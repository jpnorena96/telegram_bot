from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import mysql.connector
import os
import requests
from .auth import get_db

router = APIRouter()

class PaymentVerificationRequest(BaseModel):
    user_id: int
    transaction_id: str
    plan_name: str

@router.post("/verify")
def verify_payment(req: PaymentVerificationRequest, db = Depends(get_db)):
    if not req.transaction_id:
        raise HTTPException(status_code=400, detail="Falta el transaction_id de Wompi")

    wompi_prv_key = os.getenv("WOMPI_PRV_KEY")
    
    # Si tenemos la llave configurada, verificamos con Wompi directamente
    if wompi_prv_key:
        is_sandbox = "test" in wompi_prv_key
        wompi_url = "https://sandbox.wompi.co/v1" if is_sandbox else "https://production.wompi.co/v1"
        
        try:
            res = requests.get(
                f"{wompi_url}/transactions/{req.transaction_id}",
                headers={"Authorization": f"Bearer {wompi_prv_key}"},
                timeout=10
            )
            if res.status_code != 200:
                raise HTTPException(status_code=400, detail="Transacción no encontrada en Wompi")
                
            tx_data = res.json().get("data", {})
            if tx_data.get("status") != "APPROVED":
                raise HTTPException(status_code=400, detail=f"Pago no aprobado. Estado actual: {tx_data.get('status')}")
                
        except requests.RequestException:
            raise HTTPException(status_code=500, detail="Error de comunicación con Wompi")
    else:
        # Modo de simulación si no hay llaves (Sandbox Local Frontend)
        if not req.transaction_id.startswith("sandbox_"):
            raise HTTPException(status_code=400, detail="Llave privada de Wompi no configurada en el servidor.")

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
