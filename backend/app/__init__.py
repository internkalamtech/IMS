"""IMS Backend package.

Avoid eager imports here to prevent circular imports during startup.
"""

__all__ = ["app"]


def __getattr__(name: str):
	"""Lazily expose `app` to keep import side effects deferred."""
	if name == "app":
		from app.main import app as fastapi_app

		return fastapi_app
	raise AttributeError(f"module 'app' has no attribute {name!r}")
