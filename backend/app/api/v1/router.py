from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    users,
    homework,
    class_subjects_router,
)

from app.api.v1.endpoints.payments import router as payments_router
from app.api.v1.endpoints.attendance import router as attendance_router

router = APIRouter(prefix="/v1")

router.include_router(health.router)
router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(users.router)
router.include_router(homework.router)
router.include_router(class_subjects_router.router)
router.include_router(payments_router)
router.include_router(attendance_router)