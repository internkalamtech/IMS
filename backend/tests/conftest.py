import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import AsyncSessionLocal, engine
from app.infrastructure.database.models import Base


@pytest.fixture(scope="session")
async def setup_database():
    """Create all tables before running tests."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def db(setup_database) -> AsyncSession:
    """Provide a database session for tests."""
    session = AsyncSessionLocal()
    trans = await session.begin()
    try:
        yield session
    finally:
        await trans.rollback()
        await session.close()