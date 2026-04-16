"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, dashboard, marks , subjects

# Create v1 router
router = APIRouter(prefix="/api/v1")


# Include endpoint routers
# router.include_router(auth.router)
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(marks.router)  
router.include_router(subjects.router)