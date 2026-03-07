from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


# Payment schema
class PaymentCreate(BaseModel):
    student_id: int
    amount: float
    payment_method: str


# Create payment transaction
@router.post("/transactions")
def create_payment(payment: PaymentCreate):
    return {
        "message": "Payment processed successfully",
        "transaction": payment
    }


# Student ledger
@router.get("/students/{student_id}/ledger")
def get_student_ledger(student_id: int):
    return {
        "student_id": student_id,
        "transactions": []
    }


# Dashboard analytics
@router.get("/dashboard")
def fee_dashboard():
    return {
        "total_collected": 0,
        "total_pending": 0,
        "students_paid": 0,
        "students_pending": 0
    }
