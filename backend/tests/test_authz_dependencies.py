import pytest
from fastapi import HTTPException

from app.api.authz import require_roles
from app.domain.entities.user import Role, User, UserRole


def _make_user(
    primary_role: UserRole,
    extra_roles: list[UserRole] | None = None,
) -> User:
    role_names = extra_roles or []
    roles = [
        Role(id=str(i + 1), name=role_name, description=None)
        for i, role_name in enumerate(role_names)
    ]
    return User(
        id="u1",
        name="Test User",
        email="test@example.com",
        role=primary_role,
        roles=roles,
        avatar_url=None,
    )


@pytest.mark.asyncio
async def test_require_roles_allows_primary_role() -> None:
    dependency = require_roles("admin", "transport")
    user = _make_user("transport")

    resolved_user = await dependency(current_user=user)

    assert resolved_user.id == user.id


@pytest.mark.asyncio
async def test_require_roles_allows_secondary_role() -> None:
    dependency = require_roles("admin", "transport")
    user = _make_user("teacher", ["transport"])

    resolved_user = await dependency(current_user=user)

    assert resolved_user.id == user.id


@pytest.mark.asyncio
async def test_require_roles_rejects_unauthorized_user() -> None:
    dependency = require_roles("admin", "transport")
    user = _make_user("teacher", ["parent"])

    with pytest.raises(HTTPException) as exc:
        await dependency(current_user=user)

    assert exc.value.status_code == 403
