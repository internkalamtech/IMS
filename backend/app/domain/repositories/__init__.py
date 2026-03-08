"""Repository interfaces."""

from app.domain.repositories.auth_repository import AuthRepository
from app.domain.repositories.transport_repository import TransportRepository

__all__ = ["AuthRepository", "TransportRepository"]
