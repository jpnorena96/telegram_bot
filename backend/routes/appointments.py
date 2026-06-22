from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, time
import mysql.connector
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG
from .auth import SECRET_KEY, ALGORITHM, get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class AppointmentCreate(BaseModel):
    email: str
    password: str
    country: str = 'co'
    consulate: str = 'Lima'
    consulate_asc: Optional[str] = None
    min_consulate_date: Optional[date] = None
    max_consulate_date: Optional[date] = None
    min_consulate_time: Optional[time] = None
    max_consulate_time: Optional[time] = None
    schedule_id: Optional[str] = None
    ivr: Optional[str] = 'null'


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

@router.post("/")
def create_appointment(apt: AppointmentCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("""
            INSERT INTO user_appointments (
                user_id, email, password, country, consulate, consulate_asc,
                min_consulate_date, max_consulate_date, min_consulate_time, max_consulate_time,
                schedule_id, ivr, status
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, 'pending'
            )
        """, (
            current_user["id"], apt.email, apt.password, apt.country, apt.consulate, apt.consulate_asc,
            apt.min_consulate_date, apt.max_consulate_date, apt.min_consulate_time, apt.max_consulate_time,
            apt.schedule_id, apt.ivr
        ))
        db.commit()
        new_id = cursor.lastrowid
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

    # Deploy configuration to VPS and start PM2 automatically
    try:
        # Get telegram_user_id of current user from DB
        cursor_u = db.cursor(dictionary=True)
        cursor_u.execute("SELECT telegram_user_id FROM users WHERE id = %s", (current_user["id"],))
        user_row = cursor_u.fetchone()
        telegram_user_id = user_row["telegram_user_id"] if user_row else None
        cursor_u.close()

        # Build user_data dictionary for VPS functions
        user_data = {
            "appt_email": apt.email,
            "appt_password": apt.password,
            "country": apt.country,
            "consulate": apt.consulate,
            "need_cas": bool(apt.consulate_asc and apt.consulate_asc != 'Ninguno'),
            "consulate_asc": apt.consulate_asc or 'Ninguno',
            "min_consulate_date": str(apt.min_consulate_date) if apt.min_consulate_date else None,
            "max_consulate_date": str(apt.max_consulate_date) if apt.max_consulate_date else None,
            "schedule_id": apt.schedule_id or "",
            "ivr": apt.ivr or "Ninguno",
            "appointment_id": new_id,
            "telegram_user_id": telegram_user_id,
            "telegram_chat_id": telegram_user_id,
        }

        # Import VPS helper and deploy
        import vps
        vps_success = vps.create_vps_config(user_data)
        
        if vps_success:
            sched_id = None
            if apt.schedule_id and apt.schedule_id.strip() and apt.schedule_id.strip().lower() != 'null':
                sched_id = apt.schedule_id.strip()
            elif apt.ivr and apt.ivr.strip() and apt.ivr.strip().lower() != 'null' and apt.ivr.strip().isdigit():
                sched_id = apt.ivr.strip()

            if sched_id:
                # Update DB with the active schedule_id
                cursor_s = db.cursor()
                cursor_s.execute("UPDATE user_appointments SET schedule_id = %s WHERE id = %s", (sched_id, new_id))
                db.commit()
                cursor_s.close()
                
                # Start script on VPS using PM2
                vps.set_schedule_id_and_start(apt.email, sched_id, new_id)
    except Exception as vps_err:
        # Log VPS error, but proceed with HTTP 200 response since DB insert succeeded
        import logging
        logging.getLogger(__name__).error(f"Error deploying to VPS for appointment {new_id}: {vps_err}")
    
    return {"message": "Appointment created successfully", "id": new_id}

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
                a.status as status,
                a.date_created,
                a.date_booked
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
                status as status,
                date_created,
                date_booked
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
        if apt.get("date_created"):
            apt["date_created"] = apt["date_created"].strftime('%Y-%m-%d %H:%M:%S')
        if apt.get("date_booked"):
            apt["date_booked"] = apt["date_booked"].strftime('%Y-%m-%d %H:%M:%S')
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
