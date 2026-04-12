"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, payments, subjects
from .class_subjects import router as class_subjects_router
from .transport_enrollments import router as transport_enrollments_router

__all__ = [
    "auth",
    "health",
    "subjects",
    "payments",
    "class_subjects_router",
    "transport_enrollments_router",
]
