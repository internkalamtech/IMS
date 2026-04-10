class UpdateClassSubjectsRequest(BaseModel):
    """Request schema for updating class subjects."""

    class_id: int
    subjects: List[SubjectInput]


# ------------------------------------------------------------------ #
# Payment schemas
# ------------------------------------------------------------------ #

PaymentMode = Literal["Cash", "UPI", "Card"]
PaymentStatus = Literal["Paid", "Partial", "Pending", "Failed", "Overdue"]


class PaymentCreate(BaseModel):
    """
    Request schema for recording a new payment transaction.
    """

    student_id: int = Field(..., description="ID of the student making the payment")
    fee_structure_id: int = Field(..., description="ID of the fee structure being paid against")
    amount: float = Field(..., gt=0, description="Payment amount (must be > 0)")
    payment_mode: PaymentMode = Field(..., description="Mode of payment: Cash, UPI, or Card")
    reference_number: Optional[str] = Field(
        None,
        description="Required for UPI/Card, optional for Cash",
    )
    remarks: Optional[str] = Field(None, max_length=500)

    @model_validator(mode="after")
    def validate_reference_number_for_digital_payments(self):
        if self.payment_mode in ("UPI", "Card") and not (
            self.reference_number and self.reference_number.strip()
        ):
            raise ValueError(
                f"reference_number is required for {self.payment_mode} payments."
            )
        return self


class StudentResponse(BaseModel):
    id: int
    name: str
    roll_number: str
    class_name: str
    next_due_date: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FeeStructureResponse(BaseModel):
    id: int
    student_id: int
    total_fee: float
    amount_paid: float
    balance: float
    fee_type: str
    academic_year: str

    model_config = {"from_attributes": True}


class PaymentResponse(BaseModel):
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

    model_config = {"from_attributes": True}


class PaymentSummaryResponse(BaseModel):
    total_collectible: float
    total_collected: float
    total_pending: float
    total_overdue: float

    model_config = {"from_attributes": True}