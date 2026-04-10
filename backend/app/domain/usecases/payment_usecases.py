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
    FeeDashboard,
    FeeStructure,
    LedgerEntry,
    Payment,
    PaymentStatus,
    PaymentSummary,
    Student,
)
from app.domain.repositories.payment_repository import (
    FeeStructureRepository,
    PaymentRepository,
)


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
# Payment use cases
# ------------------------------------------------------------------ #


class RecordPaymentUseCase:
    """
    Use case for recording a new student payment transaction.

    Business rules enforced:
    - Student must exist.
    - Fee structure must exist.
    - Payment amount must be positive.
    - Generates a unique receipt number (``REC-YYYY-XXXX`` format).
    - Derives payment status from amount vs. the fee structure total:
        * amount >= total_fee  →  "Paid"
        * amount < total_fee   →  "Partial"
    - Updates the student's ``next_due_date``:
        * "Paid" (fee fully settled) → ``next_due_date`` set to ``None``
        * "Partial"                  → ``next_due_date`` set to 30 days
          from today to prompt the next instalment.
    """

    _MAX_RECEIPT_RETRIES = 5

    def __init__(self, repository: PaymentRepository) -> None:
        """
        Initialise the use case with a payment repository.

        Args:
            repository: Concrete implementation of PaymentRepository
        """
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
        """
        Record a payment transaction.

        Args:
            student_id: ID of the student making the payment
            fee_structure_id: ID of the fee structure being paid against
            amount: Payment amount (must be > 0)
            payment_mode: One of ``Cash``, ``UPI``, ``Card``
            reference_number: Required for UPI/Card transactions
            remarks: Optional free-text remarks

        Returns:
            Newly created Payment entity

        Raises:
            NotFoundError: If student or fee structure is not found
            ValidationError: If amount is invalid
        """
        # 1. Validate amount
        if amount <= 0:
            raise ValidationError("Payment amount must be greater than zero.")

        # 2. Verify student exists
        student = await self.repository.get_student_by_id(student_id)
        if student is None:
            raise NotFoundError(f"Student with id {student_id} not found.")

        # 3. Verify fee structure exists
        fee_structure = await self.repository.get_fee_structure_by_id(fee_structure_id)
        if fee_structure is None:
            raise NotFoundError(f"Fee structure with id {fee_structure_id} not found.")

        # 4. Determine payment status based on amount vs. total fee
        if amount >= fee_structure.total_fee:
            status = "Paid"
        else:
            status = "Partial"

        # 5. Generate a unique receipt number
        receipt_number = await self._unique_receipt_number()

        # 6. Persist the payment
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

        # 7. Update student's next_due_date based on payment status
        if status == "Paid":
            # Fee fully settled – clear the next due date
            next_due_date = None
        else:
            # Partial payment – schedule next instalment in 30 days
            next_due_date = datetime.utcnow() + timedelta(days=30)

        await self.repository.update_student_next_due_date(
            student_id=student_id,
            next_due_date=next_due_date,
        )

        return payment

    async def _unique_receipt_number(self) -> str:
        """
        Generate a receipt number guaranteed to be unique in the DB.

        Retries up to ``_MAX_RECEIPT_RETRIES`` times before raising.

        Returns:
            Unique receipt number string
        """
        for _ in range(self._MAX_RECEIPT_RETRIES):
            candidate = _generate_receipt_number()
            if not await self.repository.receipt_number_exists(candidate):
                return candidate
        raise RuntimeError(
            "Unable to generate a unique receipt number after "
            f"{self._MAX_RECEIPT_RETRIES} attempts."
        )


class GetPaymentUseCase:
    """Use case for retrieving a single payment by ID."""

    def __init__(self, repository: PaymentRepository) -> None:
        """
        Initialise with a payment repository.

        Args:
            repository: Concrete implementation of PaymentRepository
        """
        self.repository = repository

    async def execute(self, payment_id: int) -> Payment:
        """
        Retrieve a payment by its ID.

        Args:
            payment_id: Unique identifier of the payment

        Returns:
            Payment entity

        Raises:
            NotFoundError: If payment with given ID does not exist
        """
        payment = await self.repository.get_payment_by_id(payment_id)
        if payment is None:
            raise NotFoundError(f"Payment with id {payment_id} not found.")
        return payment


class ListPaymentsUseCase:
    """
    Use case for listing payments with optional filters and pagination.
    """

    def __init__(self, repository: PaymentRepository) -> None:
        """
        Initialise with a payment repository.

        Args:
            repository: Concrete implementation of PaymentRepository
        """
        self.repository = repository

    async def execute(
        self,
        student_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Payment]:
        """
        List payments with optional filters.

        Args:
            student_id: Filter results to a specific student
            status: Filter results by payment status
            skip: Pagination offset
            limit: Maximum number of records to return

        Returns:
            List of Payment entities
        """
        return await self.repository.list_payments(
            student_id=student_id,
            status=status,
            skip=skip,
            limit=limit,
        )


class GetPaymentSummaryUseCase:
    """
    Use case for retrieving aggregated payment statistics.
    """

    def __init__(self, repository: PaymentRepository) -> None:
        """
        Initialise with a payment repository.

        Args:
            repository: Concrete implementation of PaymentRepository
        """
        self.repository = repository

    async def execute(self) -> PaymentSummary:
        """
        Compute and return aggregated payment statistics.

        Returns:
            PaymentSummary with totals for collectible, collected,
            pending, and overdue amounts
        """
        return await self.repository.get_payment_summary()


class ListStudentsUseCase:
    """Use case for listing students with optional filters."""

    def __init__(self, repository: PaymentRepository) -> None:
        """
        Initialise with a payment repository.

        Args:
            repository: Concrete implementation of PaymentRepository
        """
        self.repository = repository

    async def execute(
        self,
        name: Optional[str] = None,
        roll_number: Optional[str] = None,
        class_name: Optional[str] = None,
        status: Optional[PaymentStatus] = None,
    ) -> List[Student]:
        """
        List students with optional search and filter criteria.

        Args:
            name: Partial name to search by
            roll_number: Exact roll number to filter by
            class_name: Class name to filter by
            status: Payment status to filter by

        Returns:
            List of Student entities
        """
        return await self.repository.list_students(
            name=name,
            roll_number=roll_number,
            class_name=class_name,
            status=status,
        )


class GetStudentUseCase:
    """Use case for retrieving a single student by ID."""

    def __init__(self, repository: PaymentRepository) -> None:
        """
        Initialise with a payment repository.

        Args:
            repository: Concrete implementation of PaymentRepository
        """
        self.repository = repository

    async def execute(self, student_id: int) -> Student:
        """
        Retrieve a student by their ID.

        Args:
            student_id: Unique identifier of the student

        Returns:
            Student entity

        Raises:
            NotFoundError: If student with given ID does not exist
        """
        student = await self.repository.get_student_by_id(student_id)
        if student is None:
            raise NotFoundError(f"Student with id {student_id} not found.")
        return student


class GetStudentLedgerUseCase:
    """
    Use case for retrieving a student's fee ledger.
    """

    def __init__(self, payment_repository: PaymentRepository):
        """
        Initialize the use case.

        Args:
            payment_repository: Repository for payment operations
        """
        self.payment_repository = payment_repository

    async def execute(self, student_id: int) -> List[LedgerEntry]:
        """
        Execute the get student ledger use case.

        Args:
            student_id: ID of the student

        Returns:
            List of LedgerEntry entities

        Raises:
            ValueError: If student_id is invalid
        """
        if student_id <= 0:
            raise ValueError("Student ID must be a positive integer")

        return await self.payment_repository.get_student_ledger(student_id)


class GetFeeDashboardUseCase:
    """
    Use case for retrieving fee collection analytics.
    """

    def __init__(self, payment_repository: PaymentRepository):
        """
        Initialize the use case.

        Args:
            payment_repository: Repository for payment operations
        """
        self.payment_repository = payment_repository

    async def execute(self) -> FeeDashboard:
        """
        Execute the get fee dashboard use case.

        Returns:
            FeeDashboard entity with aggregated statistics
        """
        return await self.payment_repository.get_fee_dashboard()


# ------------------------------------------------------------------ #
# Fee structure use cases
# ------------------------------------------------------------------ #


class CreateFeeStructureUseCase:
    """
    Use case for creating a new fee structure.
    """

    def __init__(self, fee_structure_repository: FeeStructureRepository):
        """
        Initialize the use case.

        Args:
            fee_structure_repository: Repository for fee structure operations
        """
        self.fee_structure_repository = fee_structure_repository

    async def execute(
        self,
        class_id: int,
        academic_year: str,
        total_fee: float,
        fee_heads: list[dict],
        installments: list[dict],
    ) -> FeeStructure:
        """
        Execute the create fee structure use case.

        Args:
            class_id: ID of the class
            academic_year: Academic year (e.g., "2024-2025")
            total_fee: Total fee amount
            fee_heads: List of fee head dictionaries
            installments: List of installment dictionaries

        Returns:
            Created FeeStructure entity

        Raises:
            ValueError: If validation fails
        """
        if class_id <= 0:
            raise ValueError("Class ID must be a positive integer")

        if not academic_year or not academic_year.strip():
            raise ValueError("Academic year is required")

        if total_fee <= 0:
            raise ValueError("Total fee must be greater than zero")

        if not fee_heads:
            raise ValueError("At least one fee head is required")

        if not installments:
            raise ValueError("At least one installment is required")

        # Validate fee heads
        for head in fee_heads:
            if not head.get("name"):
                raise ValueError("Fee head name is required")
            if not head.get("amount") or head.get("amount") <= 0:
                raise ValueError("Fee head amount must be greater than zero")

        # Validate installments
        for inst in installments:
            if not inst.get("installment_number") or inst.get("installment_number") <= 0:
                raise ValueError("Installment number must be positive")
            if not inst.get("due_date"):
                raise ValueError("Due date is required for each installment")
            if not inst.get("amount") or inst.get("amount") <= 0:
                raise ValueError("Installment amount must be greater than zero")

        return await self.fee_structure_repository.create_fee_structure(
            class_id=class_id,
            academic_year=academic_year.strip(),
            total_fee=total_fee,
            fee_heads=fee_heads,
            installments=installments,
        )


