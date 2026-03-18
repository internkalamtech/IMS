from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from app.infrastructure.database.database import get_db

router = APIRouter()

class User(BaseModel):
    name: str
    email: str


@router.post("/users")
async def add_user(user: User, db: AsyncSession = Depends(get_db)):

    print("User received:", user.name, user.email)

    query = text("""
        INSERT INTO added_users (name, email)
        VALUES (:name, :email)
    """)

    await db.execute(query, {"name": user.name, "email": user.email})
    await db.commit()

    return {
        "message": "User stored",
        "data": user
    }