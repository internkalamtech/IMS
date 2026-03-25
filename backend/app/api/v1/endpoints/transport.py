from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.api.dependencies import get_current_user
from app.api.schemas import (
    RouteResponse, RouteListResponse, ComplianceStatusResponse,
    AlertResponse, AlertListResponse, DocumentExpiryResponse,
    DocumentExpiryListResponse, TransportStatsResponse
)
from app.domain.entities.user import User
from app.domain.usecases.transport_usecases import (
    GetRoutesUseCase, GetRouteUseCase, GetAlertsUseCase,
    GetExpiringDocumentsUseCase, GetComplianceStatusUseCase,
    GetTransportStatsUseCase
)
from app.infrastructure.repositories.transport_repository_impl import (
    TransportRepositoryImpl
)

# Initialize dependencies (in production, use dependency injection)
transport_repository = TransportRepositoryImpl()
get_routes_usecase = GetRoutesUseCase(transport_repository)
get_route_usecase = GetRouteUseCase(transport_repository)
get_alerts_usecase = GetAlertsUseCase(transport_repository)
get_expiring_documents_usecase = (
    GetExpiringDocumentsUseCase(transport_repository)
)
get_compliance_status_usecase = (
    GetComplianceStatusUseCase(transport_repository)
)
get_transport_stats_usecase = GetTransportStatsUseCase(transport_repository)

router = APIRouter(prefix="/transport", tags=["Transport"])


@router.get(
    "/routes",
    response_model=RouteListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all transport routes",
    description=(
        "Retrieve all transport routes with their "
        "current status and details."
    )
)
async def get_routes(
    current_user: User = Depends(get_current_user),
) -> RouteListResponse:
    """
    Get all transport routes endpoint.

    Returns all routes with real-time status information.
    """
    if current_user.role != "transport":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Transport manager role required."
        )

    routes = await get_routes_usecase.execute()
    route_responses = []
    for route in routes:
        route_responses.append(RouteResponse(
            id=route.id,
            name=route.name,
            status=route.status,
            total_stops=route.total_stops,
            total_students=route.total_students,
            assigned_bus=route.assigned_bus,
            driver=route.driver,
            next_stop=route.next_stop,
            next_time=route.next_time,
            current_location=route.current_location,
            delay_minutes=route.delay_minutes
        ))

    return RouteListResponse(
        routes=route_responses, total=len(route_responses)
        )


@router.get(
    "/routes/{route_id}",
    response_model=RouteResponse,
    status_code=status.HTTP_200_OK,
    summary="Get specific route details",
    description=(
        "Retrieve detailed information for a specific "
        "transport route."
    )
)
async def get_route(
    route_id: str,
    current_user: User = Depends(get_current_user),
) -> RouteResponse:
    """
    Get specific route details endpoint.
    """
    if current_user.role != "transport":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Transport manager role required."
        )

    route = await get_route_usecase.execute(route_id)
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )

    return RouteResponse(
        id=route.id,
        name=route.name,
        status=route.status,
        total_stops=route.total_stops,
        total_students=route.total_students,
        assigned_bus=route.assigned_bus,
        driver=route.driver,
        next_stop=route.next_stop,
        next_time=route.next_time,
        current_location=route.current_location,
        delay_minutes=route.delay_minutes
    )


@router.get(
    "/compliance/status",
    response_model=ComplianceStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get compliance document status overview",
    description=(
        "Retrieve compliance document status counts "
        "(valid, expiring, expired)."
    )
)
async def get_compliance_status(
    current_user: User = Depends(get_current_user),
) -> ComplianceStatusResponse:
    """
    Get compliance status overview endpoint.
    """
    if current_user.role != "transport":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Transport manager role required."
        )

    compliance_status = await get_compliance_status_usecase.execute()
    return ComplianceStatusResponse(
        valid_documents=compliance_status.valid_documents,
        expiring_soon=compliance_status.expiring_soon,
        expired=compliance_status.expired
    )


@router.get(
    "/alerts",
    response_model=AlertListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get recent transport alerts",
    description=(
        "Retrieve recent alerts and notifications "
        "for transport operations."
    )
)
async def get_alerts(
    limit: Optional[int] = 10,
    current_user: User = Depends(get_current_user),
) -> AlertListResponse:
    """
    Get recent alerts endpoint.
    """
    if current_user.role != "transport":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Transport manager role required."
        )

    alerts = await get_alerts_usecase.execute(limit)
    alert_responses = []
    for alert in alerts:
        alert_responses.append(AlertResponse(
            id=alert.id,
            bus_id=alert.bus_id,
            type=alert.type,
            message=alert.message,
            timestamp=alert.timestamp,
            location=alert.location,
            resolved=alert.resolved
        ))

    return AlertListResponse(
        alerts=alert_responses, total=len(alert_responses)
        )


@router.get(
    "/documents/expiring",
    response_model=DocumentExpiryListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get documents expiring soon",
    description=(
        "Retrieve documents that are expiring "
        "within the next 30 days."
    )
)
async def get_expiring_documents(
    days: Optional[int] = 30,
    current_user: User = Depends(get_current_user),
) -> DocumentExpiryListResponse:
    """
    Get expiring documents endpoint.
    """
    if current_user.role != "transport":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Transport manager role required."
        )

    documents = await get_expiring_documents_usecase.execute(days)
    document_responses = []
    for doc in documents:
        document_responses.append(DocumentExpiryResponse(
            id=doc.id,
            bus_id=doc.bus_id,
            type=doc.type,
            document_number=doc.document_number,
            expiry_date=doc.expiry_date,
            status=doc.status,
            days_left=doc.days_left
        ))

    return DocumentExpiryListResponse(
        documents=document_responses, total=len(document_responses)
        )


@router.get(
    "/stats",
    response_model=TransportStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get comprehensive transport statistics",
    description=(
        "Retrieve comprehensive transport "
        "statistics for dashboard display."
    )
)
async def get_transport_stats(
    current_user: User = Depends(get_current_user),
) -> TransportStatsResponse:
    """
    Get comprehensive transport statistics endpoint.
    """
    if current_user.role != "transport":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Transport manager role required."
        )

    stats = await get_transport_stats_usecase.execute()
    return TransportStatsResponse(
        total_routes=stats.total_routes,
        active_trips=stats.active_trips,
        total_students=stats.total_students,
        total_buses=stats.total_buses,
        valid_documents=stats.valid_documents,
        expiring_documents=stats.expiring_documents,
        expired_documents=stats.expired_documents,
        active_alerts=stats.active_alerts
    )
