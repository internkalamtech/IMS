"""
Database connection and session management.

This module handles database connections using SQLAlchemy.
Uses SQLite for development, can be configured for PostgreSQL in production.

Following best practices:
- Connection pooling for resource management
- Dependency injection for session management
- Proper error handling and cleanup
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings
from app.infrastructure.database.models import Base

# Create engine - using sync SQLAlchemy for SQLite compatibility
if settings.database_url.startswith("sqlite"):
    # SQLite requires connect_args
    engine = create_engine(
        settings.database_url,
        echo=settings.debug,  # Log SQL queries in debug mode
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL or other databases
    engine = create_engine(
        settings.database_url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.

    This function is used with FastAPI's dependency injection system.
    It ensures proper session lifecycle management with automatic cleanup.

    Yields:
        Session: Database session

    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(UserModel).all()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database by creating all tables.

    This function should be called on application startup.
    In production, use Alembic migrations instead.
    """
    Base.metadata.create_all(bind=engine)


async def close_db() -> None:
    """
    Close database connections.

    This function should be called on application shutdown.
    """
    await engine.dispose()
