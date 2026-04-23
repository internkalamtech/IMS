"""
backend/app/api/schemas/payment_schema.py
STORY_PAYMENT_BACKEND - Payment API Schemas
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PaymentCreateSchema(BaseModel):
    """Request schema for recording a payment"""
    amount: Decimal = Field(..., gt=0, description="Payment amount")
    payment_mode: str = Field(..., description="Payment mode: Cash, UPI, Card, Cheque, Bank Transfer")
    reference_number: Optional[str] = Field(None, max_length=100, description="Transaction/Cheque number")
    notes: Optional[str] = Field(None, max_length=500)
    
    @validator("payment_mode")
    def validate_payment_mode(cls, v):
        valid_modes = ['Cash', 'UPI', 'Card', 'Cheque', 'Bank Transfer']
        if v not in valid_modes:
            raise ValueError(f"Payment mode must be one of {valid_modes}")
        return v


class PaymentResponseSchema(BaseModel):
    """Response schema for a payment"""
    id: str
    student_id: str
    amount: Decimal
    payment_mode: str
    receipt_number: str
    paid_date: datetime
    reference_number: Optional[str]
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        json_encoders = {Decimal: lambda v: float(v)}


class StudentLedgerSchema(BaseModel):
    """Student fee ledger response"""
    student_id: str
    student_name: str
    total_fee: Decimal
    paid_amount: Decimal
    pending_amount: Decimal
    status: str  # Paid, Partial, Overdue
    next_due_date: Optional[str]
    last_payment_date: Optional[datetime]
    
    class Config:
        json_encoders = {Decimal: lambda v: float(v)}


class CollectionStatsSchema(BaseModel):
    """Global collection statistics"""
    total_collectible: Decimal
    total_collected: Decimal
    total_pending: Decimal
    total_overdue: Decimal
    collection_percentage: float
    total_students: int
    paid_students: int
    pending_students: int
    overdue_students: int
    
    class Config:
        json_encoders = {Decimal: lambda v: float(v)}
