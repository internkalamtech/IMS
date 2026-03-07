from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import Payment

router = APIRouter()


# Payment schema
class PaymentCreate(BaseModel):
    student_id: int
    amount: float
    payment_method: str
    reference_number: str


# STEP 3 – Record payment
@router.post("/transactions")
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    receipt = f"REC-{uuid4().hex[:8]}"

    new_payment = Payment(
        student_id=payment.student_id,
        amount=payment.amount,
        payment_mode=payment.payment_mode,
        reference_number=payment.reference_number,
        receipt_number=receipt,
        created_at=datetime.utcnow()
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return {
        "message": "Payment recorded successfully",
        "receipt_number": receipt,
        "payment_id": new_payment.id
    }


# STEP 4 – Student ledger / payment history
@router.get("/students/{student_id}/ledger")
def get_student_ledger(student_id: int, db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(
        Payment.student_id == student_id
    ).all()

    history = []
    total_paid = 0

    for p in payments:
        total_paid += p.amount
        history.append({
            "receipt_number": p.receipt_number,
            "amount": p.amount,
            "mode": p.payment_mode,
            "reference_number": p.reference_number,
            "date": p.created_at
        })

    total_fee = 50000
    balance = total_fee - total_paid
    status = "Paid" if balance <= 0 else "Partial"

    return {
        "student_id": student_id,
        "total_fee": total_fee,
        "total_paid": total_paid,
        "balance": balance,
        "status": status,
        "payment_history": history
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
