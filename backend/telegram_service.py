import httpx
import os
import logging

# Set your bot token in the environment variables or replace here for testing.
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8451235369:AAFeoGdbIHfRyxAyaBgnV300V91zs-CbtMo")
# You can set a global chat ID or pass it per message
DEFAULT_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "7568579919")

logger = logging.getLogger(__name__)

async def send_telegram_message(message: str, chat_id: str = None):
    """
    Sends a message to a Telegram chat via the official Bot API.
    """
    if not chat_id:
        chat_id = DEFAULT_CHAT_ID
        
    if TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
        logger.warning("Telegram Bot Token is not set. Skipping message send.")
        return False
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"Message sent to Telegram chat {chat_id}")
            return True
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {str(e)}")
        return False

async def notify_new_schedule(schedule_id: str, client_name: str, date: str):
    """
    Helper function to format and send a new schedule discovery notification.
    """
    msg = (
        f"🚨 <b>NUEVO SCHEDULE DESCUBIERTO</b> 🚨\n\n"
        f"<b>ID:</b> {schedule_id}\n"
        f"<b>Cliente:</b> {client_name}\n"
        f"<b>Fecha:</b> {date}\n\n"
        f"<i>El sistema ha sincronizado este registro exitosamente.</i>"
    )
    return await send_telegram_message(msg)

async def notify_new_appointment(client_email: str, consulate: str, date_created: str, type_visa: str = "B1/B2"):
    """
    Sends a notification when a new appointment is created from the frontend.
    """
    msg = (
        f"✅ <b>NUEVA CITA CREADA EN FRONTEND</b> ✅\n\n"
        f"<b>Cliente (Email):</b> {client_email}\n"
        f"<b>Consulado:</b> {consulate}\n"
        f"<b>Fecha de Registro:</b> {date_created}\n"
        f"<b>Tipo:</b> {type_visa}\n\n"
        f"<i>El sistema ha registrado la cita exitosamente.</i>"
    )
    return await send_telegram_message(msg)
