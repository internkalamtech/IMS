"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    class_subjects_router,
    dashboard,
    enrollment,
    fee_structures,
    health,
    payments,
    students,
    subjects,
    trips,
)

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(class_subjects_router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
router.include_router(payments.router)
router.include_router(fee_structures.router)
router.include_router(trips.router)
