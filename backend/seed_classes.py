"""
Seed additional classes into the database for testing.
"""

import asyncio
from sqlalchemy import text
from app.infrastructure.database.database import engine

async def seed_classes():
    async with engine.begin() as conn:
        # Check existing classes
        result = await conn.execute(text("SELECT COUNT(*) FROM class_sections"))
        count = result.scalar()
        print(f"Existing classes: {count}")
        
        # Add more classes
        classes_to_add = [
            ("Class 1B", "1B"),
            ("Class 2A", "2A"),
            ("Class 2B", "2B"),
            ("Class 3A", "3A"),
            ("Class 3B", "3B"),
            ("Class 4A", "4A"),
            ("Class 4B", "4B"),
            ("Class 5A", "5A"),
            ("Class 5B", "5B"),
            ("Class 6A", "6A"),
        ]
        
        for name, section in classes_to_add:
            # Check if class already exists
            existing = await conn.execute(
                text("SELECT id FROM class_sections WHERE name = :name"),
                {"name": name}
            )
            if not existing.scalar():
                await conn.execute(
                    text("""
                        INSERT INTO class_sections (name)
                        VALUES (:name)
                    """),
                    {"name": name}
                )
                print(f"✓ Added {name}")
            else:
                print(f"- {name} already exists")
        
        # Show all classes
        result = await conn.execute(text("SELECT id, name FROM class_sections ORDER BY id"))
        classes = result.fetchall()
        print(f"\n✓ Total classes now: {len(classes)}")
        for class_id, class_name in classes:
            print(f"  {class_id}. {class_name}")

if __name__ == "__main__":
    asyncio.run(seed_classes())
