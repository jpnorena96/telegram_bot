import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Security, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from .auth import get_db, get_current_user

router = APIRouter()

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Schemas ──
class ApplicantSchema(BaseModel):
    full_name: str
    relationship: str = 'primary'
    passport_number: Optional[str] = None
    ds160_confirmation: Optional[str] = None

class CreateProcessRequest(BaseModel):
    client_email: str
    type: str  # 'individual' or 'familiar'
    applicants: List[ApplicantSchema]

class UpdateDocumentStatusRequest(BaseModel):
    status: str  # 'uploaded', 'approved', 'rejected'
    notes: Optional[str] = None

class UpdateProcessStatusRequest(BaseModel):
    status: str  # 'En Progreso', 'Listo para Revisar', 'Aprobado', 'Cargado'

# ── Helpers ──
def check_process_access(process_id: int, user: dict, db) -> dict:
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM visa_processes WHERE id = %s", (process_id,))
    process = cursor.fetchone()
    cursor.close()
    if not process:
        raise HTTPException(status_code=404, detail="Proceso de visa no encontrado")
    
    role = user["roles"][0]
    if role not in ["ADMINISTRATOR", "AUDITOR"] and process["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="No tienes autorización para acceder a este proceso")
    return process

def check_applicant_access(applicant_id: int, user: dict, db) -> dict:
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.*, p.user_id, p.client_email 
        FROM visa_applicants a 
        JOIN visa_processes p ON a.process_id = p.id 
        WHERE a.id = %s
    """, (applicant_id,))
    applicant = cursor.fetchone()
    cursor.close()
    if not applicant:
        raise HTTPException(status_code=404, detail="Solicitante no encontrado")
        
    role = user["roles"][0]
    if role not in ["ADMINISTRATOR", "AUDITOR"] and applicant["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="No tienes autorización para acceder a este solicitante")
    return applicant


# ── API Endpoints ──

@router.get("/processes")
def get_processes(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    role = current_user["roles"][0]
    
    if role in ["ADMINISTRATOR", "AUDITOR"]:
        cursor.execute("""
            SELECT p.*, u.full_name as creator_name, u.email as creator_email
            FROM visa_processes p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.id DESC
        """)
    else:
        cursor.execute("""
            SELECT p.*, u.full_name as creator_name, u.email as creator_email
            FROM visa_processes p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = %s
            ORDER BY p.id DESC
        """, (current_user["id"],))
        
    processes = cursor.fetchall()
    
    # Fetch primary applicant details for summary display
    for p in processes:
        cursor.execute("""
            SELECT full_name FROM visa_applicants 
            WHERE process_id = %s AND relationship = 'primary' 
            LIMIT 1
        """, (p["id"],))
        primary = cursor.fetchone()
        p["primary_applicant_name"] = primary["full_name"] if primary else p["client_email"]
        
        # Count applicants
        cursor.execute("SELECT COUNT(*) as count FROM visa_applicants WHERE process_id = %s", (p["id"],))
        p["applicants_count"] = cursor.fetchone()["count"]
        
    cursor.close()
    return processes


@router.get("/processes/{process_id}")
def get_process_details(process_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    process = check_process_access(process_id, current_user, db)
    
    cursor = db.cursor(dictionary=True)
    # Fetch applicants
    cursor.execute("SELECT * FROM visa_applicants WHERE process_id = %s ORDER BY id ASC", (process_id,))
    applicants = cursor.fetchall()
    
    # Fetch documents for each applicant
    for app in applicants:
        cursor.execute("SELECT * FROM visa_documents WHERE applicant_id = %s", (app["id"],))
        app["documents"] = cursor.fetchall()
        
    cursor.close()
    
    return {
        "process": process,
        "applicants": applicants
    }


@router.post("/processes")
def create_process(req: CreateProcessRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor()
    role = current_user["roles"][0]
    
    # For clients, force the client_email to be their own user email
    client_email = req.client_email
    if role not in ["ADMINISTRATOR", "TRAVEL_AGENCY"]:
        client_email = current_user["email"]
        
    try:
        # 1. Insert visa process
        cursor.execute("""
            INSERT INTO visa_processes (user_id, client_email, type, status)
            VALUES (%s, %s, %s, 'En Progreso')
        """, (current_user["id"], client_email, req.type))
        process_id = cursor.lastrowid
        
        # 2. Insert applicants
        for app in req.applicants:
            cursor.execute("""
                INSERT INTO visa_applicants (process_id, full_name, relationship, passport_number, ds160_confirmation)
                VALUES (%s, %s, %s, %s, %s)
            """, (process_id, app.full_name, app.relationship, app.passport_number, app.ds160_confirmation))
            
        db.commit()
        return {"status": "ok", "process_id": process_id, "message": "Proceso de visa y solicitantes creados correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()


@router.put("/processes/{process_id}/status")
def update_process_status(process_id: int, req: UpdateProcessStatusRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    check_process_access(process_id, current_user, db)
    
    # Role validation: Client can only transition to 'Listo para Revisar' (dar de alta) or 'En Progreso'
    role = current_user["roles"][0]
    if role not in ["ADMINISTRATOR", "TRAVEL_AGENCY"] and req.status not in ["En Progreso", "Listo para Revisar"]:
        raise HTTPException(status_code=403, detail="Como cliente, solo puedes marcar tus documentos como listos para revisar")
        
    cursor = db.cursor()
    cursor.execute("UPDATE visa_processes SET status = %s WHERE id = %s", (req.status, process_id))
    db.commit()
    cursor.close()
    
    return {"status": "ok", "message": f"Estado del trámite actualizado a: {req.status}"}


@router.post("/processes/{process_id}/applicants")
def add_applicant(process_id: int, req: ApplicantSchema, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    process = check_process_access(process_id, current_user, db)
    if process["type"] == "individual":
        raise HTTPException(status_code=400, detail="No se pueden agregar familiares en un trámite individual")
        
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO visa_applicants (process_id, full_name, relationship, passport_number, ds160_confirmation)
        VALUES (%s, %s, %s, %s, %s)
    """, (process_id, req.full_name, req.relationship, req.passport_number, req.ds160_confirmation))
    new_id = cursor.lastrowid
    db.commit()
    cursor.close()
    
    return {"status": "ok", "applicant_id": new_id, "message": "Solicitante familiar agregado correctamente"}


