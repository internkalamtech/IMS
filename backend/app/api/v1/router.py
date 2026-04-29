"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints.payments import router as payments_router

from app.api.v1.endpoints import (
    attendance,
    auth,
    class_subjects_router,
    dashboard,
    enrollment,
    health,
    payments,
    students,
    subjects,
    trips,
    documents,
    homework,
    classes,
    timetables,
    student_academic,
)
from app.api.v1.endpoints.payments import router as payments_router

from app.api.v1.endpoints.staff import router as staff_router

# Create v1 router
router = APIRouter(prefix="/v1")
router.include_router(attendance.router)

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(classes.router, prefix="/classes", tags=["classes"])
router.include_router(timetables.router, prefix="/timetables", tags=["timetables"])
router.include_router(class_subjects_router)
router.include_router(payments.router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
router.include_router(student_academic.router)
router.include_router(trips.router)
router.include_router(documents.router)
router.include_router(staff_router)
