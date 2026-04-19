"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    students,
    enrollment_router,
    subjects,
    payments,
    trips,
    homework_router,
    class_subjects_router,
    transport_enrollments_router,
)

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(students.router)
router.include_router(enrollment_router)
router.include_router(subjects.router)
router.include_router(payments.router)
router.include_router(trips.router)
router.include_router(homework_router)
router.include_router(class_subjects_router)
router.include_router(transport_enrollments_router)
