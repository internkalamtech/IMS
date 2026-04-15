"""
Use cases for payment business logic.

Use cases encapsulate business rules and orchestrate the flow of data
between entities and repositories.
"""

from typing import List, Optional
from uuid import uuid4

from app.domain.entities.payment import FeeStructureEntity, PaymentEntity
from app.domain.repositories.payment_repository import PaymentRepository


class CreatePaymentUseCase:
    """Use case for recording a new payment transaction."""

    def __init__(self, repository: PaymentRepository):
        self.repository = repository

    async def execute(
        self,
        student_id: int,
        student_name: str,
        roll_number: str,
        student_class: str,
        amount: float,
        payment_mode: str,
        reference_number: Optional[str] = None,
    ) -> PaymentEntity:
        """
        Record a new payment transaction.

        Args:
            student_id: Student's unique identifier
            student_name: Student's full name
            roll_number: Student's roll number
            student_class: Student's class/grade
            amount: Payment amount
            payment_mode: Mode of payment
            reference_number: Optional transaction reference number

        Returns:
            Created payment entity with receipt number
        """
        if amount <= 0:
            raise ValueError("Payment amount must be greater than zero")

        receipt_number = f"REC-{uuid4().hex[:8].upper()}"

        payment = PaymentEntity(
            id=None,
            student_id=student_id,
            student_name=student_name,
            roll_number=roll_number,
            student_class=student_class,
            amount=amount,
            payment_mode=payment_mode,
            reference_number=reference_number,
            receipt_number=receipt_number,
            status="Paid",
        )

        return await self.repository.create_payment(payment)


class UpdatePaymentStatusUseCase:
    """Use case for updating a payment's status."""

    def __init__(self, repository: PaymentRepository):
        self.repository = repository

    async def execute(self, payment_id: int, status: str) -> Optional[PaymentEntity]:
        """
        Update the status of a payment.

        Args:
            payment_id: Payment's unique identifier
            status: New status value

        Returns:
            Updated payment entity

        Raises:
            ValueError: If payment not found
        """
        payment = await self.repository.update_payment_status(payment_id, status)
        if not payment:
            raise ValueError(f"Payment with ID {payment_id} not found")
        return payment


class ListPaymentsUseCase:
    """Use case for listing and filtering payments."""

    def __init__(self, repository: PaymentRepository):
        self.repository = repository

    async def execute(
        self,
        name: Optional[str] = None,
        roll_number: Optional[str] = None,
        student_class: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[PaymentEntity]:
        """
        List payments with optional filters.

        Returns:
            List of matching payment entities
        """
        return await self.repository.list_payments(
            name=name,
            roll_number=roll_number,
            student_class=student_class,
            status=status,
            skip=skip,
            limit=limit,
        )


class GetStudentLedgerUseCase:
    """Use case for retrieving a student's payment ledger."""

    def __init__(self, repository: PaymentRepository):
        self.repository = repository

    async def execute(self, student_id: int) -> dict:
        """
        Get payment ledger for a student.

        Args:
            student_id: Student's unique identifier

        Returns:
            Ledger dict with fee totals, balance, and payment history

        Raises:
            ValueError: If no payments found for the student
        """
        payments = await self.repository.get_payments_by_student(student_id)

        if not payments:
            raise ValueError(f"No payments found for student ID {student_id}")

        student_class = payments[0].student_class
        fee_structure: Optional[FeeStructureEntity] = await self.repository.get_fee_structure(
            student_class
        )
        total_fee = fee_structure.fee_amount if fee_structure else 0.0
        total_paid = sum(p.amount for p in payments)
        balance = total_fee - total_paid

        history = [
            {
                "receipt_number": p.receipt_number,
                "amount": p.amount,
                "payment_mode": p.payment_mode,
                "reference_number": p.reference_number,
                "date": p.created_at,
            }
            for p in payments
        ]

        return {
            "student_id": student_id,
            "total_fee": total_fee,
            "total_paid": total_paid,
            "balance": balance,
            "next_due": {
                "amount": balance if balance > 0 else 0,
                "status": "Pending" if balance > 0 else "Cleared",
            },
            "payment_history": history,
        }


class GetFinancialSummaryUseCase:
    """Use case for retrieving a financial summary."""

    def __init__(self, repository: PaymentRepository):
        self.repository = repository

    async def execute(self) -> dict:
        """
        Get financial summary including total collectible, collected,
        pending, and overdue amounts.

        Returns:
            Dict with financial summary data
        """
        total_collected = await self.repository.get_total_collected()
        class_counts = await self.repository.get_class_student_counts()

        # Fetch all fee structures in one query to avoid N+1
        all_fee_structures = await self.repository.get_all_fee_structures()
        fee_map = {fs.student_class: fs.fee_amount for fs in all_fee_structures}

        total_collectible = 0.0
        for student_class, count in class_counts:
            fee_amount = fee_map.get(student_class, 0.0)
            total_collectible += fee_amount * count

        pending = max(total_collectible - total_collected, 0)

        return {
            "total_collectible": total_collectible,
            "collected": total_collected,
            "pending": pending,
            "overdue": 0.0,
        }


class GetPaymentStatsUseCase:
    """Use case for retrieving payment statistics."""

    def __init__(self, repository: PaymentRepository):
        self.repository = repository

    async def execute(self) -> dict:
        """
        Get payment statistics.

        Returns:
            Dict with total collected and number of students paid
        """
        total_collected = await self.repository.get_total_collected()
        students_paid = await self.repository.get_distinct_students_paid_count()

        return {
            "total_collected": total_collected,
            "students_paid": students_paid,
        }


class GetMonthlyRevenueUseCase:
    """Use case for retrieving monthly revenue analytics."""

    def __init__(self, repository: PaymentRepository):
        self.repository = repository

    async def execute(self) -> List[dict]:
        """
        Get monthly revenue data.

        Returns:
            List of dicts with month and revenue data
        """
        return await self.repository.get_monthly_revenue()
