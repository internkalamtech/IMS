"""ASGI entrypoint wrapper for the backend.

This file makes it possible to start the app with:
    uvicorn main:app
from the backend directory.
"""

from app.main import app

__all__ = ["app"]
