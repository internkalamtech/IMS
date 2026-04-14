"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, dashboard, transport
from .class_subjects import router as class_subjects_router

__all__ = ["auth", "health", "dashboard", "transport", "class_subjects_router"]
