"""
Migration script to add missing columns to students table.
"""

import asyncio
from sqlalchemy import text
from app.infrastructure.database.database import engine

async def migrate():
    async with engine.begin() as conn:
        # Add missing columns to students table
        await conn.execute(text("""
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS marks FLOAT NOT NULL DEFAULT 0.0
        """))
        
        await conn.execute(text("""
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS attendance FLOAT DEFAULT NULL
        """))
        
        await conn.execute(text("""
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS next_due_date TIMESTAMP DEFAULT NULL
        """))
        
        print("✓ Migration completed successfully")

if __name__ == "__main__":
    asyncio.run(migrate())
