from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, dashboard, users

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(health.router)

router.include_router(
    dashboard.router,
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"]
)

router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)