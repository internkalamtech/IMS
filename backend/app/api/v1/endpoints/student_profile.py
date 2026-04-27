"""
Student profile endpoints.

These endpoints return student-specific academic and conduct data.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user
from app.api.schemas import (
    ConductReplyResponse,
    ConductRemarkResponse,
    StudentAcademicResponse,
    StudentResultResponse,
    SubjectResultResponse,
    ExamResponse,
    ExamScheduleResponse,
)
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import (
    ConductReplyModel,
    ConductRemarkModel,
    ExamModel,
    StudentResultModel,
    SubjectResultModel,
)

router = APIRouter(prefix="/students", tags=["Students"])


@router.get(
    "/{student_id}/academic",
    response_model=StudentAcademicResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student academic profile",
    description=("Retrieve exam schedules and graded results for a specific student."),
)
async def get_student_academic_profile(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudentAcademicResponse:
    """
    Retrieve the academic profile for a given student.

    Returns all exams with schedules and the student's graded results.
    """
    try:
        query = (
            select(StudentResultModel)
            .where(StudentResultModel.student_id == student_id)
            .options(
                selectinload(StudentResultModel.exam).selectinload(ExamModel.schedules),
                selectinload(StudentResultModel.subject_results).selectinload(
                    SubjectResultModel.subject
                ),
            )
        )

        result = await db.execute(query)
        student_results = result.scalars().unique().all()

        exams_map: dict[int, ExamResponse] = {}
        results: list[StudentResultResponse] = []

        for student_result in student_results:
            exam = student_result.exam
            if exam is not None and exam.id not in exams_map:
                exam_schedules: list[ExamScheduleResponse] = []
                for schedule in exam.schedules:
                    exam_schedules.append(
                        ExamScheduleResponse(
                            id=schedule.id,
                            subject_id=schedule.subject_id,
                            subject_name=getattr(schedule.subject, "name", None),
                            exam_date=schedule.exam_date,
                            max_marks=schedule.max_marks,
                            duration_minutes=schedule.duration_minutes,
                        )
                    )

                exams_map[exam.id] = ExamResponse(
                    id=exam.id,
                    title=exam.title,
                    description=exam.description,
                    class_id=exam.class_id,
                    academic_year=exam.academic_year,
                    schedules=exam_schedules,
                )

            subject_result_list: list[SubjectResultResponse] = []
            for subject_result in student_result.subject_results:
                subject_result_list.append(
                    SubjectResultResponse(
                        subject_id=subject_result.subject_id,
                        subject_name=getattr(subject_result.subject, "name", None),
                        obtained_marks=subject_result.obtained_marks,
                        max_marks=subject_result.max_marks,
                        percentage=subject_result.percentage,
                    )
                )

            results.append(
                StudentResultResponse(
                    id=student_result.id,
                    exam_id=student_result.exam_id,
                    exam_title=exam.title if exam is not None else None,
                    total_marks=student_result.total_marks,
                    obtained_marks=student_result.obtained_marks,
                    percentage=student_result.percentage,
                    grade=student_result.grade,
                    status=student_result.status,
                    rank=student_result.rank,
                    subject_results=subject_result_list,
                )
            )

        return StudentAcademicResponse(
            student_id=student_id,
            exams=list(exams_map.values()),
            results=results,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load student academic profile.",
        ) from exc


@router.get(
    "/{student_id}/conduct",
    response_model=list[ConductRemarkResponse],
    status_code=status.HTTP_200_OK,
    summary="Get student conduct remarks",
    description=(
        "Retrieve all behavior and conduct remarks associated with a student."
    ),
)
async def get_student_conduct_remarks(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ConductRemarkResponse]:
    """
    Retrieve all conduct remarks for a given student.
    """
    try:
        query = (
            select(ConductRemarkModel)
            .where(ConductRemarkModel.student_id == student_id)
            .options(
                selectinload(ConductRemarkModel.replies).selectinload(
                    ConductReplyModel.parent
                ),
                selectinload(ConductRemarkModel.teacher),
            )
        )

        result = await db.execute(query)
        remarks = result.scalars().unique().all()

        response_data: list[ConductRemarkResponse] = []
        for remark in remarks:
            replies: list[ConductReplyResponse] = []
            for reply in remark.replies:
                replies.append(
                    ConductReplyResponse(
                        id=reply.id,
                        parent_id=reply.parent_id,
                        parent_name=getattr(reply.parent, "name", None),
                        reply_text=reply.reply_text,
                        created_at=reply.created_at,
                        updated_at=reply.updated_at,
                    )
                )

            response_data.append(
                ConductRemarkResponse(
                    id=remark.id,
                    student_id=remark.student_id,
                    teacher_id=remark.teacher_id,
                    teacher_name=getattr(remark.teacher, "name", None),
                    category=remark.category,
                    title=remark.title,
                    remarks=remark.remarks,
                    is_acknowledged=remark.is_acknowledged,
                    acknowledged_at=remark.acknowledged_at,
                    created_at=remark.created_at,
                    updated_at=remark.updated_at,
                    replies=replies,
                )
            )

        return response_data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load student conduct remarks.",
        ) from exc
