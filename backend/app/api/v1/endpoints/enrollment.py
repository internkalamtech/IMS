"""
Student and Parent enrollment endpoints.

Provides API endpoints for creating students with parent links and
retrieving parent fee monitoring data.
"""

from typing import List

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import (
    CreateStudentWithParentRequest,
    CreateStudentWithParentResponse,
    StudentResponse,
    ParentResponse,
    ErrorResponse,
    ParentFeeLedgerResponse,
    FeeMonitoringResponse,
    FeeLedgerEntryResponse,
)
from app.api.dependencies import get_current_user
from app.core.errors import ValidationError, DatabaseError, NotFoundError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.usecases.enrollment_usecases import (
    CreateStudentWithParentUseCase,
    GetParentFeeMonitoringUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_enrollment_repository import (
    DatabaseEnrollmentRepository,
    DatabaseParentRepository,
)
from app.infrastructure.repositories.database_payment_repository import (
    DatabasePaymentRepository,
)

router = APIRouter(prefix="/enrollment", tags=["Enrollment"])


@router.post(
    "/students/with-parent",
    response_model=CreateStudentWithParentResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        409: {"model": ErrorResponse, "description": "Conflict - duplicate student/parent"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Create Student with Parent Link",
    description=(
        "Create a new Student user and link to a Parent profile in a single transaction. "
        "Validates both student and parent information, ensures unique constraints, "
        "and establishes the relationship between entities."
    ),
)
async def create_student_with_parent(
    request: CreateStudentWithParentRequest,
    db: AsyncSession = Depends(get_db),
) -> CreateStudentWithParentResponse:
    """
    Create a student with parent link endpoint.

    Creates a new student and links to a parent (new or existing) in a single transaction.
    Validates:
    - Student basic info (Name, Roll Number)
    - Student class enrollment (Class ID must exist)
    - Parent info (Name, Phone, Email)
    - Uniqueness constraints (Roll Number, Email)

    Args:
        request: Request containing student and parent data
        db: Database session (injected)

    Returns:
        CreateStudentWithParentResponse with created student and parent data

    Raises:
        HTTPException 400: If validation fails
        HTTPException 409: If duplicate student roll number or parent email
        HTTPException 500: If internal server error occurs
    """
    try:
        Logger.info(
            f"Create student request: {request.student.name}, "
            f"Parent: {request.parent.name}"
        )

        # Initialize repositories
        enrollment_repo = DatabaseEnrollmentRepository(db)
        parent_repo = DatabaseParentRepository(db)

        # Create and execute use case
        use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)
        student, parent = await use_case.execute(
            student_name=request.student.name,
            student_roll_number=request.student.roll_number,
            class_id=request.student.class_id,
            class_name=request.student.class_name,
            parent_name=request.parent.name,
            parent_phone=request.parent.phone,
            parent_email=request.parent.email,
            parent_relationship_type=request.parent.relationship_type,
            link_existing_parent=request.link_existing_parent,
        )

        # Commit the transaction
        await db.commit()

        Logger.info(
            f"Successfully created student {student.id} "
            f"with parent {parent.id}"
        )

        # Build and return response
        return CreateStudentWithParentResponse(
            student=StudentResponse(
                id=student.id,
                name=student.name,
                roll_number=student.roll_number,
                class_id=request.student.class_id,
                class_name=student.class_name,
                next_due_date=student.next_due_date,
                created_at=student.created_at,
                updated_at=student.updated_at,
            ),
            parent=ParentResponse(
                id=parent.id,
                name=parent.name,
                phone=parent.phone,
                email=parent.email,
                relationship_type=parent.relationship_type,
                is_active=parent.is_active,
                created_at=parent.created_at,
                updated_at=parent.updated_at,
            ),
            message="Student and parent created successfully with link established",
        )

    except ValidationError as e:
        Logger.warning(f"Validation error in create student: {str(e)}")

        # Determine if it's a conflict (409) or bad request (400)
        error_msg = str(e).lower()
        status_code = (
            status.HTTP_409_CONFLICT
            if any(
                keyword in error_msg
                for keyword in [
                    "already exists",
                    "duplicate",
                    "conflict",
                    "link already exists",
                ]
            )
            else status.HTTP_400_BAD_REQUEST
        )

        await db.rollback()
        raise HTTPException(
            status_code=status_code,
            detail=str(e),
        )

    except DatabaseError as e:
        Logger.error(f"Database error in create student: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process request. Please try again later.",
        )

    except Exception as e:
        Logger.error(f"Unexpected error in create student: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later.",
        )


@router.get(
    "/parents/{parent_id}/fee-monitoring",
    response_model=ParentFeeLedgerResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Parent not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get parent fee monitoring data",
    description=(
        "Retrieve detailed fee monitoring and ledger data for all children "
        "linked to a parent, including fee breakdowns, payment status, and "
        "complete payment history for each child."
    ),
)
async def get_parent_fee_monitoring(
    parent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ParentFeeLedgerResponse:
    """
    Get fee monitoring data for a parent's children.

    Retrieves:
    - Parent information
    - All children linked to the parent
    - For each child: complete fee and payment information
      including fee breakdowns, balances, and payment history

    Args:
        parent_id: ID of the parent
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        ParentFeeLedgerResponse with parent and children fee data

    Raises:
        HTTPException 403: If the user is not an admin or the parent themselves
        HTTPException 404: If parent is not found
        HTTPException 500: If an unexpected error occurs
    """
    # Only admins or the parent themselves may access this data.
    # current_user.id is the string form of users.id; cast to int for comparison.
    if current_user.role != "admin":
        if current_user.role != "parent" or int(current_user.id) != parent_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted to admin or the parent account owner.",
            )

    try:
        Logger.info(
            f"Fetching fee monitoring for parent={parent_id} "
            f"by user={current_user.id}"
        )

        # Initialize repositories
        parent_repo = DatabaseParentRepository(db)
        payment_repo = DatabasePaymentRepository(db)

        # Create and execute use case
        use_case = GetParentFeeMonitoringUseCase(parent_repo, payment_repo)
        parent, children_data = await use_case.execute(parent_id)

        # Calculate totals
        total_collectible = 0.0
        total_collected = 0.0
        total_pending = 0.0
        total_balance = 0.0

        # Build children fee monitoring data
        children_fees = []
        for student, fee_structures_with_payments in children_data:
            for fee_structure, payments in fee_structures_with_payments:
                # Determine fee status based on balance
                if fee_structure.balance <= 0:
                    fee_status = "Paid"
                elif fee_structure.amount_paid == 0:
                    fee_status = "Pending"
                else:
                    fee_status = "Partial"

                # Build ledger entries
                ledger_entries = [
                    FeeLedgerEntryResponse(
                        id=p.id,
                        receipt_number=p.receipt_number,
                        amount=p.amount,
                        payment_mode=p.payment_mode,
                        status=p.status,
                        payment_date=p.payment_date,
                        reference_number=p.reference_number,
                        remarks=p.remarks,
                    )
                    for p in payments
                ]

                # Build fee monitoring entry
                fee_monitoring = FeeMonitoringResponse(
                    student_id=student.id,
                    student_name=student.name,
                    roll_number=student.roll_number,
                    class_name=student.class_name,
                    fee_id=fee_structure.id,
                    fee_type=fee_structure.fee_type,
                    academic_year=fee_structure.academic_year,
                    total_fee=fee_structure.total_fee,
                    amount_paid=fee_structure.amount_paid,
                    balance=fee_structure.balance,
                    next_due_date=student.next_due_date,
                    fee_status=fee_status,
                    ledger=ledger_entries,
                )
                children_fees.append(fee_monitoring)

                # Accumulate totals
                total_collectible += fee_structure.total_fee
                total_collected += fee_structure.amount_paid
                total_balance += fee_structure.balance

            total_pending = total_collectible - total_collected

        # Build and return response
        return ParentFeeLedgerResponse(
            parent_id=parent.id,
            parent_name=parent.name,
            total_collectible=total_collectible,
            total_collected=total_collected,
            total_pending=total_pending,
            total_balance=total_balance,
            children_fees=children_fees,
        )

    except NotFoundError as exc:
        Logger.warning(f"Parent not found: {exc}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except DatabaseError as e:
        Logger.error(f"Database error in get parent fee monitoring: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve fee monitoring data. Please try again later.",
        )
    except Exception as e:
        Logger.error(
            f"Unexpected error in get parent fee monitoring: {str(e)}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later.",
        )
