import logging
import mysql.connector
from typing import Optional, List
from config import DB_CONFIG

logger = logging.getLogger(__name__)


def verify_user(email: str, password: str) -> Optional[dict]:
    """Verifies user credentials against the database. Returns user dict or None."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT id, country, plan, telegram_user_id, role FROM users WHERE email = %s AND password = %s"
        cursor.execute(sql, (email, password))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
    except mysql.connector.Error as err:
        logger.error(f"Database Error in verify_user: {err}")
        raise


def check_existing_appointment(user_id: int, email: str, consulate: str = None) -> Optional[dict]:
    """Checks if an appointment with this email (and optionally consulate) already exists for the user.
    
    When consulate is provided, matches on (user_id, email, consulate) so that the same
    email can have multiple IVR profiles registered under different consulates.
    """
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        if consulate:
            sql = "SELECT id FROM user_appointments WHERE user_id = %s AND email = %s AND consulate = %s"
            cursor.execute(sql, (user_id, email, consulate))
        else:
            sql = "SELECT id FROM user_appointments WHERE user_id = %s AND email = %s"
            cursor.execute(sql, (user_id, email))
        existing = cursor.fetchone()
        cursor.close()
        conn.close()
        return existing
    except mysql.connector.Error as err:
        logger.error(f"Database Error in check_existing_appointment: {err}")
        raise


def check_existing_appointments_by_email(user_id: int, email: str) -> List[dict]:
    """Returns ALL existing appointment profiles for a given (user_id, email) combination.
    
    Useful to detect when the same email already has IVR profiles registered so the
    bot can inform the user and still allow adding a new profile for a different consulate.
    """
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT id, consulate, consulate_asc FROM user_appointments WHERE user_id = %s AND email = %s"
        cursor.execute(sql, (user_id, email))
        existing = cursor.fetchall()
        cursor.close()
        conn.close()
        return existing
    except mysql.connector.Error as err:
        logger.error(f"Database Error in check_existing_appointments_by_email: {err}")
        raise


def get_appointments(user_id: int) -> List[dict]:
    """Returns all appointments for a user."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM user_appointments WHERE user_id = %s"
        cursor.execute(sql, (user_id,))
        appointments = cursor.fetchall()
        cursor.close()
        conn.close()
        return appointments
    except mysql.connector.Error as err:
        logger.error(f"Database Error in get_appointments: {err}")
        raise


def get_appointment_list(user_id: int) -> List[dict]:
    """Returns a simplified list of appointments (id, email, consulate) for selection."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT id, email, consulate FROM user_appointments WHERE user_id = %s"
        cursor.execute(sql, (user_id,))
        appointments = cursor.fetchall()
        cursor.close()
        conn.close()
        return appointments
    except mysql.connector.Error as err:
        logger.error(f"Database Error in get_appointment_list: {err}")
        raise


def get_appointment(appointment_id: int) -> Optional[dict]:
    """Returns a single appointment by ID."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM user_appointments WHERE id = %s"
        cursor.execute(sql, (appointment_id,))
        appt = cursor.fetchone()
        cursor.close()
        conn.close()
        return appt
    except mysql.connector.Error as err:
        logger.error(f"Database Error in get_appointment: {err}")
        raise


