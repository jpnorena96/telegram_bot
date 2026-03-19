from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import List, Optional
import mysql.connector
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG
from .auth import SECRET_KEY, ALGORITHM, get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        roles: list = payload.get("roles", ["NATURAL_PERSON"])
        user_id: int = payload.get("id")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    return {"email": email, "id": user_id, "roles": roles}

@router.get("/")
def get_user_appointments(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    role = current_user["roles"][0]
    
    if role in ["ADMINISTRATOR", "AUDITOR"]:
        # Get all appointments
        cursor.execute("""
            SELECT 
                a.id, 
                IFNULL(u.full_name, a.email) as client, 
                'B1/B2 Turista' as type, 
                a.min_consulate_date as originalDate,
                a.status as newDate,
                a.status as status
            FROM user_appointments a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.id DESC LIMIT 50
        """)
    else:
        # Get only user's appointments
        cursor.execute("""
            SELECT 
                id, 
                email as client, 
                'B1/B2 Turista' as type, 
                min_consulate_date as originalDate,
                status as newDate,
                status as status
            FROM user_appointments 
            WHERE user_id = %s
            ORDER BY id DESC
        """, (current_user["id"],))
        
    appointments = cursor.fetchall()
    cursor.close()
    
    # Format dates to string
    for apt in appointments:
        if apt["originalDate"]:
            apt["originalDate"] = apt["originalDate"].strftime('%Y-%m-%d')
        # Map statuses for frontend
        if apt["status"] == "pending":
            apt["newDate"] = "Pendiente"
            apt["status"] = "Buscando"
        elif apt["status"] == "guardada":
            apt["newDate"] = "Pendiente"
            apt["status"] = "Buscando"
    
    return appointments

@router.get("/{appointment_id}")
def get_appointment(appointment_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM user_appointments WHERE id = %s", (appointment_id,))
    apt = cursor.fetchone()
    cursor.close()
    
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    role = current_user["roles"][0]
    if role not in ["ADMINISTRATOR", "AUDITOR"] and apt["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this appointment")
        
    return apt
