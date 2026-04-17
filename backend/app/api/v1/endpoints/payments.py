"""
Payment endpoints.

Provides REST API endpoints for the Payment Module, including:
- Recording new payment transactions
- Listing and filtering payments
- Listing students with fee information
- Aggregated payment statistics
- CSV export of payment records
"""

import csv
import io
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    ErrorResponse,
    PaymentCreate,
    PaymentResponse,
    PaymentSummaryResponse,
    PaymentStatus,
    StudentResponse,
)
from app.core.errors import DatabaseError, NotFoundError, ValidationError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.usecases.payment_usecases import (
    GetPaymentSummaryUseCase,
    GetPaymentUseCase,
    GetStudentUseCase,
    ListPaymentsUseCase,
    ListStudentsUseCase,
    RecordPaymentUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_payment_repository import (
    DatabasePaymentRepository,
)

router = APIRouter(prefix="/payments", tags=["Payments"])


# ------------------------------------------------------------------ #
# Payment endpoints
# ------------------------------------------------------------------ #

@router.post(
    "/",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {
            "model": ErrorResponse,
            "description": "Student or fee structure not found",
        },
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Record a payment",
)
async def create_payment(
    request: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentResponse:
    try:
        Logger.info(
            f"Payment creation requested by user={current_user.id} "
            f"for student={request.student_id}"
        )

        repository = DatabasePaymentRepository(db)
        use_case = RecordPaymentUseCase(repository)

        payment = await use_case.execute(
            student_id=request.student_id,
            fee_structure_id=request.fee_structure_id,
            amount=request.amount,
            payment_mode=request.payment_mode,
            reference_number=request.reference_number,
            remarks=request.remarks,
        )

        Logger.info(
            f"Payment recorded: receipt={payment.receipt_number}"
        )

        return PaymentResponse(
            id=payment.id,
            student_id=payment.student_id,
            fee_structure_id=payment.fee_structure_id,
            receipt_number=payment.receipt_number,
            amount=payment.amount,
            payment_mode=payment.payment_mode,
            reference_number=payment.reference_number,
            status=payment.status,
            remarks=payment.remarks,
            payment_date=payment.payment_date,
        )

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=exc.message,
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.message,
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while creating payment: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while recording the payment.",
        )


@router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    student_id: Optional[int] = Query(None),
    payment_status: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[PaymentResponse]:
    try:
        repository = DatabasePaymentRepository(db)
        use_case = ListPaymentsUseCase(repository)

        payments = await use_case.execute(
            student_id=student_id,
            status=payment_status,
            skip=skip,
            limit=limit,
        )

        return [
            PaymentResponse(
                id=p.id,
                student_id=p.student_id,
                fee_structure_id=p.fee_structure_id,
                receipt_number=p.receipt_number,
                amount=p.amount,
                payment_mode=p.payment_mode,
                reference_number=p.reference_number,
                status=p.status,
                remarks=p.remarks,
                payment_date=p.payment_date,
            )
            for p in payments
        ]

    except DatabaseError as exc:
        Logger.error(
            f"Database error while listing payments: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving payments.",
        )


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentResponse:
    try:
        repository = DatabasePaymentRepository(db)
        use_case = GetPaymentUseCase(repository)

        payment = await use_case.execute(payment_id)

        return PaymentResponse(
            id=payment.id,
            student_id=payment.student_id,
            fee_structure_id=payment.fee_structure_id,
            receipt_number=payment.receipt_number,
            amount=payment.amount,
            payment_mode=payment.payment_mode,
            reference_number=payment.reference_number,
            status=payment.status,
            remarks=payment.remarks,
            payment_date=payment.payment_date,
        )

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=exc.message,
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching payment {payment_id}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the payment.",
        )


@router.get("/summary/stats", response_model=PaymentSummaryResponse)
async def get_payment_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentSummaryResponse:
    try:
        repository = DatabasePaymentRepository(db)
        use_case = GetPaymentSummaryUseCase(repository)

        summary = await use_case.execute()

        return PaymentSummaryResponse(
            total_collectible=summary.total_collectible,
            total_collected=summary.total_collected,
            total_pending=summary.total_pending,
            total_overdue=summary.total_overdue,
        )

    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching payment summary: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving payment statistics.",
        )


@router.get("/students/", response_model=List[StudentResponse])
async def list_students(
    name: Optional[str] = Query(None),
    roll_number: Optional[str] = Query(None),
    class_name: Optional[str] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[StudentResponse]:
    try:
        repository = DatabasePaymentRepository(db)
        use_case = ListStudentsUseCase(repository)

        students = await use_case.execute(
            name=name,
            roll_number=roll_number,
            class_name=class_name,
            status=payment_status,
        )

        return [
            StudentResponse(
                id=s.id,
                name=s.name,
                roll_number=s.roll_number,
                class_name=s.class_name,
                next_due_date=s.next_due_date,
            )
            for s in students
        ]

    except DatabaseError as exc:
        Logger.error(
            f"Database error while listing students: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving students.",
        )


@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentResponse:
    try:
        repository = DatabasePaymentRepository(db)
        use_case = GetStudentUseCase(repository)

        student = await use_case.execute(student_id)

        return StudentResponse(
            id=student.id,
            name=student.name,
            roll_number=student.roll_number,
            class_name=student.class_name,
            next_due_date=student.next_due_date,
        )

    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=exc.message,
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching student {student_id}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the student.",
        )


@router.get("/export/csv")
async def export_payments_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    try:

        async def _csv_generator():
            repository = DatabasePaymentRepository(db)
            use_case = ListPaymentsUseCase(repository)

            output = io.StringIO()
            writer = csv.writer(output)

            writer.writerow(
                [
                    "ID",
                    "Student ID",
                    "Fee Structure ID",
                    "Receipt Number",
                    "Amount",
                    "Payment Mode",
                    "Reference Number",
                    "Status",
                    "Remarks",
                    "Payment Date",
                ]
            )

            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

            page_size = 500
            skip = 0

            while True:
                payments = await use_case.execute(
                    skip=skip,
                    limit=page_size,
                )

                if not payments:
                    break

                for p in payments:
                    writer.writerow(
                        [
                            p.id,
                            p.student_id,
                            p.fee_structure_id,
                            p.receipt_number,
                            p.amount,
                            p.payment_mode,
                            p.reference_number or "",
                            p.status,
                            p.remarks or "",
                            p.payment_date.isoformat(),
                        ]
                    )

                yield output.getvalue()
                output.seek(0)
                output.truncate(0)

                skip += page_size

                if len(payments) < page_size:
                    break

        return StreamingResponse(
            _csv_generator(),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=payments.csv",
            },
        )

    except DatabaseError as exc:
        Logger.error(
            f"Database error during CSV export: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while exporting payment data.",
        )
