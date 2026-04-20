from . import auth, health, dashboard, students, subjects, enrollment
from .class_subjects import router as class_subjects_router

__all__ = [
    "auth",
    "health",
    "dashboard",
    "students",
    "subjects",
    "enrollment",
    "class_subjects_router",
]