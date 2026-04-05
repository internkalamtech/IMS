"""
Repository interface for payment data access.

Repositories define abstract interfaces for data operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod

from app.domain.entities.payment import FeeDashboard, LedgerEntry, Payment


class PaymentRepository(ABC):
    """
    Abstract repository for payment operations.

    This interface defines the contract for payment data access.
    Concrete implementations are provided in the infrastructure layer.
    """

    @abstractmethod
    async def create_payment(
        self,
        student_id: int,
        amount: float,
        payment_method: str,
    ) -> Payment:
        """
        Record a new payment transaction.

        Args:
            student_id: ID of the student making the payment
            amount: Payment amount
            payment_method: Payment method used

        Returns:
            Created Payment entity
        """
        pass

    @abstractmethod
    async def get_student_ledger(self, student_id: int) -> list[LedgerEntry]:
        """
        Retrieve the full ledger for a student.

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
