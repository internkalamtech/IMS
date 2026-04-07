"""Authorization dependencies for role-based access control."""

from fastapi import Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.domain.entities.user import User


def require_roles(*allowed_roles: str):
    """Return a dependency that allows users with any allowed role."""
    normalized_allowed_roles = {role.lower() for role in allowed_roles}

    async def _require_roles(
        current_user: User = Depends(get_current_user),
    ) -> User:
        user_roles = {current_user.role.lower()}
        user_roles.update(role.name.lower() for role in current_user.roles)

        if user_roles.isdisjoint(normalized_allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return _require_roles