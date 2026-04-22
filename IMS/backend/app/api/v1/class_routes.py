from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import ClassModel, UserModel
from app.schemas.class_schema import AssignTeacherRequest

class_router = APIRouter()
router = class_router


@class_router.patch(
    "/classes/{id}/teacher",
    status_code=status.HTTP_200_OK,
)
async def assign_teacher(
    id: int,
    data: AssignTeacherRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    class_result = await db.execute(
        select(ClassModel).where(ClassModel.id == id)
    )
    class_obj = class_result.scalar_one_or_none()
    if class_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    if data.teacherUserId is None:
        class_obj.teacher_id = None
        await db.flush()
        return {"message": "Teacher removed successfully"}

    user_result = await db.execute(
        select(UserModel).where(UserModel.id == data.teacherUserId)
    )
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    has_teacher_role = any(role.name.lower() == "teacher" for role in user.roles)
    if not has_teacher_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must have role TEACHER",
        )

    class_obj.teacher_id = user.id
    await db.flush()

    return {"message": "Teacher assigned successfully"}
