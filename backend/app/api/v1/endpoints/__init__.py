"""API v1 endpoints."""

from . import (
    auth,
    health,
	enrollment,
    student_academic,
    enrollment,
    trips,
)

from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = [
    "auth",
    "health",
	"enrollment",
    "student_academic",
    "dashboard", "class_subjects_router", "documents",
    "enrollment",
    "class_subjects_router",
    "staff_router",
    "trips",
]
