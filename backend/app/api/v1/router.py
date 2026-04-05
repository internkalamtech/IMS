"""
API v1 router.

This module aggregates all v1 API endpoints.
"""
# ✅ Correct — relative to the backend folder
from app.api.v1.endpoints.users import router as user_router
from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, dashboard

# Create v1 router
router = APIRouter(prefix="/v1")
router.include_router(user_router)
# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)