"""Pydantic schemas for payment API endpoints."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

PaymentMode = Literal["Cash", "UPI", "Card"]
PaymentStatus = Literal["Paid", "Partial", "Pending", "Failed", "Overdue"]


class PaymentCreate(BaseModel):
    """Request schema for creating a payment."""

    student_id: int = Field(..., gt=0)
    fee_structure_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    payment_mode: PaymentMode
    reference_number: Optional[str] = None
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_reference_number_for_digital_payments(self):
        if self.payment_mode in {"UPI", "Card"}:
            if not self.reference_number or not self.reference_number.strip():
                raise ValueError("reference_number is required for UPI or Card payments")
        return self


class PaymentResponse(BaseModel):
    """Response schema for payment records."""

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


class PaymentSummaryResponse(BaseModel):
    """Response schema for aggregate payment statistics."""

    total_collectible: float
    total_collected: float
    total_pending: float
    total_overdue: float


class StudentResponse(BaseModel):
    """Response schema for students listed in payment views."""

    id: int
    name: str
    roll_number: str
    class_name: str
    next_due_date: Optional[datetime] = None
