from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import (
    StaffModel,
    ParentModel,
    ClassSectionModel,
    UserModel,
)
from app.api.schemas import StaffCreate
import json

router = APIRouter()


@router.post("/staff")
async def create_staff(data: StaffCreate, db: AsyncSession = Depends(get_db)):
    # Ensure email is unique across users, parents and staff
    result = await db.execute(select(UserModel).filter(UserModel.email == data.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    result = await db.execute(select(ParentModel).filter(ParentModel.email == data.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists (parent)")

    result = await db.execute(select(StaffModel).filter(StaffModel.email == data.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists (staff)")

    # Ensure phone is unique across parents and staff
    result = await db.execute(select(ParentModel).filter(ParentModel.phone == data.phone))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone already exists (parent)")

    result = await db.execute(select(StaffModel).filter(StaffModel.phone == data.phone))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone already exists (staff)")

    # Validate class assignment if provided
    class_name = None
    if data.class_assigned_id is not None:
        r = await db.execute(select(ClassSectionModel).filter(ClassSectionModel.id == data.class_assigned_id))
        class_section = r.scalar_one_or_none()
        if class_section is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="classAssigned not found")
        class_name = class_section.name

    subjects_json = None
    if data.subjects:
        subjects_json = json.dumps(data.subjects)

    staff = StaffModel(
        name=data.name,
        email=str(data.email),
        phone=data.phone,
        role=data.role,
        class_assigned_id=data.class_assigned_id,
        class_assigned_name=class_name,
        subjects=subjects_json,
        license=data.license,
    )

    db.add(staff)
    await db.flush()

    return {
        "message": "Staff created",
        "staff": {
            "id": staff.id,
            "name": staff.name,
            "email": staff.email,
            "phone": staff.phone,
            "role": staff.role,
            "subjects": data.subjects or [],
            "class_assigned_id": staff.class_assigned_id,
            "class_assigned_name": staff.class_assigned_name,
            "license": staff.license,
            "created_at": staff.created_at,
            "updated_at": staff.updated_at,
        },
    }
