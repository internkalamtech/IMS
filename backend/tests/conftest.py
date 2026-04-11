import asyncio
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import AsyncSessionLocal, init_db, close_db


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the entire test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_database(event_loop):
    """Create all tables before running tests and close engine after."""
    await init_db()
    yield
    await close_db()


@pytest.fixture(scope="function")
async def db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session