from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    ChildSummary,
    ContactSubmitRequest,
    ContactSubmitResponse,
    DashboardResponse,
    StatItem,
)
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import StudentProfileModel, UserModel
from app.infrastructure.repositories.database_contact_repository import (
    DatabaseContactRepository,
)
from sqlalchemy import select

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get dashboard statistics",
    description=(
        "Retrieve dashboard statistics based on the "
        "authenticated user's role."
    ),
)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    child_id: int | None = None,
) -> DashboardResponse:
    """
    Get dashboard statistics endpoint.

    Returns statistics relevant to the current user's role.
    """
    role = current_user.role

    stats = []
    role_label = role.capitalize()
    children_payload = None
    selected_child_id = None

    if role in ["admin", "teacher", "transport", "driver"]:
        if role == "admin":
            role_label = "Branch Admin"
            stats = [
                StatItem(label="Total Students", value="1,250"),
                StatItem(label="Faculty Members", value=85),
                StatItem(label="Monthly Revenue", value="₹45k"),
            ]
        elif role == "teacher":
            role_label = "Senior Teacher"
            stats = [
                StatItem(label="Active Classes", value=4),
                StatItem(label="Upcoming Exams", value=2),
                StatItem(label="Pending Gradings", value=12),
            ]
        elif role == "transport":
            role_label = "Transport Staff"
            stats = [
                StatItem(label="Active Routes", value=4),
                StatItem(label="Students Assigned", value=120),
            ]
        elif role == "driver":
            role_label = "Driver"
            stats = [
                StatItem(label="Today's Route", value="Route A"),
                StatItem(label="Students Onboard", value=32),
            ]

    elif role in ["parent", "student"]:
        role_label = role.capitalize() if role != "parent" else "Parent"

        # Load the corresponding database user model and profile
        result = await db.execute(
            select(UserModel).where(UserModel.id == int(current_user.id))
        )
        user_model = result.unique().scalar_one_or_none()

        if not user_model:
            # Fallback to hardcoded values
            return DashboardResponse(
                role=role_label,
                stats=[
                    StatItem(label="Attendance", value="--"),
                    StatItem(label="Avg Marks", value="--"),
                    StatItem(label="Fee Status", value="Unknown"),
                ],
            )

        def _build_child_summary(child_model: UserModel):
            return ChildSummary(
                id=str(child_model.id),
                name=child_model.name,
                class_name="Class 7-B",
                roll_number="23",
            )

        if role == "parent":
            children = user_model.children
            children_payload = [
                _build_child_summary(child) for child in children if child
            ]

            if children_payload:
                chosen_child = None
                if child_id:
                    chosen_child = next(
                        (c for c in children if c.id == child_id),
                        None,
                    )
                if not chosen_child:
                    chosen_child = children[0]

                selected_child_id = str(chosen_child.id)

                profile: StudentProfileModel | None = chosen_child.profile
                if profile:
                    attendance = f"{profile.attendance_percent}%"
                    avg_marks = f"{profile.avg_marks}%"
                    fee_status = profile.fee_status
                else:
                    attendance = "88%"
                    avg_marks = "85%"
                    fee_status = "Paid"

                stats = [
                    StatItem(label="Attendance", value=attendance),
                    StatItem(label="Avg Marks", value=avg_marks),
                    StatItem(label="Fee Status", value=fee_status),
                ]
            else:
                # Parent has no children configured yet
                stats = [
                    StatItem(label="Attendance", value="0%"),
                    StatItem(label="Avg Marks", value="0%"),
                    StatItem(label="Fee Status", value="Unassigned"),
                ]

        elif role == "student":
            profile: StudentProfileModel | None = user_model.profile
            if profile:
                stats = [
                    StatItem(label="Attendance", value=f"{profile.attendance_percent}%"),
                    StatItem(label="Avg Score", value=f"{profile.avg_marks / 10:.1f}"),
                    StatItem(label="Assignments Due", value=2),
                ]
            else:
                stats = [
                    StatItem(label="Attendance", value="92%"),
                    StatItem(label="Avg Score", value="8.5"),
                    StatItem(label="Assignments Due", value=3),
                ]

    else:
        stats = [
            StatItem(label="Status", value="Unavailable for this role"),
        ]

    return DashboardResponse(
        role=role_label,
        stats=stats,
        children=children_payload,
        selected_child_id=selected_child_id,
    )


@router.post(
    "/contacts",
    response_model=ContactSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact (name and email)",
    description=(
        "Submit a contact with name and email. "
        "Saved to database. Requires authentication."
    ),
)
async def submit_contact(
    body: ContactSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactSubmitResponse:
    """
    Submit contact information (name and email).
    Persists the data to the database and returns a success response.
    """
    repository = DatabaseContactRepository(db)
    await repository.create(name=body.name, email=body.email)
    return ContactSubmitResponse(message="Contact submitted successfully")
