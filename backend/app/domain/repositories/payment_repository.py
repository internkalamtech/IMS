"""
Abstract repository interface for payment operations.

Defines the contract that all concrete payment repository
implementations must fulfill.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional

from app.domain.entities.payment import (
    FeeStructure,
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
        Retrieve a student by their ID.

        Args:
            student_id: Unique identifier of the student

        Returns:
            Student entity if found, None otherwise
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
        List students with optional filters.

        Args:
            name: Partial name to filter by
            roll_number: Exact roll number to filter by
            class_name: Class name to filter by
            status: Payment status to filter by

        Returns:
            List of matching Student entities
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
            next_due_date: New next due date (datetime or None)
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
        Retrieve a fee structure by its ID.

        Args:
            fee_structure_id: Unique identifier of the fee structure

        Returns:
            FeeStructure entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def update_fee_structure_paid(
        self, fee_structure_id: int, additional_amount: float
    ) -> FeeStructure:
        """
        Increment the amount_paid on a fee structure record.

        Args:
            fee_structure_id: ID of the fee structure to update
            additional_amount: Amount to add to the existing paid amount

        Returns:
            Updated FeeStructure entity
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
            student_id: ID of the student making the payment
            fee_structure_id: ID of the associated fee structure
            receipt_number: Unique formatted receipt number
            amount: Payment amount
            payment_mode: Mode of payment (Cash, UPI, Card)
            status: Payment status (Paid, Partial, etc.)
            reference_number: Reference number for UPI/Card payments
            remarks: Optional remarks

        Returns:
            Created Payment entity
        """
        pass

    @abstractmethod
    async def get_payment_by_id(self, payment_id: int) -> Optional[Payment]:
        """
        Retrieve a payment by its ID.

        Args:
            payment_id: Unique identifier of the payment

        Returns:
            Payment entity if found, None otherwise
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
        List payments with optional filters and pagination.

        Args:
            student_id: Filter by student ID
            status: Filter by payment status
            skip: Number of records to skip (pagination)
            limit: Maximum records to return (pagination)

        Returns:
            List of Payment entities
        """
        pass

    @abstractmethod
    async def get_payment_summary(self) -> PaymentSummary:
        """
        Compute aggregated payment statistics across all students.

        Returns:
            PaymentSummary with totals for collectible, collected,
            pending, and overdue amounts
        """
        pass

    @abstractmethod
    async def receipt_number_exists(self, receipt_number: str) -> bool:
        """
        Check whether a receipt number already exists in the database.

        Args:
            receipt_number: Receipt number to check

        Returns:
            True if the receipt number exists, False otherwise
        """
        pass

    @abstractmethod
    async def get_fee_structures_by_student(
        self, student_id: int
    ) -> List[FeeStructure]:
        """
        Get all fee structures for a specific student.

        Args:
            student_id: ID of the student

        Returns:
            List of FeeStructure entities for the student
        """
        pass

    @abstractmethod
    async def get_payments_by_fee_structure(
        self, fee_structure_id: int
    ) -> List[Payment]:
        """
        Get all payments for a specific fee structure (ledger entries).

        Args:
            fee_structure_id: ID of the fee structure

        Returns:
            List of Payment entities for the fee structure, sorted by date
        """
        pass
