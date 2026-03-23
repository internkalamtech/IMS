from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.database import get_db
from sqlalchemy import text

router = APIRouter()


@router.get("/")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT id, email FROM users"))
    users = result.fetchall()

    return [{"id": u[0], "email": u[1]} for u in users]