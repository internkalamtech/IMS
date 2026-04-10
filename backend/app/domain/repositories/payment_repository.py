"""
Repository interface for payment data access.

Repositories define abstract interfaces for data operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod

from app.domain.entities.payment import (
    FeeDashboard,
    FeeStructure,
    LedgerEntry,
    Payment,
)


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
    ) -> FeeStructure | None:
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
    async def get_fee_structure_by_id(
        self, fee_structure_id: str
    ) -> FeeStructure | None:
        """
        Retrieve a fee structure by its ID.

        Args:
            fee_structure_id: Unique identifier of the fee structure

        Returns:
            FeeStructure entity or None if not found
        """
        pass

    @abstractmethod
    async def get_fee_structures_by_class(
        self, class_id: int
    ) -> list[FeeStructure]:
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
        total_fee: float | None = None,
        fee_heads: list[dict] | None = None,
        installments: list[dict] | None = None,
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

        Checks for data integrity with student records to ensure
        the fee structure is not being used by active students.

        Args:
            fee_structure_id: ID of the fee structure to delete

        Returns:
            True if deletion was successful

        Raises:
            ValueError: If the fee structure is in use by students
        """
        pass
