"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, enrollment
from .class_subjects import router as class_subjects_router

__all__ = ["auth", "health", "enrollment", "class_subjects_router"]
