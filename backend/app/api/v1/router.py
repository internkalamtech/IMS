from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    user,
    teacher,
    class_subjects_router,
)
from app.api.v1.endpoints.payments import router as payments_router

# Create v1 router
router = APIRouter(prefix="/v1")

# Core routers
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)

# User + Teacher modules
router.include_router(user.router)
router.include_router(teacher.router, prefix="/teacher", tags=["Teacher"])

# Additional modules from main
router.include_router(class_subjects_router)
router.include_router(payments_router)
