from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from .auth import get_current_user, get_db

router = APIRouter()

class AgencyProfileUpdate(BaseModel):
    alias: str
    company_name: str
    logo_url: Optional[str] = None
    brand_color: Optional[str] = "#4F46E5"

class AdminAgencyStatusUpdate(BaseModel):
    status: str # 'pending', 'approved', 'rejected'

@router.get("/profile")
def get_my_agency_profile(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM agency_profiles WHERE user_id = %s", (current_user["id"],))
        profile = cursor.fetchone()
        return {"status": "ok", "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.post("/profile")
def update_my_agency_profile(req: AgencyProfileUpdate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    if current_user["roles"][0] != "TRAVEL_AGENCY":
        raise HTTPException(status_code=403, detail="Only travel agencies can setup a profile")
        
    cursor = db.cursor(dictionary=True)
    try:
        # Verify if alias is taken by another agency
        cursor.execute("SELECT id FROM agency_profiles WHERE alias = %s AND user_id != %s", (req.alias, current_user["id"]))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Alias ya está en uso por otra agencia")
            
        cursor.execute("SELECT id FROM agency_profiles WHERE user_id = %s", (current_user["id"],))
        existing = cursor.fetchone()
        
        if existing:
            # Update
            cursor.execute("""
                UPDATE agency_profiles 
                SET alias = %s, company_name = %s, logo_url = %s, brand_color = %s
                WHERE user_id = %s
            """, (req.alias, req.company_name, req.logo_url, req.brand_color, current_user["id"]))
        else:
            # Create
            cursor.execute("""
                INSERT INTO agency_profiles (user_id, alias, company_name, logo_url, brand_color, status)
                VALUES (%s, %s, %s, %s, %s, 'pending')
            """, (current_user["id"], req.alias, req.company_name, req.logo_url, req.brand_color))
            
        db.commit()
        return {"status": "ok", "message": "Perfil actualizado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

# Public endpoint for white label
@router.get("/public/{alias}")
def get_public_agency_profile(alias: str, db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT company_name, logo_url, brand_color, status FROM agency_profiles WHERE alias = %s", (alias,))
        profile = cursor.fetchone()
        
        if not profile:
            raise HTTPException(status_code=404, detail="Agencia no encontrada")
            
        if profile["status"] != "approved":
            raise HTTPException(status_code=403, detail="El perfil de la agencia no está activo")
            
        return {"status": "ok", "profile": {
            "company_name": profile["company_name"],
            "logo_url": profile["logo_url"],
            "brand_color": profile["brand_color"]
        }}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

# Admin endpoints
@router.get("/admin/list")
def get_all_agencies(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    if current_user["roles"][0] not in ["ADMINISTRATOR", "AUDITOR"]:
        raise HTTPException(status_code=403, detail="Only admins can view all agencies")
        
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT a.*, u.email FROM agency_profiles a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC")
        agencies = cursor.fetchall()
        return {"status": "ok", "agencies": agencies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.post("/admin/{id}/status")
def update_agency_status(id: int, req: AdminAgencyStatusUpdate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    if current_user["roles"][0] != "ADMINISTRATOR":
        raise HTTPException(status_code=403, detail="Only administrators can approve agencies")
        
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("UPDATE agency_profiles SET status = %s WHERE id = %s", (req.status, id))
        db.commit()
        return {"status": "ok", "message": "Estado actualizado"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
