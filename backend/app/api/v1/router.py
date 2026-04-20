"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, dashboard, classes, timetables, class_subjects_router
from app.api.v1.endpoints import class_subjects_router
from app.api.v1.endpoints.payments import router as payments_router

from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    class_subjects_router,
    subjects,
)
# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(classes.router, prefix="/classes", tags=["classes"])
router.include_router(timetables.router, prefix="/timetables", tags=["timetables"])
router.include_router(class_subjects_router)
router.include_router(subjects.router)
