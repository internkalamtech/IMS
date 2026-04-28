from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import RoleModel, UserModel

router = APIRouter()


@router.get("/users")
async def get_users(role: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(UserModel)

    if role:
        query = query.join(UserModel.roles).where(RoleModel.name == role.strip().lower())

    result = await db.execute(query)
    users = result.scalars().all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "roles": [role.name for role in user.roles],
        }
        for user in users
    ]
