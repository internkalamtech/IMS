"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health
from .class_subjects import router as class_subjects_router
from .fees import router as fees_router

__all__ = ["auth", "health", "class_subjects_router", "fees_router"]
