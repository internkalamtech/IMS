"""
Repository interfaces for data access.

Repositories define abstract interfaces for data operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod

from app.domain.entities.user import User


class AuthRepository(ABC):
    """
    Abstract repository for authentication operations.

    This interface defines the contract for authentication data access.
    Concrete implementations are provided in the infrastructure layer.
    """

    @abstractmethod
    async def login(self, email: str, password: str) -> User:
        """
        Authenticate a user by email and password.

        Args:
            email: User's email address
            password: User's password (plain text)

        Returns:
            User entity if authentication successful

        Raises:
            AuthenticationError: If credentials are invalid
            ValidationError: If email or password is empty
        """
        pass

    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> User | None:
        """
        Retrieve a user by their ID.

        Args:
            user_id: Unique identifier of the user

        Returns:
            User entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_user_by_email(self, email: str) -> User | None:
        """
        Retrieve a user by their email.

        Args:
            email: Email address of the user

        Returns:
            User entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_users_by_email_pattern(self, pattern: str) -> list[User]:
        """
        Retrieve users matching an email pattern.

        Args:
            pattern: SQL like pattern (e.g., "%@example.com")

        Returns:
            List of User entities
        """
        pass