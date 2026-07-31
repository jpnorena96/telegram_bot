from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import mysql.connector
import os
import requests
from .auth import get_db, get_current_user

router = APIRouter()

@router.get("/public-key")
async def get_public_key():
    pub_key = os.getenv("WOMPI_PUB_KEY")
    if not pub_key:
        return {"public_key": "pub_test_Q5yDA9xoKdePzhSGeZaQS1mNNqAMxcgw"}
    return {"public_key": pub_key}

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
        # Create transactions table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS processed_transactions (
                transaction_id VARCHAR(100) PRIMARY KEY,
                user_id INT NOT NULL,
                amount INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Check if transaction already processed
        cursor.execute("SELECT transaction_id FROM processed_transactions WHERE transaction_id = %s", (req.transaction_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Esta transacción ya fue procesada.")

        cursor.execute("SELECT id, subscription_status FROM users WHERE id = %s", (req.user_id,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        # Record transaction (amount 0 since it's a subscription upgrade, not balance)
        cursor.execute("INSERT INTO processed_transactions (transaction_id, user_id, amount) VALUES (%s, %s, %s)", 
                      (req.transaction_id, req.user_id, 0))
                      
        # Update user subscription
        cursor.execute("""
            UPDATE users 
            SET subscription_status = 'active', 
                subscription_plan = %s,
                wompi_transaction_id = %s
            WHERE id = %s
        """, (req.plan_name, req.transaction_id, req.user_id))
        
        db.commit()
        
        return {"status": "success", "message": "Pago verificado exitosamente. Suscripción activada/actualizada."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

class TopUpVerificationRequest(BaseModel):
    transaction_id: str
    amount: int

@router.post("/topup-verify")
def verify_topup_payment(req: TopUpVerificationRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    if not req.transaction_id:
        raise HTTPException(status_code=400, detail="Falta el transaction_id de Wompi")

    wompi_prv_key = os.getenv("WOMPI_PRV_KEY")
    
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
        if not req.transaction_id.startswith("sandbox_"):
            raise HTTPException(status_code=400, detail="Llave privada de Wompi no configurada en el servidor.")

    cursor = db.cursor(dictionary=True)
    try:
        # Create transactions table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS processed_transactions (
                transaction_id VARCHAR(100) PRIMARY KEY,
                user_id INT NOT NULL,
                amount INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Check if transaction already processed
        cursor.execute("SELECT transaction_id FROM processed_transactions WHERE transaction_id = %s", (req.transaction_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Esta transacción ya fue procesada.")
            
        real_amount = req.amount
        if wompi_prv_key:
            # Prevent amount spoofing by using the real amount from Wompi
            try:
                real_amount = tx_data.get("amount_in_cents", req.amount * 100) // 100
            except:
                pass
                
        # Determine citas to add based on amount
        citas_added = 1
        if real_amount >= 135000:
            citas_added = 3
        elif real_amount >= 50000:
            citas_added = real_amount // 50000
                
        # Record transaction and update balance atomically
        cursor.execute("INSERT INTO processed_transactions (transaction_id, user_id, amount) VALUES (%s, %s, %s)", 
                      (req.transaction_id, current_user["id"], real_amount))
                      
        # Record in balance_history
        cursor.execute("""
            INSERT INTO balance_history (user_id, amount, type, description)
            VALUES (%s, %s, 'topup', %s)
        """, (current_user["id"], citas_added, f"Recarga de saldo Wompi: ${real_amount} COP"))
        
        cursor.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (citas_added, current_user["id"]))
        db.commit()
        
        return {"status": "success", "message": f"Recarga verificada exitosamente. Se abonaron {citas_added} Cita(s)."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
