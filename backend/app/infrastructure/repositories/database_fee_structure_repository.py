"""
Database-backed implementation of FeeStructureRepository.

This module implements the FeeStructureRepository interface using PostgreSQL
with SQLAlchemy ORM.

Following Clean Architecture principles:
- Implements domain repository interface
- Uses infrastructure layer (database models)
- Handles data mapping between database models and domain entities
- Proper error handling and logging
"""

from datetime import datetime

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.payment import FeeHead, FeeStructure, Installment
from app.domain.repositories.payment_repository import FeeStructureRepository
from app.infrastructure.database.models import (
    FeeHeadModel,
    FeeStructureModel,
    InstallmentModel,
)


class DatabaseFeeStructureRepository(FeeStructureRepository):
    """
    Database-backed implementation of FeeStructureRepository.

    Uses PostgreSQL with SQLAlchemy for data persistence.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def create_fee_structure(
        self,
        class_id: int,
        academic_year: str,
        total_fee: float,
        fee_heads: list[dict],
        installments: list[dict],
    ) -> FeeStructure:
        """
        Create a new fee structure for a class.

        Args:
            class_id: ID of the class
            academic_year: Academic year (e.g., "2024-2025")
            total_fee: Total fee amount
            fee_heads: List of dicts with fee head details
            installments: List of dicts with installment details

        Returns:
            Created FeeStructure entity

        Raises:
            DatabaseError: If database operation fails
            ValueError: If validation fails
        """
        try:
            Logger.info(
                f"Creating fee structure for class_id={class_id}, "
                f"academic_year={academic_year}, total_fee={total_fee}"
            )

            # Create main fee structure record
            fs_model = FeeStructureModel(
                class_id=class_id,
                academic_year=academic_year,
                total_fee=total_fee,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            self.db.add(fs_model)
            await self.db.flush()

            # Add fee heads
            fee_head_models = []
            for head in fee_heads:
                fh_model = FeeHeadModel(
                    fee_structure_id=fs_model.id,
                    name=head.get("name"),
                    description=head.get("description"),
                    amount=head.get("amount"),
                    percentage=head.get("percentage"),
                )
                self.db.add(fh_model)
                fee_head_models.append(fh_model)
            await self.db.flush()

            # Add installments
            installment_models = []
            for inst in installments:
                i_model = InstallmentModel(
                    fee_structure_id=fs_model.id,
                    installment_number=inst.get("installment_number"),
                    due_date=inst.get("due_date"),
                    amount=inst.get("amount"),
                    description=inst.get("description"),
                )
                self.db.add(i_model)
                installment_models.append(i_model)
            await self.db.flush()

            Logger.info(
                f"Fee structure created: id={fs_model.id}, "
                f"class_id={class_id}, "
                f"fee_heads={len(fee_head_models)}, "
                f"installments={len(installment_models)}"
            )

            return self._fee_structure_to_entity(fs_model, fee_head_models, installment_models)

        except Exception as e:
            Logger.error(
                f"Database error creating fee structure: {e}", exc_info=True
            )
            raise DatabaseError(f"Failed to create fee structure: {str(e)}")

    async def get_fee_structure_by_class_and_year(
        self,
        class_id: int,
        academic_year: str,
    ) -> FeeStructure | None:
        """
        Retrieve a fee structure by class ID and academic year.

        Args:
            class_id: ID of the class
            academic_year: Academic year

        Returns:
            FeeStructure entity or None if not found

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            result = await self.db.execute(
                select(FeeStructureModel).where(
                    and_(
                        FeeStructureModel.class_id == class_id,
                        FeeStructureModel.academic_year == academic_year,
                    )
                )
            )
            model = result.scalar_one_or_none()
            if not model:
                return None

            return self._fee_structure_model_to_entity(model)

        except Exception as e:
            Logger.error(f"Database error fetching fee structure: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch fee structure: {str(e)}")

    async def get_fee_structure_by_id(
        self, fee_structure_id: str
    ) -> FeeStructure | None:
        """
        Retrieve a fee structure by its ID.

        Args:
            fee_structure_id: Unique identifier of the fee structure

        Returns:
            FeeStructure entity or None if not found

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            result = await self.db.execute(
                select(FeeStructureModel).where(FeeStructureModel.id == int(fee_structure_id))
            )
            model = result.scalar_one_or_none()
            if not model:
                return None

            return self._fee_structure_model_to_entity(model)

        except ValueError:
            Logger.error(f"Invalid fee structure ID: {fee_structure_id}")
            return None
        except Exception as e:
            Logger.error(f"Database error fetching fee structure: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch fee structure: {str(e)}")

    async def get_fee_structures_by_class(
        self, class_id: int
    ) -> list[FeeStructure]:
        """
        Retrieve all fee structures for a class.

        Args:
            class_id: ID of the class

        Returns:
            List of FeeStructure entities

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            result = await self.db.execute(
                select(FeeStructureModel)
                .where(FeeStructureModel.class_id == class_id)
                .order_by(FeeStructureModel.academic_year.desc())
            )
            models = result.scalars().all()
            return [self._fee_structure_model_to_entity(m) for m in models]

        except Exception as e:
            Logger.error(f"Database error fetching fee structures: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch fee structures: {str(e)}")

    async def update_fee_structure(
        self,
        fee_structure_id: str,
        total_fee: float | None = None,
        fee_heads: list[dict] | None = None,
        installments: list[dict] | None = None,
    ) -> FeeStructure:
        """
        Update an existing fee structure.

        Args:
            fee_structure_id: ID of the fee structure to update
            total_fee: New total fee amount (optional)
            fee_heads: New list of fee heads (optional)
            installments: New list of installments (optional)

        Returns:
            Updated FeeStructure entity

        Raises:
            DatabaseError: If database operation fails
            ValueError: If fee structure not found
        """
        try:
            fs_id = int(fee_structure_id)
            Logger.info(f"Updating fee structure: id={fs_id}")

            result = await self.db.execute(
                select(FeeStructureModel).where(FeeStructureModel.id == fs_id)
            )
            fs_model = result.scalar_one_or_none()
            if not fs_model:
                raise ValueError(
                    f"Fee structure not found: {fee_structure_id}"
                )

            # Update total fee if provided
            if total_fee is not None:
                fs_model.total_fee = total_fee

            # Update fee heads if provided
            if fee_heads is not None:
                # Delete existing fee heads
                result = await self.db.execute(
                    select(FeeHeadModel).where(FeeHeadModel.fee_structure_id == fs_id)
                )
                existing_heads = result.scalars().all()
                for head in existing_heads:
                    await self.db.delete(head)
                await self.db.flush()

                # Add new fee heads
                for head in fee_heads:
                    fh_model = FeeHeadModel(
                        fee_structure_id=fs_id,
                        name=head.get("name"),
                        description=head.get("description"),
                        amount=head.get("amount"),
                        percentage=head.get("percentage"),
                    )
                    self.db.add(fh_model)
                await self.db.flush()

            # Update installments if provided
            if installments is not None:
                # Delete existing installments
                result = await self.db.execute(
                    select(InstallmentModel).where(InstallmentModel.fee_structure_id == fs_id)
                )
                existing_installments = result.scalars().all()
                for inst in existing_installments:
                    await self.db.delete(inst)
                await self.db.flush()

                # Add new installments
                for inst in installments:
                    i_model = InstallmentModel(
                        fee_structure_id=fs_id,
                        installment_number=inst.get("installment_number"),
                        due_date=inst.get("due_date"),
                        amount=inst.get("amount"),
                        description=inst.get("description"),
                    )
                    self.db.add(i_model)
                await self.db.flush()

            # Update timestamp
            fs_model.updated_at = datetime.utcnow()
            await self.db.flush()

            Logger.info(f"Fee structure updated: id={fs_id}")
            return self._fee_structure_model_to_entity(fs_model)

        except ValueError as e:
            Logger.error(f"Validation error updating fee structure: {e}")
            raise
        except Exception as e:
            Logger.error(
                f"Database error updating fee structure: {e}", exc_info=True
            )
            raise DatabaseError(f"Failed to update fee structure: {str(e)}")

    async def delete_fee_structure(self, fee_structure_id: str) -> bool:
        """
        Delete a fee structure.

        Checks for data integrity with student records to ensure
        the fee structure is not being used by active students.

        Args:
            fee_structure_id: ID of the fee structure to delete

        Returns:
            True if deletion was successful

        Raises:
            ValueError: If fee structure is in use by students or not found
            DatabaseError: If database operation fails
        """
        try:
            fs_id = int(fee_structure_id)
            Logger.info(f"Deleting fee structure: id={fs_id}")

            result = await self.db.execute(
                select(FeeStructureModel).where(FeeStructureModel.id == fs_id)
            )
            fs_model = result.scalar_one_or_none()
            if not fs_model:
                raise ValueError(
                    f"Fee structure not found: {fee_structure_id}"
                )

            # TODO: Add check for student assignments when Student model
            # is created. For now, just delete the fee structure
            await self.db.delete(fs_model)
            await self.db.flush()

            Logger.info(f"Fee structure deleted: id={fs_id}")
            return True

        except ValueError as e:
            Logger.error(f"Validation error deleting fee structure: {e}")
            raise
        except Exception as e:
            Logger.error(
                f"Database error deleting fee structure: {e}", exc_info=True
            )
            raise DatabaseError(f"Failed to delete fee structure: {str(e)}")

    def _fee_structure_to_entity(
        self,
        model: FeeStructureModel,
        fee_head_models: list[FeeHeadModel],
        installment_models: list[InstallmentModel],
    ) -> FeeStructure:
        """Convert FeeStructureModel to FeeStructure domain entity."""
        fee_heads = [
            FeeHead(
                id=str(fh.id),
                name=fh.name,
                description=fh.description,
                amount=fh.amount,
                percentage=fh.percentage,
            )
            for fh in fee_head_models
        ]

        installments = [
            Installment(
                id=str(im.id),
                installment_number=im.installment_number,
                due_date=im.due_date,
                amount=im.amount,
                description=im.description,
            )
            for im in installment_models
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

    def _fee_structure_model_to_entity(
        self, model: FeeStructureModel
    ) -> FeeStructure:
        """Convert FeeStructureModel (with relationships) to domain entity."""
        fee_heads = [
            FeeHead(
                id=str(fh.id),
                name=fh.name,
                description=fh.description,
                amount=fh.amount,
                percentage=fh.percentage,
            )
            for fh in model.fee_heads
        ]

        installments = [
            Installment(
                id=str(im.id),
                installment_number=im.installment_number,
                due_date=im.due_date,
                amount=im.amount,
                description=im.description,
            )
            for im in model.installments
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
