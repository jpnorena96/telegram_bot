import asyncio
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from whatsapp_service import send_whatsapp_message

async def main():
    phone = "+573114526128"
    msg = """¡Hola! Te traigo excelentes noticias 🥳 🎉 

Acabamos de adelantar exitosamente tu cita de la visa. Aquí te dejo cómo quedaron las nuevas fechas para tu cuenta (Sofiavaloyes711@gmail.com):

🏢 *Huellas y Fotografía (CAS):* 
📅 14 de Septiembre de 2026 a las 07:15 AM

🏛️ *Entrevista Consular:* 
📅 23 de Septiembre de 2026 a las 07:30 AM

Ya actualizamos todo en el sistema y tu estado es oficialmente 'agendado'. ¡Mucho éxito en tu entrevista! ✅"""
    
    success = await send_whatsapp_message(phone, msg)
    if success:
        print("Mensaje enviado exitosamente.")
    else:
        print("Fallo al enviar el mensaje.")

if __name__ == "__main__":
    asyncio.run(main())
