"""API v1 endpoints."""

<<<<<<< HEAD
from app.api.v1.endpoints import auth, dashboard, driver, health

__all__ = ["auth", "dashboard", "driver", "health"]
=======
from app.api.v1.endpoints import auth, health, enrollment
from .class_subjects import router as class_subjects_router

__all__ = ["auth", "health", "enrollment", "class_subjects_router"]
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
