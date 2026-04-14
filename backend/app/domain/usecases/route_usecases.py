"""
Use cases for transport route business logic.

Each class encapsulates ONE business operation (Single Responsibility).
They depend on the abstract RouteRepository, never on SQLAlchemy or
FastAPI, so they are trivially unit-testable by injecting a mock repo.

Business rules enforced here
-----------------------------
CreateRouteUseCase
  - Route name must not be empty.
  - At least one stop must be supplied.
  - sequence_order values across stops must be unique.

UpdateRouteUseCase
  - Route must exist (raises NotFoundError otherwise).
  - If stops are supplied they replace the old list entirely.
  - Same uniqueness rule applies on the replacement stop list.

DeleteRouteUseCase
  - Route must exist.
  - Deletes route; DB cascade removes stops + student mappings.

AddStudentToRouteUseCase
  - Both route and student IDs are validated at the API/schema layer;
    the use case trusts that the IDs are valid integers.
  - pickup_stop_id, if supplied, is passed through without FK validation
    here — the DB will raise an integrity error if it is invalid.
"""

from typing import List, Optional

from app.core.errors import NotFoundError, ValidationError
from app.domain.entities.route import Route, StudentRouteMapping
from app.domain.repositories.route_repository import RouteRepository


# ------------------------------------------------------------------ #
# Helper
# ------------------------------------------------------------------ #

def _validate_stops(stops: List[dict]) -> None:
    """
    Validate a stop list before persisting.

    Rules:
    - Must have at least one stop.
    - sequence_order values must be unique across stops.

    Args:
        stops: List of stop data dicts (name, lat, lng, sequence_order,
               arrival_time).

    Raises:
        ValidationError: If the stop list is empty or has duplicate
                         sequence_order values.
    """
    if not stops:
        raise ValidationError("A route must have at least one stop.")

    orders = [s.get("sequence_order") for s in stops]
    if len(orders) != len(set(orders)):
        raise ValidationError(
            "sequence_order values must be unique within a route. "
            f"Got: {orders}"
        )


# ------------------------------------------------------------------ #
# Use cases
# ------------------------------------------------------------------ #

class CreateRouteUseCase:
    """
    Create a new transport route with its stops.

    This is the primary POST handler.  The acceptance criterion says:
    \"POST/PUT: Save route objects including nested arrays of stop
    metadata (latitude, longitude, time).\"

    The stops list is validated (unique sequence_orders, at least one
    stop) before being passed to the repository, which persists the
    route and all its stops in a single database transaction.
    """

    def __init__(self, repository: RouteRepository) -> None:
        """
        Args:
            repository: Concrete implementation of RouteRepository.
        """
        self.repository = repository

    async def execute(
        self,
        name: str,
        branch_id: str,
        stops: List[dict],
        organization_id: Optional[str] = None,
        description: Optional[str] = None,
        is_active: bool = True,
    ) -> Route:
        """
        Validate inputs and persist the new route.

        Args:
            name:            Route name (e.g. \"Morning Route A\").
            branch_id:       Branch this route belongs to.
            stops:           List of stop dicts (name, latitude,
                             longitude, sequence_order, arrival_time).
            organization_id: Optional org/school identifier.
            description:     Optional free-text description.
            is_active:       Whether the route is active on creation.

        Returns:
            Fully populated Route entity with DB-assigned IDs.

        Raises:
            ValidationError: If name is empty or stops are invalid.
        """
        if not name or not name.strip():
            raise ValidationError("Route name must not be empty.")
        if not branch_id or not branch_id.strip():
            raise ValidationError("branch_id must not be empty.")

        _validate_stops(stops)

        return await self.repository.create_route(
            name=name.strip(),
            branch_id=branch_id.strip(),
            stops=stops,
            organization_id=organization_id,
            description=description,
            is_active=is_active,
        )


