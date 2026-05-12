"""API v1 endpoints."""

from . import (
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
    user,
)
from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

users = user

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
    "user",
    "users",
]
