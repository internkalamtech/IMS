import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import AsyncSessionLocal, init_db, close_db


@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    """Create all tables before running tests and close engine after."""
    await init_db()
    yield
    await close_db()

@pytest.fixture(scope="function")
async def db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session