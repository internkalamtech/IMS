from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, dashboard, users, transport_dashboard

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

# ✅ ADD THIS BLOCK (THIS IS WHAT YOU WERE MISSING)
router.include_router(
    transport_dashboard.router,
    prefix="/transport",
    tags=["Transport Dashboard"]
)