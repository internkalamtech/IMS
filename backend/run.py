"""
Development server runner for the IMS Backend.

This script starts the FastAPI application using Uvicorn in development mode.
"""

from pathlib import Path

import uvicorn

if __name__ == "__main__":
    backend_root = Path(__file__).resolve().parent
    app_dir = backend_root / "app"

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        reload_dirs=[str(app_dir)],
        reload_includes=["app/**/*.py"],
        reload_excludes=[
            "venv/**",
            "venv\\**",
            ".venv/**",
            ".venv\\**",
            "**/venv/**",
            "**\\venv\\**",
            "**/.venv/**",
            "**\\.venv\\**",
            "**/site-packages/**",
            "**\\site-packages\\**",
        ],
        log_level="info",
    )
