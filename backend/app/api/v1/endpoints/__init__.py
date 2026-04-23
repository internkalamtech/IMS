"""API v1 endpoints."""

from app.api.v1.endpoints import auth, health, enrollment, payments, fee_structures, trips, dashboard, documents, homework, transport
from .class_subjects import router as class_subjects_router
from .staff import router as staff_router

__all__ = ["auth", "health", "enrollment", "class_subjects_router", "payments", "fee_structures", "trips", "dashboard", "documents", "homework", "transport", "staff_router"]
