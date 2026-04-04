"""Repository interfaces."""

from app.domain.repositories.auth_repository import AuthRepository
from app.domain.repositories.homework_repository import HomeworkRepository

__all__ = ["AuthRepository", "HomeworkRepository"]