class UpdateRouteUseCase:
    """
    Update an existing route (PUT endpoint).

    The acceptance criterion says PUT must save route objects including
    nested stop arrays.  When ``stops`` is provided the old stops are
    deleted and the new list is inserted — this is the safest approach
    because stop sequence_orders can be reordered and stops can be
    added or removed in a single PUT request.

    If ``stops`` is omitted (None) the existing stops are untouched,
    making partial updates (e.g. rename a route) efficient.
    """

    def __init__(self, repository: RouteRepository) -> None:
        """
        Args:
            repository: Concrete implementation of RouteRepository.
        """
        self.repository = repository

    async def execute(
        self,
        route_id: int,
        name: Optional[str] = None,
        branch_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
        stops: Optional[List[dict]] = None,
    ) -> Route:
        """
        Apply updates to an existing route.

        Args:
            route_id:        PK of the route to update.
            name:            New name (skip if None).
            branch_id:       New branch ID (skip if None).
            organization_id: New org ID (skip if None).
            description:     New description (skip if None).
            is_active:       New active flag (skip if None).
            stops:           Replacement stop list.  If provided, the
                             old stops are deleted and these are
                             inserted.  If None, stops are unchanged.

        Returns:
            Updated Route entity.

        Raises:
            NotFoundError:   If no route exists with route_id.
            ValidationError: If replacement stops fail validation.
        """
        exists = await self.repository.route_exists(route_id)
        if not exists:
            raise NotFoundError(f"Route with id {route_id} not found.")

        if stops is not None:
            _validate_stops(stops)

        return await self.repository.update_route(
            route_id=route_id,
            name=name.strip() if name else None,
            branch_id=branch_id.strip() if branch_id else None,
            organization_id=organization_id,
            description=description,
            is_active=is_active,
            stops=stops,
        )


class GetRouteUseCase:
    """Use case for retrieving a single route by ID (with its stops)."""

    def __init__(self, repository: RouteRepository) -> None:
        self.repository = repository

    async def execute(self, route_id: int) -> Route:
        """
        Retrieve a route by its primary key.

        Args:
            route_id: PK of the route.

        Returns:
            Route entity (stops included).

        Raises:
            NotFoundError: If no route exists with route_id.
        """
        route = await self.repository.get_route_by_id(route_id)
        if route is None:
            raise NotFoundError(f"Route with id {route_id} not found.")
        return route


class ListRoutesUseCase:
    """
    Use case for the GET /routes endpoint.

    The acceptance criterion says: \"GET: Retrieve optimized route lists
    for specific branches or organizations.\"

    \"Optimized\" here means:
    - Only routes matching the caller's branch_id / organization_id are
      returned (index-backed WHERE clause in the DB query).
    - Stops come back already sorted by sequence_order so the frontend
      consumes them in the correct order without any client-side sort.
    - The is_active filter lets the app hide decommissioned routes from
      drivers without deleting historical data.
    """

    def __init__(self, repository: RouteRepository) -> None:
        self.repository = repository

    async def execute(
        self,
        branch_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Route]:
        """
        List routes matching the given filters.

        Args:
            branch_id:       Filter to one branch (None = all branches).
            organization_id: Filter to one org (None = all orgs).
            is_active:       True/False to filter; None = return both.

        Returns:
            List of Route entities, each with a sorted stops list.
        """
        return await self.repository.list_routes(
            branch_id=branch_id,
            organization_id=organization_id,
            is_active=is_active,
        )


class DeleteRouteUseCase:
    """
    Delete a route and clean up all associated data.

    Acceptance criterion: \"DELETE: Clean up route records and associated
    student mappings.\"

    The DB-level cascade (ondelete=\"CASCADE\" on ``route_stops`` and
    ``student_route_mappings``) means the infra layer only deletes the
    parent ``routes`` row and PostgreSQL handles the rest.  The use case
    still verifies the route exists first to give the caller a clear 404
    rather than a silent no-op.
    """

    def __init__(self, repository: RouteRepository) -> None:
        self.repository = repository

    async def execute(self, route_id: int) -> None:
        """
        Delete the route (and its stops + student mappings via cascade).

        Args:
            route_id: PK of the route to delete.

        Raises:
            NotFoundError: If no route exists with route_id.
        """
        exists = await self.repository.route_exists(route_id)
        if not exists:
            raise NotFoundError(f"Route with id {route_id} not found.")

        await self.repository.delete_route(route_id)


class AddStudentToRouteUseCase:
    """
    Assign a student to a route (with optional pickup stop).

    This is the POST /{route_id}/students endpoint.
    Use case: an admin assigns Student #42 to \"Morning Route A\" with
    boarding stop \"Main Gate\" → the mobile driver app can then show
    the driver exactly who to pick up at each stop.
    """

    def __init__(self, repository: RouteRepository) -> None:
        self.repository = repository

    async def execute(
        self,
        route_id: int,
        student_id: int,
        pickup_stop_id: Optional[int] = None,
    ) -> StudentRouteMapping:
        """
        Create a student-route mapping.

        Args:
            route_id:       PK of the route.
            student_id:     PK of the student.
            pickup_stop_id: Optional PKof the boarding stop.

        Returns:
            Created StudentRouteMapping entity.

        Raises:
            NotFoundError: If route_id does not exist.
        """
        exists = await self.repository.route_exists(route_id)
        if not exists:
            raise NotFoundError(f"Route with id {route_id} not found.")

        return await self.repository.add_student_mapping(
            route_id=route_id,
            student_id=student_id,
            pickup_stop_id=pickup_stop_id,
        )
