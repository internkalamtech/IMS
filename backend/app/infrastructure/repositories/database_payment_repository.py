"""
Database-backed implementation of PaymentRepository.

Implements the PaymentRepository interface using PostgreSQL
with SQLAlchemy ORM.
"""

from typing import List, Optional

from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.payment import FeeStructureEntity, PaymentEntity
from app.domain.repositories.payment_repository import PaymentRepository
from app.infrastructure.database.models import FeeStructure, Payment


class DatabasePaymentRepository(PaymentRepository):
    """
    Database-backed implementation of PaymentRepository.

    Uses PostgreSQL with SQLAlchemy for data persistence.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_payment(self, payment: PaymentEntity) -> PaymentEntity:
        try:
            new_payment = Payment(
                student_id=payment.student_id,
                student_name=payment.student_name,
                roll_number=payment.roll_number,
                student_class=payment.student_class,
                amount=payment.amount,
                payment_mode=payment.payment_mode,
                reference_number=payment.reference_number,
                receipt_number=payment.receipt_number,
                status=payment.status,
            )
            self.db.add(new_payment)
            await self.db.commit()
            await self.db.refresh(new_payment)
            return self._to_entity(new_payment)
        except Exception as e:
            Logger.error(
                f"Error creating payment: {e}", exc_info=True
            )
            raise DatabaseError(f"Failed to create payment: {str(e)}")

    async def get_payment_by_id(
        self, payment_id: int
    ) -> Optional[PaymentEntity]:
        try:
            result = await self.db.execute(
                select(Payment).where(Payment.id == payment_id)
            )
            payment = result.scalar_one_or_none()
            return self._to_entity(payment) if payment else None
        except Exception as e:
            Logger.error(
                f"Error fetching payment {payment_id}: {e}", exc_info=True
            )
            raise DatabaseError(f"Failed to fetch payment: {str(e)}")

    async def update_payment_status(
        self, payment_id: int, status: str
    ) -> Optional[PaymentEntity]:
        try:
            result = await self.db.execute(
                select(Payment).where(Payment.id == payment_id)
            )
            payment = result.scalar_one_or_none()
            if not payment:
                return None
            payment.status = status
            await self.db.commit()
            await self.db.refresh(payment)
            return self._to_entity(payment)
        except Exception as e:
            Logger.error(
                f"Error updating payment status: {e}", exc_info=True
            )
            raise DatabaseError(
                f"Failed to update payment status: {str(e)}"
            )

    async def list_payments(
        self,
        name: Optional[str] = None,
        roll_number: Optional[str] = None,
        student_class: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[PaymentEntity]:
        try:
            query = select(Payment)
            if name:
                query = query.where(
                    Payment.student_name.ilike(f"%{name}%")
                )
            if roll_number:
                query = query.where(Payment.roll_number == roll_number)
            if student_class:
                query = query.where(
                    Payment.student_class == student_class
                )
            if status:
                query = query.where(Payment.status == status)
            result = await self.db.execute(
                query.offset(skip).limit(limit)
            )
            return [self._to_entity(p) for p in result.scalars().all()]
        except Exception as e:
            Logger.error(
                f"Error listing payments: {e}", exc_info=True
            )
            raise DatabaseError(f"Failed to list payments: {str(e)}")

    async def get_payments_by_student(
        self, student_id: int
    ) -> List[PaymentEntity]:
        try:
            result = await self.db.execute(
                select(Payment).where(Payment.student_id == student_id)
            )
            return [self._to_entity(p) for p in result.scalars().all()]
        except Exception as e:
            Logger.error(
                f"Error fetching student payments: {e}", exc_info=True
            )
            raise DatabaseError(
                f"Failed to fetch student payments: {str(e)}"
            )

    async def get_fee_structure(
        self, student_class: str
    ) -> Optional[FeeStructureEntity]:
        try:
            result = await self.db.execute(
                select(FeeStructure).where(
                    FeeStructure.student_class == student_class
                )
            )
            fee = result.scalar_one_or_none()
            if not fee:
                return None
            return FeeStructureEntity(
                id=fee.id,
                student_class=fee.student_class,
                fee_amount=fee.fee_amount,
            )
        except Exception as e:
            Logger.error(
                f"Error fetching fee structure: {e}", exc_info=True
            )
            raise DatabaseError(
                f"Failed to fetch fee structure: {str(e)}"
            )

    async def get_total_collected(self) -> float:
        try:
            result = await self.db.execute(
                select(func.sum(Payment.amount))
            )
            return result.scalar() or 0.0
        except Exception as e:
            Logger.error(
                f"Error fetching total collected: {e}", exc_info=True
            )
            raise DatabaseError(
                f"Failed to fetch total collected: {str(e)}"
            )

    async def get_class_student_counts(self) -> List[tuple]:
        try:
            stmt = select(
                Payment.student_class,
                func.count(func.distinct(Payment.student_id)),
            ).group_by(Payment.student_class)
            result = await self.db.execute(stmt)
            return result.all()
        except Exception as e:
            Logger.error(
                f"Error fetching class counts: {e}", exc_info=True
            )
            raise DatabaseError(
                f"Failed to fetch class counts: {str(e)}"
            )

    async def get_distinct_students_paid_count(self) -> int:
        try:
            result = await self.db.execute(
                select(func.count(func.distinct(Payment.student_id)))
            )
            return result.scalar() or 0
        except Exception as e:
            Logger.error(
                f"Error fetching student count: {e}", exc_info=True
            )
            raise DatabaseError(
                f"Failed to fetch student count: {str(e)}"
            )

    async def get_monthly_revenue(self) -> List[dict]:
        try:
            stmt = select(
                extract("month", Payment.created_at).label("month"),
                func.sum(Payment.amount),
            ).group_by("month")
            result = await self.db.execute(stmt)
            return [
                {"month": int(month), "revenue": revenue}
                for month, revenue in result.all()
            ]
        except Exception as e:
            Logger.error(
                f"Error fetching monthly revenue: {e}", exc_info=True
            )
            raise DatabaseError(
                f"Failed to fetch monthly revenue: {str(e)}"
            )

    async def get_all_payments_chunked(
        self, offset: int, limit: int
    ) -> List[PaymentEntity]:
        try:
            result = await self.db.execute(
                select(Payment).offset(offset).limit(limit)
            )
            return [self._to_entity(p) for p in result.scalars().all()]
        except Exception as e:
            Logger.error(
                f"Error fetching payments chunk: {e}", exc_info=True
            )
            raise DatabaseError(
                f"Failed to fetch payments chunk: {str(e)}"
            )

    def _to_entity(self, model: Payment) -> PaymentEntity:
        return PaymentEntity(
            id=model.id,
            student_id=model.student_id,
            student_name=model.student_name,
            roll_number=model.roll_number,
            student_class=model.student_class,
            amount=model.amount,
            payment_mode=model.payment_mode,
            reference_number=model.reference_number,
            receipt_number=model.receipt_number,
            status=model.status,
            created_at=model.created_at,
        )
