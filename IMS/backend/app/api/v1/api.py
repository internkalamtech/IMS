from fastapi import APIRouter

# ✅ Import all endpoints together (clean way)
from app.api.v1.endpoints import auth, users, dashboard, transport_dashboard

api_router = APIRouter()

# ✅ Existing routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(dashboard.router, prefix="/admin", tags=["Admin Dashboard"])

# ✅ Transport Dashboard (no prefix here because it's inside the file)
api_router.include_router(transport_dashboard.router)