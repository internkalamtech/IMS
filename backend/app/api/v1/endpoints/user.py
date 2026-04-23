from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import UserModel
from app.api.schemas import UserCreate

router = APIRouter()

@router.post("/users")
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    new_user = UserModel(
        name=data.name,
        email=data.email
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "User created",
        "name": new_user.name,
        "email": new_user.email
    }