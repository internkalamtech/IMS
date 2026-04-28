from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, constr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import ClassSectionModel, RoleModel, UserModel
from app.infrastructure.repositories.class_repository import ClassRepository

router = APIRouter(prefix="/classes", tags=["Classes"])


class ClassPayload(BaseModel):
    name: constr(strip_whitespace=True, min_length=1)
    section: constr(strip_whitespace=True, min_length=1)
    academicPeriodId: int = Field(..., gt=0)
    teacherUserId: Optional[int] = None
    subject: Optional[str] = None
    totalStudents: int = Field(0, ge=0)


class ClassTeacherPayload(BaseModel):
    teacherUserId: Optional[int]


async def _find_teacher(db: AsyncSession, teacher_user_id: int) -> Optional[UserModel]:
    result = await db.execute(
        select(UserModel)
        .join(UserModel.roles)
        .where(
            UserModel.id == teacher_user_id,
            RoleModel.name == "teacher",
        )
    )
    return result.scalar_one_or_none()


async def _validate_teacher(db: AsyncSession, teacher_user_id: Optional[int]) -> Optional[int]:
    if teacher_user_id is None:
        return None

    teacher = await _find_teacher(db, teacher_user_id)
    if teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found or invalid role",
        )

    return teacher.id


async def _ensure_unique_class(
    db: AsyncSession,
    name: str,
    section: str,
    academic_period_id: int,
    exclude_id: Optional[int] = None,
) -> None:
    query = select(ClassSectionModel).where(
        ClassSectionModel.name == name,
        ClassSectionModel.section == section,
        ClassSectionModel.academic_period_id == academic_period_id,
        ClassSectionModel.is_deleted == False,
    )
    if exclude_id is not None:
        query = query.where(ClassSectionModel.id != exclude_id)

    result = await db.execute(query)
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Another class with same name, section and academic year exists",
        )


def _serialize_class(class_obj: ClassSectionModel) -> dict:
    return {
        "id": class_obj.id,
        "name": class_obj.name,
        "section": class_obj.section,
        "academicPeriodId": class_obj.academic_period_id,
        "teacherUserId": class_obj.teacher_user_id,
        "teacherName": class_obj.teacher.name if class_obj.teacher else None,
        "subject": class_obj.subject,
        "totalStudents": class_obj.total_students,
    }


@router.get("/", response_model=list[dict])
async def list_classes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ClassSectionModel).where(ClassSectionModel.is_deleted == False)
    )
    class_objects = result.scalars().all()
    return [_serialize_class(c) for c in class_objects]


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_class(payload: ClassPayload, db: AsyncSession = Depends(get_db)):
    await _ensure_unique_class(
        db,
        payload.name,
        payload.section,
        payload.academicPeriodId,
    )

    teacher_id = await _validate_teacher(db, payload.teacherUserId)

    class_obj = ClassSectionModel(
        name=payload.name,
        section=payload.section,
        academic_period_id=payload.academicPeriodId,
        teacher_user_id=teacher_id,
        subject=payload.subject,
        total_students=payload.totalStudents,
    )

    db.add(class_obj)
    await db.flush()
    await db.refresh(class_obj)

    return _serialize_class(class_obj)


@router.put("/{class_id}", response_model=dict)
async def update_class(
    class_id: int, payload: ClassPayload, db: AsyncSession = Depends(get_db)
):
    class_repo = ClassRepository(db)
    class_obj = await class_repo.get_by_id(class_id)

    if class_obj is None or class_obj.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    await _ensure_unique_class(
        db,
        payload.name,
        payload.section,
        payload.academicPeriodId,
        exclude_id=class_id,
    )

    class_obj.name = payload.name
    class_obj.section = payload.section
    class_obj.academic_period_id = payload.academicPeriodId
    class_obj.subject = payload.subject
    class_obj.total_students = payload.totalStudents
    class_obj.teacher_user_id = await _validate_teacher(db, payload.teacherUserId)

    await class_repo.save(class_obj)
    return _serialize_class(class_obj)


@router.patch("/{class_id}/teacher", response_model=dict)
async def update_class_teacher(
    class_id: int, payload: ClassTeacherPayload, db: AsyncSession = Depends(get_db)
):
    class_repo = ClassRepository(db)
    class_obj = await class_repo.get_by_id(class_id)

    if class_obj is None or class_obj.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    class_obj.teacher_user_id = await _validate_teacher(db, payload.teacherUserId)
    await class_repo.save(class_obj)

    return {
        "message": "Class teacher updated successfully",
        "classId": class_obj.id,
        "teacherUserId": class_obj.teacher_user_id,
    }


@router.delete("/{class_id}", response_model=dict)
async def delete_class(class_id: int, db: AsyncSession = Depends(get_db)):
    class_repo = ClassRepository(db)
    class_obj = await class_repo.get_by_id(class_id)

    if class_obj is None or class_obj.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    if class_obj.total_students > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete class with active students",
        )

    class_obj.is_deleted = True
    await class_repo.save(class_obj)

    return {"message": "Class deleted successfully"}
