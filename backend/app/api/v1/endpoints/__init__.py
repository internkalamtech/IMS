"""API v1 endpoints."""

from . import (
    auth,
    attendance,
    classes,
    dashboard,
    documents,
    enrollment,
    health,
    homework,
    learning_resources,
    payments,
    staff,
    students,
    subjects,
    timetables,
    trips,
    transport,
    user,
)

from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = [
    "auth",
    "attendance",
    "classes",
    "dashboard",
    "documents",
    "enrollment",
    "health",
    "homework",
    "learning_resources",
    "payments",
    "staff",
    "students",
    "subjects",
    "timetables",
    "trips",
    "transport",
    "user",
    "class_subjects_router",
    "staff_router",
]
