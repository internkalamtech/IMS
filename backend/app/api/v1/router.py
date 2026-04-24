"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

"""API v1 endpoints."""

from . import (
    auth,
    health,
    enrollment,
    trips,
    payments,
    students,
    subjects,
    dashboard,
    documents,
)

from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = [
    "auth",
    "health",
    "enrollment",
    "trips",
    "payments",
    "students",
    "subjects",
    "dashboard",
    "documents",
    "class_subjects_router",
    "staff_router",
]
