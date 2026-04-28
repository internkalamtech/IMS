"""API v1 endpoints."""

from app.api.v1.endpoints import auth, classes, enrollment, health, payments, subjects
from app.api.v1.endpoints import trips
from .class_subjects import router as class_subjects_router
from .homework import router as homework_router
from .enrollment import router as enrollment_router
from .transport_enrollments import router as transport_enrollments_router

__all__ = [
    "auth",
    "classes",
    "enrollment",
    "health",
    "subjects",
    "payments",
    "trips",
    "homework_router",
    "enrollment_router",
    "class_subjects_router",
    "transport_enrollments_router",
]
