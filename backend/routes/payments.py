from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import mysql.connector
from .auth import get_db

router = APIRouter()

class PaymentVerificationRequest(BaseModel):
    user_id: int
    transaction_id: str
    plan_name: str

@router.post("/verify")
def verify_payment(req: PaymentVerificationRequest, db = Depends(get_db)):
    # En un ambiente real, aquí haríamos una petición HTTP al API de Wompi 
    # usando la llave privada (Prv Key) para verificar que el transaction_id
    # realmente existe y su estado es "APPROVED".
    # Por ahora simulamos la verificación exitosa para la integración de Sandbox.
    
    if not req.transaction_id:
        raise HTTPException(status_code=400, detail="Falta el transaction_id de Wompi")

    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, subscription_status FROM users WHERE id = %s", (req.user_id,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        # Update user subscription
        cursor.execute("""
            UPDATE users 
            SET subscription_status = 'active', 
                subscription_plan = %s,
                wompi_transaction_id = %s
            WHERE id = %s
        """, (req.plan_name, req.transaction_id, req.user_id))
        
        db.commit()
        
        return {"status": "success", "message": "Pago verificado exitosamente. Suscripción activada."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
