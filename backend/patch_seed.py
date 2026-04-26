"""
Patch script: seeds April 2026 attendance + leave + homework
for demo children (9, 10, 11) that were missing current-month data.

Safe to run multiple times (idempotent per day/child).
"""
import asyncio
import calendar as cal_lib
from datetime import datetime, timedelta

from sqlalchemy import select, text

from app.core.logger import Logger
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import (
    AttendanceModel,
    HomeworkModel,
    LeaveRequestModel,
    UserModel,
)

CHILDREN_EMAILS = ["aarav@myuser.com", "priya@myuser.com", "ravi@myuser.com"]

DEMO_HOMEWORK_PER_CHILD = [
    {"subject": "Mathematics", "title": "Algebra Practice Set",
     "description": "Complete exercises 1-25 from chapter 4", "status": "pending"},
    {"subject": "Science", "title": "Project on Solar System",
     "description": "Submit detailed observations", "status": "pending"},
    {"subject": "English", "title": "Essay - My Favourite Book",
     "description": "Write a 500-word essay", "status": "overdue"},
    {"subject": "Hindi", "title": "Grammar Exercise Page 45-47",
     "description": "Complete the grammar exercises", "status": "pending"},
    {"subject": "Social Studies", "title": "Map Work - Indian States",
     "description": "Complete the map work assignment", "status": "submitted"},
]


def _day_status(day: int, weekday: int, today_day: int, month: int, today_month: int) -> str:
    """Deterministic attendance status for a given calendar day."""
    if weekday >= 5:          # Saturday/Sunday
        return "holiday"
    if month == today_month and day > today_day:
        return "not-marked"   # future dates
    if day % 10 == 0:
        return "absent"
    if day % 15 == 0:
        return "leave"
    return "present"


async def patch():
    await init_db()

    async with AsyncSessionLocal() as db:
        # 1. Load children
        result = await db.execute(
            select(UserModel).where(UserModel.email.in_(CHILDREN_EMAILS))
        )
        children = result.unique().scalars().all()
        if not children:
            Logger.warning("No demo children found — nothing to patch.")
            return

        today = datetime.utcnow().date()
        target_year, target_month = today.year, today.month
        days_in_month = cal_lib.monthrange(target_year, target_month)[1]

        for child in children:
            Logger.info(f"Patching child: {child.email} (id={child.id})")

            # ── Attendance for current month ───────────────────────────────
            for d in range(1, days_in_month + 1):
                day_dt = datetime(target_year, target_month, d)
                weekday = day_dt.weekday()
                status = _day_status(d, weekday, today.day, target_month, target_month)

                # Skip future not-marked days — they don't need records
                if status == "not-marked":
                    continue

                # Check if record already exists for this student+date
                existing = await db.execute(
                    select(AttendanceModel).where(
                        AttendanceModel.student_id == child.id,
                        AttendanceModel.date == day_dt,
                    )
                )
                if existing.scalar_one_or_none():
                    continue  # already seeded, skip

                db.add(AttendanceModel(
                    student_id=child.id,
                    date=day_dt,
                    status=status,
                ))

            # ── Leave request for current month ───────────────────────────
            month_start = datetime(target_year, target_month, 1)
            month_end = datetime(target_year, target_month, days_in_month, 23, 59, 59)
            existing_leave = await db.execute(
                select(LeaveRequestModel).where(
                    LeaveRequestModel.student_id == child.id,
                    LeaveRequestModel.start_date >= month_start,
                    LeaveRequestModel.start_date <= month_end,
                )
            )
            if not existing_leave.first():
                leave_day = max(today.day - 3, 1)
                start_dt = datetime(target_year, target_month, leave_day)
                end_dt = start_dt + timedelta(days=1)
                db.add(LeaveRequestModel(
                    student_id=child.id,
                    start_date=start_dt,
                    end_date=end_dt,
                    reason="Medical appointment",
                    status="approved",
                    applied_date=datetime.utcnow(),
                    teacher_note="Approved. Get well soon.",
                ))
                Logger.info(f"  Added leave request for child {child.id}")

            # ── Homework (idempotent: skip if any exist for this child) ───
            existing_hw = await db.execute(
                select(HomeworkModel).where(HomeworkModel.child_id == child.id)
            )
            if not existing_hw.scalars().first():
                for hw_data in DEMO_HOMEWORK_PER_CHILD:
                    db.add(HomeworkModel(
                        child_id=child.id,
                        subject=hw_data["subject"],
                        title=hw_data["title"],
                        description=hw_data["description"],
                        status=hw_data["status"],
                    ))
                Logger.info(f"  Added {len(DEMO_HOMEWORK_PER_CHILD)} homework records for child {child.id}")
            else:
                Logger.info(f"  Homework already exists for child {child.id} — skipping")

        await db.commit()
        Logger.info("Patch complete!")


if __name__ == "__main__":
    asyncio.run(patch())
