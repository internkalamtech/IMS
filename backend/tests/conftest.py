import asyncio
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import AsyncSessionLocal, engine
from app.infrastructure.database.models import Base


# Create all tables once at module startup
async def _init_db():
    """Create all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


asyncio.run(_init_db())


@pytest.fixture(scope="function")
async def db() -> AsyncSession:
    """Provide a database session for each test."""
    session = AsyncSessionLocal()
    trans = await session.begin()
    try:
        yield session
    finally:
        await trans.rollback()
        await session.close()