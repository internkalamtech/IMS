"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

# ✅ Import all required endpoints
from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    driver,              # 👈 your feature (IMPORTANT)
    class_subjects_router,
    students,
    subjects,
    enrollment,
)

from app.api.v1.endpoints.payments import router as payments_router

# Create v1 router
router = APIRouter(prefix="/v1")

# ✅ Core routes
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)

# ✅ Your driver feature (MUST be present)
router.include_router(driver.router)

# ✅ Existing system routes (do NOT remove)
router.include_router(class_subjects_router)
router.include_router(payments_router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)