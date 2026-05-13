from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
import mysql.connector
import io
import csv
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG
from .auth import get_current_user, get_db, get_password_hash

PRICE_PER_APPT = 10.0

router = APIRouter()


def require_admin(current_user: dict = Depends(get_current_user)):
    role = current_user["roles"][0]
    if role not in ["ADMINISTRATOR", "AUDITOR"]:
        raise HTTPException(status_code=403, detail="Solo administradores o auditores")
    return current_user


def require_admin_only(current_user: dict = Depends(get_current_user)):
    role = current_user["roles"][0]
    if role != "ADMINISTRATOR":
        raise HTTPException(status_code=403, detail="Solo administradores")
    return current_user


# ── GET /admin/summary ─────────────────────────────────────────────────────
@router.get("/summary")
def get_summary(current_user: dict = Depends(require_admin), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT COUNT(*) as total FROM users WHERE role != 'ADMINISTRATOR'")
    total_users = cur.fetchone()["total"]

    cur.execute("SELECT COUNT(*) as total FROM users WHERE is_authorized=1 AND role != 'ADMINISTRATOR'")
    active_users = cur.fetchone()["total"]

    cur.execute("SELECT COUNT(*) as total FROM users WHERE is_authorized=0")
    pending_users = cur.fetchone()["total"]

    cur.execute("SELECT COUNT(*) as total FROM user_appointments")
    total_apts = cur.fetchone()["total"]

    cur.execute("SELECT COUNT(*) as total FROM user_appointments WHERE status='pending'")
    searching = cur.fetchone()["total"]

    cur.execute("SELECT COUNT(*) as total FROM user_appointments WHERE status NOT IN ('pending','guardada')")
    completed = cur.fetchone()["total"]

    cur.close()

    total_revenue = total_apts * PRICE_PER_APPT
    return {
        "total_users": total_users,
        "active_users": active_users,
        "pending_users": pending_users,
        "total_appointments": total_apts,
        "searching_appointments": searching,
        "completed_appointments": completed,
        "total_revenue_usd": total_revenue,
        "price_per_appointment": PRICE_PER_APPT,
    }


# ── GET /admin/users ───────────────────────────────────────────────────────
@router.get("/users")
def get_admin_users(current_user: dict = Depends(require_admin), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT
            u.id, u.full_name, u.email, u.role, u.is_authorized, u.plan,
            COUNT(a.id)               AS appointment_count,
            COUNT(a.id) * %s          AS revenue_usd,
            MAX(a.date_created)       AS last_appointment
        FROM users u
        LEFT JOIN user_appointments a ON a.user_id = u.id
        GROUP BY u.id
        ORDER BY u.id DESC
    """, (PRICE_PER_APPT,))
    rows = cur.fetchall()
    cur.close()
    result = []
    for r in rows:
        r["last_appointment"] = str(r["last_appointment"]) if r["last_appointment"] else None
        r["revenue_usd"] = float(r["revenue_usd"] or 0)
        r["name"] = r.get("full_name") or r["email"].split("@")[0]
        result.append(r)
    return result


# ── GET /admin/users/{user_id}/appointments ───────────────────────────────
@router.get("/users/{user_id}/appointments")
def get_user_appointments(user_id: int, current_user: dict = Depends(require_admin), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT id, email, consulate, country, status, schedule_id,
               date_created, min_consulate_date, max_consulate_date
        FROM user_appointments
        WHERE user_id = %s
        ORDER BY id DESC
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()
    for r in rows:
        r["date_created"] = str(r["date_created"]) if r["date_created"] else None
        r["min_consulate_date"] = str(r["min_consulate_date"]) if r["min_consulate_date"] else None
        r["max_consulate_date"] = str(r["max_consulate_date"]) if r["max_consulate_date"] else None
        r["charge_usd"] = PRICE_PER_APPT
    return rows


# ── GET /admin/appointments ────────────────────────────────────────────────
@router.get("/appointments")
def get_all_appointments(current_user: dict = Depends(require_admin), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT
            a.id, IFNULL(u.full_name, a.email) AS client_name,
            u.email AS user_email, a.email AS portal_email,
            a.consulate, a.country, a.status, a.schedule_id,
            a.date_created, a.min_consulate_date, a.max_consulate_date,
            %s AS charge_usd
        FROM user_appointments a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.id DESC
        LIMIT 200
    """, (PRICE_PER_APPT,))
    rows = cur.fetchall()
    cur.close()
    for r in rows:
        r["date_created"] = str(r["date_created"]) if r["date_created"] else None
        r["min_consulate_date"] = str(r["min_consulate_date"]) if r["min_consulate_date"] else None
        r["max_consulate_date"] = str(r["max_consulate_date"]) if r["max_consulate_date"] else None
        r["charge_usd"] = float(r["charge_usd"])
    return rows


# ── POST /admin/users ──────────────────────────────────────────────────────
class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "NATURAL_PERSON"
    plan: str = "platino"
    is_authorized: bool = True


@router.post("/users")
def create_user(req: CreateUserRequest, current_user: dict = Depends(require_admin_only), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT id FROM users WHERE email = %s", (req.email,))
    if cur.fetchone():
        cur.close()
        raise HTTPException(status_code=400, detail="Email ya registrado")
    hashed = get_password_hash(req.password)
    cur.execute(
        "INSERT INTO users (full_name, email, password, role, plan, is_authorized, country) VALUES (%s,%s,%s,%s,%s,%s,'co')",
        (req.full_name, req.email, hashed, req.role, req.plan, 1 if req.is_authorized else 0)
    )
    db.commit()
    new_id = cur.lastrowid
    cur.close()
    return {"status": "ok", "id": new_id}


# ── PUT /admin/users/{user_id} ─────────────────────────────────────────────
class UpdateUserRequest(BaseModel):
    is_authorized: Optional[bool] = None
    role: Optional[str] = None
    plan: Optional[str] = None
    full_name: Optional[str] = None


@router.put("/users/{user_id}")
def update_user(user_id: int, req: UpdateUserRequest, current_user: dict = Depends(require_admin_only), db=Depends(get_db)):
    cur = db.cursor()
    fields, vals = [], []
    if req.is_authorized is not None:
        fields.append("is_authorized=%s"); vals.append(1 if req.is_authorized else 0)
    if req.role:
        fields.append("role=%s"); vals.append(req.role)
    if req.plan:
        fields.append("plan=%s"); vals.append(req.plan)
    if req.full_name:
        fields.append("full_name=%s"); vals.append(req.full_name)
    if not fields:
        cur.close(); return {"status": "no_changes"}
    vals.append(user_id)
    cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id=%s", vals)
    db.commit(); cur.close()
    return {"status": "ok"}


# ── DELETE /admin/users/{user_id} ─────────────────────────────────────────
@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(require_admin_only), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("DELETE FROM user_appointments WHERE user_id=%s", (user_id,))
    cur.execute("DELETE FROM users WHERE id=%s", (user_id,))
    db.commit(); cur.close()
    return {"status": "ok"}


# ── GET /admin/export/csv ─────────────────────────────────────────────────
@router.get("/export/csv")
def export_csv(current_user: dict = Depends(require_admin), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT
            a.id AS cita_id,
            IFNULL(u.full_name, a.email) AS cliente,
            u.email AS email_usuario,
            a.email AS email_portal,
            a.consulate AS consulado,
            a.country AS pais,
            a.status AS estado,
            a.schedule_id,
            a.date_created AS fecha_creacion,
            a.min_consulate_date AS fecha_min,
            a.max_consulate_date AS fecha_max,
            %s AS cobro_usd
        FROM user_appointments a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.id DESC
    """, (PRICE_PER_APPT,))
    rows = cur.fetchall(); cur.close()

    output = io.StringIO()
    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader(); writer.writerows(rows)

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.read().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=auditoria_citas.csv"}
    )
