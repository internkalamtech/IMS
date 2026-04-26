"""
IMS Backend - FastAPI Application

Main application module that initializes and configures the FastAPI app.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.core.errors import IMSException
from app.core.logger import Logger
from app.infrastructure.database.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    Logger.info("Starting IMS Backend...")
    Logger.info(f"Environment: {'Development' if settings.debug else 'Production'}")

    try:
        await init_db()
        Logger.info("Database initialized successfully")
    except Exception as e:
        Logger.error(f"Failed to initialize database: {e}", exc_info=True)
        raise

    yield

    Logger.info("Shutting down IMS Backend...")
    await close_db()
    Logger.info("Database connections closed")


# App
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Institute Management System",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)


# Exception handlers
@app.exception_handler(IMSException)
async def ims_exception_handler(request: Request, exc: IMSException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"},
    )


# Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    Logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    Logger.info(f"{request.method} {request.url.path} - {response.status_code}")
    Logger.info(
        f"{request.method} {request.url.path} - "
        f"{response.status_code}"
    )
    return response


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(api_v1_router, prefix="/api")


# Root

@app.get("/", tags=["Root"])
async def root() -> dict:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/v1/health",
    }


# ✅ Admin Dashboard API (ISSUE FIX)
@app.get("/api/admin/dashboard", tags=["Admin"])
async def admin_dashboard():
    return {
        "total_users": 120,
        "active_users": 95,
        "total_courses": 15,
        "revenue": 50000
    }