"""API v1 endpoints."""

from app.api.v1.endpoints import auth, enrollment, health, payments, subjects
from .class_subjects import router as class_subjects_router
from .enrollment import router as enrollment_router
from .transport_enrollments import router as transport_enrollments_router

__all__ = [
    "auth",
    "enrollment",
    "health",
    "subjects",
    "payments",
    "enrollment_router",
    "class_subjects_router",
    "transport_enrollments_router",
]
