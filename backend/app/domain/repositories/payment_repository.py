"""
Abstract repository interfaces for payment operations.

Defines the contracts that all concrete payment repository
implementations must fulfill.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional

from app.domain.entities.payment import (
    FeeDashboard,
    FeeStructure,
    LedgerEntry,
    Payment,
    PaymentStatus,
    PaymentSummary,
    Student,
)


class PaymentRepository(ABC):
    """
    Abstract repository for payment operations.

    Concrete implementations (e.g. database-backed) are provided in
    the infrastructure layer.
    """

    # ------------------------------------------------------------------ #
    # Student operations
    # ------------------------------------------------------------------ #

    @abstractmethod
    async def get_student_by_id(self, student_id: int) -> Optional[Student]:
        """
        Retrieve a student by their unique ID.

        Args:
            student_id: Unique identifier of the student

        Returns:
            Student entity, or ``None`` if not found
        """
        pass

    @abstractmethod
    async def list_students(
        self,
        name: Optional[str] = None,
        roll_number: Optional[str] = None,
        class_name: Optional[str] = None,
        status: Optional[PaymentStatus] = None,
    ) -> List[Student]:
        """
        Retrieve a list of students with optional filters.

        Args:
            name: Partial name to search by (case-insensitive)
            roll_number: Exact roll number to filter by
            class_name: Class name to filter by
            status: Payment status to filter by

        Returns:
            List of Student entities
        """
        pass

    @abstractmethod
    async def update_student_next_due_date(
        self, student_id: int, next_due_date: Optional[datetime]
    ) -> None:
        """
        Update the next payment due date for a student.

        Args:
            student_id: ID of the student to update
            next_due_date: New due date, or ``None`` to clear
        """
        pass

    # ------------------------------------------------------------------ #
    # Fee structure operations
    # ------------------------------------------------------------------ #

    @abstractmethod
    async def get_fee_structure_by_id(
        self, fee_structure_id: int
    ) -> Optional[FeeStructure]:
        """
        Retrieve a fee structure by its unique ID.

        Args:
            fee_structure_id: Unique identifier of the fee structure

        Returns:
            FeeStructure entity, or ``None`` if not found
        """
        pass

    # ------------------------------------------------------------------ #
    # Payment operations
    # ------------------------------------------------------------------ #

    @abstractmethod
    async def create_payment(
        self,
        student_id: int,
        fee_structure_id: int,
        receipt_number: str,
        amount: float,
        payment_mode: str,
        status: str,
        reference_number: Optional[str] = None,
        remarks: Optional[str] = None,
    ) -> Payment:
        """
        Persist a new payment transaction.

        Args:
            student_id: ID of the student
            fee_structure_id: ID of the fee structure being paid against
            receipt_number: Unique receipt number (REC-YYYY-XXXX format)
            amount: Payment amount
            payment_mode: Mode of payment (Cash, UPI, Card)
            status: Payment status (Paid, Partial, etc.)
            reference_number: Optional reference for UPI/Card payments
            remarks: Optional free-text remarks

        Returns:
            Created Payment entity
        """
        pass

    @abstractmethod
    async def get_payment_by_id(self, payment_id: int) -> Optional[Payment]:
        """
        Retrieve a single payment by its unique ID.

        Args:
            payment_id: Unique identifier of the payment

        Returns:
            Payment entity, or ``None`` if not found
        """
        pass

    @abstractmethod
    async def list_payments(
        self,
        student_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Payment]:
        """
        Retrieve a list of payments with optional filters and pagination.

        Args:
            student_id: Filter results to a specific student
            status: Filter by payment status string
            skip: Pagination offset
            limit: Maximum number of records to return

        Returns:
            List of Payment entities
        """
        pass

    @abstractmethod
    async def get_payment_summary(self) -> PaymentSummary:
        """
        Compute and return aggregated payment statistics.

        Returns:
            PaymentSummary with totals for collectible, collected,
            pending, and overdue amounts
        """
        pass

    @abstractmethod
    async def receipt_number_exists(self, receipt_number: str) -> bool:
        """
        Check whether a receipt number is already in use.

        Args:
            receipt_number: Receipt number to check

        Returns:
            ``True`` if the receipt number exists, ``False`` otherwise
        """
        pass

    @abstractmethod
    async def get_student_ledger(self, student_id: int) -> List[LedgerEntry]:
        """
        Retrieve the full fee ledger for a student.

        Args:
            student_id: ID of the student

        Returns:
            List of LedgerEntry entities ordered by date
        """
        pass

    @abstractmethod
    async def get_fee_dashboard(self) -> FeeDashboard:
        """
        Retrieve aggregated fee collection statistics.

        Returns:
            FeeDashboard entity with summary statistics
        """
        pass


class FeeStructureRepository(ABC):
    """
    Abstract repository for fee structure operations.

    This interface defines the contract for fee structure data access.
    Concrete implementations are provided in the infrastructure layer.
    """

    @abstractmethod
    async def create_fee_structure(
        self,
        class_id: int,
        academic_year: str,
        total_fee: float,
        fee_heads: list[dict],
        installments: list[dict],
    ) -> FeeStructure:
        """
        Create a new fee structure for a class.

        Args:
            class_id: ID of the class
            academic_year: Academic year (e.g., "2024-2025")
            total_fee: Total fee amount
            fee_heads: List of dicts with fee head details
            installments: List of dicts with installment details

        Returns:
            Created FeeStructure entity
        """
        pass

    @abstractmethod
    async def get_fee_structure_by_class_and_year(
        self,
        class_id: int,
        academic_year: str,
    ) -> Optional[FeeStructure]:
        """
        Retrieve a fee structure by class ID and academic year.

        Args:
            class_id: ID of the class
            academic_year: Academic year

        Returns:
            FeeStructure entity or None if not found
        """
        pass

    @abstractmethod
    async def get_fee_structure_by_id(self, fee_structure_id: str) -> Optional[FeeStructure]:
        """
        Retrieve a fee structure by its ID.

        Args:
            fee_structure_id: Unique identifier of the fee structure

        Returns:
            FeeStructure entity or None if not found
        """
        pass

    @abstractmethod
    async def get_fee_structures_by_class(self, class_id: int) -> list[FeeStructure]:
        """
        Retrieve all fee structures for a class.

        Args:
            class_id: ID of the class

        Returns:
            List of FeeStructure entities
        """
        pass

    @abstractmethod
    async def update_fee_structure(
        self,
        fee_structure_id: str,
        total_fee: Optional[float] = None,
        fee_heads: Optional[list[dict]] = None,
        installments: Optional[list[dict]] = None,
    ) -> FeeStructure:
        """
        Update an existing fee structure.

        Args:
            fee_structure_id: ID of the fee structure to update
            total_fee: New total fee amount (optional)
            fee_heads: New list of fee heads (optional)
            installments: New list of installments (optional)

        Returns:
            Updated FeeStructure entity
        """
        pass

    @abstractmethod
    async def delete_fee_structure(self, fee_structure_id: str) -> bool:
        """
        Delete a fee structure.

        Args:
            fee_structure_id: ID of the fee structure to delete

        Returns:
            True if deletion was successful

        Raises:
            ValueError: If the fee structure is in use by students
        """
        pass
