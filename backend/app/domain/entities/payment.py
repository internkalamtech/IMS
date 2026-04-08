"""
Domain entities for the payments module.

Entities represent core business objects with no dependencies
on external frameworks.
"""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Payment:
    """
    Payment entity representing a fee transaction.

    Attributes:
        id: Unique identifier for the payment
        student_id: ID of the student making the payment
        amount: Payment amount
        payment_method: Method used for payment (e.g., cash, card)
        payment_date: Date and time of the payment
    """

    id: str
    student_id: int
    amount: float
    payment_method: str
    payment_date: datetime


@dataclass
class LedgerEntry:
    """
    Ledger entry entity representing a line in the student's fee ledger.

    Attributes:
        id: Unique identifier for the ledger entry
        student_id: ID of the student this entry belongs to
        debit: Amount debited (fee charged)
        credit: Amount credited (payment received)
        balance: Running balance after this entry
        description: Description of the transaction
        transaction_date: Date and time of the transaction
    """

    id: str
    student_id: int
    debit: float
    credit: float
    balance: float
    description: str
    transaction_date: datetime


@dataclass
class FeeDashboard:
    """
    Dashboard summary for fee collection analytics.

    Attributes:
        total_collected: Total fees collected
        total_pending: Total fees pending
        students_paid: Number of students who have paid
        students_pending: Number of students with pending fees
    """

    total_collected: float
    total_pending: float
    students_paid: int
    students_pending: int


@dataclass
class FeeHead:
    """
    Fee head entity representing a breakdown item in a fee structure.

    Attributes:
        id: Unique identifier for the fee head
        name: Name of the fee head (e.g., Tuition, Transport, Lab Fee)
        description: Description of the fee head
        amount: Amount for this fee head
        percentage: Optional percentage of total fee
    """

    id: str
    name: str
    description: str | None
    amount: float
    percentage: float | None = None


@dataclass
class Installment:
    """
    Installment entity representing a payment schedule.

    Attributes:
        id: Unique identifier for the installment
        installment_number: Sequential number of the installment
        due_date: Date when the installment is due
        amount: Amount due for this installment
        description: Description of the installment (e.g., "First Installment")
    """

    id: str
    installment_number: int
    due_date: datetime
    amount: float
    description: str | None = None


@dataclass
class FeeStructure:
    """
    Fee structure entity representing the complete fee structure for a class.

    Attributes:
        id: Unique identifier for the fee structure
        class_id: ID of the class this fee structure applies to
        academic_year: Academic year for this fee structure (e.g., "2024-2025")
        total_fee: Total fee amount for the class
        fee_heads: List of FeeHead entities (breakdown items)
        installments: List of Installment entities (payment schedule)
        created_at: Timestamp when the fee structure was created
        updated_at: Timestamp when the fee structure was last updated
    """

    id: str
    class_id: int
    academic_year: str
    total_fee: float
    fee_heads: list[FeeHead]
    installments: list[Installment]
    created_at: datetime
    updated_at: datetime