class GetFeeStructureUseCase:
    """
    Use case for retrieving fee structures.
    """

    def __init__(self, fee_structure_repository: FeeStructureRepository):
        """
        Initialize the use case.

        Args:
            fee_structure_repository: Repository for fee structure operations
        """
        self.fee_structure_repository = fee_structure_repository

    async def execute_by_class_and_year(
        self, class_id: int, academic_year: str
    ) -> Optional[FeeStructure]:
        """
        Get fee structure by class and academic year.

        Args:
            class_id: ID of the class
            academic_year: Academic year

        Returns:
            FeeStructure entity or None if not found

        Raises:
            ValueError: If validation fails
        """
        if class_id <= 0:
            raise ValueError("Class ID must be a positive integer")

        if not academic_year or not academic_year.strip():
            raise ValueError("Academic year is required")

        return await self.fee_structure_repository.get_fee_structure_by_class_and_year(
            class_id=class_id,
            academic_year=academic_year.strip(),
        )

    async def execute_by_id(self, fee_structure_id: str) -> Optional[FeeStructure]:
        """
        Get fee structure by ID.

        Args:
            fee_structure_id: ID of the fee structure

        Returns:
            FeeStructure entity or None if not found

        Raises:
            ValueError: If validation fails
        """
        if not fee_structure_id or not fee_structure_id.strip():
            raise ValueError("Fee structure ID is required")

        return await self.fee_structure_repository.get_fee_structure_by_id(
            fee_structure_id=fee_structure_id.strip()
        )

    async def execute_by_class(self, class_id: int) -> list[FeeStructure]:
        """
        Get all fee structures for a class.

        Args:
            class_id: ID of the class

        Returns:
            List of FeeStructure entities

        Raises:
            ValueError: If validation fails
        """
        if class_id <= 0:
            raise ValueError("Class ID must be a positive integer")

        return await self.fee_structure_repository.get_fee_structures_by_class(
            class_id=class_id
        )


class UpdateFeeStructureUseCase:
    """
    Use case for updating an existing fee structure.
    """

    def __init__(self, fee_structure_repository: FeeStructureRepository):
        """
        Initialize the use case.

        Args:
            fee_structure_repository: Repository for fee structure operations
        """
        self.fee_structure_repository = fee_structure_repository

    async def execute(
        self,
        fee_structure_id: str,
        total_fee: Optional[float] = None,
        fee_heads: Optional[list[dict]] = None,
        installments: Optional[list[dict]] = None,
    ) -> FeeStructure:
        """
        Execute the update fee structure use case.

        Args:
            fee_structure_id: ID of the fee structure to update
            total_fee: New total fee (optional)
            fee_heads: New fee heads (optional)
            installments: New installments (optional)

        Returns:
            Updated FeeStructure entity

        Raises:
            ValueError: If validation fails
        """
        if not fee_structure_id or not fee_structure_id.strip():
            raise ValueError("Fee structure ID is required")

        if total_fee is not None and total_fee <= 0:
            raise ValueError("Total fee must be greater than zero")

        if fee_heads is not None:
            if not fee_heads:
                raise ValueError("At least one fee head is required")
            for head in fee_heads:
                if not head.get("name"):
                    raise ValueError("Fee head name is required")
                if not head.get("amount") or head.get("amount") <= 0:
                    raise ValueError("Fee head amount must be greater than zero")

        if installments is not None:
            if not installments:
                raise ValueError("At least one installment is required")
            for inst in installments:
                if not inst.get("installment_number") or inst.get("installment_number") <= 0:
                    raise ValueError("Installment number must be positive")
                if not inst.get("due_date"):
                    raise ValueError("Due date is required for each installment")
                if not inst.get("amount") or inst.get("amount") <= 0:
                    raise ValueError("Installment amount must be greater than zero")

        return await self.fee_structure_repository.update_fee_structure(
            fee_structure_id=fee_structure_id.strip(),
            total_fee=total_fee,
            fee_heads=fee_heads,
            installments=installments,
        )


class DeleteFeeStructureUseCase:
    """
    Use case for deleting a fee structure.
    """

    def __init__(self, fee_structure_repository: FeeStructureRepository):
        """
        Initialize the use case.

        Args:
            fee_structure_repository: Repository for fee structure operations
        """
        self.fee_structure_repository = fee_structure_repository

    async def execute(self, fee_structure_id: str) -> bool:
        """
        Execute the delete fee structure use case.

        Args:
            fee_structure_id: ID of the fee structure to delete

        Returns:
            True if deletion was successful

        Raises:
            ValueError: If validation fails or fee structure is in use
        """
        if not fee_structure_id or not fee_structure_id.strip():
            raise ValueError("Fee structure ID is required")

        return await self.fee_structure_repository.delete_fee_structure(
            fee_structure_id=fee_structure_id.strip()
        )
