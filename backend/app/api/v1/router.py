"""
API v1 router.

This module aggregates all v1 API endpoints and includes them
in the main v1 router with their respective prefixes.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, dashboard, trips  # ← ADD trips IMPORT

# Create v1 router
router = APIRouter(prefix="/v1")

# Include endpoint routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(trips.router)  # ← ADDED THIS LINE