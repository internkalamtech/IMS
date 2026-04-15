"""
Repository interface for payment operations.

Defines the abstract contract for payment data access.
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.payment import FeeStructureEntity, PaymentEntity


class PaymentRepository(ABC):
    """
    Abstract repository for payment operations.

    Defines the contract for payment data access.
    Concrete implementations are provided in the infrastructure layer.
    """

    @abstractmethod
    async def create_payment(self, payment: PaymentEntity) -> PaymentEntity:
        """
        Persist a new payment record.

        Args:
            payment: Payment entity to create

        Returns:
            Created payment entity with assigned ID
        """
        pass

    @abstractmethod
    async def get_payment_by_id(self, payment_id: int) -> Optional[PaymentEntity]:
        """
        Retrieve a payment by its ID.

        Args:
            payment_id: Unique identifier of the payment

        Returns:
            Payment entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def update_payment_status(self, payment_id: int, status: str) -> Optional[PaymentEntity]:
        """
        Update the status of a payment.

        Args:
            payment_id: Unique identifier of the payment
            status: New status value

        Returns:
            Updated payment entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def list_payments(
        self,
        name: Optional[str] = None,
        roll_number: Optional[str] = None,
        student_class: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[PaymentEntity]:
        """
        List payments with optional filters and pagination.

        Args:
            name: Filter by student name (partial match)
            roll_number: Filter by roll number
            student_class: Filter by class
            status: Filter by payment status
            skip: Number of records to skip
            limit: Maximum records to return

        Returns:
            List of matching payment entities
        """
        pass

    @abstractmethod
    async def get_payments_by_student(self, student_id: int) -> List[PaymentEntity]:
        """
        Retrieve all payments for a specific student.

        Args:
            student_id: Unique identifier of the student

        Returns:
            List of payment entities
        """
        pass

    @abstractmethod
    async def get_fee_structure(self, student_class: str) -> Optional[FeeStructureEntity]:
        """
        Retrieve fee structure for a given class.

        Args:
            student_class: Class/grade name

        Returns:
            FeeStructure entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_all_fee_structures(self) -> List[FeeStructureEntity]:
        """
        Retrieve all fee structures in a single query.

        Returns:
            List of all FeeStructure entities
        """
        pass

    @abstractmethod
    async def get_total_collected(self) -> float:
        """
        Get the total amount collected across all payments.

        Returns:
            Total collected amount
        """
        pass

    @abstractmethod
    async def get_class_student_counts(self) -> List[tuple]:
        """
        Get student counts grouped by class.

        Returns:
            List of (class_name, student_count) tuples
        """
        pass

    @abstractmethod
    async def get_distinct_students_paid_count(self) -> int:
        """
        Get the count of distinct students who have made payments.

        Returns:
            Count of students who paid
        """
        pass

    @abstractmethod
    async def get_monthly_revenue(self) -> List[dict]:
        """
        Get monthly revenue data.

        Returns:
            List of dicts with 'month' and 'revenue' keys
        """
        pass

    @abstractmethod
    async def get_all_payments_chunked(self, offset: int, limit: int) -> List[PaymentEntity]:
        """
        Retrieve payments in chunks for streaming.

        Args:
            offset: Records to skip
            limit: Maximum records to return

        Returns:
            List of payment entities
        """
        pass
