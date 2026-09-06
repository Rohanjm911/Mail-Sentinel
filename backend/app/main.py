"""
Mail Sentinel - Intelligent Email Phishing Detection & Threat Analysis Platform
FastAPI Application Entrypoint
"""
import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

# Add backend directory to sys.path for internal imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.db.database import engine, Base
from app.services.ml_service import MLService
from app.api.routes import health, scans, statistics, threat_intel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not existing
    Base.metadata.create_all(bind=engine)
    # Preload ML model singleton into memory
    ml_service = MLService.get_instance()
    if ml_service.loaded:
        print("[Mail Sentinel] Detection Engine Online: ML classifier loaded successfully.")
    else:
        print("[Mail Sentinel] Notice: ML classifier artifacts not loaded.")
    yield
    # Shutdown: Clean up resources
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.TAGLINE} - SOC-grade Explainable Threat Analysis Platform",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Consistent JSON Error Handlers as required by Section 17
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    code = "HTTP_ERROR"
    message = str(exc.detail)
    if isinstance(exc.detail, dict):
        code = exc.detail.get("code", "ERROR")
        message = exc.detail.get("message", str(exc.detail))

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg", "Invalid request body.") if errors else "Validation error."
    field = ".".join(str(loc) for loc in errors[0].get("loc", [])) if errors else ""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"{field}: {msg}" if field else msg,
                "details": errors
            }
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Prevent leaking internal stack traces or paths as required in Section 32
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred during threat analysis. The event has been logged."
            }
        }
    )

# Include API Routers
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(scans.router, prefix=settings.API_V1_PREFIX)
app.include_router(statistics.router, prefix=settings.API_V1_PREFIX)
app.include_router(threat_intel.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health"
    }
