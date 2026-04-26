"""API v1 endpoints."""

from . import (
    auth,
    dashboard,
    documents,
    driver,
    enrollment,
    health,
    enrollment,
    trips,
)

from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = [
    "auth",
    "dashboard",
    "documents",
    "driver",
    "health",
    "enrollment",
    "class_subjects_router",
    "staff_router",
    "trips",
]
