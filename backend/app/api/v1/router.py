"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, dashboard, class_subjects, payments, fee_structures

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(class_subjects.router)
router.include_router(payments.router, prefix="/payments", tags=["Payments"])
router.include_router(fee_structures.router, prefix="/finances", tags=["Fee Structures"])
