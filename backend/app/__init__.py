"""IMS Backend Application package exports."""

__all__ = ["app"]


def __getattr__(name: str):
    """Lazily expose the FastAPI app without importing app.main at package import time."""
    if name == "app":
        from app.main import app

        return app
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
