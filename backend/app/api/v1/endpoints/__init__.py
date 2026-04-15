from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, enrollment
from .class_subjects import router as class_subjects_router

router = APIRouter()

router.include_router(auth.router)
router.include_router(health.router)
router.include_router(enrollment.router)
router.include_router(class_subjects_router)