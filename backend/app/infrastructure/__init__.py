"""Infrastructure layer - external concerns and implementations."""

from app.infrastructure.repositories import InMemoryAuthRepository

__all__ = ["InMemoryAuthRepository"]
