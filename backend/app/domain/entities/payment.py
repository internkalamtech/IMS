"""
Payment domain entity.

Represents a payment record in the system.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class PaymentEntity:
    """
    Payment domain entity.

    Attributes:
        id: Unique identifier for the payment
        student_id: ID of the student making the payment
        student_name: Full name of the student
        roll_number: Student roll number
        student_class: Student class/grade
        amount: Payment amount
        payment_mode: Mode of payment (e.g. Cash, UPI, Bank Transfer)
        receipt_number: Unique receipt number for the payment
        status: Payment status (Paid, Pending, Failed, Partial, Overdue)
        reference_number: Optional reference number for the transaction
        created_at: Timestamp when the payment was recorded
    """

    id: Optional[int]
    student_id: int
    student_name: str
    roll_number: str
    student_class: str
    amount: float
    payment_mode: str
    receipt_number: str
    status: str
    reference_number: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class FeeStructureEntity:
    """
    Fee structure domain entity.

    Attributes:
        id: Unique identifier
        student_class: Class/grade name
        fee_amount: Total fee amount for the class
    """

    id: Optional[int]
    student_class: str
    fee_amount: float
