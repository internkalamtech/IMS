"""
Development server runner for the IMS Backend.

This script starts the FastAPI application using Uvicorn in development mode.
"""

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info",
    )
