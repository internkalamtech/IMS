"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, classes

__all__ = ["auth", "health", "classes""enrollment",
    "class_subjects_router",
    "staff_router",
    "trips",]
from . import (
    auth,
    health,
    enrollment,
    student_academic,
    trips,
)

from .class_subjects import router as class_subjects_router
__all__ = [
    "auth",
    "health",
	"enrollment",
    "student_academic",
    "dashboard", "class_subjects_router", "documents",
    "staff_router",
    "trips",
]