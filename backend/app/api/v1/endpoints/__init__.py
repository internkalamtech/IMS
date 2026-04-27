"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, student_profile
from . import (
    enrollment,
    trips,
)

from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = ["auth", "health", "student_profile", "class_subjects_router", "enrollment", "staff_router", "trips"]
