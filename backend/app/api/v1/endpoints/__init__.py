"""API v1 endpoints."""

from . import (
    auth,
    classes,
    dashboard,
    documents,
    enrollment,
    health,
    payments,
    student_academic,
    students,
    subjects,
    timetable,
    timetables,
    trips,
)
from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = [
    "auth",
    "classes",
    "dashboard",
    "documents",
    "enrollment",
    "health",
    "payments",
    "student_academic",
    "students",
    "subjects",
    "timetable",
    "timetables",
    "trips",
    "class_subjects_router",
    "staff_router",
]