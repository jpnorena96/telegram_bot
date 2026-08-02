from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from fastapi import BackgroundTasks
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

    # Fetch applicants
    cursor.execute("SELECT id, full_name, passport_number, relationship FROM visa_applicants WHERE process_id = %s", (process_id,))
    applicants = cursor.fetchall()
    
    # Fetch documents for each applicant (to find passport_file)
    for app in applicants:
        app["is_main_applicant"] = (app.get("relationship") == 'primary')
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
    
    # Check if process exists
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM visa_processes WHERE id = %s", (process_id,))
    if not cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=404, detail="Process not found")
    # Handle dynamic applicants
    applicant_count = int(form.get('applicant_count', 1))
    
    cursor = db.cursor()
    
    for i in range(applicant_count):
        full_name = form.get(f"full_name_{i}")
        passport_number = form.get(f"passport_number_{i}")
        passport_file = form.get(f"passport_file_{i}")
        
        passport_url = None
        if passport_file and hasattr(passport_file, 'filename') and passport_file.filename:
            # Save file
            file_ext = os.path.splitext(passport_file.filename)[1]
            filename = f"passport_{process_id}_{i}{file_ext}"
            filepath = f"uploads/visas/{filename}"
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(passport_file.file, buffer)
            passport_url = f"/uploads/visas/{filename}"
            
        is_main = (i == 0)
        relationship = 'primary' if is_main else 'dependent'
        cursor.execute(
            "INSERT INTO visa_applicants (process_id, full_name, passport_number, relationship) VALUES (%s, %s, %s, %s)",
            (process_id, full_name, passport_number, relationship)
        )
        applicant_id = cursor.lastrowid
        
        if passport_url:
            cursor.execute(
                "INSERT INTO visa_documents (applicant_id, document_type, file_path, file_name) VALUES (%s, %s, %s, %s)",
                (applicant_id, 'passport', passport_url, passport_file.filename)
            )
        
        # We no longer save backward compatibility fields to visa_processes
        pass

    # Handle extra files (DS-160, acceptance letter, etc.)
    # For now, we will store extra files in visa_applicants or documents table if needed.
    # Since we removed ds160_file from visa_processes, we won't store it there.
    # Ideally, we should insert it into visa_documents.
    
    cursor.execute("UPDATE visa_processes SET status = 'Pendiente Revisión' WHERE id = %s", (process_id,))
    db.commit()
    cursor.close()
    
    return {"status": "success"}
