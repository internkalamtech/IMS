"""Use cases for business logic."""

from app.domain.usecases.auth_usecases import (
    LoginUseCase,
    GetCurrentUserUseCase,
)
from app.domain.usecases.transport_usecases import (
    GetStudentsUseCase,
    GetStudentAllocationsUseCase,
    AssignStudentToRouteUseCase,
    UpdateStudentAllocationUseCase,
    RemoveStudentAllocationUseCase,
    GetRouteSummariesUseCase,
)
from app.domain.usecases.payment_usecases import (
    RecordPaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
    GetPaymentSummaryUseCase,
    ListStudentsUseCase,
    GetStudentUseCase,
)
from .list_students_usecase import ListStudentsUseCase
from .update_student_stop_usecase import UpdateStudentStopUseCase
from .route_summary_usecase import RouteSummaryUseCase

__all__ = [
    "LoginUseCase",
    "GetCurrentUserUseCase",
    "GetStudentsUseCase",
    "GetStudentAllocationsUseCase",
    "AssignStudentToRouteUseCase",
    "UpdateStudentAllocationUseCase",
    "RemoveStudentAllocationUseCase",
    "GetRouteSummariesUseCase",
    "RecordPaymentUseCase",
    "GetPaymentUseCase",
    "ListPaymentsUseCase",
    "GetPaymentSummaryUseCase",
    "ListStudentsUseCase",
    "GetStudentUseCase",
    "UpdateStudentStopUseCase",
    "RouteSummaryUseCase",
]
