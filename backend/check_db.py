import asyncio
from sqlalchemy import text
from app.infrastructure.database.database import AsyncSessionLocal


async def check():
    async with AsyncSessionLocal() as db:
        r = await db.execute(
            text("SELECT student_id, MIN(date), MAX(date), COUNT(*) FROM attendances WHERE student_id IN (9,10,11) GROUP BY student_id")
        )
        print("DATE RANGE FOR CHILDREN:", r.fetchall())

        r = await db.execute(
            text("SELECT date, status FROM attendances WHERE student_id=9 AND date >= '2026-04-01' ORDER BY date")
        )
        april = r.fetchall()
        print("APRIL 2026 records for child 9:", april)

        r = await db.execute(
            text("SELECT date, status FROM attendances WHERE student_id=9 ORDER BY date LIMIT 5")
        )
        print("FIRST 5 records for child 9:", r.fetchall())

        r = await db.execute(
            text("SELECT date, status FROM attendances WHERE student_id=9 ORDER BY date DESC LIMIT 5")
        )
        print("LAST 5 records for child 9:", r.fetchall())


asyncio.run(check())
