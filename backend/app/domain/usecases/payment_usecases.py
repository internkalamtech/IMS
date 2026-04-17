"""
Use cases for payment business logic.

Each use case encapsulates a single business operation, keeping the
domain layer free from infrastructure concerns.
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from app.core.errors import NotFoundError, ValidationError
from app.domain.entities.payment import (
    Payment,
    PaymentStatus,
    PaymentSummary,
    Student,
)
from app.domain.repositories.payment_repository import PaymentRepository


# ------------------------------------------------------------------ #
# Helpers
# ------------------------------------------------------------------ #

def _generate_receipt_number() -> str:
    """
    Generate a receipt number in the format REC-YYYY-XXXXXXXX.

    Uses a UUID4 hex suffix (8 characters) to make collisions
    statistically impossible without requiring a database round-trip.

    Returns:
        Receipt number string, e.g. ``REC-2024-A3F7B2C1``
    """
    year = datetime.utcnow().year
    suffix = uuid.uuid4().hex[:8].upper()
    return f"REC-{year}-{suffix}"


# ------------------------------------------------------------------ #
# Use cases
# ------------------------------------------------------------------ #

class RecordPaymentUseCase:
    """
    Use case for recording a new student payment transaction.

    Business rules enforced:
    - Student must exist.
    - Fee structure must exist and belong to the given student.
    - Payment amount must be positive.
    - Generates a unique receipt number (``REC-YYYY-XXXX`` format).
    - Derives payment status from amount vs. outstanding balance:
        * amount >= balance  →  "Paid"
        * amount < balance   →  "Partial"
    - Increments ``fee_structure.amount_paid`` by the payment amount.
    - Updates the student's ``next_due_date``:
        * "Paid" (fee fully settled) → ``next_due_date`` set to ``None``
        * "Partial" → ``next_due_date`` set to 30 days from today
    """

    _MAX_RECEIPT_RETRIES = 5

    def __init__(self, repository: PaymentRepository) -> None:
        self.repository = repository

    async def execute(
        self,
        student_id: int,
        fee_structure_id: int,
        amount: float,
        payment_mode: str,
        reference_number: Optional[str] = None,
        remarks: Optional[str] = None,
    ) -> Payment:

        if amount <= 0:
            raise ValidationError("Payment amount must be greater than zero.")

        student = await self.repository.get_student_by_id(student_id)
        if student is None:
            raise NotFoundError(
                f"Student with id {student_id} not found."
            )

        fee_structure = await self.repository.get_fee_structure_by_id(
            fee_structure_id
        )
        if fee_structure is None:
            raise NotFoundError(
                f"Fee structure with id {fee_structure_id} not found."
            )

        if fee_structure.student_id != student_id:
            raise ValidationError(
                f"Fee structure {fee_structure_id} does not belong "
                f"to student {student_id}."
            )

        balance = fee_structure.balance
        if amount >= balance:
            status = "Paid"
        else:
            status = "Partial"

        receipt_number = await self._unique_receipt_number()

        payment = await self.repository.create_payment(
            student_id=student_id,
            fee_structure_id=fee_structure_id,
            receipt_number=receipt_number,
            amount=amount,
            payment_mode=payment_mode,
            status=status,
            reference_number=reference_number,
            remarks=remarks,
        )

        updated_fee = await self.repository.update_fee_structure_paid(
            fee_structure_id=fee_structure_id,
            additional_amount=amount,
        )

        if updated_fee.balance <= 0:
            next_due_date = None
        else:
            next_due_date = datetime.utcnow() + timedelta(days=30)

        await self.repository.update_student_next_due_date(
            student_id=student_id,
            next_due_date=next_due_date,
        )

        return payment

    async def _unique_receipt_number(self) -> str:
        for _ in range(self._MAX_RECEIPT_RETRIES):
            candidate = _generate_receipt_number()
            if not await self.repository.receipt_number_exists(candidate):
                return candidate
        raise RuntimeError(
            "Unable to generate a unique receipt number after "
            f"{self._MAX_RECEIPT_RETRIES} attempts."
        )


class GetPaymentUseCase:
    def __init__(self, repository: PaymentRepository) -> None:
        self.repository = repository

    async def execute(self, payment_id: int) -> Payment:
        payment = await self.repository.get_payment_by_id(payment_id)
        if payment is None:
            raise NotFoundError(
                f"Payment with id {payment_id} not found."
            )
        return payment


class ListPaymentsUseCase:
    def __init__(self, repository: PaymentRepository) -> None:
        self.repository = repository

    async def execute(
        self,
        student_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Payment]:
        return await self.repository.list_payments(
            student_id=student_id,
            status=status,
            skip=skip,
            limit=limit,
        )


class GetPaymentSummaryUseCase:
    def __init__(self, repository: PaymentRepository) -> None:
        self.repository = repository

    async def execute(self) -> PaymentSummary:
        return await self.repository.get_payment_summary()


class ListStudentsUseCase:
    def __init__(self, repository: PaymentRepository) -> None:
        self.repository = repository

    async def execute(
        self,
        name: Optional[str] = None,
        roll_number: Optional[str] = None,
        class_name: Optional[str] = None,
        status: Optional[PaymentStatus] = None,
    ) -> List[Student]:
        return await self.repository.list_students(
            name=name,
            roll_number=roll_number,
            class_name=class_name,
            status=status,
        )


class GetStudentUseCase:
    def __init__(self, repository: PaymentRepository) -> None:
        self.repository = repository

    async def execute(self, student_id: int) -> Student:
        student = await self.repository.get_student_by_id(student_id)
        if student is None:
            raise NotFoundError(
                f"Student with id {student_id} not found."
            )
        return student
