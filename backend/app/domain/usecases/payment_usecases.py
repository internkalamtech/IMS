"""
Use cases for payment business logic.

Use cases encapsulate business rules and orchestrate the flow of data
between entities and repositories.
"""

from app.domain.entities.payment import FeeDashboard, LedgerEntry, Payment
from app.domain.repositories.payment_repository import PaymentRepository


class CreatePaymentUseCase:
    """
    Use case for recording a new payment transaction.
    """

    def __init__(self, payment_repository: PaymentRepository):
        """
        Initialize the use case.

        Args:
            payment_repository: Repository for payment operations
        """
        self.payment_repository = payment_repository

    async def execute(
        self,
        student_id: int,
        amount: float,
        payment_method: str,
    ) -> Payment:
        """
        Execute the create payment use case.

        Args:
            student_id: ID of the student making the payment
            amount: Payment amount (must be positive)
            payment_method: Payment method used

        Returns:
            Created Payment entity

        Raises:
            ValueError: If amount is not positive or required fields are missing
        """
        if student_id <= 0:
            raise ValueError("Student ID must be a positive integer")

        if amount <= 0:
            raise ValueError("Payment amount must be greater than zero")

        if not payment_method or not payment_method.strip():
            raise ValueError("Payment method is required")

        return await self.payment_repository.create_payment(
            student_id=student_id,
            amount=amount,
            payment_method=payment_method.strip(),
        )


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

    async def execute(self, student_id: int) -> list[LedgerEntry]:
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
