"""Repository interfaces."""

from app.domain.repositories.auth_repository import AuthRepository
from app.domain.repositories.payment_repository import PaymentRepository

__all__ = ["AuthRepository", "PaymentRepository"]
