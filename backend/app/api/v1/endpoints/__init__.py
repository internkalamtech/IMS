"""API v1 endpoints."""

from app.api.v1.endpoints import auth, enrollment, health, payments, subjects
from app.api.v1.endpoints import trips, classes, timetables, student_academic
from .class_subjects import router as class_subjects_router
from .homework import router as homework_router
from .enrollment import router as enrollment_router
from .staff import router as staff_router
from .transport_enrollments import router as transport_enrollments_router

__all__ = [
    "auth",
    "classes",
    "enrollment",
    "health",
    "subjects",
    "payments",
    "student_academic",
    "timetables",
    "trips",
    "class_subjects_router",
    "enrollment_router",
    "homework_router",
    "staff_router",
    "transport_enrollments_router",
]
