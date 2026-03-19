from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, appointments, users

app = FastAPI(title="GlobalVisas API")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"], # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "GlobalVisas API is running"}
