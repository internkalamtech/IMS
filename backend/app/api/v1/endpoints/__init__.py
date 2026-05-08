"""API v1 endpoints."""

from app.api.v1.endpoints import (
    attendance,
    auth,
    classes,
    dashboard,
    documents,
    enrollment,
    fee_structures,
    health,
    homework,
    payments,
    students,
    subjects,
    timetables,
    transport,
    trips,
)
from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = [
    "attendance",
    "auth",
    "classes",
    "class_subjects_router",
    "dashboard",
    "documents",
    "enrollment",
    "fee_structures",
    "health",
    "homework",
    "payments",
    "staff_router",
    "students",
    "subjects",
    "timetables",
    "transport",
    "trips",
]
