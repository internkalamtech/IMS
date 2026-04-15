"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    transport,
    students,
    subjects,
    enrollment,
    class_subjects,
)
from app.api.v1.endpoints.payments import router as payments_router


router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(transport.router)
router.include_router(class_subjects.router)  # Ensure this uses the module's router
router.include_router(payments_router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
