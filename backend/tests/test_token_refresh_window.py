from datetime import datetime, timedelta, timezone

from app.core.security import is_token_within_refresh_window


def _payload_with_exp(delta_minutes: int) -> dict[str, int]:
    exp = datetime.now(timezone.utc) + timedelta(minutes=delta_minutes)
    return {"exp": int(exp.timestamp())}


def test_token_within_refresh_window_recently_expired() -> None:
    payload = _payload_with_exp(-1)
    assert is_token_within_refresh_window(payload) is True


def test_token_within_refresh_window_expiring_soon() -> None:
    payload = _payload_with_exp(1)
    assert is_token_within_refresh_window(payload) is True


def test_token_outside_refresh_window_expired_too_long() -> None:
    payload = _payload_with_exp(-10)
    assert is_token_within_refresh_window(payload) is False


def test_token_outside_refresh_window_not_close_to_expiry() -> None:
    payload = _payload_with_exp(10)
    assert is_token_within_refresh_window(payload) is False
