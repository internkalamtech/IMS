"""API v1 endpoints."""

from app.api.v1.endpoints import (
    auth,
    dashboard,
    documents,
    driver,
    enrollment,
    health,
    homework,
    students,
    subjects,
    transport,
    trips,
)
from .class_subjects import router as class_subjects_router

__all__ = [
    "auth",
    "dashboard",
    "documents",
    "driver",
    "enrollment",
    "health",
    "homework",
    "students",
    "subjects",
    "transport",
    "trips",
    "class_subjects_router",
]
