from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.infrastructure.database.database import get_db

router = APIRouter()


@router.get("/")
async def get_users(db: AsyncSession = Depends(get_db)):
    """
    Fetch all users from database
    """
    result = await db.execute(text("SELECT id, email FROM users"))
    users = result.fetchall()

    return [
        {"id": user.id, "email": user.email}
        for user in users
    ]