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
    }