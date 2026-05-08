from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
import uuid

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import HomeworkModel
from app.api.schemas import HomeworkResponse, HomeworkCreate, HomeworkUpdate

router = APIRouter(prefix="/homeworks", tags=["Homework"])


# ✅ GET ALL HOMEWORKS (for admin/teacher)
@router.get("/", response_model=list[HomeworkResponse])
async def get_homeworks(
    class_name: str | None = Query(None),
    teacher_id: int | None = Query(None),
    subject: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get all homeworks, optionally filtered by class, teacher, or subject."""
    try:
        query = select(HomeworkModel)

        if teacher_id:
            query = query.where(HomeworkModel.teacher_id == teacher_id)

        if class_name:
            query = query.where(HomeworkModel.className == class_name)

        if subject:
            query = query.where(HomeworkModel.subject == subject)

        result = await db.execute(query)
        homeworks = result.scalars().all()
        return [HomeworkResponse(**hw.__dict__) for hw in homeworks]

    except Exception as e:
        print("GET ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET HOMEWORK FOR A STUDENT
@router.get("/student/{child_id}", response_model=list[HomeworkResponse])
async def get_student_homework(
    child_id: int,
    status: str | None = Query(None),
    subject: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get all homework assignments for a specific student, optionally filtered by status or subject."""
    try:
        query = select(HomeworkModel).where(HomeworkModel.child_id == child_id)

        if status:
            query = query.where(HomeworkModel.status == status)

        if subject:
            query = query.where(HomeworkModel.subject == subject)

        query = query.order_by(HomeworkModel.due_date.desc())

        result = await db.execute(query)
        homeworks = result.scalars().all()
        return [HomeworkResponse(**hw.__dict__) for hw in homeworks]

    except Exception as e:
        print("GET STUDENT HOMEWORK ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET SINGLE HOMEWORK
@router.get("/{homework_id}", response_model=HomeworkResponse)
async def get_homework(homework_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific homework assignment by ID."""
    try:
        result = await db.execute(
            select(HomeworkModel).where(HomeworkModel.id == homework_id)
        )
        homework = result.scalar_one_or_none()

        if not homework:
            raise HTTPException(status_code=404, detail="Homework not found")

        return HomeworkResponse(**homework.__dict__)

    except HTTPException:
        raise
    except Exception as e:
        print("GET SINGLE HOMEWORK ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ CREATE HOMEWORK
@router.post("/", response_model=HomeworkResponse, status_code=201)
async def create_homework(
    data: HomeworkCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new homework assignment."""
    try:
        new_hw = HomeworkModel(
            child_id=data.child_id,
            teacher_id=data.teacher_id,
            title=data.title,
            description=data.description,
            subject=data.subject,
            due_date=data.due_date,
            status=data.status,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(new_hw)
        await db.commit()
        await db.refresh(new_hw)

        return HomeworkResponse(**new_hw.__dict__)

    except Exception as e:
        await db.rollback()
        print("CREATE HOMEWORK ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ UPDATE HOMEWORK
@router.put("/{homework_id}", response_model=HomeworkResponse)
async def update_homework(
    homework_id: int,
    data: HomeworkUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing homework assignment."""
    try:
        result = await db.execute(
            select(HomeworkModel).where(HomeworkModel.id == homework_id)
        )
        homework = result.scalar_one_or_none()

        if not homework:
            raise HTTPException(status_code=404, detail="Homework not found")

        # Update only provided fields
        if data.title is not None:
            homework.title = data.title
        if data.description is not None:
            homework.description = data.description
        if data.subject is not None:
            homework.subject = data.subject
        if data.due_date is not None:
            homework.due_date = data.due_date
        if data.status is not None:
            homework.status = data.status

        homework.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(homework)

        return HomeworkResponse(**homework.__dict__)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print("UPDATE HOMEWORK ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ DELETE HOMEWORK
@router.delete("/{homework_id}", status_code=204)
async def delete_homework(homework_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a homework assignment."""
    try:
        result = await db.execute(
            select(HomeworkModel).where(HomeworkModel.id == homework_id)
        )
        homework = result.scalar_one_or_none()

        if not homework:
            raise HTTPException(status_code=404, detail="Homework not found")

        await db.delete(homework)
        await db.commit()

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print("DELETE HOMEWORK ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))



# ✅ DELETE 
@router.delete("/{homework_id}")
async def delete_homework(
    homework_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        # 🔍 PRINT ID
        print("DELETE ID RECEIVED:", homework_id)

        # 🔍 FIND HOMEWORK
        result = await db.execute(
            select(HomeworkModel).where(
                HomeworkModel.id == homework_id
            )
        )

        hw = result.scalar_one_or_none()

        print("FOUND HOMEWORK:", hw)

        # ❌ NOT FOUND
        if not hw:
            raise HTTPException(
                status_code=404,
                detail="Homework not found"
            )

        # 🗑 DELETE
        await db.delete(hw)

        print("DELETING RECORD...")

        # ✅ COMMIT
        await db.commit()

        print("DELETE SUCCESSFUL")

        return {
            "message": "Deleted successfully"
        }

    except Exception as e:
        print("DELETE ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )