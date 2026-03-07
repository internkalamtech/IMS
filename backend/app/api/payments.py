from datetime import datetime
from uuid import uuid4
from io import StringIO
import csv

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import Payment

router = APIRouter(prefix="/payments", tags=["Payments"])


# -------------------------
# Schemas
# -------------------------
class PaymentCreate(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    student_class: str
    amount: float
    payment_mode: str
    reference_number: str


class PaymentStatusUpdate(BaseModel):
    status: str


# -------------------------
# Record Payment (#256)
# -------------------------
@router.post("/transactions")
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """Record a payment and generate receipt"""

    receipt_number = f"REC-{uuid4().hex[:8].upper()}"

    new_payment = Payment(
        student_id=payment.student_id,
        student_name=payment.student_name,
        roll_number=payment.roll_number,
        student_class=payment.student_class,
        amount=payment.amount,
        payment_mode=payment.payment_mode,
        reference_number=payment.reference_number,
        receipt_number=receipt_number,
        status="Paid",
        created_at=datetime.utcnow(),
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return {
        "message": "Payment recorded successfully",
        "receipt_number": receipt_number,
        "payment_id": new_payment.id,
    }


# -------------------------
# Update Payment Status (#254)
# -------------------------
@router.patch("/{payment_id}/status")
def update_payment_status(
    payment_id: int,
    payload: PaymentStatusUpdate,
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        return {"error": "Payment not found"}

    payment.status = payload.status
    db.commit()

    return {"message": "Payment status updated", "status": payment.status}


# -------------------------
# Student Ledger (#256)
# -------------------------
@router.get("/students/{student_id}/ledger")
def student_ledger(student_id: int, db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(
        Payment.student_id == student_id
    ).all()

    history = []
    total_paid = 0

    for payment in payments:
        total_paid += payment.amount
        history.append(
            {
                "receipt_number": payment.receipt_number,
                "amount": payment.amount,
                "payment_mode": payment.payment_mode,
                "reference_number": payment.reference_number,
                "date": payment.created_at,
            }
        )

    total_fee = 50000
    balance = total_fee - total_paid

    next_due = {
        "amount": balance if balance > 0 else 0,
        "status": "Pending" if balance > 0 else "Cleared",
    }

    return {
        "student_id": student_id,
        "total_fee": total_fee,
        "total_paid": total_paid,
        "balance": balance,
        "next_due": next_due,
        "payment_history": history,
    }


# -------------------------
# Search + Filter (#254)
# -------------------------
@router.get("/")
def list_payments(
    name: str | None = Query(default=None),
    roll_number: str | None = Query(default=None),
    student_class: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):

    query = db.query(Payment)

    if name:
        query = query.filter(Payment.student_name.ilike(f"%{name}%"))

    if roll_number:
        query = query.filter(Payment.roll_number == roll_number)

    if student_class:
        query = query.filter(Payment.student_class == student_class)

    if status:
        query = query.filter(Payment.status == status)

    results = query.all()

    return results


# -------------------------
# Financial Summary (#255)
# -------------------------
@router.get("/summary")
def financial_summary(db: Session = Depends(get_db)):
    total_collected = db.query(func.sum(Payment.amount)).scalar() or 0

    student_count = db.query(
        func.count(func.distinct(Payment.student_id))
    ).scalar() or 0

    total_collectible = student_count * 50000
    pending = max(total_collectible - total_collected, 0)

    return {
        "total_collectible": total_collectible,
        "collected": total_collected,
        "pending": pending,
        "overdue": 0,
    }


# -------------------------
# Global Stats (#256)
# -------------------------
@router.get("/stats")
def payment_stats(db: Session = Depends(get_db)):
    total_collected = db.query(func.sum(Payment.amount)).scalar() or 0

    students_paid = db.query(
        func.count(func.distinct(Payment.student_id))
    ).scalar() or 0

    return {
        "total_collected": total_collected,
        "students_paid": students_paid,
    }


# -------------------------
# Export Report (#255)
# -------------------------
@router.get("/export")
def export_payments(db: Session = Depends(get_db)):

    payments = db.query(Payment).all()

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(
        [
            "Student Name",
            "Roll Number",
            "Class",
            "Amount",
            "Payment Mode",
            "Receipt",
            "Status",
            "Date",
        ]
    )

    for payment in payments:
        writer.writerow(
            [
                payment.student_name,
                payment.roll_number,
                payment.student_class,
                payment.amount,
                payment.payment_mode,
                payment.receipt_number,
                payment.status,
                payment.created_at,
            ]
        )

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=payments.csv"
        },
    )