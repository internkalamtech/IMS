from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    health,
    dashboard,
    user,
    teacher,
)

from app.api.v1.endpoints.class_subjects import router as class_subjects_router
from app.api.v1.endpoints.payments import router as payment_router

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)

router.include_router(user.router)
router.include_router(teacher.router, prefix="/teacher", tags=["Teacher"])

router.include_router(class_subjects_router)
router.include_router(payment_router)
