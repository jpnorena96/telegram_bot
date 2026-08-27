from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
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
from backend.telegram_service import notify_new_appointment
import datetime

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
    group_size: int = 1


def calculate_price_usd(role: str, max_consulate_date: date, group_size: int = 1) -> int:
    import datetime
    today = datetime.date.today()
    is_urgent = False
    
    if max_consulate_date:
        diff_days = (max_consulate_date - today).days
        if diff_days <= 30:
            is_urgent = True

    extra_persons = max(0, group_size - 1)
    
    if is_urgent:
        if role in ["TRAVEL_AGENCY", "AGENCY"]:
            return 20 + (15 * extra_persons)
        else:
            return 60 + (10 * extra_persons)
    else:
        if role in ["TRAVEL_AGENCY", "AGENCY"]:
            return 15 + (13 * extra_persons)
        else:
            return 45 + (15 * extra_persons)


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
def create_appointment(apt: AppointmentCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        # 0. Calcular precio
        role = current_user["roles"][0]
        price_usd = calculate_price_usd(role, apt.max_consulate_date, apt.group_size)

        # 1. Check and deduct balance
        # Temporarily agencies do not pay
        requires_payment = role not in ["ADMINISTRATOR", "AUDITOR", "AGENCY", "TRAVEL_AGENCY"]
        
        if requires_payment:
            cursor.execute("SELECT balance FROM users WHERE id = %s", (current_user["id"],))
            user_balance = cursor.fetchone()
            if not user_balance or user_balance["balance"] < price_usd:
                raise HTTPException(status_code=402, detail=f"No tienes saldo suficiente. Costo: ${price_usd} USD, Balance actual: ${user_balance['balance'] if user_balance else 0} USD.")
                
            cursor.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (price_usd, current_user["id"]))
            cursor.execute("""
                INSERT INTO balance_history (user_id, amount, type, description)
                VALUES (%s, %s, 'spend', %s)
            """, (current_user["id"], price_usd, f"Agendamiento para {apt.email} (Grupo: {apt.group_size})"))
        
        # 1. Insertar agendamiento en la base de datos
        cursor_insert = db.cursor()
        cursor_insert.execute("""
            INSERT INTO user_appointments (
                user_id, email, password, country, consulate, consulate_asc,
                min_consulate_date, max_consulate_date, min_consulate_time, max_consulate_time,
                schedule_id, ivr, status, group_size
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, 'pending', %s
            )
        """, (
            current_user["id"], apt.email, apt.password, apt.country, apt.consulate, apt.consulate_asc,
            apt.min_consulate_date, apt.max_consulate_date, apt.min_consulate_time, apt.max_consulate_time,
            apt.schedule_id, apt.ivr, apt.group_size
        ))
        db.commit()
        new_id = cursor_insert.lastrowid
        cursor_insert.close()

        # Enviar notificación a Telegram en background
        fecha_registro = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        background_tasks.add_task(notify_new_appointment, apt.email, apt.consulate, fecha_registro, apt.type if hasattr(apt, 'type') else "B1/B2")

        # 2. Preparar datos para configuración en VPS (fijamos telegram_user_id a vacío para no notificar por Telegram al ser creado desde la web)
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
            "telegram_user_id": "",  # Vacío para evitar notificaciones de Telegram desde la web
            "appointment_id": new_id
        }

        # 3. Crear archivos de configuración en el VPS
        vps_success = vps.create_vps_config(user_data)

        # 4. Si viene con schedule_id o ivr numérico, iniciar PM2 en el VPS
        schedule_id_to_use = None
        if apt.schedule_id and apt.schedule_id.strip():
            schedule_id_to_use = apt.schedule_id.strip()
        elif apt.ivr and apt.ivr.strip().isdigit():
            schedule_id_to_use = apt.ivr.strip()

        is_running = False
        if vps_success and schedule_id_to_use:
            start_success = vps.set_schedule_id_and_start(apt.email, schedule_id_to_use, new_id)
            if start_success:
                is_running = True
                cursor_update = db.cursor()
                cursor_update.execute(
                    "UPDATE user_appointments SET schedule_id = %s, status = 'pending' WHERE id = %s",
                    (schedule_id_to_use, new_id)
                )
                db.commit()
                cursor_update.close()

        # 5. Insertar notificación del sistema para la web
        msg = f"Se ha registrado el agendamiento para {apt.email}."
        if is_running:
            msg += " Búsqueda automática iniciada en el servidor (PM2)."
        else:
            msg += " Servidor configurado a la espera del Schedule ID."
            
        cursor_notif = db.cursor()
        cursor_notif.execute(
            "INSERT INTO notifications (user_id, message, status) VALUES (%s, %s, %s)",
            (current_user["id"], msg, "success" if is_running else "info")
        )
        db.commit()
        cursor_notif.close()

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
                a.email as client, 
                'B1/B2 Turista' as type, 
                a.min_consulate_date as originalDate,
                a.status as newDate,
                a.status as status,
                a.date_created,
                a.date_booked,
                a.schedule_id as schedule_id,
                a.schedule_names as schedule_names,
                a.assigned_consulate_date as assigned_consulate_date,
                a.assigned_cas_date as assigned_cas_date,
                u.full_name as system_user_name,
                u.email as system_user_email
            FROM user_appointments a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.status != 'guardada'
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
                date_booked,
                schedule_id,
                schedule_names,
                assigned_consulate_date,
                assigned_cas_date,
                NULL as system_user_name,
                NULL as system_user_email
            FROM user_appointments 
            WHERE user_id = %s AND status != 'guardada'
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
        if apt.get("assigned_consulate_date"):
            apt["assigned_consulate_date"] = apt["assigned_consulate_date"].strftime('%Y-%m-%d %H:%M:%S')
        if apt.get("assigned_cas_date"):
            apt["assigned_cas_date"] = apt["assigned_cas_date"].strftime('%Y-%m-%d %H:%M:%S')
        # Map statuses for frontend
        if apt["status"] == "pending":
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

