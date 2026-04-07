from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, dashboard, homework  # ✅ ADD homework

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(homework.router)  # ✅ ADD THIS