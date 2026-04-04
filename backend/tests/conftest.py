import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import AsyncSessionLocal, engine
from app.infrastructure.database.models import Base


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """Create all database tables before tests run."""
    # Use synchronous connection to create tables
    with engine.begin() as conn:
        Base.metadata.create_all(conn)
    yield


@pytest.fixture(scope="function")
async def db() -> AsyncSession:
    """Provide a database session for each test."""
    session = AsyncSessionLocal()
    async with session.begin():
        yield session
    await session.close()