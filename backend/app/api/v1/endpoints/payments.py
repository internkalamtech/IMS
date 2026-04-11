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
        500: {
            "model": ErrorResponse,
            "description": "Internal server error",
        },
    },
    summary="Record a payment",
    description=(
        "Record a new payment transaction for a student. "
        "A unique receipt number (REC-YYYY-XXXX format) "
        "is generated automatically. "
        "The payment status is derived from the amount "
        "vs. the outstanding balance: "
        "'Paid' if the balance is cleared, 'Partial' otherwise. "
        "The student's next_due_date is updated accordingly."
    ),
)
async def create_payment(
    request: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentResponse:
    """
    Record a new student payment.

    Validates that both the student and fee structure exist, computes
    the payment status, generates a receipt number, and persists the
    transaction.  The student's next_due_date is also updated.

    Args:
        request: Payment creation payload
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        PaymentResponse with the created payment details

    Raises:
        HTTPException 400: If validation fails
        HTTPException 404: If student or fee structure is not found
        HTTPException 500: If an unexpected error occurs
    """
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
        Logger.info(f"Payment recorded: receipt={payment.receipt_number}")
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
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(f"Database error while creating payment: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while recording the payment.",
        )


@router.get(
    "/",
    response_model=List[PaymentResponse],
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="List payments",
    description="Retrieve a paginated list of payments with optional filters.",
)
async def list_payments(
    student_id: Optional[int] = Query(
        None, description="Filter by student ID"
    ),
    payment_status: Optional[str] = Query(
        None,
        alias="status",
        description=(
            "Filter by status "
            "(Paid, Partial, Pending, Failed, Overdue)"
        ),
    ),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(
        100, ge=1, le=500, description="Maximum records to return"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[PaymentResponse]:
    """
    List payments with optional filters and pagination.

    Args:
        student_id: Optional filter by student ID
        payment_status: Optional filter by payment status
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        List of PaymentResponse objects
    """
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
        Logger.error(f"Database error while listing payments: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving payments.",
        )


@router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Payment not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get payment by ID",
    description="Retrieve a single payment transaction by its unique ID.",
)
async def get_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentResponse:
    """
    Retrieve a payment by its ID.

    Args:
        payment_id: Unique identifier of the payment
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        PaymentResponse for the requested payment

    Raises:
        HTTPException 404: If payment is not found
    """
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
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching payment {payment_id}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the payment.",
        )


# ------------------------------------------------------------------ #
# Summary / stats endpoint
# ------------------------------------------------------------------ #


@router.get(
    "/summary/stats",
    response_model=PaymentSummaryResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get payment statistics",
    description=(
        "Returns aggregated payment statistics: total collectible, "
        "total collected, total pending, and total overdue amounts."
    ),
)
async def get_payment_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentSummaryResponse:
    """
    Return aggregated payment statistics.

    Computes totals for collectible, collected, pending, and overdue
    amounts across all fee structures and payment records.

    Args:
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        PaymentSummaryResponse with computed totals
    """
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
        Logger.error(f"Database error while fetching payment summary: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving payment statistics.",
        )


# ------------------------------------------------------------------ #
# Student endpoints
# ------------------------------------------------------------------ #


@router.get(
    "/students/",
    response_model=List[StudentResponse],
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="List students",
    description=(
        "List students with optional filters for name, roll number, "
        "class, and payment status."
    ),
)
async def list_students(
    name: Optional[str] = Query(None, description="Partial name search"),
    roll_number: Optional[str] = Query(None, description="Exact roll number"),
    class_name: Optional[str] = Query(None, description="Class name filter"),
    payment_status: Optional[PaymentStatus] = Query(
        None,
        alias="status",
        description="Filter by payment status",
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[StudentResponse]:
    """
    List students with optional search/filter criteria.

    Args:
        name: Partial name to search by (case-insensitive)
        roll_number: Exact roll number to filter by
        class_name: Class name to filter by
        payment_status: Payment status to filter by
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        List of StudentResponse objects
    """
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
        Logger.error(f"Database error while listing students: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving students.",
        )


@router.get(
    "/students/{student_id}",
    response_model=StudentResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Student not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get student by ID",
    description="Retrieve a single student record by their unique ID.",
)
async def get_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentResponse:
    """
    Retrieve a student by their ID.

    Args:
        student_id: Unique identifier of the student
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        StudentResponse for the requested student

    Raises:
        HTTPException 404: If student is not found
    """
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
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching student {student_id}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the student.",
        )


# ------------------------------------------------------------------ #
# CSV export endpoint
# ------------------------------------------------------------------ #


@router.get(
    "/export/csv",
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Export payments as CSV",
    description=(
        "Stream all payment records as a downloadable CSV file. "
        "Results are streamed in chunks to handle large datasets efficiently."
    ),
)
async def export_payments_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    """
    Export all payment records as a streaming CSV download.

    Payments are fetched in paginated chunks and streamed to the client
    as ``text/csv`` to avoid loading the entire dataset into memory.

    Args:
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        StreamingResponse with CSV content
    """
    try:

        async def _csv_generator():
            repository = DatabasePaymentRepository(db)
            use_case = ListPaymentsUseCase(repository)

            output = io.StringIO()
            writer = csv.writer(output)

            # Header row
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

            # Data rows – fetch in pages to avoid large memory footprint
            page_size = 500
            skip = 0
            while True:
                payments = await use_case.execute(skip=skip, limit=page_size)
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
                "Content-Disposition": "attachment; filename=payments.csv"
            },
        )
    except DatabaseError as exc:
        Logger.error(f"Database error during CSV export: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while exporting payment data.",
        )
