import asyncio
from datetime import datetime, timedelta
from sqlalchemy import text
from app.infrastructure.database.database import engine

async def seed_documents():
    async with engine.begin() as conn:
        now = datetime.utcnow()
        
        docs = [
            {
                "title": "Insurance",
                "original_filename": "insurance.pdf",
                "file_path": "uploads/documents/insurance.pdf",
                "content_type": "application/pdf",
                "branch": "School Bus 012",
                "scope": "INS-2024-5678",
                "expiry_date": now + timedelta(days=7),
                "uploaded_by_id": 1,
                "upload_date": now - timedelta(days=360)
            },
            {
                "title": "Pollution Certificate",
                "original_filename": "pollution.pdf",
                "file_path": "uploads/documents/pollution.pdf",
                "content_type": "application/pdf",
                "branch": "School Bus 008",
                "scope": "PUC-2024-3421",
                "expiry_date": now + timedelta(days=17),
                "uploaded_by_id": 1,
                "upload_date": now - timedelta(days=160)
            },
            {
                "title": "Driving License",
                "original_filename": "license.pdf",
                "file_path": "uploads/documents/license.pdf",
                "content_type": "application/pdf",
                "branch": "Rajesh Kumar",
                "scope": "DL-2024-1234",
                "expiry_date": now + timedelta(days=41),
                "uploaded_by_id": 1,
                "upload_date": now - timedelta(days=1000)
            }
        ]
        
        for doc in docs:
            # Check if exists
            existing = await conn.execute(
                text("SELECT id FROM compliance_documents WHERE title = :title AND scope = :scope"),
                {"title": doc["title"], "scope": doc["scope"]}
            )
            if not existing.scalar():
                await conn.execute(
                    text("""
                        INSERT INTO compliance_documents 
                        (title, original_filename, file_path, content_type, branch, scope, expiry_date, uploaded_by_id, upload_date)
                        VALUES (:title, :original_filename, :file_path, :content_type, :branch, :scope, :expiry_date, :uploaded_by_id, :upload_date)
                    """),
                    doc
                )
                print(f"✓ Added {doc['title']}")
            else:
                print(f"- {doc['title']} already exists")
                
        print("✓ Seeding complete")

if __name__ == "__main__":
    asyncio.run(seed_documents())
