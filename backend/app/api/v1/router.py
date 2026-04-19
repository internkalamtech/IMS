"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    dashboard,
    driver,
    enrollment,
    health,
    homework,
    students,
    subjects,
    transport,
    trips,
)
from app.api.v1.endpoints.class_subjects import router as class_subjects_router
from app.api.v1.endpoints.documents import router as documents_router
from app.api.v1.endpoints.payments import router as payments_router

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(driver.router)
router.include_router(homework.router)
router.include_router(transport.router)
router.include_router(documents_router)
router.include_router(class_subjects_router)
router.include_router(payments_router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
router.include_router(trips.router)