@router.get("/{appointment_id}/logs")
def get_appointment_logs(appointment_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT email, user_id FROM user_appointments WHERE id = %s", (appointment_id,))
        apt = cursor.fetchone()
        
        if not apt:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        role = current_user["roles"][0]
        if role not in ["ADMINISTRATOR", "AUDITOR"] and apt["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        logs = vps.get_pm2_logs(apt["email"], appointment_id)
        return {"status": "ok", "logs": logs}
    finally:
        cursor.close()

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
        # Insertar notificación
        cursor.execute(
            "INSERT INTO notifications (user_id, message, status) VALUES (%s, %s, 'info')",
            (apt["user_id"], f"Búsqueda automática iniciada en el servidor para {apt['email']}.",)
        )
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
        # Insertar notificación
        cursor.execute(
            "INSERT INTO notifications (user_id, message, status) VALUES (%s, %s, 'warning')",
            (apt["user_id"], f"Búsqueda automática detenida en el servidor para {apt['email']}.",)
        )
        db.commit()
        cursor.close()
        return {"status": "ok", "message": "Búsqueda pausada en el servidor (PM2)"}
    else:
        cursor.close()
        raise HTTPException(status_code=500, detail="Error al pausar el proceso en el VPS")


class DiscoverDirectRequest(BaseModel):
    email: str
    password: str
    country: str = 'co'
    consulate: str = '25'
    consulate_asc: Optional[str] = '26'
    min_consulate_date: Optional[date] = None
    max_consulate_date: Optional[date] = None
    ivr: Optional[str] = 'null'
    group_size: int = 1


@router.post("/discover-direct")
def discover_direct(req: DiscoverDirectRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        # 1. Obtener telegram_user_id (vació para no notificar por Telegram al ser por la web)
        telegram_user_id = ""

        # 2. Insertar agendamiento temporal en la base de datos (con status 'guardada')
        cursor_insert = db.cursor()
        cursor_insert.execute("""
            INSERT INTO user_appointments (
                user_id, email, password, country, consulate, consulate_asc,
                min_consulate_date, max_consulate_date, status, ivr, group_size
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, 'guardada', %s, %s
            )
        """, (
            current_user["id"], req.email, req.password, req.country, req.consulate, req.consulate_asc,
            req.min_consulate_date, req.max_consulate_date, req.ivr, req.group_size
        ))
        db.commit()
        new_id = cursor_insert.lastrowid
        cursor_insert.close()

        # 3. Preparar datos para el VPS
        need_cas = bool(req.consulate_asc and req.consulate_asc.strip().lower() not in ["ninguno", "none", "null", ""])
        user_data = {
            "appt_email": req.email,
            "appt_password": req.password,
            "country": req.country,
            "consulate": req.consulate,
            "need_cas": need_cas,
            "consulate_asc": req.consulate_asc if need_cas else "Ninguno",
            "min_consulate_date": req.min_consulate_date.strftime('%Y-%m-%d') if req.min_consulate_date else None,
            "max_consulate_date": req.max_consulate_date.strftime('%Y-%m-%d') if req.max_consulate_date else None,
            "ivr": req.ivr or "Ninguno",
            "telegram_user_id": telegram_user_id,
            "appointment_id": new_id
        }

        # 4. Crear archivos en el VPS
        vps_success = vps.create_vps_config(user_data)
        if not vps_success:
            raise Exception("No se pudo iniciar la configuración en nuestro sistema")

        # 5. Ejecutar descubrimiento de Schedule IDs en el VPS
        schedule_ids, error_detail = vps.discover_schedule_ids(req.email, new_id)
        
        if not schedule_ids:
            return {"status": "error", "appointment_id": new_id, "detail": error_detail or "No se encontraron Schedule IDs en el portal de visas. Por favor verifica tu correo y contraseña."}

        return {"status": "ok", "appointment_id": new_id, "schedules": schedule_ids}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()


class SelectScheduleRequest(BaseModel):
    schedule_id: str
    schedule_names: Optional[str] = None


@router.post("/{appointment_id}/select-schedule")
def select_appointment_schedule(appointment_id: int, req: SelectScheduleRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT email, user_id, max_consulate_date, group_size FROM user_appointments WHERE id = %s", (appointment_id,))
        apt = cursor.fetchone()
        
        if not apt:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        role = current_user["roles"][0]
        if role not in ["ADMINISTRATOR", "AUDITOR"] and apt["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        # 0. Check Balance for Natural Person (and now Agencies too if they use discover-direct, though typically they don't, but let's calculate for everyone to be safe)
        price_usd = calculate_price_usd(role, apt["max_consulate_date"], apt["group_size"] or 1)
        # Temporarily agencies do not pay
        requires_payment = role not in ["ADMINISTRATOR", "AUDITOR", "AGENCY", "TRAVEL_AGENCY"]
        
        if requires_payment:
            cursor.execute("SELECT balance FROM users WHERE id = %s", (current_user["id"],))
            u_row = cursor.fetchone()
            if not u_row or u_row["balance"] < price_usd:
                raise HTTPException(status_code=402, detail=f"Saldo insuficiente. Costo: ${price_usd} USD. Por favor recarga tu balance.")

            
        # 1. Validar que no esté duplicado (agencias y admins pueden reagendar)
        if role not in ["ADMINISTRATOR", "AUDITOR", "AGENCY", "TRAVEL_AGENCY"]:
            cursor.execute("SELECT id FROM user_appointments WHERE schedule_id = %s", (req.schedule_id,))
            existing = cursor.fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="Este Schedule ID ya se encuentra registrado.")
            
        # 2. Guardar e iniciar PM2
        success = vps.set_schedule_id_and_start(apt["email"], req.schedule_id, appointment_id)
        if success:
            cursor.execute(
                "UPDATE user_appointments SET schedule_id = %s, schedule_names = %s, status = 'pending' WHERE id = %s",
                (req.schedule_id, req.schedule_names, appointment_id)
            )
            # Deduct balance
            if requires_payment:
                cursor.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (price_usd, current_user["id"]))
                cursor.execute("""
                    INSERT INTO balance_history (user_id, amount, type, description)
                    VALUES (%s, %s, 'spend', %s)
                """, (current_user["id"], price_usd, f"Agendamiento Direct Connect para {apt['email']} (Grupo: {apt['group_size']})"))
            
            # Insertar notificación
            cursor.execute(
                "INSERT INTO notifications (user_id, message, status) VALUES (%s, %s, 'success')",
                (apt["user_id"], f"Búsqueda iniciada para {apt['email']} con IDENTIFICADOR {req.schedule_id}.",)
            )
            db.commit()
            return {"status": "ok", "message": "IDENTIFICADOR configurado y búsqueda iniciada en nuestro sistema."}
        else:
            raise HTTPException(status_code=500, detail="Error al configurar el IDENTIFICADOR en nuestro sistema.")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        # Check if exists and belongs to user
        cursor.execute("SELECT * FROM user_appointments WHERE id = %s", (appointment_id,))
        apt = cursor.fetchone()
        if not apt:
            raise HTTPException(status_code=404, detail="Agendamiento no encontrado")
            
        role = current_user["roles"][0]
        if role not in ["ADMINISTRATOR", "AUDITOR"] and apt["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="No autorizado para eliminar este agendamiento")
            
        # Prevent deletion if 'agendado'
        if apt["status"] == "agendado":
            raise HTTPException(status_code=400, detail="No se puede eliminar un agendamiento que ya ha sido procesado (agendado).")
            
        # Delete from VPS first if schedule_id exists
        if apt["schedule_id"] and apt["email"]:
            try:
                vps.delete_vps_appointment(apt["email"], apt["schedule_id"])
            except Exception as e:
                print(f"Error borrando en VPS: {e}")
                
        # Delete from DB
        cursor.execute("DELETE FROM user_appointments WHERE id = %s", (appointment_id,))
        db.commit()
        return {"status": "ok", "message": "Agendamiento eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

import subprocess

@router.get("/{appointment_id}/logs")
def get_appointment_logs(appointment_id: int, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    if "ADMINISTRATOR" not in current_user.get("roles", []) and "AUDITOR" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT email FROM user_appointments WHERE id = %s", (appointment_id,))
    apt = cursor.fetchone()
    cursor.close()
    
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    process_name = f"visa_{apt['email'].replace('@', '_').replace('.', '_')}_{appointment_id}"
    
    try:
        result = subprocess.run(
            f"pm2 logs {process_name} --lines 100 --nostream",
            shell=True,
            capture_output=True,
            text=True
        )
        logs = result.stdout if result.stdout else result.stderr
        if not logs:
            logs = "El proceso no ha generado logs aún o no existe en PM2."
        return {"logs": logs}
    except Exception as e:
        return {"logs": f"Error fetchings logs: {str(e)}"}
