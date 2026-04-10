from fastapi import APIRouter, Depends, status, Path, Query
from app.api.dependencies import get_current_user
from app.api.schemas import (
    FeeSummaryResponse,
    FeeStructureResponse,
    InstallmentResponse,
    TransactionResponse,
)
from app.domain.entities.user import User
from app.domain.usecases.fee_usecases import (
    GetFeeStructureUseCaseImpl,
    GetFeeSummaryUseCaseImpl,
    GetInstallmentsUseCaseImpl,
    GetTransactionHistoryUseCaseImpl,
    GetReceiptDetailsUseCaseImpl,
)

router = APIRouter(prefix="/finance", tags=["Finance & Fees"])


# Dummy repository for demonstration (would be injected in real app)
class DummyFeeRepository:
    """Mock repository for fee operations."""

    async def get_fee_structure(self, student_id: str):
        from app.domain.entities.fee import FeeStructure

        return [
            FeeStructure(
                id="fs-001",
                student_id=student_id,
                fee_head="Tuition Fee",
                total_amount=50000.0,
                is_mandatory=True,
                academic_year="2024-2025",
            ),
            FeeStructure(
                id="fs-002",
                student_id=student_id,
                fee_head="Transport Fee",
                total_amount=15000.0,
                is_mandatory=True,
                academic_year="2024-2025",
            ),
            FeeStructure(
                id="fs-003",
                student_id=student_id,
                fee_head="Lab Fee",
                total_amount=5000.0,
                is_mandatory=False,
                academic_year="2024-2025",
            ),
        ]

    async def get_fee_summary(self, student_id: str):
        from app.domain.entities.fee import FeeSummary
        from datetime import datetime, timedelta

        return FeeSummary(
            student_id=student_id,
            total_fee=70000.0,
            paid_amount=35000.0,
            balance_due=35000.0,
            next_due_date=datetime.now() + timedelta(days=15),
            status_percentage=50.0,
        )

    async def get_installments(self, student_id: str, fee_structure_id=None):
        from app.domain.entities.fee import Installment
        from datetime import datetime

        installments = [
            Installment(
                id="inst-001",
                fee_structure_id="fs-001",
                student_id=student_id,
                due_date=datetime(2024, 4, 15),
                amount=25000.0,
                status="Paid",
                paid_date=datetime(2024, 4, 10),
            ),
            Installment(
                id="inst-002",
                fee_structure_id="fs-001",
                student_id=student_id,
                due_date=datetime(2024, 7, 15),
                amount=25000.0,
                status="Pending",
            ),
            Installment(
                id="inst-003",
                fee_structure_id="fs-002",
                student_id=student_id,
                due_date=datetime(2024, 5, 1),
                amount=15000.0,
                status="Pending",
            ),
        ]

        if fee_structure_id:
            return [
                i
                for i in installments
                if i.fee_structure_id == fee_structure_id
            ]
        return installments

    async def get_transactions(self, student_id: str, limit=20, offset=0):
        from app.domain.entities.fee import Transaction
        from datetime import datetime

        transactions = [
            Transaction(
                id="txn-001",
                student_id=student_id,
                installment_id="inst-001",
                amount=25000.0,
                payment_mode="Online",
                transaction_ref="TXN20240410001",
                receipt_number="REC-A1B2C3D4",
                created_at=datetime(2024, 4, 10, 10, 30),
                description="Tuition fee installment 1",
            ),
        ]
        return transactions[offset:offset + limit]

    async def get_transaction_by_receipt(self, receipt_number: str):
        from app.domain.entities.fee import Transaction
        from datetime import datetime

        if receipt_number == "REC-A1B2C3D4":
            return Transaction(
                id="txn-001",
                student_id="std-123",
                installment_id="inst-001",
                amount=25000.0,
                payment_mode="Online",
                transaction_ref="TXN20240410001",
                receipt_number=receipt_number,
                created_at=datetime(2024, 4, 10, 10, 30),
                description="Tuition fee installment 1",
            )
        return None


@router.get(
    "/student/{student_id}/fee-summary",
    response_model=FeeSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student fee summary",
    description="Retrieve aggregated fee summary for a student",
)
async def get_fee_summary(
    student_id: str = Path(..., description="Student ID"),
    current_user: User = Depends(get_current_user),
) -> FeeSummaryResponse:
    """
    Get fee summary for a student.

    Returns:
        FeeSummaryResponse: Total fee, paid amount, balance due, and percentage
    """
    repository = DummyFeeRepository()
    use_case = GetFeeSummaryUseCaseImpl(repository)
    summary = await use_case.execute(student_id)

    return FeeSummaryResponse(
        student_id=summary.student_id,
        total_fee=summary.total_fee,
        paid_amount=summary.paid_amount,
        balance_due=summary.balance_due,
        next_due_date=summary.next_due_date,
        status_percentage=summary.status_percentage,
    )


