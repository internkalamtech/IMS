"""
IMS Backend - FastAPI Application
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from passlib.hash import bcrypt  # for verifying passwords

from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.core.errors import IMSException
from app.core.logger import Logger
from app.infrastructure.database.database import init_db, close_db, get_db


class User(BaseModel):
    name: str
    email: str


class LoginModel(BaseModel):
    email: str
    password: str


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


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Institute Management System",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)


# ----------------- ADD USER -----------------
@app.post("/add-user")
async def add_user(user: User, db: AsyncSession = Depends(get_db)):
    stmt = text(
        "INSERT INTO added_users (name, email) VALUES (:name, :email)"
    )
    await db.execute(stmt, {"name": user.name, "email": user.email})
    await db.commit()

    return {"message": "User stored in database"}


# ----------------- LOGIN -----------------
@app.post("/login")
async def login(payload: LoginModel, db: AsyncSession = Depends(get_db)):
    stmt = text("SELECT id, email, password_hash FROM users WHERE email = :email")
    result = await db.execute(stmt, {"email": payload.email})
    user = result.fetchone()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not bcrypt.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # You can later return a JWT token here, but for now return basic info
    return {"id": user.id, "email": user.email}


# ----------------- TEACHER DASHBOARD -----------------
@app.get("/teacher/dashboard")
async def dashboard(teacher_id: int = 1, db: AsyncSession = Depends(get_db)):
    # --- Fetch teacher info ---
    teacher_result = await db.execute(
        text("SELECT name, role FROM teachers WHERE id = :id"),
        {"id": teacher_id},
    )
    teacher = teacher_result.fetchone()
    if not teacher:
        return {"error": "Teacher not found"}

    # --- Fetch latest updates ---
    updates_result = await db.execute(
        text("SELECT id, title, description, type, created_at FROM updates ORDER BY created_at DESC")
    )
    rows = updates_result.fetchall()

    # Convert rows to dicts properly
    updates_list = [
        {
            "id": row.id,
            "title": row.title,
            "description": row.description,
            "type": row.type,
            "created_at": row.created_at,
            "time": row.created_at.strftime("%I:%M %p, %d %b")  # e.g., 10:37 AM, 31 Mar
        }
        for row in rows
    ]

    new_updates_count = len(updates_list)

    return {
        "name": teacher.name,
        "role": teacher.role,
        "class": "Class 7A",
        "subject": "Computer Science",
        "students": 38,
        "present": 35,
        "updates": updates_list,
        "new_updates_count": new_updates_count,
    }


# ----------------- EXCEPTION HANDLERS -----------------
@app.exception_handler(IMSException)
async def ims_exception_handler(request: Request, exc: IMSException):
    Logger.warning(f"IMS Exception: {exc.message}")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    Logger.error(f"Unexpected exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"},
    )


# ----------------- LOGGING -----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    Logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    Logger.info(f"{request.method} {request.url.path} - {response.status_code}")
    return response


# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------- ROUTERS -----------------
app.include_router(api_v1_router, prefix="/api")


# ----------------- ROOT -----------------
@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }