"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import dashboard
from app.api.v1.endpoints import health
from app.api.v1.endpoints import subjects
from app.api.v1.endpoints import timetable
from app.api.v1.endpoints.class_subjects import router as class_subjects_router
from app.api.v1.endpoints.payments import router as payments_router

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(class_subjects_router)
router.include_router(payments.router)
router.include_router(students.router)
router.include_router(timetable.router)
router.include_router(enrollment.router)
router.include_router(trips.router)
router.include_router(documents.router)
router.include_router(staff_router)
