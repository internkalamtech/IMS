"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, student_profile
from .class_subjects import router as class_subjects_router

__all__ = ["auth", "health", "student_profile", "class_subjects_router"]