@router.delete("/processes/{process_id}/applicants/{applicant_id}")
def delete_applicant(process_id: int, applicant_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    check_process_access(process_id, current_user, db)
    
    cursor = db.cursor(dictionary=True)
    # Ensure they are not deleting the primary applicant
    cursor.execute("SELECT relationship FROM visa_applicants WHERE id = %s", (applicant_id,))
    applicant = cursor.fetchone()
    if not applicant:
        cursor.close()
        raise HTTPException(status_code=404, detail="Solicitante no encontrado")
        
    if applicant["relationship"] == "primary":
        cursor.close()
        raise HTTPException(status_code=400, detail="No se puede eliminar el solicitante principal")
        
    cursor.execute("DELETE FROM visa_applicants WHERE id = %s", (applicant_id,))
    db.commit()
    cursor.close()
    
    # Clean up associated files if directory exists
    app_dir = os.path.join(UPLOAD_DIR, str(process_id), str(applicant_id))
    if os.path.exists(app_dir):
        shutil.rmtree(app_dir)
        
    return {"status": "ok", "message": "Solicitante familiar eliminado"}


@router.post("/applicants/{applicant_id}/upload")
def upload_document(
    applicant_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    applicant = check_applicant_access(applicant_id, current_user, db)
    process_id = applicant["process_id"]
    
    # Organize directory structure: uploads/processes/{process_id}/{applicant_id}/
    dest_dir = os.path.join(UPLOAD_DIR, str(process_id), str(applicant_id))
    os.makedirs(dest_dir, exist_ok=True)
    
    # Clean up filename to prevent directory traversal
    safe_filename = "".join([c for c in file.filename if c.isalnum() or c in [".", "_", "-"]])
    file_path = os.path.join(dest_dir, f"{document_type}_{safe_filename}")
    
    # Save the file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    cursor = db.cursor(dictionary=True)
    
    # Check if document type already uploaded for this applicant
    cursor.execute("""
        SELECT id, file_path FROM visa_documents 
        WHERE applicant_id = %s AND document_type = %s
    """, (applicant_id, document_type))
    existing = cursor.fetchone()
    
    if existing:
        # Delete old file from disk
        if os.path.exists(existing["file_path"]):
            try:
                os.remove(existing["file_path"])
            except:
                pass
        # Update db record
        cursor.execute("""
            UPDATE visa_documents 
            SET file_path = %s, file_name = %s, status = 'uploaded', notes = NULL, created_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (file_path, file.filename, existing["id"]))
        doc_id = existing["id"]
    else:
        # Insert new db record
        cursor.execute("""
            INSERT INTO visa_documents (applicant_id, document_type, file_path, file_name, status)
            VALUES (%s, %s, %s, %s, 'uploaded')
        """, (applicant_id, document_type, file_path, file.filename))
        doc_id = cursor.lastrowid
        
    db.commit()
    cursor.close()
    
    return {
        "status": "ok", 
        "document_id": doc_id, 
        "file_name": file.filename,
        "message": f"Documento de tipo '{document_type}' cargado correctamente"
    }


@router.put("/documents/{document_id}/status")
def update_document_status(document_id: int, req: UpdateDocumentStatusRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    role = current_user["roles"][0]
    # Only agency/admin/auditor can review, but auditor is read-only
    if role not in ["ADMINISTRATOR", "TRAVEL_AGENCY"]:
        raise HTTPException(status_code=403, detail="No tienes autorización para revisar documentos")
    if role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditor no tiene permisos de modificación")
        
    cursor = db.cursor(dictionary=True)
    # Check document existence
    cursor.execute("SELECT id FROM visa_documents WHERE id = %s", (document_id,))
    doc = cursor.fetchone()
    if not doc:
        cursor.close()
        raise HTTPException(status_code=404, detail="Documento no encontrado")
        
    cursor.execute("""
        UPDATE visa_documents 
        SET status = %s, notes = %s 
        WHERE id = %s
    """, (req.status, req.notes, document_id))
    db.commit()
    cursor.close()
    
    return {"status": "ok", "message": f"Estado del documento actualizado a: {req.status}"}


@router.get("/download/{document_id}")
def download_document(document_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT d.*, p.id as process_id, p.user_id 
        FROM visa_documents d
        JOIN visa_applicants a ON d.applicant_id = a.id
        JOIN visa_processes p ON a.process_id = p.id
        WHERE d.id = %s
    """, (document_id,))
    doc = cursor.fetchone()
    cursor.close()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
        
    # Check access permission
    role = current_user["roles"][0]
    if role not in ["ADMINISTRATOR", "AUDITOR"] and doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="No tienes autorización para descargar este documento")
        
    if not os.path.exists(doc["file_path"]):
        raise HTTPException(status_code=404, detail="Archivo físico no encontrado en el servidor")
        
    return FileResponse(
        path=doc["file_path"],
        filename=doc["file_name"],
        media_type="application/octet-stream"
    )
