from fastapi import APIRouter, Depends, HTTPException
import mysql.connector
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG
from .auth import get_current_user, get_db

router = APIRouter()

@router.get("/")
def get_users(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    role = current_user["roles"][0]
    
    if role not in ["ADMINISTRATOR", "AUDITOR"]:
        raise HTTPException(status_code=403, detail="Not authorized to view users")
        
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, email, role, full_name, is_authorized FROM users ORDER BY id DESC")
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
            "status": "Activo" if u["is_authorized"] else "Pendiente"
        })
        
    return formatted_users
