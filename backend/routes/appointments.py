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
from backend import vps

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
    cursor = db.cursor(dictionary=True)
    try:
        # 1. Obtener telegram_user_id de la tabla users
        cursor.execute("SELECT telegram_user_id FROM users WHERE id = %s", (current_user["id"],))
        user_row = cursor.fetchone()
        telegram_user_id = user_row["telegram_user_id"] if user_row else None

        # 2. Insertar agendamiento en la base de datos
        cursor_insert = db.cursor()
        cursor_insert.execute("""
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
        new_id = cursor_insert.lastrowid
        cursor_insert.close()

        # 3. Preparar datos para configuración en VPS
        need_cas = bool(apt.consulate_asc and apt.consulate_asc.strip().lower() not in ["ninguno", "none", "null", ""])
        
        user_data = {
            "appt_email": apt.email,
            "appt_password": apt.password,
            "country": apt.country,
            "consulate": apt.consulate,
            "need_cas": need_cas,
            "consulate_asc": apt.consulate_asc if need_cas else "Ninguno",
            "min_consulate_date": apt.min_consulate_date.strftime('%Y-%m-%d') if apt.min_consulate_date else None,
            "max_consulate_date": apt.max_consulate_date.strftime('%Y-%m-%d') if apt.max_consulate_date else None,
            "ivr": apt.ivr or "Ninguno",
            "telegram_user_id": telegram_user_id,
            "appointment_id": new_id
        }

        # 4. Crear archivos de configuración en el VPS
        vps_success = vps.create_vps_config(user_data)

        # 5. Si viene con schedule_id o ivr numérico, iniciar PM2 en el VPS
        schedule_id_to_use = None
        if apt.schedule_id and apt.schedule_id.strip():
            schedule_id_to_use = apt.schedule_id.strip()
        elif apt.ivr and apt.ivr.strip().isdigit():
            schedule_id_to_use = apt.ivr.strip()

        if vps_success and schedule_id_to_use:
            start_success = vps.set_schedule_id_and_start(apt.email, schedule_id_to_use, new_id)
            if start_success:
                cursor_update = db.cursor()
                cursor_update.execute(
                    "UPDATE user_appointments SET schedule_id = %s, status = 'pending' WHERE id = %s",
                    (schedule_id_to_use, new_id)
                )
                db.commit()
                cursor_update.close()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
    
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


@router.post("/{appointment_id}/start")
def start_appointment(appointment_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT email, user_id FROM user_appointments WHERE id = %s", (appointment_id,))
    apt = cursor.fetchone()
    
    if not apt:
        cursor.close()
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Verificar autorización: administrador o dueño del agendamiento
    role = current_user["roles"][0]
    if role not in ["ADMINISTRATOR", "AUDITOR"] and apt["user_id"] != current_user["id"]:
        cursor.close()
        raise HTTPException(status_code=403, detail="Not authorized")
        
    success = vps.start_pm2_process(apt["email"], appointment_id)
    if success:
        cursor.execute("UPDATE user_appointments SET status = 'pending' WHERE id = %s", (appointment_id,))
        db.commit()
        cursor.close()
        return {"status": "ok", "message": "Búsqueda iniciada en el servidor (PM2)"}
    else:
        cursor.close()
        raise HTTPException(status_code=500, detail="Error al iniciar el proceso en el VPS")


@router.post("/{appointment_id}/stop")
def stop_appointment(appointment_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT email, user_id FROM user_appointments WHERE id = %s", (appointment_id,))
    apt = cursor.fetchone()
    
    if not apt:
        cursor.close()
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Verificar autorización: administrador o dueño del agendamiento
    role = current_user["roles"][0]
    if role not in ["ADMINISTRATOR", "AUDITOR"] and apt["user_id"] != current_user["id"]:
        cursor.close()
        raise HTTPException(status_code=403, detail="Not authorized")
        
    success = vps.stop_pm2_process(apt["email"], appointment_id)
    if success:
        cursor.execute("UPDATE user_appointments SET status = 'paused' WHERE id = %s", (appointment_id,))
        db.commit()
        cursor.close()
        return {"status": "ok", "message": "Búsqueda pausada en el servidor (PM2)"}
    else:
        cursor.close()
        raise HTTPException(status_code=500, detail="Error al pausar el proceso en el VPS")
