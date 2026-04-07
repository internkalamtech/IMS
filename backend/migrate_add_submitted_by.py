"""
One-off migration: Add submitted_by_id column to leave_requests table.
Run from the backend directory:  venv\Scripts\python migrate_add_submitted_by.py
"""
import asyncio
from sqlalchemy import text
from app.infrastructure.database.database import engine


async def migrate():
    async with engine.begin() as conn:
        # Check if column already exists
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name='leave_requests' AND column_name='submitted_by_id'
        """))
        if result.fetchone():
            print("Column submitted_by_id already exists - nothing to do.")
            return

        # Add the column
        await conn.execute(text("""
            ALTER TABLE leave_requests
            ADD COLUMN submitted_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL
        """))
        print("SUCCESS: submitted_by_id column added to leave_requests.")


if __name__ == "__main__":
    asyncio.run(migrate())
