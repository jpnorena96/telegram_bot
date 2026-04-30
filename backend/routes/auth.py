from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import mysql.connector

# Re-use config for DB connection
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG

# JWT Configuration
SECRET_KEY = "super-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
    # Depending on how the current bot handles passwords (currently plain text in SQL DB it seems)
    # the bot script checks "password = %s".
    # We should support plain text for existing, but hashing for new ones.
    # We will just do direct comparison here for simplicity as the legacy bot does.
    # Or, we can use passlib if they start hashing.
    if plain_password == hashed_password:
        return True
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except:
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

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
    
    # Defaults if migration didn't happen yet
    role = user.get('role', 'NATURAL_PERSON')
    user_name = user.get('full_name', user['email'].split('@')[0])

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
        cursor.execute(
            "INSERT INTO users (email, password, role, full_name, country) VALUES (%s, %s, %s, %s, 'co')",
            (request.email, hashed_password, request.role, request.full_name)
        )
    except mysql.connector.Error as err:
        cursor.close()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
        
    db.commit()
    user_id = cursor.lastrowid
    cursor.close()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.email, "roles": [request.role], "id": user_id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": request.role, "user_name": request.full_name}
