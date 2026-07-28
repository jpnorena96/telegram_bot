from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routes import auth, appointments, users, admin, notifications, documents, webhooks, agency, payments, visa_processes
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="AdelantaVisa API")

# Ensure uploads directories exist
os.makedirs("uploads/logos", exist_ok=True)
os.makedirs("uploads/visas", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://n8n-bot-front-visatreep.gnuu1e.easypanel.host"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler to ensure CORS headers are always present
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(agency.router, prefix="/api/agency", tags=["Agency"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(visa_processes.router, prefix="/api/visa-processes", tags=["visa_processes"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "AdelantaVisa API is running"}
