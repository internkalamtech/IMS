"""API v1 endpoints."""

from . import (
    auth,
    dashboard,
    documents,
    driver,
    enrollment,
    health,
    trips,
)

from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = [
    "auth",
    "driver",
    "health",
    "enrollment",
    "class_subjects_router",
    "staff_router",
    "trips",
]
