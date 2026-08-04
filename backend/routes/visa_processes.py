from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from fastapi import BackgroundTasks
from datetime import datetime, timedelta
from .auth import get_db, get_current_user

router = APIRouter()

class VisaProcessCreate(BaseModel):
    client_email: str
    target_country: str = 'Estados Unidos'
    group_type: str = 'Individual'
    purpose: str = 'Turismo / Negocios'

@router.post("/")
def create_process(data: VisaProcessCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    # Any logged in user can create a process.
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO visa_processes (user_id, client_email, type, target_country, group_type, purpose) VALUES (%s, %s, %s, %s, %s, %s)",
        (current_user["id"], data.client_email, 'client_form', data.target_country, data.group_type, data.purpose)
    )
    db.commit()
    new_id = cursor.lastrowid
    cursor.close()
    
    return {"status": "success", "id": new_id, "link": f"/client-portal/{new_id}"}

@router.get("/")
def get_processes(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    if current_user["roles"][0] == "ADMINISTRATOR":
        cursor.execute("SELECT * FROM visa_processes ORDER BY created_at DESC")
    else:
        cursor.execute("SELECT * FROM visa_processes WHERE user_id = %s ORDER BY created_at DESC", (current_user["id"],))
    processes = cursor.fetchall()
    cursor.close()
    return processes

@router.get("/public/{process_id}")
def get_public_process(process_id: int, db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    
    # Get process
    cursor.execute("SELECT id, user_id, client_email, target_country, visa_category, group_type, purpose, status, created_at FROM visa_processes WHERE id = %s", (process_id,))
    row = cursor.fetchone()
    
    if not row:
        cursor.close()
        raise HTTPException(status_code=404, detail="Process not found")

    # Check expiration (7 days limit)
    if row["status"] == "En Progreso" and row["created_at"]:
        expiration_date = row["created_at"] + timedelta(days=7)
        if datetime.now() > expiration_date:
            cursor.close()
            raise HTTPException(status_code=410, detail="Expediente expirado por seguridad. Contacta a tu agencia para generar un nuevo enlace.")

    # Fetch applicants
    cursor.execute("SELECT id, full_name, passport_number, ds160_confirmation, relationship, form_data FROM visa_applicants WHERE process_id = %s ORDER BY id ASC", (process_id,))
    applicants = cursor.fetchall()
    
    # Fetch documents for each applicant (to find passport_file)
    import json
    for app in applicants:
        app["is_main_applicant"] = (app.get("relationship") == 'primary')
        if app.get("form_data") and isinstance(app["form_data"], str):
            try:
                app["form_data"] = json.loads(app["form_data"])
            except Exception:
                app["form_data"] = {}
        elif not app.get("form_data"):
            app["form_data"] = {}

        cursor.execute("SELECT file_path FROM visa_documents WHERE applicant_id = %s AND document_type = 'passport' LIMIT 1", (app["id"],))
        doc = cursor.fetchone()
        app["passport_file"] = doc["file_path"] if doc else None
    
    # Get agency logo and name
    cursor.execute("SELECT full_name, logo_url FROM users WHERE id = %s", (row.get("user_id"),))
    agency = cursor.fetchone() or {}
    cursor.close()
    
    return {
        "id": row["id"],
        "client_email": row["client_email"],
        "target_country": row["target_country"],
        "visa_category": row["visa_category"],
        "group_type": row["group_type"],
        "purpose": row["purpose"],
        "status": row["status"],
        "created_at": row["created_at"],
        "applicants": applicants,
        "agency_name": agency.get("full_name", "Agencia"),
        "agency_logo": agency.get("logo_url")
    }

@router.post("/{process_id}/mark-ready")
def mark_process_ready(process_id: int, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    # Ensure they own it
    cursor.execute("SELECT id, target_country, group_type, purpose, client_email FROM visa_processes WHERE id = %s AND user_id = %s", (process_id, current_user["id"]))
    process_row = cursor.fetchone()
    if not process_row:
        cursor.close()
        raise HTTPException(status_code=403, detail="Not authorized")
        
    cursor.execute("UPDATE visa_processes SET status = 'Listo para Alta' WHERE id = %s", (process_id,))
    db.commit()
    cursor.close()

    # Launch automation script based on country
    if process_row["target_country"] == "Estados Unidos" and process_row["purpose"] == "Turismo / Negocios":
        try:
            from backend.script_visas.usa.b1_b2 import USAB1B2Script
            script = USAB1B2Script(process_id, process_row)
            background_tasks.add_task(script.run)
        except ImportError:
            pass

    return {"status": "ok", "message": "Expediente marcado como Listo para Alta. Automatización iniciada."}

@router.post("/public/{process_id}/submit")
async def submit_public_process(process_id: int, request: Request, db = Depends(get_db)):
    form = await request.form()
    
    # Check if process exists and is not expired
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, status, created_at FROM visa_processes WHERE id = %s", (process_id,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
        
    if row["status"] == "En Progreso" and row["created_at"]:
        expiration_date = row["created_at"] + timedelta(days=7)
        if datetime.now() > expiration_date:
            cursor.close()
            raise HTTPException(status_code=410, detail="El enlace ha expirado por razones de seguridad. Contacta a tu agencia.")
            
    # Handle dynamic applicants
    applicant_count = int(form.get('applicant_count', 1))
    
    # Ensure upload directory exists
    upload_dir = os.path.join(os.getcwd(), "uploads", "visas")
    os.makedirs(upload_dir, exist_ok=True)
    
    for i in range(applicant_count):
        full_name = form.get(f"full_name_{i}", "").strip()
        passport_number = form.get(f"passport_number_{i}", "").strip()
        ds160_confirmation = form.get(f"ds160_confirmation_{i}", "").strip()
        relationship = form.get(f"relationship_{i}", "primary" if i == 0 else "dependent").strip()
        form_data_str = form.get(f"form_data_{i}", "{}")
        
        if not full_name:
            continue

        # Check if applicant already exists for this index
        cursor.execute("SELECT id FROM visa_applicants WHERE process_id = %s ORDER BY id ASC LIMIT 1 OFFSET %s", (process_id, i))
        existing_app = cursor.fetchone()
        
        if existing_app:
            applicant_id = existing_app["id"]
            cursor.execute(
                "UPDATE visa_applicants SET full_name = %s, passport_number = %s, ds160_confirmation = %s, relationship = %s, form_data = %s WHERE id = %s",
                (full_name, passport_number, ds160_confirmation, relationship, form_data_str, applicant_id)
            )
        else:
            cursor.execute(
                "INSERT INTO visa_applicants (process_id, full_name, passport_number, ds160_confirmation, relationship, form_data) VALUES (%s, %s, %s, %s, %s, %s)",
                (process_id, full_name, passport_number, ds160_confirmation, relationship, form_data_str)
            )
            applicant_id = cursor.lastrowid
            
        # Helper to process and save uploaded document files
        doc_fields = [
            (f"passport_file_{i}", 'passport'),
            (f"photo_file_{i}", 'photo'),
            (f"ds160_file_{i}", 'ds160'),
            (f"financial_file_{i}", 'financial_support'),
            (f"employment_file_{i}", 'employment_support')
        ]
        
        for form_key, doc_type in doc_fields:
            file_obj = form.get(form_key)
            if file_obj and hasattr(file_obj, 'filename') and file_obj.filename:
                file_ext = os.path.splitext(file_obj.filename)[1].lower() or '.pdf'
                safe_filename = f"{doc_type}_{process_id}_{applicant_id}_{i}{file_ext}"
                filepath = os.path.join(upload_dir, safe_filename)
                
                with open(filepath, "wb") as buffer:
                    shutil.copyfileobj(file_obj.file, buffer)
                    
                rel_url = f"/uploads/visas/{safe_filename}"
                
                # Upsert document into visa_documents
                cursor.execute(
                    "SELECT id FROM visa_documents WHERE applicant_id = %s AND document_type = %s LIMIT 1",
                    (applicant_id, doc_type)
                )
                existing_doc = cursor.fetchone()
                if existing_doc:
                    cursor.execute(
                        "UPDATE visa_documents SET file_path = %s, file_name = %s, status = 'uploaded' WHERE id = %s",
                        (rel_url, file_obj.filename, existing_doc["id"])
                    )
                else:
                    cursor.execute(
                        "INSERT INTO visa_documents (applicant_id, document_type, file_path, file_name, status) VALUES (%s, %s, %s, %s, 'uploaded')",
                        (applicant_id, doc_type, rel_url, file_obj.filename)
                    )

    # Set process status to Listo para Revisar
    cursor.execute("UPDATE visa_processes SET status = 'Listo para Revisar' WHERE id = %s", (process_id,))
    db.commit()
    cursor.close()
    
    return {"status": "success", "message": "Expediente actualizado y recibido correctamente."}

@router.delete("/{process_id}")
def delete_process(process_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM visa_processes WHERE id = %s", (process_id,))
    row = cursor.fetchone()
    
    if not row:
        cursor.close()
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
        
    role = current_user["roles"][0]
    if role not in ["ADMINISTRATOR", "AGENCY"] or (role == "AGENCY" and row["user_id"] != current_user["id"]):
        cursor.close()
        raise HTTPException(status_code=403, detail="No tienes autorización para eliminar este expediente")
        
    cursor.execute("DELETE FROM visa_processes WHERE id = %s", (process_id,))
    db.commit()
    cursor.close()
    
    return {"status": "success", "message": "Expediente eliminado correctamente"}

