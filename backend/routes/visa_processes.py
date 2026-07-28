from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil

from .auth import get_db, get_current_user

router = APIRouter()

class VisaProcessCreate(BaseModel):
    client_email: str
    target_country: str = 'Estados Unidos'
    visa_category: str = 'B1/B2'

@router.post("/")
def create_process(data: VisaProcessCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    if current_user["roles"][0] != "TRAVEL_AGENCY":
        raise HTTPException(status_code=403, detail="Only agencies can create processes")
    
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO visa_processes (user_id, client_email, type, target_country, visa_category) VALUES (%s, %s, %s, %s, %s)",
        (current_user["id"], data.client_email, 'client_form', data.target_country, data.visa_category)
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
    cursor.execute("SELECT user_id, target_country, visa_category FROM visa_processes WHERE id = %s", (process_id,))
    process = cursor.fetchone()
    if not process:
        cursor.close()
        raise HTTPException(status_code=404, detail="Process not found")
        
    # Get agency logo and name
    cursor.execute("SELECT full_name, logo_url FROM users WHERE id = %s", (process["user_id"],))
    agency = cursor.fetchone()
    cursor.close()
    
    return {
        "agency_name": agency.get("full_name", "Agencia"),
        "agency_logo": agency.get("logo_url"),
        "target_country": process["target_country"],
        "visa_category": process["visa_category"]
    }

@router.post("/public/{process_id}/submit")
async def submit_public_process(
    process_id: int,
    full_name: str = Form(...),
    passport_number: str = Form(...),
    passport_file: UploadFile = File(None),
    ds160_file: UploadFile = File(None),
    db = Depends(get_db)
):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM visa_processes WHERE id = %s", (process_id,))
    if not cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=404, detail="Process not found")
        
    # Update process status
    cursor.execute("UPDATE visa_processes SET status = 'Documentos Recibidos' WHERE id = %s", (process_id,))
    
    # Create applicant
    cursor.execute(
        "INSERT INTO visa_applicants (process_id, full_name, passport_number) VALUES (%s, %s, %s)",
        (process_id, full_name, passport_number)
    )
    applicant_id = cursor.lastrowid
    
    # Save files
    os.makedirs("uploads/visas", exist_ok=True)
    
    if passport_file:
        ext = os.path.splitext(passport_file.filename)[1]
        p_name = f"pass_{applicant_id}{ext}"
        p_path = os.path.join("uploads/visas", p_name)
        with open(p_path, "wb") as buffer:
            shutil.copyfileobj(passport_file.file, buffer)
        cursor.execute(
            "INSERT INTO visa_documents (applicant_id, document_type, file_path, file_name) VALUES (%s, %s, %s, %s)",
            (applicant_id, 'passport', p_path, passport_file.filename)
        )
        
    if ds160_file:
        ext = os.path.splitext(ds160_file.filename)[1]
        d_name = f"ds160_{applicant_id}{ext}"
        d_path = os.path.join("uploads/visas", d_name)
        with open(d_path, "wb") as buffer:
            shutil.copyfileobj(ds160_file.file, buffer)
        cursor.execute(
            "INSERT INTO visa_documents (applicant_id, document_type, file_path, file_name) VALUES (%s, %s, %s, %s)",
            (applicant_id, 'ds160', d_path, ds160_file.filename)
        )
        
    db.commit()
    cursor.close()
    return {"status": "success"}
