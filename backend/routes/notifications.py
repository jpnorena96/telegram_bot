from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
import mysql.connector
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from .auth import get_current_user, get_db

router = APIRouter()

@router.get("/")
def get_user_notifications(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT id, message, status, is_read, created_at 
            FROM notifications 
            WHERE user_id = %s 
            ORDER BY id DESC 
            LIMIT 15
        """, (current_user["id"],))
        rows = cursor.fetchall()
        
        # Format dates
        for r in rows:
            if r["created_at"]:
                r["created_at"] = r["created_at"].strftime('%Y-%m-%d %H:%M:%S')
                
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.post("/read")
def mark_notifications_as_read(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("""
            UPDATE notifications 
            SET is_read = 1 
            WHERE user_id = %s
        """, (current_user["id"],))
        db.commit()
        return {"status": "ok", "message": "Notificaciones marcadas como leídas"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
