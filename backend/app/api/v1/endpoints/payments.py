"""
Payment endpoints.

This module provides API endpoints for payment management including
recording transactions, viewing student ledgers, and analytics.
"""

import csv
from io import StringIO
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import ErrorResponse
from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.usecases.payment_usecases import (
    CreatePaymentUseCase,
    GetFinancialSummaryUseCase,
    GetMonthlyRevenueUseCase,
    GetPaymentStatsUseCase,
    GetStudentLedgerUseCase,
    ListPaymentsUseCase,
    UpdatePaymentStatusUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_payment_repository import (
    DatabasePaymentRepository,
)

router = APIRouter(prefix="/payments", tags=["Payments"])


# -------------------------
# Schemas
# -------------------------


class PaymentCreate(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    student_class: str
    amount: float
    payment_mode: str
    reference_number: Optional[str] = None

    model_config = {"json_schema_extra": {"examples": []}}


class PaymentStatusUpdate(BaseModel):
    status: Literal["Paid", "Pending", "Failed", "Partial", "Overdue"]


class PaymentResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    roll_number: str
    student_class: str
    amount: float
    payment_mode: str
    reference_number: Optional[str]
    receipt_number: str
    status: str
    created_at: Optional[str]

    model_config = {"from_attributes": True}


class PaymentCreated(BaseModel):
    message: str
    receipt_number: str
    payment_id: int


class FinancialSummary(BaseModel):
    total_collectible: float
    collected: float
    pending: float
    overdue: float


class PaymentStats(BaseModel):
    total_collected: float
    students_paid: int


# -------------------------
# Record Payment
# -------------------------


@router.post(
    "/transactions",
    response_model=PaymentCreated,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Record a payment transaction",
)
async def create_payment(
    payment: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentCreated:
    """Record a new student payment transaction."""
    try:
        repository = DatabasePaymentRepository(db)
        use_case = CreatePaymentUseCase(repository)
        created = await use_case.execute(
            student_id=payment.student_id,
            student_name=payment.student_name,
            roll_number=payment.roll_number,
            student_class=payment.student_class,
            amount=payment.amount,
            payment_mode=payment.payment_mode,
            reference_number=payment.reference_number,
        )
        return PaymentCreated(
            message="Payment recorded successfully",
            receipt_number=created.receipt_number,
            payment_id=created.id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )
    except DatabaseError as e:
        Logger.error(f"Database error creating payment: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record payment",
        )


# -------------------------
# Update Payment Status
# -------------------------


@router.patch(
    "/{payment_id}/status",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Payment not found"},
    },
    summary="Update payment status",
)
async def update_payment_status(
    payment_id: int,
    payload: PaymentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the status of a payment record."""
    try:
        repository = DatabasePaymentRepository(db)
        use_case = UpdatePaymentStatusUseCase(repository)
        updated = await use_case.execute(payment_id, payload.status)
        return {"message": "Payment status updated", "status": updated.status}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
    except DatabaseError as e:
        Logger.error(f"Database error updating payment: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update payment status",
        )


# -------------------------
# List Payments (Filters + Pagination)
# -------------------------


@router.get(
    "/",
    response_model=List[PaymentResponse],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
    },
    summary="List payments with optional filters",
)
async def list_payments(
    name: Optional[str] = Query(default=None),
    roll_number: Optional[str] = Query(default=None),
    student_class: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List payments with optional filtering and pagination."""
    try:
        repository = DatabasePaymentRepository(db)
        use_case = ListPaymentsUseCase(repository)
        payments = await use_case.execute(
            name=name,
            roll_number=roll_number,
            student_class=student_class,
            status=status,
            skip=skip,
            limit=limit,
        )
        return [
            PaymentResponse(
                id=p.id,
                student_id=p.student_id,
                student_name=p.student_name,
                roll_number=p.roll_number,
                student_class=p.student_class,
                amount=p.amount,
                payment_mode=p.payment_mode,
                reference_number=p.reference_number,
                receipt_number=p.receipt_number,
                status=p.status,
                created_at=(
                    p.created_at.isoformat() if p.created_at else None
                ),
            )
            for p in payments
        ]
    except DatabaseError as e:
        Logger.error(f"Database error listing payments: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch payments",
        )


# -------------------------
# Student Ledger
# -------------------------


@router.get(
    "/students/{student_id}",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "No payments found"},
    },
    summary="Get student payment ledger",
)
async def student_ledger(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the full payment ledger for a student."""
    try:
        repository = DatabasePaymentRepository(db)
        use_case = GetStudentLedgerUseCase(repository)
        return await use_case.execute(student_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
    except DatabaseError as e:
        Logger.error(f"Database error fetching ledger: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student ledger",
        )


# -------------------------
# Financial Summary
# -------------------------


@router.get(
    "/summary",
    response_model=FinancialSummary,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
    },
    summary="Get financial summary",
)
async def get_financial_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinancialSummary:
    """Get overall financial summary including collectible, collected
    and pending amounts."""
    try:
        repository = DatabasePaymentRepository(db)
        use_case = GetFinancialSummaryUseCase(repository)
        data = await use_case.execute()
        return FinancialSummary(**data)
    except DatabaseError as e:
        Logger.error(f"Database error fetching summary: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch financial summary",
        )


# -------------------------
# Payment Stats
# -------------------------


@router.get(
    "/stats",
    response_model=PaymentStats,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
    },
    summary="Get payment statistics",
)
async def get_payment_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentStats:
    """Get payment statistics including total collected and number
    of students paid."""
    try:
        repository = DatabasePaymentRepository(db)
        use_case = GetPaymentStatsUseCase(repository)
        data = await use_case.execute()
        return PaymentStats(**data)
    except DatabaseError as e:
        Logger.error(f"Database error fetching stats: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch payment stats",
        )


# -------------------------
# Monthly Analytics
# -------------------------


@router.get(
    "/analytics/monthly",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
    },
    summary="Get monthly revenue analytics",
)
async def monthly_revenue(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get monthly revenue breakdown."""
    try:
        repository = DatabasePaymentRepository(db)
        use_case = GetMonthlyRevenueUseCase(repository)
        return await use_case.execute()
    except DatabaseError as e:
        Logger.error(f"Database error fetching monthly revenue: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch monthly revenue",
        )


# -------------------------
# Export Payments CSV
# -------------------------


@router.get(
    "/export",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
    },
    summary="Export payments as CSV",
)
async def export_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export all payment records as a streaming CSV file."""
    repository = DatabasePaymentRepository(db)
    chunk_size = 1000

    async def payment_iterator():
        output = StringIO()
        writer = csv.writer(output)

        writer.writerow(
            [
                "Student Name",
                "Roll Number",
                "Class",
                "Amount",
                "Payment Mode",
                "Receipt",
                "Status",
                "Date",
            ]
        )
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        offset = 0
        while True:
            payments = await repository.get_all_payments_chunked(
                offset=offset, limit=chunk_size
            )
            if not payments:
                break

            for payment in payments:
                writer.writerow(
                    [
                        payment.student_name,
                        payment.roll_number,
                        payment.student_class,
                        payment.amount,
                        payment.payment_mode,
                        payment.receipt_number,
                        payment.status,
                        payment.created_at,
                    ]
                )

            yield output.getvalue()
            output.seek(0)
            output.truncate(0)
            offset += chunk_size

    return StreamingResponse(
        payment_iterator(),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=payments.csv"
        },
    )
