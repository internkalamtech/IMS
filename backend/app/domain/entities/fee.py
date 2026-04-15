"""
Domain entities for Fee & Finance management.

Entities represent core business objects with no dependencies
on external frameworks.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Literal


@dataclass
class FeeStructure:
    """
    FeeStructure entity representing fee configuration.

    Attributes:
        id: Unique identifier for the fee structure
        student_id: Student associated with this fee structure
        fee_head: Name of the fee component (e.g., "Tuition Fee",
              "Transport Fee")
        total_amount: Total amount for this fee
        is_mandatory: Whether this fee is mandatory or optional
        academic_year: Academic year for this fee
    """

    id: str
    student_id: str
    fee_head: str
    total_amount: float
    is_mandatory: bool
    academic_year: str


@dataclass
class Installment:
    """
    Installment entity representing a payment installment.

    Attributes:
        id: Unique identifier for the installment
        fee_structure_id: Reference to the fee structure
        student_id: Student associated with this installment
        due_date: Due date for the installment
        amount: Amount due for this installment
        status: Payment status (Pending, Paid, Overdue)
        paid_date: Date when the installment was paid (None if not paid)
    """

    id: str
    fee_structure_id: str
    student_id: str
    due_date: datetime
    amount: float
    status: Literal["Pending", "Paid", "Overdue"]
    paid_date: datetime | None = None


@dataclass
class Transaction:
    """
    Transaction entity representing a payment transaction.

    Attributes:
        id: Unique identifier for the transaction
        student_id: Student who made the payment
        installment_id: Reference to the installment (if applicable)
        amount: Amount paid
        payment_mode: Mode of payment (UPI, Card, Cash, etc.)
        transaction_ref: External transaction reference ID
        receipt_number: Unique receipt number
        created_at: When the transaction was created
        description: Optional description of transaction
    """

    id: str
    student_id: str
    installment_id: str | None
    amount: float
    payment_mode: Literal["UPI", "Card", "Cash", "Check", "Online"]
    transaction_ref: str
    receipt_number: str
    created_at: datetime
    description: str | None = None


@dataclass
class FeeSummary:
    """
    FeeSummary entity representing aggregated fee information.

    Attributes:
        student_id: Student ID
        total_fee: Total fees charged
        paid_amount: Total amount paid so far
        balance_due: Remaining balance
        next_due_date: Date of next due installment
        status_percentage: Percentage of fees paid (0-100)
    """

    student_id: str
    total_fee: float
    paid_amount: float
    balance_due: float
    next_due_date: datetime | None = None
    status_percentage: float = 0.0
