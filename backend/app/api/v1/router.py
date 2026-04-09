"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

<<<<<<< feature/430-transport-manager-dashboard
from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    transport,
)
=======
from app.api.v1.endpoints import auth, health, dashboard, class_subjects_router
from app.api.v1.endpoints.payments import router as payments_router
>>>>>>> main

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
<<<<<<< feature/430-transport-manager-dashboard
router.include_router(transport.router)
=======
router.include_router(class_subjects_router)
router.include_router(payments_router)
>>>>>>> main
