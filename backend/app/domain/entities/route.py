"""
Route domain entities.

These dataclasses represent the core route/transport business objects.
They have ZERO framework dependencies (no SQLAlchemy, no FastAPI, no
Pydantic) so the domain layer stays completely portable and testable.

Design rationale
----------------
Route  1──*  RouteStop
  A route is an ordered sequence of stops (pickup/drop-off points).
  Stops carry GPS coordinates (latitude, longitude) and a scheduled
  arrival time so the mobile app can show drivers the timeline.

Route  1──*  StudentRouteMapping
  A separate mapping table links students to routes (and optionally to
  their specific boarding stop).  This keeps the Student entity clean
  and lets one student be reassigned to a different route without
  touching the core student record.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional


@dataclass
class RouteStop:
    """
    A single stop (pickup/drop-off point) on a transport route.

    Attributes:
        id:             Database primary key.
        route_id:       FK to the parent Route.
        name:           Human-readable stop label (e.g. "Main Gate").
        latitude:       GPS latitude  (-90.0 to +90.0).
        longitude:      GPS longitude (-180.0 to +180.0).
        sequence_order: 1-based integer that defines travel order.
                        The API always returns stops sorted by this
                        field so the frontend renders them correctly.
        arrival_time:   Expected vehicle arrival in "HH:MM" format,
                        e.g. "07:30".  Optional — some routes only
                        track location, not schedule.
        created_at:     Row creation timestamp (set by DB).
    """

    id: int
    route_id: int
    name: str
    latitude: float
    longitude: float
    sequence_order: int
    arrival_time: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class Route:
    """
    A transport route belonging to a branch or organization.

    The ``stops`` list is the nested array of stop metadata that the
    acceptance criteria requires the POST/PUT endpoints to persist.  It
    is always ordered by ``RouteStop.sequence_order`` so callers receive
    stops in travel order.

    ``branch_id`` / ``organization_id`` are plain strings (not FK ints)
    because the IMS does not yet have dedicated Branch / Organization
    tables.  Using strings lets existing branch codes from the mobile
    app work without a schema migration on those entities.

    Attributes:
        id:              Database primary key.
        name:            Route name (e.g. "Morning Route A").
        branch_id:       Identifier of the branch this route serves.
        organization_id: Optional top-level org/school identifier.
        description:     Free-text description of the route.
        is_active:       Whether the route is currently in service.
        stops:           Ordered list of RouteStop entities.
        created_at:      Row creation timestamp.
        updated_at:      Last update timestamp.
    """

    id: int
    name: str
    branch_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    organization_id: Optional[str] = None
    description: Optional[str] = None
    stops: List[RouteStop] = field(default_factory=list)


@dataclass
class StudentRouteMapping:
    """
    Links a student to a route (and optionally to a specific stop).

    Why a separate entity (not a field on Student):
    - Students may change routes mid-year; a mapping row can be deleted
      and recreated without touching the student's core record.
    - When a route is deleted the cascade on the DB removes all
      mappings automatically — the acceptance criteria for DELETE is
      satisfied at the schema level, not in application code.

    Attributes:
        id:             Database primary key.
        route_id:       FK to the Route.
        student_id:     FK to the Student.
        pickup_stop_id: Optional FK to the RouteStop where the student
                        boards.  Null means "any stop on the route".
        created_at:     Row creation timestamp.
    """

    id: int
    route_id: int
    student_id: int
    pickup_stop_id: Optional[int] = None
    created_at: Optional[datetime] = None
