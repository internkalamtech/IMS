"""
Transport route endpoints.

Provides REST API endpoints for the Route Module:

- POST   /routes/                  Create a new route with nested stops
- PUT    /routes/{route_id}        Update a route (replace stops if supplied)
- GET    /routes/                  List routes filtered by branch/org
- GET    /routes/{route_id}        Retrieve a single route
- DELETE /routes/{route_id}        Delete route + student mappings (cascade)
- POST   /routes/{route_id}/students  Assign a student to a route

Acceptance criteria mapping
---------------------------
AC1 POST/PUT  →  create_route, update_route
AC2 GET       →  list_routes (branch_id / organization_id query params)
AC3 DELETE    →  delete_route (DB cascade removes stops + student mappings)

All endpoints require JWT authentication (get_current_user dependency).
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    ErrorResponse,
    RouteCreate,
    RouteResponse,
    RouteStopResponse,
    RouteUpdate,
    StudentRouteMappingCreate,
    StudentRouteMappingResponse,
)
from app.core.errors import DatabaseError, NotFoundError, ValidationError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.usecases.route_usecases import (
    AddStudentToRouteUseCase,
    CreateRouteUseCase,
    DeleteRouteUseCase,
    GetRouteUseCase,
    ListRoutesUseCase,
    UpdateRouteUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_route_repository import (
    DatabaseRouteRepository,
)

router = APIRouter(prefix="/routes", tags=["Routes"])


# ------------------------------------------------------------------ #
# Internal helper — entity → response schema
# ------------------------------------------------------------------ #

def _route_to_response(route) -> RouteResponse:
    """
    Map a Route domain entity to a RouteResponse Pydantic schema.

    Why a helper instead of model_validate()?
    The domain entity uses plain dataclasses (no ORM), so Pydantic's
    from_attributes mode does work, but building it explicitly keeps
    the mapping visible and avoids surprises if field names diverge.
    """
    return RouteResponse(
        id=route.id,
        name=route.name,
        branch_id=route.branch_id,
        organization_id=route.organization_id,
        description=route.description,
        is_active=route.is_active,
        stops=[
            RouteStopResponse(
                id=s.id,
                route_id=s.route_id,
                name=s.name,
                latitude=s.latitude,
                longitude=s.longitude,
                sequence_order=s.sequence_order,
                arrival_time=s.arrival_time,
            )
            for s in route.stops
        ],
        created_at=route.created_at,
        updated_at=route.updated_at,
    )


# ------------------------------------------------------------------ #
# AC1 — POST: Save route objects with nested stop arrays
# ------------------------------------------------------------------ #


@router.post(
    "/",
    response_model=RouteResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Create a route",
    description=(
        "Create a new transport route with an ordered list of stops. "
        "Each stop must include name, latitude, longitude, sequence_order, "
        "and an optional arrival_time (HH:MM). "
        "sequence_order values must be unique within the stop list. "
        "The route is immediately queryable via GET /routes/?branch_id=<id>."
    ),
)
async def create_route(
    request: RouteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RouteResponse:
    """
    Create a new transport route.

    Args:
        request: Route creation payload (name, branch_id, stops, …).
        db:           Database session (injected).
        current_user: Authenticated user (injected by JWT middleware).

    Returns:
        RouteResponse with DB-assigned IDs for the route and each stop.

    Raises:
        HTTPException 400: If name/branch_id empty or stops invalid.
        HTTPException 500: If a database error occurs.
    """
    try:
        Logger.info(
            f"Route creation requested by user={current_user.id}, "
            f"branch={request.branch_id}"
        )
        repository = DatabaseRouteRepository(db)
        use_case = CreateRouteUseCase(repository)
        # Convert Pydantic stop models → plain dicts for the use case /
        # repository (keeps the domain layer free from Pydantic).
        stops_data = [s.model_dump() for s in request.stops]
        route = await use_case.execute(
            name=request.name,
            branch_id=request.branch_id,
            stops=stops_data,
            organization_id=request.organization_id,
            description=request.description,
            is_active=request.is_active,
        )
        Logger.info(f"Route created: id={route.id}, name='{route.name}'")
        return _route_to_response(route)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(f"Database error while creating route: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the route.",
        )


# ------------------------------------------------------------------ #
# AC1 — PUT: Update route including stops
# ------------------------------------------------------------------ #


@router.put(
    "/{route_id}",
    response_model=RouteResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Route not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Update a route",
    description=(
        "Update an existing route. All fields are optional. "
        "If 'stops' is provided the ENTIRE stop list is replaced "
        "(delete old stops, insert new ones). "
        "If 'stops' is omitted, existing stops are preserved unchanged."
    ),
)
async def update_route(
    route_id: int,
    request: RouteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RouteResponse:
    """
    Update an existing route.

    Args:
        route_id:     PK of the route to update.
        request:      Partial update payload.
        db:           Database session (injected).
        current_user: Authenticated user (injected).

    Returns:
        Updated RouteResponse.

    Raises:
        HTTPException 404: If route_id does not exist.
        HTTPException 400: If replacement stops fail validation.
        HTTPException 500: If a database error occurs.
    """
    try:
        Logger.info(
            f"Route update requested by user={current_user.id}, "
            f"route_id={route_id}"
        )
        repository = DatabaseRouteRepository(db)
        use_case = UpdateRouteUseCase(repository)
        stops_data = (
            [s.model_dump() for s in request.stops]
            if request.stops is not None
            else None
        )
        route = await use_case.execute(
            route_id=route_id,
            name=request.name,
            branch_id=request.branch_id,
            organization_id=request.organization_id,
            description=request.description,
            is_active=request.is_active,
            stops=stops_data,
        )
        Logger.info(f"Route updated: id={route_id}")
        return _route_to_response(route)
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(f"Database error while updating route {route_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the route.",
        )


# ------------------------------------------------------------------ #
# AC2 — GET: Retrieve optimized route lists for branches/organizations
# ------------------------------------------------------------------ #


@router.get(
    "/",
    response_model=List[RouteResponse],
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="List routes",
    description=(
        "Retrieve routes filtered by branch and/or organization. "
        "All query parameters are optional. Results include the full "
        "nested stop list for each route, ordered by sequence_order. "
        "Use is_active=true to fetch only routes currently in service."
    ),
)
async def list_routes(
    branch_id: Optional[str] = Query(
        None, description="Filter routes by branch identifier"
    ),
    organization_id: Optional[str] = Query(
        None, description="Filter routes by organization identifier"
    ),
    is_active: Optional[bool] = Query(
        None, description="Filter by active status (true/false)"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[RouteResponse]:
    """
    List transport routes with optional filters.

    This is the \"GET: Retrieve optimized route lists for specific
    branches or organizations\" endpoint from the acceptance criteria.

    Args:
        branch_id:       Filter to a specific branch (None = all).
        organization_id: Filter to a specific org (None = all).
        is_active:       True/False filter; None returns both.
        db:              Database session (injected).
        current_user:    Authenticated user (injected).

    Returns:
        List of RouteResponse objects, each with sorted stops.
    """
    try:
        repository = DatabaseRouteRepository(db)
        use_case = ListRoutesUseCase(repository)
        routes = await use_case.execute(
            branch_id=branch_id,
            organization_id=organization_id,
            is_active=is_active,
        )
        return [_route_to_response(r) for r in routes]
    except DatabaseError as exc:
        Logger.error(f"Database error while listing routes: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving routes.",
        )


@router.get(
    "/{route_id}",
    response_model=RouteResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Route not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get route by ID",
    description="Retrieve a single transport route by its unique ID.",
)
async def get_route(
    route_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RouteResponse:
    """
    Retrieve a single route by primary key.

    Args:
        route_id:     Unique route identifier.
        db:           Database session (injected).
        current_user: Authenticated user (injected).

    Returns:
        RouteResponse with full stop list.

    Raises:
        HTTPException 404: If route does not exist.
    """
    try:
        repository = DatabaseRouteRepository(db)
        use_case = GetRouteUseCase(repository)
        route = await use_case.execute(route_id)
        return _route_to_response(route)
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching route {route_id}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the route.",
        )


# ------------------------------------------------------------------ #
# AC3 — DELETE: Clean up route records and associated student mappings
# ------------------------------------------------------------------ #


@router.delete(
    "/{route_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Route not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Delete a route",
    description=(
        "Delete a route and ALL associated data: "
        "its stops (route_stops) and student assignments "
        "(student_route_mappings). "
        "The cleanup is handled by database-level CASCADE constraints "
        "so no orphaned records remain. Returns 204 No Content on success."
    ),
)
async def delete_route(
    route_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """
    Delete a route (and its stops + student mappings via DB cascade).

    This satisfies acceptance criterion 3:
    \"DELETE: Clean up route records and associated student mappings.\"

    Args:
        route_id:     PK of the route to delete.
        db:           Database session (injected).
        current_user: Authenticated user (injected).

    Returns:
        HTTP 204 No Content on success.

    Raises:
        HTTPException 404: If route does not exist.
        HTTPException 500: If a database error occurs.
    """
    try:
        Logger.info(
            f"Route delete requested by user={current_user.id}, "
            f"route_id={route_id}"
        )
        repository = DatabaseRouteRepository(db)
        use_case = DeleteRouteUseCase(repository)
        await use_case.execute(route_id)
        Logger.info(f"Route deleted: id={route_id}")
        # 204 responses must have no body — return an empty Response
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while deleting route {route_id}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the route.",
        )


# ------------------------------------------------------------------ #
# Student mapping endpoint
# ------------------------------------------------------------------ #


@router.post(
    "/{route_id}/students",
    response_model=StudentRouteMappingResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Route not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Assign a student to a route",
    description=(
        "Assign a student to a transport route. "
        "The optional pickup_stop_id specifies which stop the student "
        "boards at. When the route is deleted, this mapping is "
        "automatically removed by the database cascade."
    ),
)
async def add_student_to_route(
    route_id: int,
    request: StudentRouteMappingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentRouteMappingResponse:
    """
    Assign a student to a route (with optional pickup stop).

    Args:
        route_id:     PK of the route.
        request:      student_id and optional pickup_stop_id.
        db:           Database session (injected).
        current_user: Authenticated user (injected).

    Returns:
        StudentRouteMappingResponse with the new mapping's DB ID.

    Raises:
        HTTPException 404: If route does not exist.
        HTTPException 500: If a database error occurs.
    """
    try:
        Logger.info(
            f"Student {request.student_id} being assigned to "
            f"route {route_id} by user={current_user.id}"
        )
        repository = DatabaseRouteRepository(db)
        use_case = AddStudentToRouteUseCase(repository)
        mapping = await use_case.execute(
            route_id=route_id,
            student_id=request.student_id,
            pickup_stop_id=request.pickup_stop_id,
        )
        return StudentRouteMappingResponse(
            id=mapping.id,
            route_id=mapping.route_id,
            student_id=mapping.student_id,
            pickup_stop_id=mapping.pickup_stop_id,
            created_at=mapping.created_at,
        )
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while assigning student to route: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while assigning the student to the route.",
        )
