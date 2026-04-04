"""
Use cases for Fee Management operations.

Business logic for fee-related operations.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from app.domain.entities.fee import (
    FeeStructure,
    Installment,
    Transaction,
    FeeSummary,
)
from app.domain.repositories.fee_repository import FeeRepository


class GetFeeStructureUseCase(ABC):
    """Use case for retrieving fee structure."""

    @abstractmethod
    async def execute(self, student_id: str) -> list[FeeStructure]:
        """Get fee structure for a student."""
        pass


class GetFeeSummaryUseCase(ABC):
    """Use case for retrieving fee summary."""

    @abstractmethod
    async def execute(self, student_id: str) -> FeeSummary:
        """Get aggregated fee summary for a student."""
        pass


class GetInstallmentsUseCase(ABC):
    """Use case for retrieving fee installments."""

    @abstractmethod
    async def execute(
        self, student_id: str, fee_structure_id: str | None = None
    ) -> list[Installment]:
        """Get installments for a student."""
        pass


class GetTransactionHistoryUseCase(ABC):
    """Use case for retrieving transaction history."""

    @abstractmethod
    async def execute(
        self,
        student_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Transaction]:
        """Get transaction history for a student."""
        pass


class GetReceiptDetailsUseCase(ABC):
    """Use case for retrieving receipt details."""

    @abstractmethod
    async def execute(self, receipt_number: str) -> Transaction | None:
        """Get receipt details by receipt number."""
        pass


class ProcessPaymentUseCase(ABC):
    """Use case for processing payments."""

    @abstractmethod
    async def execute(
        self,
        student_id: str,
        installment_id: str | None,
        amount: float,
        payment_mode: str,
        transaction_ref: str,
        description: str | None = None,
    ) -> Transaction:
        """
        Process a payment and create transaction record.
        Generates receipt number and updates installment status.
        """
        pass


# Concrete implementations


class GetFeeStructureUseCaseImpl(GetFeeStructureUseCase):
    """Concrete implementation for retrieving fee structure."""

    def __init__(self, repository: FeeRepository):
        self.repository = repository

    async def execute(self, student_id: str) -> list[FeeStructure]:
        return await self.repository.get_fee_structure(student_id)


class GetFeeSummaryUseCaseImpl(GetFeeSummaryUseCase):
    """Concrete implementation for retrieving fee summary."""

    def __init__(self, repository: FeeRepository):
        self.repository = repository

    async def execute(self, student_id: str) -> FeeSummary:
        return await self.repository.get_fee_summary(student_id)


class GetInstallmentsUseCaseImpl(GetInstallmentsUseCase):
    """Concrete implementation for retrieving installments."""

    def __init__(self, repository: FeeRepository):
        self.repository = repository

    async def execute(
        self, student_id: str, fee_structure_id: str | None = None
    ) -> list[Installment]:
        return await self.repository.get_installments(
            student_id, fee_structure_id
        )


class GetTransactionHistoryUseCaseImpl(GetTransactionHistoryUseCase):
    """Concrete implementation for retrieving transaction history."""

    def __init__(self, repository: FeeRepository):
        self.repository = repository

    async def execute(
        self,
        student_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Transaction]:
        return await self.repository.get_transactions(
            student_id, limit, offset
        )


class GetReceiptDetailsUseCaseImpl(GetReceiptDetailsUseCase):
    """Concrete implementation for retrieving receipt details."""

    def __init__(self, repository: FeeRepository):
        self.repository = repository

    async def execute(self, receipt_number: str) -> Transaction | None:
        return await self.repository.get_transaction_by_receipt(receipt_number)


class ProcessPaymentUseCaseImpl(ProcessPaymentUseCase):
    """Concrete implementation for processing payments."""

    def __init__(self, repository: FeeRepository):
        self.repository = repository

    async def execute(
        self,
        student_id: str,
        installment_id: str | None,
        amount: float,
        payment_mode: str,
        transaction_ref: str,
        description: str | None = None,
    ) -> Transaction:
        """
        Process payment: create transaction and update installment.
        """
        from uuid import uuid4

        receipt_number = f"REC-{uuid4().hex[:8].upper()}"

        # Create transaction
        transaction = await self.repository.create_transaction(
            student_id=student_id,
            installment_id=installment_id,
            amount=amount,
            payment_mode=payment_mode,
            transaction_ref=transaction_ref,
            receipt_number=receipt_number,
            description=description,
        )

        # Update installment status if applicable
        if installment_id:
            await self.repository.update_installment_status(
                installment_id=installment_id,
                status="Paid",
                paid_date=datetime.now(),
            )

        return transaction