@router.get(
    "/student/{student_id}/fee-structure",
    response_model=list[FeeStructureResponse],
    status_code=status.HTTP_200_OK,
    summary="Get student fee structure",
    description="Retrieve fee structure details for a student",
)
async def get_fee_structure(
    student_id: str = Path(..., description="Student ID"),
    current_user: User = Depends(get_current_user),
) -> list[FeeStructureResponse]:
    """
    Get fee structure for a student.

    Returns:
        List[FeeStructureResponse]: List of fee components with amounts
    """
    repository = DummyFeeRepository()
    use_case = GetFeeStructureUseCaseImpl(repository)
    structures = await use_case.execute(student_id)

    return [
        FeeStructureResponse(
            id=s.id,
            student_id=s.student_id,
            fee_head=s.fee_head,
            total_amount=s.total_amount,
            is_mandatory=s.is_mandatory,
            academic_year=s.academic_year,
        )
        for s in structures
    ]


@router.get(
    "/student/{student_id}/installments",
    response_model=list[InstallmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get fee installments",
    description="Retrieve all fee installments with payment status",
)
async def get_installments(
    student_id: str = Path(..., description="Student ID"),
    fee_structure_id: str | None = Query(
        None, description="Optional fee structure filter"
    ),
    current_user: User = Depends(get_current_user),
) -> list[InstallmentResponse]:
    """
    Get installments for a student.

    Returns:
        List[InstallmentResponse]: List of installments with due dates and status
    """
    repository = DummyFeeRepository()
    use_case = GetInstallmentsUseCaseImpl(repository)
    installments = await use_case.execute(student_id, fee_structure_id)

    return [
        InstallmentResponse(
            id=i.id,
            fee_structure_id=i.fee_structure_id,
            student_id=i.student_id,
            due_date=i.due_date,
            amount=i.amount,
            status=i.status,
            paid_date=i.paid_date,
        )
        for i in installments
    ]


@router.get(
    "/student/{student_id}/receipts",
    response_model=list[TransactionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get transaction receipts",
    description="Retrieve transaction/receipt history for a student",
)
async def get_receipts(
    student_id: str = Path(..., description="Student ID"),
    limit: int = Query(20, ge=1, le=100, description="Limit per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    current_user: User = Depends(get_current_user),
) -> list[TransactionResponse]:
    """
    Get transaction receipts for a student.

    Returns:
        List[TransactionResponse]: List of paid transactions with receipt details
    """
    repository = DummyFeeRepository()
    use_case = GetTransactionHistoryUseCaseImpl(repository)
    transactions = await use_case.execute(student_id, limit, offset)

    return [
        TransactionResponse(
            id=t.id,
            student_id=t.student_id,
            installment_id=t.installment_id,
            amount=t.amount,
            payment_mode=t.payment_mode,
            transaction_ref=t.transaction_ref,
            receipt_number=t.receipt_number,
            created_at=t.created_at,
            description=t.description,
        )
        for t in transactions
    ]


@router.get(
    "/receipt/{receipt_number}",
    response_model=TransactionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get receipt details",
    description="Retrieve detailed information for a specific receipt",
)
async def get_receipt_details(
    receipt_number: str = Path(
        ..., description="Receipt number (e.g., REC-A1B2C3D4)"
    ),
    current_user: User = Depends(get_current_user),
) -> TransactionResponse:
    """
    Get receipt details by receipt number.

    Returns:
        TransactionResponse: Complete receipt and transaction details
    """
    repository = DummyFeeRepository()
    use_case = GetReceiptDetailsUseCaseImpl(repository)
    transaction = await use_case.execute(receipt_number)

    if not transaction:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receipt {receipt_number} not found",
        )

    return TransactionResponse(
        id=transaction.id,
        student_id=transaction.student_id,
        installment_id=transaction.installment_id,
        amount=transaction.amount,
        payment_mode=transaction.payment_mode,
        transaction_ref=transaction.transaction_ref,
        receipt_number=transaction.receipt_number,
        created_at=transaction.created_at,
        description=transaction.description,
    )
