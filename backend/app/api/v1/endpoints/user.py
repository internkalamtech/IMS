from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str

@router.post("/users")
async def create_user(data: UserCreate):
    return {
        "message": "User created",
        "name": data.name,
        "email": data.email
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import UserModel
from app.api.schemas import UserCreate
router = APIRouter()

@router.post("/users")
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = UserModel(
        name=data.name,
        email=data.email
    )

    db.add(user)
    await db.flush()   # pushes insert to DB

    return {
        "message": "User created",
        "id": user.id,
        "name": user.name,
        "email": user.email
    }