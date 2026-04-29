"""
Logging configuration for the IMS application.

Following best practices:
- Structured logging with context
- Multiple log levels
- File and console handlers
- Request ID tracking for distributed tracing
- JSON formatting for production (optional)
"""

import logging
import sys
from pathlib import Path
from typing import Any

from app.core.config import settings


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for console output."""

    # ANSI color codes
    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        "INFO": "\033[32m",  # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[35m",  # Magenta
        "RESET": "\033[0m",  # Reset
    }

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors."""
        if record.levelname in self.COLORS:
            record.levelname = (
                f"{self.COLORS[record.levelname]}{record.levelname}" f"{self.COLORS['RESET']}"
            )
        return super().format(record)


def setup_logging() -> logging.Logger:
    """
    Configure application logging.

    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger("ims")
    logger.setLevel(getattr(logging, settings.log_level.upper()))

    # Remove existing handlers
    logger.handlers.clear()

    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_formatter = ColoredFormatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # File handler (if logs directory exists or can be created)
    try:
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)

        file_handler = logging.FileHandler(logs_dir / "ims.log")
        file_handler.setLevel(logging.INFO)
        file_formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s] " "[%(funcName)s:%(lineno)d] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    except Exception as e:
        logger.warning(f"Could not create file handler: {e}")

    return logger


# Global logger instance
logger = setup_logging()


class Logger:
    """
    Logger wrapper with convenience methods.

    Provides structured logging with context.
    """

    @staticmethod
    def debug(message: str, **kwargs: Any) -> None:
        """Log debug message with context."""
        logger.debug(message, extra=kwargs)

    @staticmethod
    def info(message: str, **kwargs: Any) -> None:
        """Log info message with context."""
        logger.info(message, extra=kwargs)

    @staticmethod
    def warning(message: str, **kwargs: Any) -> None:
        """Log warning message with context."""
        logger.warning(message, extra=kwargs)

    @staticmethod
    def error(message: str, exc_info: bool = False, **kwargs: Any) -> None:
        """Log error message with context and optional exception info."""
        logger.error(message, exc_info=exc_info, extra=kwargs)

    @staticmethod
    def critical(message: str, exc_info: bool = False, **kwargs: Any) -> None:
        """Log critical message with context and optional exception info."""
        logger.critical(message, exc_info=exc_info, extra=kwargs)
