"""Domain entities."""

from app.domain.entities.homework import Homework, HomeworkStatus
from app.domain.entities.user import User, Role, UserRole

__all__ = ["User", "Role", "UserRole", "Homework", "HomeworkStatus"]
