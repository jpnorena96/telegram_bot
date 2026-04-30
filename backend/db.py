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
        sql = "SELECT id, country, plan FROM users WHERE email = %s AND password = %s"
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
