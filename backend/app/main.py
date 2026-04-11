"""
IMS Backend - FastAPI Application

Main application module that initializes and configures the FastAPI app.
"""

from sqlalchemy.ext.asyncio import AsyncSession      # added
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.core.errors import IMSException
from app.core.logger import Logger
from app.infrastructure.database.database import init_db, close_db, get_db
from sqlalchemy import text


# Pydantic model for user input
class User(BaseModel):
    name: str
    email: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    Logger.info("Starting IMS Backend...")
    Logger.info(
        f"Environment: {'Development' if settings.debug else 'Production'}")

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


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Institute Management System",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)


# ----------------- Add User Endpoint -----------------

# …existing imports…
# from sqlalchemy.orm import Session                 # can be removed, not used

# …existing code…


@app.post("/add-user")
async def add_user(user: User, db: AsyncSession = Depends(get_db)):
    """
    receive name/email from the UI and persist it.
    `get_db()` yields an AsyncSession, so we must await the calls.
    """
    print("User received:", user.name, user.email)

    stmt = text(
        "INSERT INTO added_users (name, email) VALUES (:name, :email)"
    )
    await db.execute(stmt, {"name": user.name, "email": user.email})
    await db.commit()

    return {"message": "User stored in database"}

# …remaining code…
# ----------------- Exception Handlers -----------------


@app.exception_handler(IMSException)
async def ims_exception_handler(request: Request, exc: IMSException):
    Logger.warning(f"IMS Exception: {exc.message} (status: {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code, content={
            "detail": exc.message})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    Logger.error(f"Unexpected exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"},
    )


# ----------------- Request Logging Middleware -----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    Logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    Logger.info(
        f"{request.method} {request.url.path} - {response.status_code}")
    return response


# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------- API Routers -----------------
app.include_router(api_v1_router, prefix="/api")


# ----------------- Root Endpoint -----------------
@app.get("/", tags=["Root"])
async def root() -> dict:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/v1/health",
    }
