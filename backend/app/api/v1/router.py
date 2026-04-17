"""
API v1 router.

This module aggregates all v1 API endpoints.
"""

from fastapi import APIRouter
<<<<<<< HEAD

from app.api.v1.endpoints import auth, dashboard, driver, health
=======
from app.api.v1.endpoints import auth, health, dashboard, driver
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

# Create v1 router
router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
<<<<<<< HEAD
router.include_router(driver.router)
=======
router.include_router(driver.router)
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
