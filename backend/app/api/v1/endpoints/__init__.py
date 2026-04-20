"""API v1 endpoints."""

from . import auth
from . import health
from . import enrollment
from . import trips
from . import subjects
from . import students
from . import payments

from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = [
    "auth",
    "health",
    "enrollment",
    "trips",
    "subjects",
    "students",
    "payments",
    "class_subjects_router",
    "staff_router",
]
