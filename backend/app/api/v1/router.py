"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

<<<<<<< HEAD
from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    class_subjects_router,
    subjects,
    enrollment,
)
=======
from app.api.v1.endpoints import auth, health, dashboard, driver

>>>>>>> ebaf4fd (Add vehicle and license compliance screen with expiry status and API integration)
# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
<<<<<<< HEAD
router.include_router(class_subjects_router)
router.include_router(subjects.router)
router.include_router(enrollment.router)

=======
router.include_router(driver.router)
>>>>>>> ebaf4fd (Add vehicle and license compliance screen with expiry status and API integration)
