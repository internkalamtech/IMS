import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import AsyncSessionLocal, engine
from app.infrastructure.database.models import Base


@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    """Create all tables before running tests."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # Drop tables after tests
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