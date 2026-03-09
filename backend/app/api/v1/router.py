"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

# Import endpoint routers
from app.api.v1.endpoints import auth
from app.api.v1.endpoints import health
from app.api.v1.endpoints import dashboard

# Create v1 router
router = APIRouter(prefix="/v1")

# Register routes
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)