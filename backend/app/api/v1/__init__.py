from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.enrollment import router as enrollment_router
from app.api.v1.endpoints.class_subjects import router as class_subjects_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(health_router)
router.include_router(enrollment_router)
router.include_router(class_subjects_router)