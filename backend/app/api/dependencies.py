"""
Authentication and authorization dependencies for FastAPI.

These dependencies handle JWT token validation and user authentication.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.core.security import decode_access_token
from app.domain.entities.user import User, UserRole
from app.domain.usecases.auth_usecases import GetCurrentUserUseCase
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_auth_repository import (
    DatabaseAuthRepository,
)

# Security scheme for JWT bearer tokens
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Args:
        credentials: HTTP authorization credentials with bearer token

    Returns:
        Current authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user ID from token
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from repository
    repository = DatabaseAuthRepository(db)
    use_case = GetCurrentUserUseCase(repository)

    try:
        user = await use_case.execute(user_id)
        return user
    except (ValueError, NotFoundError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_roles(*allowed_roles: UserRole):
    """
    Create a dependency that allows only users with any allowed role.

    Args:
        allowed_roles: Roles permitted to access the endpoint

    Returns:
        A dependency function that validates the current user's roles
    """

    async def dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:
        user_roles = {current_user.role}
        user_roles.update(role.name for role in current_user.roles)

        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        return current_user

    return dependency
