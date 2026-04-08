"""
Database-backed implementation of PaymentRepository.

This module implements the PaymentRepository interface using PostgreSQL
with SQLAlchemy ORM.

Following Clean Architecture principles:
- Implements domain repository interface
- Uses infrastructure layer (database models)
- Handles data mapping between database models and domain entities
- Proper error handling and logging
"""

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.payment import FeeDashboard, LedgerEntry, Payment
from app.domain.repositories.payment_repository import PaymentRepository
from app.infrastructure.database.models import PaymentModel, StudentLedgerModel


class DatabasePaymentRepository(PaymentRepository):
    """
    Database-backed implementation of PaymentRepository.

    Uses PostgreSQL with SQLAlchemy for data persistence.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def create_payment(
        self,
        student_id: int,
        amount: float,
        payment_method: str,
    ) -> Payment:
        """
        Record a new payment transaction and update the student's ledger.

        Args:
            student_id: ID of the student making the payment
            amount: Payment amount
            payment_method: Payment method used

        Returns:
            Created Payment entity

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(
                f"Creating payment for student_id={student_id}, "
                f"amount={amount}, method={payment_method}"
            )

            # Create payment record
            payment_model = PaymentModel(
                student_id=student_id,
                amount=amount,
                payment_method=payment_method,
                payment_date=datetime.utcnow(),
            )
            self.db.add(payment_model)
            await self.db.flush()

            # Compute running balance for the ledger (lock row for concurrency safety)
            result = await self.db.execute(
                select(StudentLedgerModel)
                .where(StudentLedgerModel.student_id == student_id)
                .order_by(
                    StudentLedgerModel.transaction_date.desc(),
                    StudentLedgerModel.id.desc(),
                )
                .limit(1)
                .with_for_update()
            )
            last_entry = result.scalar_one_or_none()
            previous_balance = last_entry.balance if last_entry else 0.0

            new_balance = previous_balance - amount  # credit reduces balance

            # Add ledger entry
            ledger_entry = StudentLedgerModel(
                student_id=student_id,
                debit=0.0,
                credit=amount,
                balance=new_balance,
                description=f"Payment via {payment_method}",
                transaction_date=payment_model.payment_date,
            )
            self.db.add(ledger_entry)
            await self.db.flush()

            Logger.info(f"Payment created: id={payment_model.id}, student_id={student_id}")
            return self._payment_to_entity(payment_model)

        except Exception as e:
            Logger.error(f"Database error creating payment: {e}", exc_info=True)
            raise DatabaseError(f"Failed to create payment: {str(e)}")

    async def get_student_ledger(self, student_id: int) -> list[LedgerEntry]:
        """
        Retrieve the full ledger for a student, ordered by date.

        Args:
            student_id: ID of the student

        Returns:
            List of LedgerEntry entities

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            result = await self.db.execute(
                select(StudentLedgerModel)
                .where(StudentLedgerModel.student_id == student_id)
                .order_by(StudentLedgerModel.transaction_date.asc())
            )
            entries = result.scalars().all()
            return [self._ledger_to_entity(e) for e in entries]

        except Exception as e:
            Logger.error(f"Database error fetching ledger: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch student ledger: {str(e)}")

    async def get_fee_dashboard(self) -> FeeDashboard:
        """
        Retrieve aggregated fee collection statistics.

        Returns:
            FeeDashboard entity with summary statistics

        Raises:
            DatabaseError: If database operation fails
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

        except Exception as e:
            Logger.error(f"Database error fetching fee dashboard: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch fee dashboard: {str(e)}")

    def _payment_to_entity(self, model: PaymentModel) -> Payment:
        """Convert PaymentModel to Payment domain entity."""
        return Payment(
            id=str(model.id),
            student_id=model.student_id,
            amount=model.amount,
            payment_method=model.payment_method,
            payment_date=model.payment_date,
        )

    def _ledger_to_entity(self, model: StudentLedgerModel) -> LedgerEntry:
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
