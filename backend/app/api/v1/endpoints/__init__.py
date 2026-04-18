"""API v1 endpoints."""

from app.api.v1.endpoints import (
    auth,
    health,
	enrollment,
    trips,
)
from .class_subjects import router as class_subjects_router
from .staff import router as staff_router
__all__ = [
    "auth",
    "health",
	"enrollment",
    "class_subjects_router",
    "staff_router",
    "trips",
]