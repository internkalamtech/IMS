"""
Database-backed implementation of AuthRepository.

This module implements the AuthRepository interface using PostgreSQL
with SQLAlchemy ORM.

Following Clean Architecture principles:
- Implements domain repository interface
- Uses infrastructure layer (database models)
- Handles data mapping between database models and domain entities
- Proper error handling and logging
"""

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import (
    AuthenticationError,
    DatabaseError,
    NotFoundError,
)
from app.core.logger import Logger
from app.core.password import verify_password
from app.domain.entities.user import Role, User
from app.domain.repositories.auth_repository import AuthRepository
from app.infrastructure.database.models import UserModel


class DatabaseAuthRepository(AuthRepository):
    """
    Database-backed implementation of AuthRepository.

    Uses PostgreSQL with SQLAlchemy for data persistence.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def login(self, email: str, password: str) -> User:
        """
        Authenticate user by email and password.

        Args:
            email: User's email address
            password: User's password (plain text)

        Returns:
            User entity if authentication successful

        Raises:
            AuthenticationError: If credentials are invalid
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Login attempt for email: {email}")

            # Query user by email (with roles eagerly loaded)
            result = await self.db.execute(
                select(UserModel)
                .options(selectinload(UserModel.roles))
                .where(UserModel.email == email.lower())
            )
            user_model = result.unique().scalar_one_or_none()

            # Check if user exists
            if not user_model:
                Logger.warning(f"Login failed: User not found - {email}")
                raise AuthenticationError("Invalid email or password")

            # Check if user is active
            if not user_model.is_active:
                Logger.warning(f"Login failed: User inactive - {email}")
                raise AuthenticationError("Account is inactive")

            # Verify password
            if not verify_password(password, user_model.password_hash):
                Logger.warning(f"Login failed: Invalid password - {email}")
                raise AuthenticationError("Invalid email or password")

            # Check if user has at least one role
            if not user_model.roles:
                Logger.error(f"Login failed: User has no roles - {email}")
                raise AuthenticationError("User has no assigned roles")

            # Convert to domain entity
            user = self._to_domain_entity(user_model)

            Logger.info(
                f"Login successful: {email} "
                f"(roles: {', '.join([r.name for r in user.roles])})"
            )
            return user

        except AuthenticationError:
            # Re-raise authentication errors
            raise
        except Exception as e:
            Logger.error(f"Database error during login: {e}", exc_info=True)
            raise DatabaseError(f"Failed to authenticate user: {str(e)}")

    async def get_user_by_id(self, user_id: str) -> User:
        """
        Get user by ID.

        Args:
            user_id: User's unique identifier

        Returns:
            User entity

        Raises:
            NotFoundError: If user not found
            DatabaseError: If database operation fails
        """
        try:
            result = await self.db.execute(
                select(UserModel)
                .options(selectinload(UserModel.roles))
                .where(UserModel.id == int(user_id))
            )
            user_model = result.unique().scalar_one_or_none()

            if not user_model:
                raise NotFoundError(f"User with ID {user_id} not found")

            return self._to_domain_entity(user_model)

        except Exception as e:
            from app.core.errors import NotFoundError

            if isinstance(e, NotFoundError):
                raise
            Logger.error(f"Database error getting user: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get user: {str(e)}")

    async def get_user_by_email(self, email: str) -> User | None:
        """
        Get user by email.

        Args:
            email: User's email address

        Returns:
            User entity if found, None otherwise
        """
        try:
            result = await self.db.execute(
                select(UserModel)
                .options(selectinload(UserModel.roles))
                .where(UserModel.email == email.lower())
            )
            user_model = result.unique().scalar_one_or_none()

            if not user_model:
                return None

            return self._to_domain_entity(user_model)

        except Exception as e:
            Logger.error(
                f"Database error getting user by email: {e}",
                exc_info=True,
            )
            raise DatabaseError(f"Failed to get user: {str(e)}")

    async def get_users_by_email_pattern(self, pattern: str) -> list[User]:
        """
        Retrieve users matching an email pattern.

        Args:
            pattern: SQL like pattern (e.g., "%@myuser.com")

        Returns:
            List of User entities
        """
        try:
            result = await self.db.execute(
                select(UserModel)
                .options(selectinload(UserModel.roles))
                .where(UserModel.email.like(pattern))
            )
            user_models = result.scalars().unique().all()

            return [self._to_domain_entity(um) for um in user_models]

        except Exception as e:
            Logger.error(
                f"Database error getting users by pattern: {e}",
                exc_info=True,
            )
            raise DatabaseError(
                f"Failed to get users matching pattern: {str(e)}"
            )

    def _to_domain_entity(self, user_model: UserModel) -> User:
        """
        Convert database model to domain entity.

        Args:
            user_model: SQLAlchemy UserModel instance

        Returns:
            User domain entity
        """
        # Convert roles
        roles = [
            Role(
                id=str(role.id),
                name=role.name,  # type: ignore
                description=role.description,
            )
            for role in user_model.roles
        ]

        # Primary role is the first role
        primary_role = roles[0].name if roles else "student"  # type: ignore

        return User(
            id=str(user_model.id),
            name=user_model.name,
            email=user_model.email,
            role=primary_role,  # type: ignore
            roles=roles,
            avatar_url=None,  # Can be added later
        )