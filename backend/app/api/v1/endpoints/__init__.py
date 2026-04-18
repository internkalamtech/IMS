"""API v1 endpoints."""

from app.api.v1.endpoints import (
	auth,
	class_subjects,
	dashboard,
	health,
	payments,
	trips,
)

__all__ = [
	"auth",
	"class_subjects",
	"dashboard",
	"health",
	"payments",
	"trips",
]
