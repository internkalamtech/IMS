from fastapi import APIRouter

# Import all endpoint routers
from app.api.v1.endpoints import (
    auth,
    dashboard,
    health,
    users,
)
from app.api.v1.class_routes import class_router

# Main API router
router = APIRouter(prefix="/v1")

# Auth routes
router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"],
)

# Health routes
router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"],
)

# Admin Dashboard
router.include_router(
    dashboard.router,
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"],
)

# Users (YOUR TASK)
router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

# Classes
router.include_router(
    class_router,
    tags=["Classes"],
)
