"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    dashboard,
    health,
    class_subjects,
    classes,
    user,
)

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(classes.router)
router.include_router(class_subjects.router)
router.include_router(user.router)
