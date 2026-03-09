"""
IMS Backend - FastAPI Application

Main application module that initializes and configures the FastAPI app.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.admin.dashboard_router import router as dashboard_router
from app.api.v1 import router as api_v1_router

# Existing Users API
from app.api.users import router as users_router

# ✅ STEP 3 IMPORT (Class Teacher Router)
from app.class_teacher import router as class_teacher_router

from app.core.config import settings
from app.core.errors import IMSException
from app.core.logger import Logger
from app.infrastructure.database.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    """
    Logger.info("Starting IMS Backend...")
    Logger.info(
        f"Environment: {'Development' if settings.debug else 'Production'}"
    )

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


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Institute Management System",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)


@app.exception_handler(IMSException)
async def ims_exception_handler(request: Request, exc: IMSException):
    Logger.warning(f"IMS Exception: {exc.message} (status: {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    Logger.error(f"Unexpected exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"},
    )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    Logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    Logger.info(
        f"{request.method} {request.url.path} - {response.status_code}"
    )
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Existing routers
app.include_router(api_v1_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api/v1")

# Users API
app.include_router(users_router, prefix="/api")

# ✅ STEP 3 ADDED (Class Teacher API)
app.include_router(class_teacher_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root() -> dict:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/v1/health",
    }