"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, dashboard, homework, class_subjects_router
from app.api.v1.endpoints.payments import router as payments_router
from app.api.v1.endpoints import (
    auth,
    class_subjects_router,
<<<<<<< staff_user_API
    staff_router,
=======
    transport,
>>>>>>> main
    dashboard,
    enrollment,
    health,
    payments,
    students,
    subjects,
    trips,  
    )
from app.api.v1.endpoints.payments import router as payments_router

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(homework.router) 
router.include_router(transport.router)
router.include_router(class_subjects_router)
router.include_router(payments.router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
router.include_router(trips.router)
router.include_router(staff_router)
