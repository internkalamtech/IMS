from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.trips import router as trips_router

__all__ = ["auth_router", "dashboard_router", "health_router", "trips_router"]