"""
Database-backed implementation of PaymentRepository.

Implements the PaymentRepository interface using SQLAlchemy ORM with
an async PostgreSQL session.
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.payment import (
    FeeStructure,
    Payment,
    PaymentStatus,
    PaymentSummary,
    Student,
)
from app.domain.repositories.payment_repository import PaymentRepository
from app.infrastructure.database.models import (
    FeeStructureModel,
    PaymentModel,
    StudentModel,
)


class DatabasePaymentRepository(PaymentRepository):

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ---------------- helpers ---------------- #

    @staticmethod
    def _student_to_entity(model: StudentModel) -> Student:
        return Student(
            id=model.id,
            name=model.name,
            roll_number=model.roll_number,
            class_name=model.class_name,
            next_due_date=model.next_due_date,
        )

    @staticmethod
    def _fee_structure_to_entity(model: FeeStructureModel) -> FeeStructure:
        return FeeStructure(
            id=model.id,
            student_id=model.student_id,
            total_fee=model.total_fee,
            amount_paid=model.amount_paid,
            fee_type=model.fee_type,
            academic_year=model.academic_year,
        )

    @staticmethod
    def _payment_to_entity(model: PaymentModel) -> Payment:
        return Payment(
            id=model.id,
            student_id=model.student_id,
            fee_structure_id=model.fee_structure_id,
            receipt_number=model.receipt_number,
            amount=model.amount,
            payment_mode=model.payment_mode,  # type: ignore[arg-type]
            status=model.status,  # type: ignore[arg-type]
            payment_date=model.payment_date,
            reference_number=model.reference_number,
            remarks=model.remarks,
        )

    # ---------------- students ---------------- #

    async def get_student_by_id(self, student_id: int) -> Optional[Student]:
        try:
            result = await self.db.execute(
                select(StudentModel).where(
                    StudentModel.id == student_id
                )
            )
            model = result.scalar_one_or_none()
            return self._student_to_entity(model) if model else None
        except Exception as exc:
            Logger.error(f"Error fetching student {student_id}: {exc}")
            raise DatabaseError("Failed to retrieve student.") from exc

    async def list_students(
        self,
        name: Optional[str] = None,
        roll_number: Optional[str] = None,
        class_name: Optional[str] = None,
        status: Optional[PaymentStatus] = None,
    ) -> List[Student]:

        try:
            if status:
                latest_date_subq = (
                    select(
                        PaymentModel.student_id,
                        func.max(PaymentModel.payment_date).label("max_date"),
                    )
                    .group_by(PaymentModel.student_id)
                    .subquery()
                )

                latest_payment_subq = (
                    select(
                        PaymentModel.student_id.label("student_id"),
                        PaymentModel.status.label("latest_status"),
                    )
                    .join(
                        latest_date_subq,
                        (
                            PaymentModel.student_id
                            == latest_date_subq.c.student_id
                        )
                        & (
                            PaymentModel.payment_date
                            == latest_date_subq.c.max_date
                        ),
                    )
                    .subquery()
                )

                query = (
                    select(StudentModel)
                    .join(
                        latest_payment_subq,
                        StudentModel.id == latest_payment_subq.c.student_id,
                    )
                    .where(
                        latest_payment_subq.c.latest_status == status
                    )
                )
            else:
                query = select(StudentModel)

            if name:
                query = query.where(
                    StudentModel.name.ilike(f"%{name}%")
                )
            if roll_number:
                query = query.where(
                    StudentModel.roll_number == roll_number
                )
            if class_name:
                query = query.where(
                    StudentModel.class_name == class_name
                )

            result = await self.db.execute(query)

            return [
                self._student_to_entity(m)
                for m in result.scalars().all()
            ]

        except DatabaseError:
            raise
        except Exception as exc:
            Logger.error(f"Error listing students: {exc}")
            raise DatabaseError("Failed to list students.") from exc

    async def update_student_next_due_date(
        self,
        student_id: int,
        next_due_date: Optional[datetime],
    ) -> None:
        try:
            result = await self.db.execute(
                select(StudentModel).where(
                    StudentModel.id == student_id
                )
            )
            model = result.scalar_one_or_none()

            if model:
                model.next_due_date = next_due_date
                await self.db.flush()

        except Exception as exc:
            Logger.error(
                f"Error updating next_due_date for student {student_id}: {exc}"
            )
            raise DatabaseError(
                "Failed to update student next due date."
            ) from exc

    # ---------------- fee structure ---------------- #

    async def get_fee_structure_by_id(
        self, fee_structure_id: int
    ) -> Optional[FeeStructure]:
        try:
            result = await self.db.execute(
                select(FeeStructureModel).where(
                    FeeStructureModel.id == fee_structure_id
                )
            )
            model = result.scalar_one_or_none()
            return (
                self._fee_structure_to_entity(model)
                if model
                else None
            )
        except Exception as exc:
            Logger.error(
                f"Error fetching fee structure {fee_structure_id}: {exc}"
            )
            raise DatabaseError(
                "Failed to retrieve fee structure."
            ) from exc

    async def update_fee_structure_paid(
        self,
        fee_structure_id: int,
        additional_amount: float,
    ) -> FeeStructure:
        try:
            result = await self.db.execute(
                select(FeeStructureModel).where(
                    FeeStructureModel.id == fee_structure_id
                )
            )
            model = result.scalar_one_or_none()

            if model is None:
                raise DatabaseError(
                    f"Fee structure {fee_structure_id} not found."
                )

            model.amount_paid = model.amount_paid + additional_amount
            await self.db.flush()

            return self._fee_structure_to_entity(model)

        except DatabaseError:
            raise
        except Exception as exc:
            Logger.error(
                f"Error updating fee structure {fee_structure_id}: {exc}"
            )
            raise DatabaseError(
                "Failed to update fee structure."
            ) from exc

    # ---------------- payments ---------------- #

    async def create_payment(
        self,
        student_id: int,
        fee_structure_id: int,
        receipt_number: str,
        amount: float,
        payment_mode: str,
        status: str,
        reference_number: Optional[str] = None,
        remarks: Optional[str] = None,
    ) -> Payment:

        try:
            model = PaymentModel(
                student_id=student_id,
                fee_structure_id=fee_structure_id,
                receipt_number=receipt_number,
                amount=amount,
                payment_mode=payment_mode,
                status=status,
                reference_number=reference_number,
                remarks=remarks,
                payment_date=datetime.utcnow(),
            )

            self.db.add(model)
            await self.db.flush()
            await self.db.refresh(model)

            Logger.info(
                f"Payment created: receipt={receipt_number}, "
                f"student={student_id}, amount={amount}"
            )

            return self._payment_to_entity(model)

        except Exception as exc:
            Logger.error(f"Error creating payment: {exc}")
            raise DatabaseError("Failed to create payment.") from exc

    async def get_payment_by_id(
        self, payment_id: int
    ) -> Optional[Payment]:
        try:
            result = await self.db.execute(
                select(PaymentModel).where(
                    PaymentModel.id == payment_id
                )
            )
            model = result.scalar_one_or_none()
            return self._payment_to_entity(model) if model else None
        except Exception as exc:
            Logger.error(f"Error fetching payment {payment_id}: {exc}")
            raise DatabaseError("Failed to retrieve payment.") from exc

    async def list_payments(
        self,
        student_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Payment]:

        try:
            query = select(PaymentModel).order_by(
                PaymentModel.payment_date.desc()
            )

            if student_id is not None:
                query = query.where(
                    PaymentModel.student_id == student_id
                )

            if status:
                query = query.where(
                    PaymentModel.status == status
                )

            query = query.offset(skip).limit(limit)

            result = await self.db.execute(query)

            return [
                self._payment_to_entity(m)
                for m in result.scalars().all()
            ]

        except Exception as exc:
            Logger.error(f"Error listing payments: {exc}")
            raise DatabaseError("Failed to list payments.") from exc

    async def get_payment_summary(self) -> PaymentSummary:
        try:
            total_collectible = (
                await self.db.execute(
                    select(
                        func.coalesce(
                            func.sum(FeeStructureModel.total_fee),
                            0,
                        )
                    )
                )
            ).scalar() or 0.0

            total_collected = (
                await self.db.execute(
                    select(
                        func.coalesce(
                            func.sum(FeeStructureModel.amount_paid),
                            0,
                        )
                    )
                )
            ).scalar() or 0.0

            overdue_result = await self.db.execute(
                select(
                    func.coalesce(
                        func.sum(
                            FeeStructureModel.total_fee
                            - FeeStructureModel.amount_paid
                        ),
                        0,
                    )
                )
                .join(
                    StudentModel,
                    FeeStructureModel.student_id == StudentModel.id,
                )
                .where(
                    StudentModel.next_due_date < datetime.utcnow(),
                    FeeStructureModel.total_fee
                    > FeeStructureModel.amount_paid,
                )
            )

            total_overdue = overdue_result.scalar() or 0.0
            total_pending = total_collectible - total_collected

            return PaymentSummary(
                total_collectible=total_collectible,
                total_collected=total_collected,
                total_pending=max(total_pending, 0.0),
                total_overdue=total_overdue,
            )

        except Exception as exc:
            Logger.error(f"Error computing payment summary: {exc}")
            raise DatabaseError(
                "Failed to compute payment summary."
            ) from exc
