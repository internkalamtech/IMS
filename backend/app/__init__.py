"""IMS backend package.

Keep package initialization lightweight to avoid importing the whole
application when modules import from ``app.*``.
"""


def __getattr__(name: str):
	"""Lazily expose ``app`` for compatibility with ``from app import app``."""
	if name == "app":
		from app.main import app as fastapi_app

		return fastapi_app
	raise AttributeError(f"module 'app' has no attribute {name!r}")


__all__ = ["app"]



