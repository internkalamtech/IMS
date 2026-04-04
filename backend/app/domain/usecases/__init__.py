"""Use cases for business logic."""

from app.domain.usecases.auth_usecases import (
    LoginUseCase,
    GetCurrentUserUseCase,
)
from app.domain.usecases.homework_usecases import (
    GetPendingHomeworkCountUseCase,
)

__all__ = [
    "LoginUseCase",
    "GetCurrentUserUseCase",
    "GetPendingHomeworkCountUseCase",
]
