"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, dashboard, finance
from .class_subjects import router as class_subjects_router
from .payments import router as payments_router

__all__ = [
    "auth",
    "health",
    "dashboard",
    "finance",
    "class_subjects_router",
    "payments_router",
]
