from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import HomeworkModel

router = APIRouter(prefix="/homeworks", tags=["Homework"])


# ✅ GET
@router.get("/")
async def get_homeworks(
    childId: str = None,
    status: str = None,
    db: AsyncSession = Depends(get_db),
):
    try:
        query = select(HomeworkModel)

        if childId:
            query = query.where(HomeworkModel.child_id == int(childId))

        if status:
            query = query.where(HomeworkModel.status == status)

        result = await db.execute(query)
        return result.scalars().all()

    except Exception as e:
        print("GET ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ CREATE
@router.post("/")
async def create_homework(data: dict, db: AsyncSession = Depends(get_db)):
    try:
        child_id = data.get("child_id") or data.get("childId")
        if child_id is None:
            raise HTTPException(status_code=400, detail="child_id is required")

        new_hw = HomeworkModel(
            child_id=int(child_id),
            title=data.get("title"),
            description=data.get("description"),
            subject=data.get("subject"),
            status=data.get("status", "pending"),
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
    homework_id: int,
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
        hw.status = data.get("status", hw.status)

        await db.commit()
        await db.refresh(hw)

        return hw

    except Exception as e:
        print("UPDATE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ DELETE 
@router.delete("/{homework_id}")
async def delete_homework(
    homework_id: int,
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