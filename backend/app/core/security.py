"""
JWT token utilities for authentication.

This module provides functions for creating and validating JWT tokens.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Data to encode in the token (typically user_id)
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    """
    Decode and validate a JWT access token.

    Args:
        token: JWT token string to decode

    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        return payload
    except JWTError:
        return None


def decode_access_token_ignore_expiry(token: str) -> dict[str, Any] | None:
    """
    Decode a JWT access token without checking expiry.

    This is useful for refresh token operations where you want to
    allow expired tokens to be refreshed.

    Args:
        token: JWT token string to decode

    Returns:
        Decoded token payload if valid, None otherwise
        (expiry is ignored)
    """
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm],
            options={"verify_exp": False}
        )
        return payload
    except JWTError:
        return None


def is_token_within_refresh_window(payload: dict[str, Any]) -> bool:
    """
    Check whether a token is eligible for refresh based on its exp claim.

    Refresh is only allowed when current time is within
    +/- access_token_refresh_window_minutes around token expiry.

    Args:
        payload: Decoded JWT payload

    Returns:
        True if token is within the refresh window, False otherwise
    """
    exp = payload.get("exp")
    if exp is None:
        return False

    if isinstance(exp, datetime):
        exp_dt = exp
    elif isinstance(exp, (int, float)):
        exp_dt = datetime.fromtimestamp(exp, tz=timezone.utc)
    else:
        return False

    if exp_dt.tzinfo is None:
        exp_dt = exp_dt.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    window = timedelta(minutes=settings.access_token_refresh_window_minutes)

    return (exp_dt - window) <= now <= (exp_dt + window)
