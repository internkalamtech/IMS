import csv
from datetime import datetime
from io import StringIO
from typing import List, Literal, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import FeeStructure, Payment

router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


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
    status: Literal["Paid", "Pending", "Failed"]


class PaymentResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    roll_number: str
    student_class: str
    amount: float
    payment_mode: str
    reference_number: str
    receipt_number: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentCreated(BaseModel):
    message: str
    receipt_number: str
    payment_id: int


class FinancialSummary(BaseModel):
    total_collectible: float
    collected: float
    pending: float
    overdue: float


class PaymentStats(BaseModel):
    total_collected: float
    students_paid: int


# -------------------------
# Record Payment
# -------------------------


@router.post("/transactions", response_model=PaymentCreated)
async def create_payment(
    payment: PaymentCreate,
    db: AsyncSession = Depends(get_db),
) -> PaymentCreated:

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
    await db.commit()
    await db.refresh(new_payment)

    return PaymentCreated(
        message="Payment recorded successfully",
        receipt_number=receipt_number,
        payment_id=new_payment.id,
    )


# -------------------------
# Update Payment Status
# -------------------------


@router.patch("/{payment_id}/status")
async def update_payment_status(
    payment_id: int,
    payload: PaymentStatusUpdate,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(select(Payment).filter(Payment.id == payment_id))
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.status = payload.status
    await db.commit()

    return {"message": "Payment status updated", "status": payment.status}


# -------------------------
# List Payments (Filters + Pagination)
# -------------------------


@router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    name: Optional[str] = Query(default=None),
    roll_number: Optional[str] = Query(default=None),
    student_class: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):

    query = select(Payment)

    if name:
        query = query.filter(Payment.student_name.ilike(f"%{name}%"))

    if roll_number:
        query = query.filter(Payment.roll_number == roll_number)

    if student_class:
        query = query.filter(Payment.student_class == student_class)

    if status:
        query = query.filter(Payment.status == status)

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


# -------------------------
# Student Ledger
# -------------------------


@router.get("/students/{student_id}")
async def student_ledger(
    student_id: int,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(select(Payment).filter(Payment.student_id == student_id))
    payments = result.scalars().all()

    if not payments:
        raise HTTPException(status_code=404, detail="No payments found")

    student_class = payments[0].student_class
    fee_result = await db.execute(
        select(FeeStructure.fee_amount).filter_by(student_class=student_class)
    )
    fee_amount = fee_result.scalar()

    total_paid = sum(p.amount for p in payments)
    total_fee = fee_amount if fee_amount else 0
    balance = total_fee - total_paid

    history = []

    for payment in payments:
        history.append(
            {
                "receipt_number": payment.receipt_number,
                "amount": payment.amount,
                "payment_mode": payment.payment_mode,
                "reference_number": payment.reference_number,
                "date": payment.created_at,
            }
        )

    return {
        "student_id": student_id,
        "total_fee": total_fee,
        "total_paid": total_paid,
        "balance": balance,
        "next_due": {
            "amount": balance if balance > 0 else 0,
            "status": "Pending" if balance > 0 else "Cleared",
        },
        "payment_history": history,
    }


# -------------------------
# Financial Summary
# -------------------------
async def financial_summary(db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(func.sum(Payment.amount)))
    total_collected = result.scalar() or 0

    stmt = select(Payment.student_class, func.count(func.distinct(Payment.student_id))).group_by(
        Payment.student_class
    )
    class_counts = (await db.execute(stmt)).all()

    total_collectible = 0
    for s_class, count in class_counts:
        fee_result = await db.execute(
            select(FeeStructure.fee_amount).filter_by(student_class=s_class)
        )
        fee_amount = fee_result.scalar() or 0
        total_collectible += fee_amount * count
    pending = max(total_collectible - total_collected, 0)

    return FinancialSummary(
        total_collectible=total_collectible,
        collected=total_collected,
        pending=pending,
        overdue=0,
    )


# -------------------------
async def payment_stats(db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(func.sum(Payment.amount)))
    total_collected = result.scalar() or 0

    result = await db.execute(select(func.count(func.distinct(Payment.student_id))))
    students_paid = result.scalar() or 0

    return PaymentStats(
        total_collected=total_collected,
        students_paid=students_paid,
    )


# -------------------------
# Monthly Analytics
# -------------------------


@router.get("/analytics/monthly")
async def monthly_revenue(db: AsyncSession = Depends(get_db)):

    stmt = select(
        extract("month", Payment.created_at).label("month"),
        func.sum(Payment.amount),
    ).group_by("month")
    result = await db.execute(stmt)
    results = result.all()

    data = []

    for month, revenue in results:
        data.append(
            {
                "month": int(month),
                "revenue": revenue,
            }
        )

    return data


# -------------------------
# Export Payments CSV
# -------------------------


@router.get("/export")
async def export_payments(db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Payment))
    payments = result.scalars().all()

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
        headers={"Content-Disposition": "attachment; filename=payments.csv"},
    )
