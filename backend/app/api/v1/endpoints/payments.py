"""
Payments endpoints.

This module provides API endpoints for fee payment management,
including recording transactions, viewing student ledgers, and
accessing fee collection analytics.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import (
    FeeDashboardResponse,
    PaymentCreate,
    PaymentResponse,
    StudentLedgerResponse,
    LedgerEntryResponse,
)
from app.core.errors import ValidationError
from app.core.logger import Logger
from app.domain.usecases.payment_usecases import (
    CreatePaymentUseCase,
    GetFeeDashboardUseCase,
    GetStudentLedgerUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_payment_repository import (
    DatabasePaymentRepository,
)

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post(
    "/transactions",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a payment transaction",
    description="Record a new fee payment for a student.",
)
async def create_payment(
    payment: PaymentCreate,
    db: AsyncSession = Depends(get_db),
) -> PaymentResponse:
    """
    Create a payment transaction endpoint.

    Records the payment and automatically adds a credit entry
    to the student's ledger.
    """
    repository = DatabasePaymentRepository(db)
    use_case = CreatePaymentUseCase(repository)

    try:
        result = await use_case.execute(
            student_id=payment.student_id,
            amount=payment.amount,
            payment_method=payment.payment_method,
        )
    except ValueError as e:
        raise ValidationError(str(e))

    Logger.info(
        f"Payment recorded: id={result.id}, student_id={result.student_id}"
    )
    return PaymentResponse(
        id=result.id,
        student_id=result.student_id,
        amount=result.amount,
        payment_method=result.payment_method,
        payment_date=result.payment_date,
    )


@router.get(
    "/students/{student_id}/ledger",
    response_model=StudentLedgerResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student fee ledger",
    description="Retrieve the full fee ledger for a specific student.",
)
async def get_student_ledger(
    student_id: int,
    db: AsyncSession = Depends(get_db),
) -> StudentLedgerResponse:
    """
    Get student ledger endpoint.

    Returns all ledger entries for the student ordered by date.
    """
    repository = DatabasePaymentRepository(db)
    use_case = GetStudentLedgerUseCase(repository)

    try:
        entries = await use_case.execute(student_id=student_id)
    except ValueError as e:
        raise ValidationError(str(e))

    return StudentLedgerResponse(
        student_id=student_id,
        transactions=[
            LedgerEntryResponse(
                id=e.id,
                student_id=e.student_id,
                debit=e.debit,
                credit=e.credit,
                balance=e.balance,
                description=e.description,
                transaction_date=e.transaction_date,
            )
            for e in entries
        ],
    )


@router.get(
    "/dashboard",
    response_model=FeeDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Fee collection dashboard",
    description="Retrieve aggregated fee collection analytics.",
)
async def fee_dashboard(
    db: AsyncSession = Depends(get_db),
) -> FeeDashboardResponse:
    """
    Fee dashboard endpoint.

    Returns summary statistics for fee collection across all students.
    """
    repository = DatabasePaymentRepository(db)
    use_case = GetFeeDashboardUseCase(repository)

    result = await use_case.execute()

    return FeeDashboardResponse(
        total_collected=result.total_collected,
        total_pending=result.total_pending,
        students_paid=result.students_paid,
        students_pending=result.students_pending,
    )
