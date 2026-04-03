import asyncio
from sqlalchemy import text
from app.infrastructure.database.database import AsyncSessionLocal


async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(text(
            "SELECT id, student_id, start_date, end_date, reason, status, applied_date "
            "FROM leave_requests ORDER BY id DESC LIMIT 10"
        ))
        rows = result.fetchall()
        if not rows:
            print("NO leave requests found in database.")
        else:
            print(f"Found {len(rows)} leave request(s) in DB:")
            print("-" * 70)
            for r in rows:
                print(f"  ID={r[0]} | student_id={r[1]} | {r[2].date()} to {r[3].date()} | status={r[5]}")
                print(f"  Reason   : {r[4]}")
                applied = r[6].strftime("%Y-%m-%d %H:%M") if r[6] else "N/A"
                print(f"  Applied  : {applied}")
                print()


asyncio.run(check())
