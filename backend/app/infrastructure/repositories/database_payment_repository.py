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
    FeeDashboard,
    FeeHead,
    FeeStructure,
    Installment,
    LedgerEntry,
    Payment,
    PaymentStatus,
    PaymentSummary,
    Student,
)
from app.domain.repositories.payment_repository import PaymentRepository
from app.infrastructure.database.models import (
    FeeHeadModel,
    FeeStructureModel,
    InstallmentModel,
    PaymentModel,
    StudentLedgerModel,
    StudentModel,
)


class DatabasePaymentRepository(PaymentRepository):
    """
    PostgreSQL-backed implementation of PaymentRepository.

    All public methods delegate to async SQLAlchemy queries and map
    database model objects to domain entities before returning.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialise repository with a database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #

    @staticmethod
    def _student_to_entity(model: StudentModel) -> Student:
        """Map a StudentModel ORM object to a Student domain entity."""
        return Student(
            id=model.id,
            name=model.name,
            roll_number=model.roll_number,
            class_name=model.class_name,
            next_due_date=model.next_due_date,
        )

    @staticmethod
    def _fee_structure_to_entity(model: FeeStructureModel) -> FeeStructure:
        """Map a FeeStructureModel ORM object to a FeeStructure domain entity."""
        fee_heads = [
            FeeHead(
                id=str(fh.id),
                name=fh.name,
                description=fh.description,
                amount=fh.amount,
                percentage=fh.percentage,
            )
            for fh in (model.fee_heads or [])
        ]
        installments = [
            Installment(
                id=str(inst.id),
                installment_number=inst.installment_number,
                due_date=inst.due_date,
                amount=inst.amount,
                description=inst.description,
            )
            for inst in (model.installments or [])
        ]
        return FeeStructure(
            id=str(model.id),
            class_id=model.class_id,
            academic_year=model.academic_year,
            total_fee=model.total_fee,
            fee_heads=fee_heads,
            installments=installments,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _payment_to_entity(model: PaymentModel) -> Payment:
        """Map a PaymentModel ORM object to a Payment domain entity."""
        return Payment(
            id=model.id,
            student_id=model.student_id,
            fee_structure_id=model.fee_structure_id or 0,
            receipt_number=model.receipt_number,
            amount=model.amount,
            payment_mode=model.payment_mode,  # type: ignore[arg-type]
            status=model.status,  # type: ignore[arg-type]
            payment_date=model.payment_date,
            reference_number=model.reference_number,
            remarks=model.remarks,
        )

    @staticmethod
    def _ledger_to_entity(model: StudentLedgerModel) -> LedgerEntry:
        """Convert StudentLedgerModel to LedgerEntry domain entity."""
        return LedgerEntry(
            id=str(model.id),
            student_id=model.student_id,
            debit=model.debit,
            credit=model.credit,
            balance=model.balance,
            description=model.description,
            transaction_date=model.transaction_date,
        )

    # ------------------------------------------------------------------ #
    # Student operations
    # ------------------------------------------------------------------ #

    async def get_student_by_id(self, student_id: int) -> Optional[Student]:
        """
        Retrieve a student by ID.

        Args:
            student_id: Primary key of the student

        Returns:
            Student entity or None if not found
        """
        try:
            result = await self.db.execute(
                select(StudentModel).where(StudentModel.id == student_id)
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
        """
        List students with optional filters.

        Args:
            name: Partial name filter (case-insensitive LIKE)
            roll_number: Exact roll number filter
            class_name: Exact class name filter
            status: Payment status filter

        Returns:
            List of Student entities
        """
        try:
            if status:
                # Subquery 1: latest payment_date per student
                latest_date_subq = (
                    select(
                        PaymentModel.student_id,
                        func.max(PaymentModel.payment_date).label("max_date"),
                    )
                    .group_by(PaymentModel.student_id)
                    .subquery()
                )
                # Subquery 2: status of that latest payment per student
                latest_payment_subq = (
                    select(
                        PaymentModel.student_id.label("student_id"),
                        PaymentModel.status.label("latest_status"),
                    )
                    .join(
                        latest_date_subq,
                        (PaymentModel.student_id == latest_date_subq.c.student_id)
                        & (PaymentModel.payment_date == latest_date_subq.c.max_date),
                    )
                    .subquery()
                )
                query = (
                    select(StudentModel)
                    .join(
                        latest_payment_subq,
                        StudentModel.id == latest_payment_subq.c.student_id,
                    )
                    .where(latest_payment_subq.c.latest_status == status)
                )
            else:
                query = select(StudentModel)

            if name:
                query = query.where(StudentModel.name.ilike(f"%{name}%"))
            if roll_number:
                query = query.where(StudentModel.roll_number == roll_number)
            if class_name:
                query = query.where(StudentModel.class_name == class_name)

            result = await self.db.execute(query)
            return [self._student_to_entity(m) for m in result.scalars().all()]
        except DatabaseError:
            raise
        except Exception as exc:
            Logger.error(f"Error listing students: {exc}")
            raise DatabaseError("Failed to list students.") from exc

    async def update_student_next_due_date(
        self, student_id: int, next_due_date: Optional[datetime]
    ) -> None:
        """
        Update the next_due_date field of a student record.

        Args:
            student_id: Primary key of the student
            next_due_date: New next due date, or None to clear it
        """
        try:
            result = await self.db.execute(
                select(StudentModel).where(StudentModel.id == student_id)
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

    # ------------------------------------------------------------------ #
    # Fee structure operations
    # ------------------------------------------------------------------ #

    async def get_fee_structure_by_id(
        self, fee_structure_id: int
    ) -> Optional[FeeStructure]:
        """
        Retrieve a fee structure by ID.

        Args:
            fee_structure_id: Primary key of the fee structure

        Returns:
            FeeStructure entity or None if not found
        """
        try:
            result = await self.db.execute(
                select(FeeStructureModel).where(
                    FeeStructureModel.id == fee_structure_id
                )
            )
            model = result.scalar_one_or_none()
            return self._fee_structure_to_entity(model) if model else None
        except Exception as exc:
            Logger.error(
                f"Error fetching fee structure {fee_structure_id}: {exc}"
            )
            raise DatabaseError("Failed to retrieve fee structure.") from exc

    # ------------------------------------------------------------------ #
    # Payment operations
    # ------------------------------------------------------------------ #

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
        """
        Persist a new payment transaction to the database.

        Args:
            student_id: ID of the student
            fee_structure_id: ID of the fee structure
            receipt_number: Unique formatted receipt number
            amount: Payment amount
            payment_mode: Mode of payment (Cash, UPI, Card)
            status: Payment status (Paid, Partial, etc.)
            reference_number: Optional UPI/Card reference
            remarks: Optional free-text remarks

        Returns:
            Created Payment entity
        """
        try:
            model = PaymentModel(
                student_id=student_id,
                fee_structure_id=fee_structure_id if fee_structure_id else None,
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

    async def get_payment_by_id(self, payment_id: int) -> Optional[Payment]:
        """
        Retrieve a payment by its primary key.

        Args:
            payment_id: Primary key of the payment

        Returns:
            Payment entity or None if not found
        """
        try:
            result = await self.db.execute(
                select(PaymentModel).where(PaymentModel.id == payment_id)
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
        """
        List payments with optional filters and pagination.

        Args:
            student_id: Filter by student ID
            status: Filter by payment status
            skip: Pagination offset
            limit: Maximum records to return

        Returns:
            List of Payment entities
        """
        try:
            query = select(PaymentModel).order_by(
                PaymentModel.payment_date.desc()
            )
            if student_id is not None:
                query = query.where(PaymentModel.student_id == student_id)
            if status:
                query = query.where(PaymentModel.status == status)
            query = query.offset(skip).limit(limit)
            result = await self.db.execute(query)
            return [
                self._payment_to_entity(m) for m in result.scalars().all()
            ]
        except Exception as exc:
            Logger.error(f"Error listing payments: {exc}")
            raise DatabaseError("Failed to list payments.") from exc

    async def get_payment_summary(self) -> PaymentSummary:
        """
        Compute aggregated payment statistics from the database.

        Returns:
            PaymentSummary with totals for collectible, collected,
            pending, and overdue amounts
        """
        try:
            # Total collectible = sum of all fee structure total_fee values
            total_collectible_result = await self.db.execute(
                select(func.coalesce(func.sum(FeeStructureModel.total_fee), 0))
            )
            total_collectible: float = total_collectible_result.scalar() or 0.0

            # Total collected = sum of all payments
            total_collected_result = await self.db.execute(
                select(func.coalesce(func.sum(PaymentModel.amount), 0))
            )
            total_collected: float = total_collected_result.scalar() or 0.0

            # Overdue = students whose next_due_date has passed
            overdue_result = await self.db.execute(
                select(
                    func.coalesce(func.sum(PaymentModel.amount), 0)
                )
                .join(
                    StudentModel,
                    PaymentModel.student_id == StudentModel.id,
                )
                .where(
                    StudentModel.next_due_date < datetime.utcnow(),
                    PaymentModel.status == "Partial",
                )
            )
            total_overdue: float = overdue_result.scalar() or 0.0

            total_pending = max(total_collectible - total_collected, 0.0)

            return PaymentSummary(
                total_collectible=total_collectible,
                total_collected=total_collected,
                total_pending=total_pending,
                total_overdue=total_overdue,
            )
        except Exception as exc:
            Logger.error(f"Error computing payment summary: {exc}")
            raise DatabaseError("Failed to compute payment summary.") from exc

    async def receipt_number_exists(self, receipt_number: str) -> bool:
        """
        Check whether a receipt number is already in use.

        Args:
            receipt_number: Receipt number to check

        Returns:
            True if the number already exists, False otherwise
        """
        try:
            result = await self.db.execute(
                select(PaymentModel.id).where(
                    PaymentModel.receipt_number == receipt_number
                )
            )
            return result.scalar_one_or_none() is not None
        except Exception as exc:
            Logger.error(
                f"Error checking receipt number existence: {exc}"
            )
            raise DatabaseError(
                "Failed to check receipt number."
            ) from exc

    async def get_student_ledger(self, student_id: int) -> List[LedgerEntry]:
        """
        Retrieve the full fee ledger for a student.

        Args:
            student_id: ID of the student

        Returns:
            List of LedgerEntry entities ordered by date
        """
        try:
            result = await self.db.execute(
                select(StudentLedgerModel)
                .where(StudentLedgerModel.student_id == student_id)
                .order_by(StudentLedgerModel.transaction_date.asc())
            )
            entries = result.scalars().all()
            return [self._ledger_to_entity(e) for e in entries]
        except Exception as exc:
            Logger.error(f"Database error fetching ledger: {exc}", exc_info=True)
            raise DatabaseError(f"Failed to fetch student ledger: {str(exc)}")

    async def get_fee_dashboard(self) -> FeeDashboard:
        """
        Retrieve aggregated fee collection statistics.

        Returns:
            FeeDashboard entity with summary statistics
        """
        try:
            # Total amount collected from payment records
            collected_result = await self.db.execute(
                select(func.coalesce(func.sum(PaymentModel.amount), 0.0))
            )
            total_collected: float = collected_result.scalar_one()

            # Students who have made at least one payment
            paid_result = await self.db.execute(
                select(func.count(func.distinct(PaymentModel.student_id)))
            )
            students_paid: int = paid_result.scalar_one()

            # Latest ledger row per student, using id as a deterministic tie-breaker
            latest_ledger_subquery = (
                select(
                    StudentLedgerModel.student_id.label("student_id"),
                    StudentLedgerModel.balance.label("balance"),
                    func.row_number()
                    .over(
                        partition_by=StudentLedgerModel.student_id,
                        order_by=(
                            StudentLedgerModel.transaction_date.desc(),
                            StudentLedgerModel.id.desc(),
                        ),
                    )
                    .label("row_num"),
                )
            ).subquery()

            # Students whose latest ledger balance is still positive
            pending_result = await self.db.execute(
                select(func.count())
                .select_from(latest_ledger_subquery)
                .where(
                    latest_ledger_subquery.c.row_num == 1,
                    latest_ledger_subquery.c.balance > 0,
                )
            )
            students_pending: int = pending_result.scalar_one()

            # Total pending from latest outstanding balances only
            pending_amount_result = await self.db.execute(
                select(func.coalesce(func.sum(latest_ledger_subquery.c.balance), 0.0))
                .select_from(latest_ledger_subquery)
                .where(
                    latest_ledger_subquery.c.row_num == 1,
                    latest_ledger_subquery.c.balance > 0,
                )
            )
            total_pending: float = pending_amount_result.scalar_one()

            return FeeDashboard(
                total_collected=total_collected,
                total_pending=total_pending,
                students_paid=students_paid,
                students_pending=students_pending,
            )

        except Exception as exc:
            Logger.error(f"Database error fetching fee dashboard: {exc}", exc_info=True)
            raise DatabaseError(f"Failed to fetch fee dashboard: {str(exc)}")
