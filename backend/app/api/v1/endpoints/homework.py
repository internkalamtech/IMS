"""
Homework endpoints for the IMS API.

GET  /homeworks/              - List homework for a student (filtered by child_id)
POST /homeworks/              - Create a homework record
PUT  /homeworks/{id}          - Update a homework record
DELETE /homeworks/{id}        - Delete a homework record
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import HomeworkModel
from app.core.logger import Logger

router = APIRouter(prefix="/homeworks", tags=["Homework"])


# ─── GET ─────────────────────────────────────────────────────────────────────

@router.get("/")
async def get_homeworks(
    child_id: int = None,
    status: str = None,
    db: AsyncSession = Depends(get_db),
):
    """Return homework records, optionally filtered by child_id and/or status."""
    try:
        query = select(HomeworkModel)

        if child_id is not None:
            query = query.where(HomeworkModel.child_id == child_id)

        if status:
            query = query.where(HomeworkModel.status == status)

        query = query.order_by(HomeworkModel.created_at.desc())
        result = await db.execute(query)
        records = result.scalars().all()

        return [
            {
                "id": hw.id,
                "child_id": hw.child_id,
                "subject": hw.subject,
                "title": hw.title,
                "description": hw.description,
                "status": hw.status,
                "created_at": hw.created_at.isoformat() if hw.created_at else None,
            }
            for hw in records
        ]

    except Exception as e:
        Logger.error(f"GET /homeworks error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/", status_code=201)
async def create_homework(data: dict, db: AsyncSession = Depends(get_db)):
    """Create a new homework record for a child."""
    try:
        child_id = data.get("child_id")
        if not child_id:
            raise HTTPException(status_code=400, detail="child_id is required")

        new_hw = HomeworkModel(
            child_id=int(child_id),
            subject=data.get("subject", "General"),
            title=data.get("title", ""),
            description=data.get("description"),
            status=data.get("status", "pending"),
        )

        db.add(new_hw)
        await db.commit()
        await db.refresh(new_hw)

        return {
            "id": new_hw.id,
            "child_id": new_hw.child_id,
            "subject": new_hw.subject,
            "title": new_hw.title,
            "description": new_hw.description,
            "status": new_hw.status,
            "created_at": new_hw.created_at.isoformat() if new_hw.created_at else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        Logger.error(f"POST /homeworks error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ─── UPDATE ───────────────────────────────────────────────────────────────────

@router.put("/{homework_id}")
async def update_homework(
    homework_id: int,
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing homework record."""
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

        return {
            "id": hw.id,
            "child_id": hw.child_id,
            "subject": hw.subject,
            "title": hw.title,
            "description": hw.description,
            "status": hw.status,
            "created_at": hw.created_at.isoformat() if hw.created_at else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        Logger.error(f"PUT /homeworks/{homework_id} error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ─── DELETE ───────────────────────────────────────────────────────────────────

@router.delete("/{homework_id}")
async def delete_homework(
    homework_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a homework record by ID."""
    try:
        result = await db.execute(
            select(HomeworkModel).where(HomeworkModel.id == homework_id)
        )
        hw = result.scalar_one_or_none()

        if not hw:
            raise HTTPException(status_code=404, detail="Homework not found")

        await db.delete(hw)
        await db.commit()

        return {"message": "Deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        Logger.error(f"DELETE /homeworks/{homework_id} error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))