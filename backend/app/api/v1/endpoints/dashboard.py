from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.dependencies import get_current_user
from app.api.schemas import DashboardResponse, StatItem
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import HomeworkModel

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:

    try:
        role = current_user.role
        stats = []
        role_label = role.capitalize()

        # 🎯 TEACHER DASHBOARD
        if role == "teacher":

            result = await db.execute(
                select(HomeworkModel).where(
                    HomeworkModel.teacherId == str(current_user.id)
                )
            )

            homeworks = result.scalars().all()

            class_counts = {}

            for hw in homeworks:
                cls = hw.className
                if cls:
                    class_counts[cls] = class_counts.get(cls, 0) + 1

            # ✅ HANDLE EMPTY CASE
            if not class_counts:
                stats = [
                    StatItem(label="No Homework Yet", value="0")
                ]
            else:
                stats = [
                    StatItem(label=f"Homework ({cls})", value=str(count))  # 🔥 string safe
                    for cls, count in class_counts.items()
                ]

            role_label = "Teacher"

        else:
            stats = [
                StatItem(label="No Data", value="0")
            ]

        return DashboardResponse(role=role_label, stats=stats)

    except Exception as e:
        print("DASHBOARD ERROR:", e)
        raise HTTPException(status_code=500, detail="Dashboard failed")