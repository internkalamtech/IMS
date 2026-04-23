"""
backend/app/api/schemas/fee_structure_schema.py
STORY_FEE_BREAKDOWN_BACKEND - Fee Structure API Schemas
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class FeeHeadSchema(BaseModel):
    """Fee head breakdown item"""
    name: str = Field(..., min_length=1, max_length=100, description="Fee head name (e.g., Tuition, Transport)")
    amount: Decimal = Field(..., gt=0, description="Amount for this fee head")
    description: Optional[str] = Field(None, max_length=500)
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }


class InstallmentPlanSchema(BaseModel):
    """Installment payment schedule"""
    installment_number: int = Field(..., ge=1, description="Sequential installment number")
    due_date: str = Field(..., description="Due date in YYYY-MM-DD format")
    amount: Decimal = Field(..., gt=0, description="Amount due for this installment")
    description: Optional[str] = Field(None, max_length=500)
    
    @validator("due_date")
    def validate_due_date(cls, v):
        """Validate date format"""
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("due_date must be in YYYY-MM-DD format")
        return v
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }


class FeeStructureCreateSchema(BaseModel):
    """Request schema for creating a fee structure"""
    class_name: str = Field(..., min_length=1, max_length=100, description="Class name (e.g., Class 10-A)")
    academic_year: str = Field(..., min_length=4, max_length=20, description="Academic year (e.g., 2024-2025)")
    fee_heads: List[FeeHeadSchema] = Field(..., min_items=1, description="Fee breakdown items")
    installment_plans: List[InstallmentPlanSchema] = Field(..., min_items=1, description="Payment installments")
    
    @validator("fee_heads")
    def validate_fee_heads_unique(cls, v):
        """Ensure fee head names are unique"""
        names = [head.name.lower() for head in v]
        if len(names) != len(set(names)):
            raise ValueError("Fee head names must be unique")
        return v
    
    @validator("installment_plans")
    def validate_installments_sequential(cls, v):
        """Ensure installment numbers are sequential"""
        numbers = sorted([plan.installment_number for plan in v])
        if numbers != list(range(1, len(numbers) + 1)):
            raise ValueError("Installment numbers must be sequential starting from 1")
        return v


class FeeStructureUpdateSchema(BaseModel):
    """Request schema for updating a fee structure"""
    class_name: Optional[str] = Field(None, min_length=1, max_length=100)
    academic_year: Optional[str] = Field(None, min_length=4, max_length=20)
    fee_heads: Optional[List[FeeHeadSchema]] = Field(None, min_items=1)
    installment_plans: Optional[List[InstallmentPlanSchema]] = Field(None, min_items=1)


class FeeStructureResponseSchema(BaseModel):
    """Response schema for fee structure"""
    id: str
    class_name: str
    academic_year: str
    fee_heads: List[FeeHeadSchema]
    installment_plans: List[InstallmentPlanSchema]
    total_amount: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }


class FeeStructureListResponseSchema(BaseModel):
    """Response schema for listing fee structures"""
    total: int
    page: int
    page_size: int
    items: List[FeeStructureResponseSchema]


class FeeStructureValidationSchema(BaseModel):
    """Request schema for validating uniqueness"""
    class_name: str
    academic_year: str
    exclude_id: Optional[str] = None


class ValidationResponseSchema(BaseModel):
    """Response for validation checks"""
    is_unique: bool
    message: Optional[str] = None
