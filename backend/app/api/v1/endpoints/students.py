from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.infrastructure.database.models import StudentModel
from app.infrastructure.database.database import get_db
from app.api.schemas import StudentResponse, AverageMarksResponse
from app.api.schemas import StudentCreate

router = APIRouter()

# TODO: Filter students based on logged-in teacher's assigned classes
@router.get("/students", response_model=list[StudentResponse])
async def get_students_by_class(
    class_name: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudentModel).where(StudentModel.class_name == class_name)
    )

    students = result.scalars().all()

    return students

# TODO: Restrict aggregation to classes assigned to the authenticated teacher
@router.get("/students/average-marks", response_model=AverageMarksResponse)
async def get_average_marks(
    class_name: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            func.avg(StudentModel.marks),
            func.avg(StudentModel.attendance)
        ).where(StudentModel.class_name == class_name)
    )

    row = result.fetchone()

    avg_marks = row[0] if row and row[0] is not None else 0
    avg_attendance = row[1] if row and row[1] is not None else 0

    return {
        "class_name": class_name,
        "average_marks": round(avg_marks, 2),
        "average_attendance": round(avg_attendance, 2),
    }


@router.post("/students", response_model=StudentResponse)
async def create_student(
    payload: StudentCreate,
    db: AsyncSession = Depends(get_db),
):
    student = StudentModel(
        name=payload.name,
        roll_number=payload.roll_number,
        class_name=payload.class_name
    )

    db.add(student)
    await db.commit()
    await db.refresh(student)

    return student