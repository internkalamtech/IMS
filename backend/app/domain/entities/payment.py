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
