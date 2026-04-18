"""
Payment domain entities.

These dataclasses represent the core payment business objects with no
dependencies on external frameworks or database models.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional


# Supported payment modes
PaymentMode = Literal["Cash", "UPI", "Card"]

# Supported payment statuses
PaymentStatus = Literal["Paid", "Partial", "Pending", "Failed", "Overdue"]


@dataclass
class Student:
    """
    Student entity.

    Attributes:
        id: Unique identifier for the student
        name: Full name of the student
        roll_number: Student's roll number
        class_name: Class/grade the student belongs to
        next_due_date: Next payment due date (None if no outstanding dues)
        created_at: Timestamp when the student record was created
        updated_at: Timestamp when the student record was last updated
    """

    id: int
    name: str
    roll_number: str
    class_name: str
    next_due_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class FeeStructure:
    """
    Fee structure entity.

    Attributes:
        id: Unique identifier for the fee structure
        student_id: ID of the associated student
        total_fee: Total fee amount for the term/year
        amount_paid: Amount paid so far
        fee_type: Type of fee (e.g. Tuition, Transport)
        academic_year: Academic year this fee structure belongs to
        balance: Outstanding balance (computed)
    """

    id: int
    student_id: int
    total_fee: float
    amount_paid: float
    fee_type: str = "Tuition"
    academic_year: str = "2024-25"

    @property
    def balance(self) -> float:
        """Outstanding fee balance."""
        return self.total_fee - self.amount_paid


@dataclass
class Payment:
    """
    Payment transaction entity.

    Attributes:
        id: Unique identifier for the payment
        student_id: ID of the associated student
        fee_structure_id: ID of the associated fee structure
        receipt_number: Unique formatted receipt number (REC-YYYY-XXXX)
        amount: Amount paid in this transaction
        payment_mode: Mode of payment (Cash, UPI, Card)
        reference_number: Reference number for UPI/Card transactions
        status: Current payment status
        remarks: Optional remarks or notes
        payment_date: Date and time the payment was recorded
    """

    id: int
    student_id: int
    fee_structure_id: int
    receipt_number: str
    amount: float
    payment_mode: PaymentMode
    status: PaymentStatus
    payment_date: datetime
    reference_number: Optional[str] = None
    remarks: Optional[str] = None


@dataclass
class PaymentSummary:
    """
    Aggregated payment statistics summary.

    Attributes:
        total_collectible: Total fee amount expected from all students
        total_collected: Total amount collected so far
        total_pending: Total outstanding amount
        total_overdue: Total amount that is overdue
    """

    total_collectible: float
    total_collected: float
    total_pending: float
    total_overdue: float
