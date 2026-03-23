from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.database import get_db
from sqlalchemy import text

router = APIRouter()


@router.get("/")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT COUNT(*) FROM users"))
    user_count = result.scalar()

    return {
        "total_users": user_count,
        "message": "Dashboard data fetched successfully"
    }