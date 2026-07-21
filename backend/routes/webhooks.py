from fastapi import APIRouter, Request, BackgroundTasks, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Any, Dict
import json
import logging
import asyncio

from backend.sse import sse_manager
from backend.telegram_service import notify_new_schedule
from .auth import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

class SchedulePayload(BaseModel):
    schedule_id: str
    client_name: Optional[str] = "Desconocido"
    date: Optional[str] = "No definida"
    metadata: Optional[Dict[str, Any]] = None

@router.post("/schedule")
async def receive_schedule_webhook(payload: SchedulePayload, background_tasks: BackgroundTasks, db = Depends(get_db)):
    """
    Webhook endpoint para recibir notificaciones pasivas de nuevos schedules desde scrapers/bots.
    """
    try:
        # Aquí guardaríamos o actualizaríamos en BD. Para el MVP asumo que si no existe, se registra, 
        # o si existe, se actualiza el estado. Simulamos el registro en logs:
        logger.info(f"Webhook recibido: Nuevo Schedule {payload.schedule_id} para {payload.client_name}")
        
        # Broadcast vía SSE al Frontend (React) en tiempo real
        await sse_manager.broadcast("schedule_discovered", {
            "schedule_id": payload.schedule_id,
            "client_name": payload.client_name,
            "date": payload.date
        })
        
        # Enviar notificación a Telegram en background para no bloquear el request
        background_tasks.add_task(notify_new_schedule, payload.schedule_id, payload.client_name, payload.date)
        
        return {"status": "success", "message": "Schedule procesado y emitido exitosamente"}
    except Exception as e:
        logger.error(f"Error procesando webhook de schedule: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/stream")
async def sse_stream(request: Request):
    """
    Endpoint de Server-Sent Events (SSE) para que el frontend escuche eventos en tiempo real.
    """
    async def event_generator():
        queue = await sse_manager.subscribe()
        try:
            while True:
                # Si el cliente se desconecta, request.is_disconnected() lo detectará eventualmente, 
                # pero wait_for lanza CancelledError si la conexión se cierra al escribir.
                if await request.is_disconnected():
                    break
                # Esperar mensajes de la cola
                message = await queue.get()
                yield message
        except asyncio.CancelledError:
            pass
        finally:
            sse_manager.unsubscribe(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
