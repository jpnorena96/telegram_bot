import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Evolution API Config
EVOLUTION_API_URL = "https://bot-evolution-api.gnuu1e.easypanel.host"
EVOLUTION_API_TOKEN = "BE0DD94EFEF7-4E20-B115-8115FAEA8F98"
INSTANCE_NAME = "test"

async def send_whatsapp_message(phone_number: str, text: str) -> bool:
    """
    Sends a WhatsApp message using Evolution API.
    """
    if not phone_number:
        logger.warning("No phone number provided for WhatsApp notification.")
        return False

    # Clean phone number (remove any non-numeric characters except +)
    phone_clean = "".join([c for c in phone_number if c.isdigit() or c == "+"])
    
    # Remove '+' for Evolution API if present
    if phone_clean.startswith("+"):
        phone_clean = phone_clean[1:]

    url = f"{EVOLUTION_API_URL}/message/sendText/{INSTANCE_NAME}"
    
    headers = {
        "apikey": EVOLUTION_API_TOKEN,
        "Content-Type": "application/json"
    }
    
    payload = {
        "number": phone_clean,
        "options": {
            "delay": 1200,
            "presence": "composing",
            "linkPreview": False
        },
        "textMessage": {
            "text": text
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            logger.info(f"WhatsApp message sent to {phone_clean}")
            return True
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred while sending WhatsApp message: {e.response.text}")
        return False
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {str(e)}")
        return False

async def notify_appointment_scheduled(phone_number: str, client_name: str, date: str):
    """
    Helper function to format and send a success notification via WhatsApp.
    """
    msg = (
        f"✅ *CITA AGENDADA EXITOSAMENTE*\n\n"
        f"👤 *Solicitante:* {client_name}\n"
        f"📅 *Nueva Fecha:* {date}\n\n"
        f"El sistema automático de AdelantaVisa ha logrado adelantar esta cita. ¡Felicidades!"
    )
    return await send_whatsapp_message(phone_number, msg)
