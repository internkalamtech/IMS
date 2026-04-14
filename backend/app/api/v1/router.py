"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter
<<<<<<< HEAD
from app.api.v1.endpoints.user import router as users_router
from app.api.v1.endpoints import auth, health, dashboard

=======

from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    class_subjects_router,
    subjects,
    enrollment,
)
>>>>>>> dc602061e26d83106ce771e0cd7bdc07e9770a77
# Create v1 router
router = APIRouter(prefix="/v1")
router.include_router(users_router)
# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(class_subjects_router)
router.include_router(subjects.router)
router.include_router(enrollment.router)

