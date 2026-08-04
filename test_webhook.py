import os
import sys
import requests

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from backend.db import get_db

def test_webhook():
    db = next(get_db())
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT a.schedule_id, u.whatsapp_number, u.full_name
        FROM user_appointments a
        JOIN users u ON a.user_id = u.id
        WHERE u.whatsapp_number IS NOT NULL AND u.whatsapp_number != '' AND a.schedule_id IS NOT NULL AND a.schedule_id != ''
        LIMIT 1
    """)
    row = cursor.fetchone()
    
    if not row:
        print("No se encontro ninguna cita con schedule_id que pertenezca a un usuario con whatsapp_number.")
        return
        
    print(f"Probando con schedule_id: {row['schedule_id']} del usuario {row['full_name']} (WA: {row['whatsapp_number']})")
    
    # Enviar webhook al servidor de produccion, si se sabe la URL.
    # Como la db debe ser remota o local, probaremos primero con una direct call a Evolution API!
    # El usuario pidio una "test", entonces enviemos la notificacion por python directo.
    from backend.whatsapp_service import notify_appointment_scheduled
    import asyncio
    
    print("Enviando WhatsApp...")
    result = asyncio.run(notify_appointment_scheduled(row['whatsapp_number'], row['full_name'], "2024-12-15 10:00:00"))
    print(f"Resultado WhatsApp: {result}")

if __name__ == "__main__":
    test_webhook()
