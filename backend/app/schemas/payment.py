"""
Pydantic schemas for the Payment Module API.

These schemas validate request bodies and shape response payloads for all
payment-related endpoints.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


# ------------------------------------------------------------------ #
# Type aliases (shared with domain layer)
# ------------------------------------------------------------------ #

PaymentMode = Literal["Cash", "UPI", "Card"]
PaymentStatus = Literal["Paid", "Partial", "Pending", "Failed", "Overdue"]


# ------------------------------------------------------------------ #
# Request schemas
# ------------------------------------------------------------------ #


class PaymentCreate(BaseModel):
    """
    Request schema for recording a new payment transaction.

    Validation rules:
    - ``amount`` must be a positive number.
    - ``reference_number`` is **required** when ``payment_mode`` is
      ``"UPI"`` or ``"Card"``; it remains optional for ``"Cash"``.
    """

    student_id: int = Field(
        ..., description="ID of the student making the payment"
    )
    fee_structure_id: int = Field(
        ..., description="ID of the fee structure being paid against"
    )
    amount: float = Field(
        ..., gt=0, description="Payment amount (must be > 0)"
    )
    payment_mode: PaymentMode = Field(
        ..., description="Mode of payment: Cash, UPI, or Card"
    )
    reference_number: Optional[str] = Field(
        None,
        description=(
            "Transaction reference number. "
            "Required for UPI and Card payments, optional for Cash."
        ),
    )
    remarks: Optional[str] = Field(
        None, max_length=500, description="Optional remarks or notes"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "student_id": 1,
                    "fee_structure_id": 1,
                    "amount": 5000.00,
                    "payment_mode": "UPI",
                    "reference_number": "UPI123456789",
                    "remarks": "Monthly fee – April",
                }
            ]
        }
    }

    @model_validator(mode="after")
    def validate_reference_number_for_digital_payments(
        self,
    ) -> "PaymentCreate":
        """
        Ensure a reference number is supplied for UPI or Card payments.

        Raises:
            ValueError: If payment_mode is UPI or Card but
                        reference_number is absent or blank.
        """
        if self.payment_mode in ("UPI", "Card") and not (
            self.reference_number and self.reference_number.strip()
        ):
            raise ValueError(
                f"reference_number is required for "
                f"{self.payment_mode} payments."
            )
        return self


# ------------------------------------------------------------------ #
# Response schemas
# ------------------------------------------------------------------ #


class StudentResponse(BaseModel):
    """Response schema for student data in payment context."""

    id: int
    name: str
    roll_number: str
    class_name: str
    next_due_date: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FeeStructureResponse(BaseModel):
    """Response schema for fee structure data."""

    id: int
    student_id: int
    total_fee: float
    amount_paid: float
    balance: float
    fee_type: str
    academic_year: str

    model_config = {"from_attributes": True}


class PaymentResponse(BaseModel):
    """Response schema for a single payment transaction."""

    id: int
    student_id: int
    fee_structure_id: int
    receipt_number: str
    amount: float
    payment_mode: PaymentMode
    reference_number: Optional[str] = None
    status: PaymentStatus
    remarks: Optional[str] = None
    payment_date: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "student_id": 1,
                    "fee_structure_id": 1,
                    "receipt_number": "REC-2024-A3F7",
                    "amount": 5000.00,
                    "payment_mode": "UPI",
                    "reference_number": "UPI123456789",
                    "status": "Paid",
                    "remarks": "Monthly fee – April",
                    "payment_date": "2024-04-01T10:00:00",
                }
            ]
        },
    }


class PaymentSummaryResponse(BaseModel):
    """Response schema for aggregated payment statistics."""

    total_collectible: float
    total_collected: float
    total_pending: float
    total_overdue: float

    model_config = {"from_attributes": True}
