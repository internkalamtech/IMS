"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    attendance,
    class_subjects_router,
    students,
    subjects,
    enrollment,
)
from app.api.v1.endpoints.payments import router as payments_router

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(attendance.router, prefix="/attendance")
router.include_router(class_subjects_router)
router.include_router(payments_router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
