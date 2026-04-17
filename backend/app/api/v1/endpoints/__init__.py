"""API v1 endpoints."""

from app.api.v1.endpoints import (
    auth,
    dashboard,
    driver,
    enrollment,
    health,
    students,
    subjects,
)
from .class_subjects import router as class_subjects_router

__all__ = [
    "auth",
    "dashboard",
    "driver",
    "enrollment",
    "health",
    "students",
    "subjects",
    "class_subjects_router",
]
