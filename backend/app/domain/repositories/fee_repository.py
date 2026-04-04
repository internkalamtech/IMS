"""
Repository interface for Fee-related data access.

This defines the contract for fee data operations.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from app.domain.entities.fee import (
    FeeStructure,
    Installment,
    Transaction,
    FeeSummary,
)


class FeeRepository(ABC):
    """Abstract repository for fee operations."""

    @abstractmethod
    async def get_fee_structure(self, student_id: str) -> list[FeeStructure]:
        """
        Retrieve fee structure for a student.

        Args:
            student_id: The student's unique identifier

        Returns:
            List of FeeStructure objects
        """
        pass

    @abstractmethod
    async def get_fee_summary(self, student_id: str) -> FeeSummary:
        """
        Retrieve aggregated fee summary for a student.

        Args:
            student_id: The student's unique identifier

        Returns:
            FeeSummary object with total, paid, and balance information
        """
        pass

    @abstractmethod
    async def get_installments(
        self, student_id: str, fee_structure_id: str | None = None
    ) -> list[Installment]:
        """
        Retrieve installments for a student.

        Args:
            student_id: The student's unique identifier
            fee_structure_id: Optional fee structure filter

        Returns:
            List of Installment objects
        """
        pass

    @abstractmethod
    async def get_transactions(
        self,
        student_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Transaction]:
        """
        Retrieve transaction history for a student.

        Args:
            student_id: The student's unique identifier
            limit: Maximum number of transactions to return
            offset: Number of transactions to skip

        Returns:
            List of Transaction objects
        """
        pass

    @abstractmethod
    async def get_transaction_by_receipt(
        self, receipt_number: str
    ) -> Transaction | None:
        """
        Retrieve a transaction by receipt number.

        Args:
            receipt_number: The receipt number to search for

        Returns:
            Transaction object or None if not found
        """
        pass

    @abstractmethod
    async def create_transaction(
        self,
        student_id: str,
        installment_id: str | None,
        amount: float,
        payment_mode: str,
        transaction_ref: str,
        receipt_number: str,
        description: str | None = None,
    ) -> Transaction:
        """
        Create a new transaction record.

        Args:
            student_id: Student making the payment
            installment_id: Installment being paid (optional)
            amount: Amount being paid
            payment_mode: Mode of payment
            transaction_ref: External transaction reference
            receipt_number: Unique receipt number
            description: Optional description

        Returns:
            Created Transaction object
        """
        pass

    @abstractmethod
    async def update_installment_status(
        self,
        installment_id: str,
        status: str,
        paid_date: datetime | None = None,
    ) -> Installment:
        """
        Update installment payment status.

        Args:
            installment_id: The installment to update
            status: New status (Pending, Paid, Overdue)
            paid_date: Date of payment (if applicable)

        Returns:
            Updated Installment object
        """
        pass