def save_appointment(telegram_user_id: int, user_id: int, user_data: dict) -> tuple[str, int]:
    """Inserts a new appointment. Returns (action_text, appointment_id)."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        sql = """INSERT INTO user_appointments (
                 telegram_user_id, user_id, email, password, ivr, country,
                 consulate, consulate_asc,
                 min_consulate_date, max_consulate_date, min_asc_date, max_asc_date,
                 schedule_id, status
                 ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')"""
        val = (telegram_user_id, user_id, user_data["appt_email"], user_data["appt_password"],
               user_data.get("ivr"), user_data.get("country", "co"),
               user_data["consulate"], user_data["consulate_asc"],
               user_data["min_consulate_date"], user_data["max_consulate_date"],
               user_data["min_asc_date"], user_data["max_asc_date"],
               user_data.get("schedule_id"))
        cursor.execute(sql, val)
        conn.commit()
        appointment_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return "guardada", appointment_id
    except mysql.connector.Error as err:
        logger.error(f"Database Error in save_appointment: {err}")
        raise


def update_appointment(telegram_user_id: int, appointment_id: int, user_data: dict) -> tuple[str, int]:
    """Updates an existing appointment. Returns (action_text, appointment_id)."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        sql = """UPDATE user_appointments SET
                 telegram_user_id = %s, password = %s, ivr = %s, country = %s,
                 consulate = %s, consulate_asc = %s,
                 min_consulate_date = %s, max_consulate_date = %s,
                 min_asc_date = %s, max_asc_date = %s,
                 schedule_id = %s, status = 'pending'
                 WHERE id = %s"""
        val = (telegram_user_id, user_data["appt_password"], user_data.get("ivr"),
               user_data.get("country", "co"),
               user_data["consulate"], user_data["consulate_asc"],
               user_data["min_consulate_date"], user_data["max_consulate_date"],
               user_data["min_asc_date"], user_data["max_asc_date"],
               user_data.get("schedule_id"),
               appointment_id)
        cursor.execute(sql, val)
        conn.commit()
        cursor.close()
        conn.close()
        return "actualizada", appointment_id
    except mysql.connector.Error as err:
        logger.error(f"Database Error in update_appointment: {err}")
        raise


def delete_appointment(appointment_id: int) -> bool:
    """Deletes an appointment by ID. Returns True on success."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_appointments WHERE id = %s", (appointment_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except mysql.connector.Error as err:
        logger.error(f"Database Error in delete_appointment: {err}")
        raise
def get_appointment_count(user_id: int) -> int:
    """Returns the number of appointments for a user."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        sql = "SELECT COUNT(*) FROM user_appointments WHERE user_id = %s"
        cursor.execute(sql, (user_id,))
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count
    except mysql.connector.Error as err:
        logger.error(f"Database Error in get_appointment_count: {err}")
        return 0


def save_schedule_id(email: str, schedule_id: str) -> bool:
    """Updates the schedule_id of the most recent appointment for a given email.
    Called after the PM2 process starts successfully so the schedule_id is persisted."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        sql = """UPDATE user_appointments
                 SET schedule_id = %s
                 WHERE email = %s
                 ORDER BY id DESC
                 LIMIT 1"""
        cursor.execute(sql, (schedule_id, email))
        conn.commit()
        affected = cursor.rowcount
        cursor.close()
        conn.close()
        logger.info(f"save_schedule_id: {schedule_id} → email={email}, rows={affected}")
        return affected > 0
    except mysql.connector.Error as err:
        logger.error(f"Database Error in save_schedule_id: {err}")
        return False

def check_existing_schedule_id(schedule_id: str) -> bool:
    """Checks if a schedule_id is already registered by any user."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT id FROM user_appointments WHERE schedule_id = %s"
        cursor.execute(sql, (schedule_id,))
        existing = cursor.fetchone()
        cursor.close()
        conn.close()
        return bool(existing)
    except mysql.connector.Error as err:
        logger.error(f"Database Error in check_existing_schedule_id: {err}")
        return False


def update_appointment_status(appointment_id: int, status: str) -> bool:
    """Updates the status of an appointment in the database."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        sql = "UPDATE user_appointments SET status = %s WHERE id = %s"
        cursor.execute(sql, (status, appointment_id))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except mysql.connector.Error as err:
        logger.error(f"Database Error in update_appointment_status: {err}")
        return False


def get_admin_summary() -> dict:
    """Returns general statistics for the admin dashboard."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE role != 'ADMINISTRATOR'")
        total_users = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_authorized=1 AND role != 'ADMINISTRATOR'")
        active_users = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_authorized=0")
        pending_users = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as total FROM user_appointments")
        total_apts = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as total FROM user_appointments WHERE status='pending'")
        searching = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as total FROM user_appointments WHERE status NOT IN ('pending', 'guardada')")
        completed = cursor.fetchone()["total"]
        
        cursor.close()
        conn.close()
        return {
            "total_users": total_users,
            "active_users": active_users,
            "pending_users": pending_users,
            "total_appointments": total_apts,
            "searching_appointments": searching,
            "completed_appointments": completed
        }
    except mysql.connector.Error as err:
        logger.error(f"Database Error in get_admin_summary: {err}")
        return {}


def get_admin_users() -> List[dict]:
    """Returns a list of all users for administration."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id, u.full_name, u.email, u.role, u.is_authorized, u.plan,
                   COUNT(a.id) AS appointment_count
            FROM users u
            LEFT JOIN user_appointments a ON a.user_id = u.id
            GROUP BY u.id
            ORDER BY u.id DESC
        """)
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        return users
    except mysql.connector.Error as err:
        logger.error(f"Database Error in get_admin_users: {err}")
        return []


def admin_create_user(name: str, email: str, password_text: str, role: str, plan: str) -> int:
    """Creates a new user with proper password hashing and returns the new ID, or 0 on error."""
    import hashlib
    import bcrypt
    try:
        # Hashing using SHA256 + Bcrypt
        sha256_pw = hashlib.sha256(password_text.encode('utf-8')).hexdigest().encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(sha256_pw, salt).decode('utf-8')
        
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        sql = "INSERT INTO users (full_name, email, password, role, plan, is_authorized, country) VALUES (%s, %s, %s, %s, %s, 1, 'co')"
        cursor.execute(sql, (name, email, hashed_password, role, plan))
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return new_id
    except mysql.connector.Error as err:
        logger.error(f"Database Error in admin_create_user: {err}")
        return 0


def admin_update_user(user_id: int, fields: dict) -> bool:
    """Updates user information in the database."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        sql_parts = []
        vals = []
        for col, val in fields.items():
            sql_parts.append(f"{col} = %s")
            vals.append(val)
            
        if not sql_parts:
            return False
            
        vals.append(user_id)
        sql = f"UPDATE users SET {', '.join(sql_parts)} WHERE id = %s"
        cursor.execute(sql, vals)
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except mysql.connector.Error as err:
        logger.error(f"Database Error in admin_update_user: {err}")
        return False


def admin_delete_user(user_id: int) -> bool:
    """Deletes a user and all their appointments."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        # Delete appointments first due to foreign key
        cursor.execute("DELETE FROM user_appointments WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except mysql.connector.Error as err:
        logger.error(f"Database Error in admin_delete_user: {err}")
        return False


def get_all_appointments_admin() -> List[dict]:
    """Returns the most recent 15 appointments in the system for admin view."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.id, a.email, a.consulate, a.country, a.status, a.schedule_id, 
                   u.full_name as client_name
            FROM user_appointments a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.id DESC
            LIMIT 15
        """)
        appointments = cursor.fetchall()
        cursor.close()
        conn.close()
        return appointments
    except mysql.connector.Error as err:
        logger.error(f"Database Error in get_all_appointments_admin: {err}")
        return []
