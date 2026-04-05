"""
Use cases for authentication business logic.

Use cases encapsulate business rules and orchestrate the flow of data
between entities and repositories.
"""

from app.core.errors import NotFoundError
from app.domain.entities.user import User
from app.domain.repositories.auth_repository import AuthRepository


class LoginUseCase:
    """
    Use case for user login.

    This use case handles the business logic for user authentication,
    including validation and error handling.
    """

    def __init__(self, auth_repository: AuthRepository):
        """
        Initialize the login use case.

        Args:
            auth_repository: Repository for authentication operations
        """
        self.auth_repository = auth_repository

    async def execute(self, email: str, password: str) -> User:
        """
        Execute the login use case.

        Args:
            email: User's email address
            password: User's password

        Returns:
            User entity if login successful

        Raises:
            ValidationError: If email or password is invalid or empty
            AuthenticationError: If credentials are incorrect
        """
        # Validation
        if not email:
            raise ValueError("Email is required")

        if "@" not in email:
            raise ValueError("Invalid email format")

        if not password:
            raise ValueError("Password is required")

        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")

        # Delegate to repository
        user = await self.auth_repository.login(email, password)
        return user


class GetCurrentUserUseCase:
    """
    Use case for retrieving the current authenticated user.
    """

    def __init__(self, auth_repository: AuthRepository):
        """
        Initialize the get current user use case.

        Args:
            auth_repository: Repository for authentication operations
        """
        self.auth_repository = auth_repository

    async def execute(self, user_id: str) -> User:
        """
        Execute the get current user use case.

        Args:
            user_id: ID of the user to retrieve

        Returns:
            User entity if found

        Raises:
            ValueError: If user not found
        """
        try:
            return await self.auth_repository.get_user_by_id(user_id)
        except NotFoundError:
            raise ValueError("User not found")


class GetDemoUsersUseCase:
    """
    Use case for retrieving demo users from the database.

    Demo users are identified by their email domain.
    """

    def __init__(self, auth_repository: AuthRepository):
        """
        Initialize the use case.

        Args:
            auth_repository: Repository for authentication operations
        """
        self.auth_repository = auth_repository

    async def execute(self, email_pattern: str = "%@myuser.com") -> list[User]:
        """
        Execute the use case.

        Args:
            email_pattern: SQL like pattern for demo users

        Returns:
            List of User entities
        """
        return await self.auth_repository.get_users_by_email_pattern(
            email_pattern
        )
