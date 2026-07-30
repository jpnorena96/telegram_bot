from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import mysql.connector
import sys
import os
import shutil

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG
from .auth import get_current_user, get_db, revoked_users
from backend.sse import sse_manager
from datetime import datetime

router = APIRouter()

@router.post("/logo")
async def upload_logo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    if current_user["roles"][0] != "TRAVEL_AGENCY":
        raise HTTPException(status_code=403, detail="Only travel agencies can upload logos")
        
    user_id = current_user["id"]
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"agency_{user_id}{file_ext}"
    file_path = os.path.join("uploads/logos", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    logo_url = f"/uploads/logos/{filename}"
    
    cursor = db.cursor()
    cursor.execute("UPDATE users SET logo_url = %s WHERE id = %s", (logo_url, user_id))
    db.commit()
    cursor.close()
    
    return {"status": "success", "logo_url": logo_url}

@router.get("/me/logo")
def get_my_logo(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT logo_url FROM users WHERE id = %s", (current_user["id"],))
        user = cursor.fetchone()
        return {"logo_url": user.get("logo_url") if user else None}
    except Exception:
        return {"logo_url": None}
    finally:
        cursor.close()

@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        # If balance column doesn't exist yet, this might throw an error on old DBs,
        # but we already ran the migration. We'll select common fields.
        cursor.execute("SELECT id, email, full_name, role, is_authorized, plan, balance, whatsapp_number, logo_url FROM users WHERE id = %s", (current_user["id"],))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except mysql.connector.Error as err:
        if "Unknown column 'balance'" in str(err):
             cursor.execute("SELECT id, email, full_name, role, is_authorized, plan, whatsapp_number, logo_url FROM users WHERE id = %s", (current_user["id"],))
             user = cursor.fetchone()
             if user:
                 user["balance"] = 0
             return user
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()

@router.get("/")
def get_users(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    role = current_user["roles"][0]
    
    if role not in ["ADMINISTRATOR", "AUDITOR"]:
        raise HTTPException(status_code=403, detail="Not authorized to view users")
        
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, email, role, full_name, is_authorized, plan, whatsapp_number FROM users ORDER BY id DESC")
    except mysql.connector.Error:
        # Fallback if DB not migrated yet
        cursor.execute("SELECT id, email, is_authorized FROM users ORDER BY id DESC")
        
    users = cursor.fetchall()
    cursor.close()
    
    # Format for frontend
    formatted_users = []
    for u in users:
        formatted_users.append({
            "id": u["id"],
            "name": u.get("full_name", u["email"].split('@')[0]),
            "email": u["email"],
            "role": u.get("role", "NATURAL_PERSON"),
            "status": "Activo" if u["is_authorized"] else "Pendiente",
            "plan": u.get("plan", "platino"),
            "whatsapp_number": u.get("whatsapp_number", "")
        })
        
    return formatted_users

@router.post("/")
def create_user(data: dict, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    role = current_user["roles"][0]
    if role != "ADMINISTRATOR":
        raise HTTPException(status_code=403, detail="Only administrators can create users")
    
    from backend.routes.auth import get_password_hash
    hashed_password = get_password_hash(data.get("password", ""))
    
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (full_name, email, password, role, is_authorized, plan, country, whatsapp_number) VALUES (%s, %s, %s, %s, %s, %s, 'co', %s)",
            (data.get("full_name"), data.get("email"), hashed_password, data.get("role", "NATURAL_PERSON"), 1 if data.get("is_authorized") else 0, data.get("plan", "platino"), data.get("whatsapp_number"))
        )
        db.commit()
        new_id = cursor.lastrowid
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating user: {err}")
    finally:
        cursor.close()
    return {"status": "ok", "id": new_id}

@router.put("/{user_id}")
def update_user(user_id: int, data: dict, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    role = current_user["roles"][0]
    if role != "ADMINISTRATOR":
        raise HTTPException(status_code=403, detail="Only administrators can update users")
        
    cursor = db.cursor()
    fields = []
    vals = []
    
    if "is_authorized" in data:
        fields.append("is_authorized = %s")
        vals.append(1 if data["is_authorized"] else 0)
    if "full_name" in data:
        fields.append("full_name = %s")
        vals.append(data["full_name"])
    if "email" in data:
        fields.append("email = %s")
        vals.append(data["email"])
    if "role" in data:
        fields.append("role = %s")
        vals.append(data["role"])
    if "plan" in data:
        fields.append("plan = %s")
        vals.append(data["plan"])
    if "whatsapp_number" in data:
        fields.append("whatsapp_number = %s")
        vals.append(data["whatsapp_number"])
    if "password" in data and data["password"].strip():
        from backend.routes.auth import get_password_hash
        fields.append("password = %s")
        vals.append(get_password_hash(data["password"]))
        
    if fields:
        vals.append(user_id)
        cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = %s", vals)
        db.commit()
    
    cursor.close()
    return {"status": "ok"}

@router.delete("/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    role = current_user["roles"][0]
    if role != "ADMINISTRATOR":
        raise HTTPException(status_code=403, detail="Only administrators can delete users")
        
    cursor = db.cursor()
    # Delete appointments first due to foreign key
    cursor.execute("DELETE FROM user_appointments WHERE user_id = %s", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    db.commit()
    cursor.close()
    return {"status": "ok"}

@router.post("/{user_id}/revoke")
async def revoke_user_session(user_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    """Revoca el acceso de un usuario y fuerza su desconexión en tiempo real"""
    role = current_user["roles"][0]
    if role != "ADMINISTRATOR":
        raise HTTPException(status_code=403, detail="Only administrators can revoke sessions")
        
    revoked_users[user_id] = datetime.utcnow().timestamp()
    await sse_manager.broadcast("session_revoked", {"user_id": user_id})
    
    return {"status": "success", "message": "Session revoked successfully"}
