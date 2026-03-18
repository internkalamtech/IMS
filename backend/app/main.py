"""
IMS Backend - FastAPI Application

Main application module that initializes and configures the FastAPI app.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.endpoints import users
from app.domain.entities import user
from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.core.errors import IMSException
from app.core.logger import Logger
from app.infrastructure.database.database import init_db, close_db
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.database import get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
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

    # Shutdown
    Logger.info("Shutting down IMS Backend...")
    await close_db()
    Logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Institute Management System",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)


# Global exception handler
@app.exception_handler(IMSException)
async def ims_exception_handler(request: Request, exc: IMSException):
    """Handle custom IMS exceptions."""
    Logger.warning(f"IMS Exception: {exc.message} (status: {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    Logger.error(f"Unexpected exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"},
    )


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests."""
    Logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    Logger.info(
        f"{request.method} {request.url.path} - {response.status_code}"
    )
    return response


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers


@app.get("/", tags=["Root"])
async def root() -> dict:
    """
    Root endpoint.

    Returns basic information about the API.
    """
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/v1/health",
    }
class User(BaseModel):
    name: str
    email: str

@api_v1_router.post("/users")
async def add_user(user: User, db: AsyncSession = Depends(get_db)):

    print("User received:", user.name, user.email)

    query = text("""
        INSERT INTO added_users (name, email)
        VALUES (:name, :email)
    """)

    await db.execute(query, {"name": user.name, "email": user.email})
    await db.commit()

    return {
        "message": "User stored in database",
        "data": user
    }
app.include_router(api_v1_router, prefix="/api/v1")