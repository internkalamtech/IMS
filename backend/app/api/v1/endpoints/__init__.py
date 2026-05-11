"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, classes

__all__ = ["auth", "health", "classes","enrollment",
    "class_subjects_router","student_academic","dashboard",
    "staff_router","documents",
    "trips",]
from app.api.v1.endpoints import auth, health, enrollment
from . import (
    auth,
    health,
    enrollment,
    #student_academic,
    trips,
)

from .class_subjects import router as class_subjects_router
from .staff import router as staff_router


