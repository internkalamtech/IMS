import pytest

from app.core.errors import NotFoundError
from app.domain.entities.user import Role, User
from app.domain.usecases.auth_usecases import GetCurrentUserUseCase


class _RepoReturnsUser:
    async def get_user_by_id(self, user_id: str) -> User:
        return User(
            id=user_id,
            name="Test User",
            email="test@example.com",
            role="admin",
            roles=[Role(id="1", name="admin", description=None)],
            avatar_url=None,
        )


class _RepoRaisesNotFound:
    async def get_user_by_id(self, user_id: str) -> User:
        raise NotFoundError(f"User with ID {user_id} not found")


@pytest.mark.asyncio
async def test_get_current_user_usecase_returns_user() -> None:
    use_case = GetCurrentUserUseCase(_RepoReturnsUser())

    user = await use_case.execute("42")

    assert user.id == "42"


@pytest.mark.asyncio
async def test_get_current_user_usecase_maps_not_found_to_value_error() -> None:
    use_case = GetCurrentUserUseCase(_RepoRaisesNotFound())

    with pytest.raises(ValueError, match="User not found"):
        await use_case.execute("999")
