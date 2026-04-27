"""
Student-focused API routes under /api/students.

These endpoints serve exam schedule/results and conduct remarks for a student.
"""

from datetime import datetime, date, time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user
from app.api.schemas import (
    StudentConductResponse,
    StudentConductRemarkResponse,
    StudentExamListResponse,
    StudentExamResponse,
)
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import (
    ConductRemarkModel,
    ExamModel,
    ExamScheduleModel,
    StudentModel,
    StudentResultModel,
    SubjectModel,
    SubjectResultModel,
)

router = APIRouter(prefix="/students", tags=["Academic Performance", "Conduct"])


def parse_date_filter(value: Optional[str], field_name: str) -> Optional[date]:
    if value is None:
        return None

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name} format. Expected YYYY-MM-DD.",
        ) from exc


def build_severity(value: str | None) -> str | None:
    if value is None:
        return None

    severity = value.lower()
    if severity not in {"low", "medium", "high"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid severity. Must be one of: low, medium, high.",
        )
    return severity


def remark_severity_from_category(category: str | None) -> str | None:
    mapping = {
        "Academic": "low",
        "Discipline": "medium",
        "Attitude": "high",
    }
    return mapping.get(category)


@router.get(
    "/{student_id}/exams",
    response_model=StudentExamListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get exam schedules and results for a student",
    description=(
        "Fetch exam schedules and graded results for a given student."
    ),
)
async def get_student_exams(
    student_id: int,
    term: Optional[str] = Query(None, description="Academic term to filter by."),
    status: Optional[str] = Query(
        None,
        description="Result status filter: scheduled or completed.",
    ),
    subject: Optional[str] = Query(
        None,
        description="Filter by exam subject name.",
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudentExamListResponse:
    if status is not None and status not in {"scheduled", "completed"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Must be 'scheduled' or 'completed'.",
        )

    student_query = select(StudentModel).where(StudentModel.id == student_id)
    student_result = await db.execute(student_query)
    student = student_result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    if student.class_id is None:
        return StudentExamListResponse(studentId=str(student_id), exams=[])

    schedule_query = (
        select(ExamScheduleModel)
        .join(ExamModel)
        .where(ExamModel.class_id == student.class_id)
        .options(
            selectinload(ExamScheduleModel.subject),
            selectinload(ExamScheduleModel.exam),
        )
    )

    if term:
        schedule_query = schedule_query.where(ExamModel.academic_year == term)

    if subject:
        schedule_query = schedule_query.join(SubjectModel).where(
            SubjectModel.name.ilike(f"%{subject}%")
        )

    schedules_result = await db.execute(schedule_query)
    schedules = schedules_result.scalars().unique().all()

    student_result_query = (
        select(StudentResultModel)
        .where(StudentResultModel.student_id == student_id)
        .options(selectinload(StudentResultModel.subject_results))
    )
    student_result_rows = await db.execute(student_result_query)
    student_results = student_result_rows.scalars().unique().all()

    subject_results_map: dict[tuple[int, int], SubjectResultModel] = {}
    exam_grade_map: dict[int, str | None] = {}
    for student_result in student_results:
        exam_grade_map[student_result.exam_id] = student_result.grade
        for subject_result in student_result.subject_results:
            subject_results_map[
                (student_result.exam_id, subject_result.subject_id)
            ] = subject_result

    now_date = datetime.utcnow().date()
    exams: list[StudentExamResponse] = []

    for schedule in schedules:
        if schedule.exam is None:
            continue

        exam_date = schedule.exam_date.date()
        entry_status = "completed" if exam_date <= now_date else "scheduled"

        if status is not None and entry_status != status:
            continue

        subject_result = subject_results_map.get((schedule.exam_id, schedule.subject_id))
        exams.append(
            StudentExamResponse(
                examId=str(schedule.id),
                subject=schedule.subject.name if schedule.subject is not None else "",
                date=exam_date.isoformat(),
                status=entry_status,
                score=(
                    subject_result.obtained_marks if subject_result is not None else None
                ),
                grade=(
                    exam_grade_map.get(schedule.exam_id)
                    if subject_result is not None
                    else None
                ),
                maxMarks=schedule.max_marks,
            )
        )

    return StudentExamListResponse(studentId=str(student_id), exams=exams)


@router.get(
    "/{student_id}/conduct",
    response_model=StudentConductResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student conduct remarks",
    description=(
        "Retrieve all behavior and conduct remarks associated with a student."
    ),
)
async def get_student_conduct(
    student_id: int,
    fromDate: Optional[str] = Query(
        None,
        alias="fromDate",
        description="Start date for conduct remark filtering in YYYY-MM-DD format.",
    ),
    toDate: Optional[str] = Query(
        None,
        alias="toDate",
        description="End date for conduct remark filtering in YYYY-MM-DD format.",
    ),
    severity: Optional[str] = Query(
        None,
        description="Filter by severity: low, medium, high.",
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudentConductResponse:
    student_query = select(StudentModel).where(StudentModel.id == student_id)
    student_result = await db.execute(student_query)
    student = student_result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    from_date = parse_date_filter(fromDate, "fromDate")
    to_date = parse_date_filter(toDate, "toDate")

    if from_date is not None and to_date is not None and from_date > to_date:
        raise HTTPException(
            status_code=400,
            detail="fromDate must be earlier than or equal to toDate.",
        )

    severity = build_severity(severity)

    query = select(ConductRemarkModel).where(
        ConductRemarkModel.student_id == student_id
    ).options(selectinload(ConductRemarkModel.teacher))

    if from_date is not None:
        query = query.where(
            ConductRemarkModel.created_at >= datetime.combine(from_date, time.min)
        )

    if to_date is not None:
        query = query.where(
            ConductRemarkModel.created_at <= datetime.combine(to_date, time.max)
        )

    result = await db.execute(query)
    remarks = result.scalars().unique().all()

    if severity is not None:
        remarks = [
            remark
            for remark in remarks
            if remark_severity_from_category(remark.category) == severity
        ]

    conduct_remarks: list[StudentConductRemarkResponse] = []
    for remark in remarks:
        conduct_remarks.append(
            StudentConductRemarkResponse(
                remarkId=remark.id,
                date=remark.created_at.date(),
                teacher=getattr(remark.teacher, "name", None),
                remark=remark.remarks,
                severity=remark_severity_from_category(remark.category),
            )
        )

    return StudentConductResponse(
        studentId=str(student_id), conductRemarks=conduct_remarks
    )
