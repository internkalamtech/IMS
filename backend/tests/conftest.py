import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import AsyncSessionLocal


@pytest.fixture(scope="function")
async def db() -> AsyncSession:
    session = AsyncSessionLocal()
    trans = await session.begin()
    try:
        yield session
    finally:
        try:
            await trans.rollback()
        except Exception:
            pass  # Test already committed/closed the transaction
        await session.close()