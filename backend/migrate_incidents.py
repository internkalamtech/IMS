"""
One-time migration: add latitude & longitude columns to incidents table.
Run with: python migrate_incidents.py
"""
import asyncio
import asyncpg


DB_URL = "postgresql://ims_user:ims_password@localhost:5432/ims_db"


async def migrate():
    conn = await asyncpg.connect(DB_URL)
    try:
        # Check existing columns
        rows = await conn.fetch(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'incidents'
            ORDER BY ordinal_position
            """
        )
        existing = [r["column_name"] for r in rows]
        print(f"Existing columns: {existing}")

        # Add latitude if missing
        if "latitude" not in existing:
            await conn.execute(
                "ALTER TABLE incidents ADD COLUMN latitude DOUBLE PRECISION"
            )
            print("OK: Added column: latitude")
        else:
            print("SKIP: latitude already exists")

        # Add longitude if missing
        if "longitude" not in existing:
            await conn.execute(
                "ALTER TABLE incidents ADD COLUMN longitude DOUBLE PRECISION"
            )
            print("OK: Added column: longitude")
        else:
            print("SKIP: longitude already exists")

        # Verify final state
        rows2 = await conn.fetch(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'incidents'
            ORDER BY ordinal_position
            """
        )
        print(f"\nFinal columns: {[r['column_name'] for r in rows2]}")
        print("\nMigration complete ✅")

    finally:
        await conn.close()


asyncio.run(migrate())
