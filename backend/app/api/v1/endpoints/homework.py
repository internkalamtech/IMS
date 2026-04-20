from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import HomeworkModel

router = APIRouter(prefix="/homeworks", tags=["Homework"])


# ✅ GET
@router.get("/")
async def get_homeworks(
    className: str = None,
    teacherId: str = None,
    db: AsyncSession = Depends(get_db),
):
    try:
        query = select(HomeworkModel)

        if teacherId:
            query = query.where(HomeworkModel.teacherId == teacherId)

        if className:
            query = query.where(HomeworkModel.className == className)

        result = await db.execute(query)
        return result.scalars().all()

    except Exception as e:
        print("GET ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ CREATE
@router.post("/")
async def create_homework(data: dict, db: AsyncSession = Depends(get_db)):
    try:
        new_hw = HomeworkModel(
            id=str(uuid.uuid4()),
            title=data.get("title"),
            description=data.get("description"),
            subject=data.get("subject"),
            className=data.get("className"),
            dueDate=data.get("dueDate"),
            assignType=data.get("assignType", "ALL"),
            students=",".join(data.get("students", [])) if isinstance(data.get("students"), list) else "",
            teacherId=data.get("teacherId", "T1"),
            created_at=datetime.utcnow(),
        )

        db.add(new_hw)
        await db.commit()
        await db.refresh(new_hw)

        return new_hw

    except Exception as e:
        print("CREATE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ UPDATE
@router.put("/{homework_id}")
async def update_homework(
    homework_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(
            select(HomeworkModel).where(HomeworkModel.id == homework_id)
        )
        hw = result.scalar_one_or_none()

        if not hw:
            raise HTTPException(status_code=404, detail="Homework not found")

        hw.title = data.get("title", hw.title)
        hw.description = data.get("description", hw.description)
        hw.subject = data.get("subject", hw.subject)
        hw.className = data.get("className", hw.className)
        hw.dueDate = data.get("dueDate", hw.dueDate)
        hw.assignType = data.get("assignType", hw.assignType)

        if "students" in data and isinstance(data.get("students"), list):
            hw.students = ",".join(data.get("students"))

        await db.commit()
        await db.refresh(hw)

        return hw

    except Exception as e:
        print("UPDATE ERROR:", e)
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