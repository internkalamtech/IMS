import asyncio
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import AsyncSessionLocal, engine
from app.infrastructure.database.models import Base


def pytest_sessionstart(session):
    """Create all tables before running the test session."""
    asyncio.run(_create_tables())


async def _create_tables():
    """Create all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def pytest_sessionfinish(session):
    """Drop all tables after the test session."""
    asyncio.run(_drop_tables())


async def _drop_tables():
    """Drop all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def db() -> AsyncSession:
    session = AsyncSessionLocal()
    trans = await session.begin()
    try:
        yield session
    finally:
        await trans.rollback()
        await session.close()