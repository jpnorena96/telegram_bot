from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import hashlib
import mysql.connector

# Re-use config for DB connection
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG

# --- JWT Configuration ---
SECRET_KEY = "super-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

router = APIRouter()

# --- Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str

# --- Security Utilities ---
def verify_password(plain_password, hashed_password):
    # Soporte para contraseñas en texto plano (Legacy)
    if plain_password == hashed_password:
        return True
        
    try:
        # Opción 1: Probar si fue encriptada usando el pre-hash SHA256
        sha256_pw = hashlib.sha256(plain_password.encode('utf-8')).hexdigest().encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        if bcrypt.checkpw(sha256_pw, hash_bytes):
            return True
    except Exception:
        pass
        
    try:
        # Opción 2: Probar si fue encriptada directamente (legacy truncado)
        pw_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password):
    # Pre-hash con SHA256 garantiza una longitud de exactamente 64 caracteres hex.
    # Esto soluciona de forma absoluta el límite de 72 bytes de bcrypt.
    sha256_pw = hashlib.sha256(password.encode('utf-8')).hexdigest().encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(sha256_pw, salt)
    return hashed_bytes.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

security = HTTPBearer()

# --- Dependencies ---
def get_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception

# --- Routes ---
@router.post("/login", response_model=Token)
def login(request: LoginRequest, db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    # Include role and full_name once added to DB schema
    try:
        cursor.execute("SELECT id, email, password, role, full_name FROM users WHERE email = %s", (request.email,))
    except mysql.connector.Error:
        # Fallback if DB not migrated yet
        cursor.execute("SELECT id, email, password FROM users WHERE email = %s", (request.email,))
        
    user = cursor.fetchone()
    cursor.close()

    if not user or not verify_password(request.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check authorization for non-admin/natural person roles
    role = user.get('role') or 'NATURAL_PERSON'
    
    # Check if authorized if they are a manager or agency
    if role in ['VISA_MANAGER', 'TRAVEL_AGENCY']:
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT is_authorized FROM users WHERE id = %s", (user['id'],))
        auth_check = cursor.fetchone()
        if not auth_check or not auth_check['is_authorized']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu cuenta está pendiente de aprobación por el administrador."
            )
    
    # Defaults if migration didn't happen yet
    role = user.get('role') or 'NATURAL_PERSON'
    user_name = user.get('full_name') or user['email'].split('@')[0]

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email'], "roles": [role], "id": user['id']},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": role, "user_name": user_name}

@router.post("/register")
def register(request: RegisterRequest, db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (request.email,))
    if cursor.fetchone():
        cursor.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(request.password)
    
    try:
        # Natural persons are authorized by default, managers and agencies need approval
        is_authorized = 1 if request.role == 'NATURAL_PERSON' else 0
        cursor.execute(
            "INSERT INTO users (email, password, role, full_name, country, is_authorized) VALUES (%s, %s, %s, %s, 'co', %s)",
            (request.email, hashed_password, request.role, request.full_name, is_authorized)
        )
    except mysql.connector.Error as err:
        cursor.close()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
        
    db.commit()
    user_id = cursor.lastrowid
    cursor.close()
    
    if is_authorized:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": request.email, "roles": [request.role], "id": user_id},
            expires_delta=access_token_expires
        )
        return {"status": "authorized", "access_token": access_token, "token_type": "bearer", "role": request.role, "user_name": request.full_name}
    else:
        return {"status": "pending", "message": "Cuenta creada. Esperando aprobación."}
