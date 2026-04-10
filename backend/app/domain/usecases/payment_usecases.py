"""
Use cases for payment business logic.

Use cases encapsulate business rules and orchestrate the flow of data
between entities and repositories.
"""

from app.domain.entities.payment import (
    FeeDashboard,
    FeeStructure,
    LedgerEntry,
    Payment,
)
from app.domain.repositories.payment_repository import (
    FeeStructureRepository,
    PaymentRepository,
)


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
            ValueError: If amount is not positive or required
            fields are missing
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
            if (
                not inst.get("installment_number")
                or inst.get("installment_number") <= 0
            ):
                raise ValueError("Installment number must be positive")
            if not inst.get("due_date"):
                raise ValueError("Due date is required for each installment")
            if not inst.get("amount") or inst.get("amount") <= 0:
                raise ValueError(
                    "Installment amount must be greater than zero"
                )

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
    ) -> FeeStructure | None:
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

        return (
            await self.fee_structure_repository
            .get_fee_structure_by_class_and_year(
                class_id=class_id,
                academic_year=academic_year.strip(),
            )
        )

    async def execute_by_id(
        self, fee_structure_id: str
    ) -> FeeStructure | None:
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
        total_fee: float | None = None,
        fee_heads: list[dict] | None = None,
        installments: list[dict] | None = None,
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
                    raise ValueError(
                        "Fee head amount must be greater than zero"
                    )

        if installments is not None:
            if not installments:
                raise ValueError("At least one installment is required")
            for inst in installments:
                if (
                    not inst.get("installment_number")
                    or inst.get("installment_number") <= 0
                ):
                    raise ValueError("Installment number must be positive")
                if not inst.get("due_date"):
                    raise ValueError(
                        "Due date is required for each installment"
                    )
                if not inst.get("amount") or inst.get("amount") <= 0:
                    raise ValueError(
                        "Installment amount must be greater than zero"
                    )

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
