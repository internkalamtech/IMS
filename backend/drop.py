import asyncio

import app.infrastructure.database.models  # noqa: F401
from app.infrastructure.database.database import Base, engine


async def drop_all() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


if __name__ == "__main__":
    asyncio.run(drop_all())
