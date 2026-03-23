import asyncio
from app.infrastructure.database.database import engine, Base
import app.infrastructure.database.models  # noqa: F401


async def drop_all():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

asyncio.run(drop_all())
