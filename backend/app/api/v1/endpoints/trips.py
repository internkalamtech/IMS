"""
Trip management endpoints.

Provides REST API endpoints for managing trips, stops, and student boarding.
These endpoints implement Issue #278: Trip Execution and Boarding API.

All endpoints require authentication via JWT token.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    TripCreateRequest,
    TripUpdateStatusRequest,
    TripResponse,
    TripStopCreateRequest,
    TripStopUpdateRequest,
    TripStopResponse,
    StudentBoardingCreateRequest,
    StudentBoardingResponse,
)
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.entities.trip import Trip, TripStatus, TripType
from app.domain.entities.trip_stop import TripStop, StopStatus
from app.domain.entities.student_boarding import StudentBoarding, BoardingStatus
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.trip_repository import (
    DatabaseTripRepository,
    DatabaseTripStopRepository,
    DatabaseStudentBoardingRepository,
)

# Create router
router = APIRouter(prefix="/trips", tags=["Trip Management"])


# ============================================================================
# TRIP ENDPOINTS
# ============================================================================

@router.post(
    "",
    response_model=TripResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new trip",
    description="Create a new trip for a driver with specified route and vehicle",
)
async def create_trip(
    request: TripCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TripResponse:
    """
    Create a new trip.

    Args:
        request: Trip creation details (driver_id, route_id, vehicle_id, etc.)
        db: Database session
        current_user: Authenticated user making the request

    Returns:
        Created trip with ID and timestamps

    Raises:
        HTTPException: If creation fails
    """
    try:
        Logger.info(f"Creating trip for driver {request.driver_id}")

        # Create trip entity
        trip = Trip(
            id="temp",  # Will be set by repository
            driver_id=str(request.driver_id),
            route_id=request.route_id,
            vehicle_id=request.vehicle_id,
            trip_type=TripType(request.trip_type),
            status=TripStatus.SCHEDULED,
            scheduled_start=request.scheduled_start,
            total_students=request.total_students,
        )

        # Save to database
        repo = DatabaseTripRepository(db)
        created_trip = await repo.create_trip(trip)

        Logger.info(f"Trip created successfully with ID: {created_trip.id}")

        return TripResponse(
            id=int(created_trip.id),
            driver_id=int(created_trip.driver_id),
            route_id=created_trip.route_id,
            vehicle_id=created_trip.vehicle_id,
            trip_type=created_trip.trip_type.value,
            status=created_trip.status.value,
            scheduled_start=created_trip.scheduled_start,
            actual_start=created_trip.actual_start,
            actual_end=created_trip.actual_end,
            total_students=created_trip.total_students,
            boarded_count=created_trip.boarded_count,
            created_at=created_trip.created_at,
            updated_at=created_trip.updated_at,
        )

    except ValueError as e:
        Logger.error(f"Invalid trip type: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid trip data: {str(e)}",
        )
    except Exception as e:
        Logger.error(f"Error creating trip: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create trip",
        )


@router.get(
    "/{trip_id}",
    response_model=TripResponse,
    status_code=status.HTTP_200_OK,
    summary="Get trip details",
    description="Retrieve details of a specific trip by ID",
)
async def get_trip(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TripResponse:
    """
    Get trip by ID.

    Args:
        trip_id: ID of the trip to retrieve
        db: Database session
        current_user: Authenticated user

    Returns:
        Trip details

    Raises:
        HTTPException: If trip not found or error occurs
    """
    try:
        Logger.info(f"Fetching trip {trip_id}")

        repo = DatabaseTripRepository(db)
        trip = await repo.get_trip(str(trip_id))

        if not trip:
            Logger.warning(f"Trip not found: {trip_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID {trip_id} not found",
            )

        return TripResponse(
            id=int(trip.id),
            driver_id=int(trip.driver_id),
            route_id=trip.route_id,
            vehicle_id=trip.vehicle_id,
            trip_type=trip.trip_type.value,
            status=trip.status.value,
            scheduled_start=trip.scheduled_start,
            actual_start=trip.actual_start,
            actual_end=trip.actual_end,
            total_students=trip.total_students,
            boarded_count=trip.boarded_count,
            created_at=trip.created_at,
            updated_at=trip.updated_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        Logger.error(f"Error fetching trip: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch trip",
        )


@router.patch(
    "/{trip_id}/status",
    response_model=TripResponse,
    status_code=status.HTTP_200_OK,
    summary="Update trip status",
    description="Update the status of a trip (scheduled → in_progress → completed)",
)
async def update_trip_status(
    trip_id: int,
    request: TripUpdateStatusRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TripResponse:
    """
    Update trip status.

    When status changes to IN_PROGRESS, actual_start is recorded.
    When status changes to COMPLETED, actual_end is recorded.

    Args:
        trip_id: ID of the trip to update
        request: New status and optional notes
        db: Database session
        current_user: Authenticated user

    Returns:
        Updated trip

    Raises:
        HTTPException: If trip not found or update fails
    """
    try:
        Logger.info(f"Updating trip {trip_id} status to {request.status}")

        repo = DatabaseTripRepository(db)
        trip = await repo.update_trip_status(str(trip_id), TripStatus(request.status))

        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID {trip_id} not found",
            )

        await db.commit()

        Logger.info(f"Trip {trip_id} status updated to {request.status}")

        return TripResponse(
            id=int(trip.id),
            driver_id=int(trip.driver_id),
            route_id=trip.route_id,
            vehicle_id=trip.vehicle_id,
            trip_type=trip.trip_type.value,
            status=trip.status.value,
            scheduled_start=trip.scheduled_start,
            actual_start=trip.actual_start,
            actual_end=trip.actual_end,
            total_students=trip.total_students,
            boarded_count=trip.boarded_count,
            created_at=trip.created_at,
            updated_at=trip.updated_at,
        )

    except ValueError as e:
        Logger.error(f"Invalid status: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {str(e)}",
        )
    except HTTPException:
        raise
    except Exception as e:
        Logger.error(f"Error updating trip status: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update trip status",
        )


@router.get(
    "/driver/{driver_id}/today",
    response_model=List[TripResponse],
    status_code=status.HTTP_200_OK,
    summary="Get today's trips for a driver",
    description="Retrieve all trips scheduled for today for a specific driver",
)
async def get_today_trips(
    driver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[TripResponse]:
    """
    Get all trips for a driver today.

    Args:
        driver_id: ID of the driver
        db: Database session
        current_user: Authenticated user

    Returns:
        List of trips scheduled for today

    Raises:
        HTTPException: If error occurs
    """
    try:
        Logger.info(f"Fetching today's trips for driver {driver_id}")

        repo = DatabaseTripRepository(db)
        trips = await repo.get_today_trips(str(driver_id))

        Logger.info(f"Retrieved {len(trips)} trips for driver {driver_id} today")

        return [
            TripResponse(
                id=int(trip.id),
                driver_id=int(trip.driver_id),
                route_id=trip.route_id,
                vehicle_id=trip.vehicle_id,
                trip_type=trip.trip_type.value,
                status=trip.status.value,
                scheduled_start=trip.scheduled_start,
                actual_start=trip.actual_start,
                actual_end=trip.actual_end,
                total_students=trip.total_students,
                boarded_count=trip.boarded_count,
                created_at=trip.created_at,
                updated_at=trip.updated_at,
            )
            for trip in trips
        ]

    except Exception as e:
        Logger.error(f"Error fetching today's trips: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch today's trips",
        )


# ============================================================================
# TRIP STOP ENDPOINTS
# ============================================================================

@router.post(
    "/{trip_id}/stops",
    response_model=TripStopResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a trip stop",
    description="Create a new stop for a trip",
)
async def create_stop(
    trip_id: int,
    request: TripStopCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TripStopResponse:
    """
    Create a new stop for a trip.

    Args:
        trip_id: ID of the parent trip
        request: Stop details (location, sequence, students, etc.)
        db: Database session
        current_user: Authenticated user

    Returns:
        Created stop

    Raises:
        HTTPException: If creation fails
    """
    try:
        Logger.info(
            f"Creating stop '{request.location_name}' for trip {trip_id}"
        )

        stop = TripStop(
            id="temp",
            trip_id=str(trip_id),
            stop_sequence=request.stop_sequence,
            location_name=request.location_name,
            latitude=request.latitude,
            longitude=request.longitude,
            scheduled_time=request.scheduled_time,
            expected_students=request.expected_students,
        )

        repo = DatabaseTripStopRepository(db)
        created_stop = await repo.create_stop(stop)
        await db.commit()

        Logger.info(f"Stop created with ID: {created_stop.id}")

        return TripStopResponse(
            id=int(created_stop.id),
            trip_id=int(created_stop.trip_id),
            stop_sequence=created_stop.stop_sequence,
            location_name=created_stop.location_name,
            latitude=created_stop.latitude,
            longitude=created_stop.longitude,
            scheduled_time=created_stop.scheduled_time,
            actual_arrival=created_stop.actual_arrival,
            actual_departure=created_stop.actual_departure,
            expected_students=created_stop.expected_students,
            boarded_students=created_stop.boarded_students,
            status=created_stop.status.value,
            created_at=created_stop.created_at,
            updated_at=created_stop.updated_at,
        )

    except Exception as e:
        Logger.error(f"Error creating stop: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create stop",
        )


@router.get(
    "/{trip_id}/stops",
    response_model=List[TripStopResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all stops for a trip",
    description="Retrieve all stops for a trip, ordered by sequence",
)
async def get_trip_stops(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[TripStopResponse]:
    """
    Get all stops for a trip.

    Args:
        trip_id: ID of the trip
        db: Database session
        current_user: Authenticated user

    Returns:
        List of stops ordered by sequence

    Raises:
        HTTPException: If error occurs
    """
    try:
        Logger.info(f"Fetching stops for trip {trip_id}")

        repo = DatabaseTripStopRepository(db)
        stops = await repo.get_trip_stops(str(trip_id))

        Logger.info(f"Retrieved {len(stops)} stops for trip {trip_id}")

        return [
            TripStopResponse(
                id=int(stop.id),
                trip_id=int(stop.trip_id),
                stop_sequence=stop.stop_sequence,
                location_name=stop.location_name,
                latitude=stop.latitude,
                longitude=stop.longitude,
                scheduled_time=stop.scheduled_time,
                actual_arrival=stop.actual_arrival,
                actual_departure=stop.actual_departure,
                expected_students=stop.expected_students,
                boarded_students=stop.boarded_students,
                status=stop.status.value,
                created_at=stop.created_at,
                updated_at=stop.updated_at,
            )
            for stop in stops
        ]

    except Exception as e:
        Logger.error(f"Error fetching stops: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch stops",
        )


@router.patch(
    "/stops/{stop_id}/status",
    response_model=TripStopResponse,
    status_code=status.HTTP_200_OK,
    summary="Update stop status",
    description="Update the status of a trip stop",
)
async def update_stop_status(
    stop_id: int,
    request: TripStopUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TripStopResponse:
    """
    Update stop status.

    Args:
        stop_id: ID of the stop to update
        request: New status and boarded count
        db: Database session
        current_user: Authenticated user

    Returns:
        Updated stop

    Raises:
        HTTPException: If stop not found or update fails
    """
    try:
        Logger.info(f"Updating stop {stop_id} status to {request.status}")

        repo = DatabaseTripStopRepository(db)
        stop = await repo.update_stop_status(str(stop_id), StopStatus(request.status))

        if not stop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stop with ID {stop_id} not found",
            )

        # Update boarded count if provided
        if request.boarded_students is not None:
            stop.boarded_students = request.boarded_students

        await db.commit()

        Logger.info(f"Stop {stop_id} status updated to {request.status}")

        return TripStopResponse(
            id=int(stop.id),
            trip_id=int(stop.trip_id),
            stop_sequence=stop.stop_sequence,
            location_name=stop.location_name,
            latitude=stop.latitude,
            longitude=stop.longitude,
            scheduled_time=stop.scheduled_time,
            actual_arrival=stop.actual_arrival,
            actual_departure=stop.actual_departure,
            expected_students=stop.expected_students,
            boarded_students=stop.boarded_students,
            status=stop.status.value,
            created_at=stop.created_at,
            updated_at=stop.updated_at,
        )

    except ValueError as e:
        Logger.error(f"Invalid stop status: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {str(e)}",
        )
    except HTTPException:
        raise
    except Exception as e:
        Logger.error(f"Error updating stop status: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update stop status",
        )


# ============================================================================
# STUDENT BOARDING ENDPOINTS
# ============================================================================

@router.post(
    "/{trip_id}/stops/{stop_id}/boarding",
    response_model=StudentBoardingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log student boarding",
    description="Log when a student boards at a specific stop",
)
async def log_student_boarding(
    trip_id: int,
    stop_id: int,
    request: StudentBoardingCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentBoardingResponse:
    """
    Log a student boarding event.

    Records when a student boards the vehicle at a stop.
    Automatically updates the trip's boarded_count.

    Args:
        trip_id: ID of the trip
        stop_id: ID of the stop
        request: Student details and boarding status
        db: Database session
        current_user: Authenticated user

    Returns:
        Created boarding record

    Raises:
        HTTPException: If logging fails
    """
    try:
        Logger.info(
            f"Logging boarding: Student {request.student_id} at stop {stop_id}"
        )

        boarding = StudentBoarding(
            id="temp",
            trip_id=str(trip_id),
            stop_id=str(stop_id),
            student_id=str(request.student_id),
            student_name=request.student_name,
            status=BoardingStatus(request.status),
            boarding_time=datetime.utcnow(),
        )

        repo = DatabaseStudentBoardingRepository(db)
        created_boarding = await repo.create_boarding(boarding)

        await db.commit()

        Logger.info(
            f"Boarding logged successfully with ID: {created_boarding.id}"
        )

        return StudentBoardingResponse(
            id=int(created_boarding.id),
            trip_id=int(created_boarding.trip_id),
            stop_id=int(created_boarding.stop_id),
            student_id=int(created_boarding.student_id),
            student_name=created_boarding.student_name,
            status=created_boarding.status.value,
            boarding_time=created_boarding.boarding_time,
            created_at=created_boarding.created_at,
        )

    except ValueError as e:
        Logger.error(f"Invalid boarding status: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {str(e)}",
        )
    except Exception as e:
        Logger.error(f"Error logging boarding: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log boarding",
        )


@router.get(
    "/{trip_id}/boardings",
    response_model=List[StudentBoardingResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all boarding records for a trip",
    description="Retrieve all student boarding events for a trip",
)
async def get_trip_boardings(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[StudentBoardingResponse]:
    """
    Get all boarding events for a trip.

    Args:
        trip_id: ID of the trip
        db: Database session
        current_user: Authenticated user

    Returns:
        List of boarding records

    Raises:
        HTTPException: If error occurs
    """
    try:
        Logger.info(f"Fetching boarding records for trip {trip_id}")

        repo = DatabaseStudentBoardingRepository(db)
        boardings = await repo.get_trip_boardings(str(trip_id))

        Logger.info(f"Retrieved {len(boardings)} boarding records for trip {trip_id}")

        return [
            StudentBoardingResponse(
                id=int(boarding.id),
                trip_id=int(boarding.trip_id),
                stop_id=int(boarding.stop_id),
                student_id=int(boarding.student_id),
                student_name=boarding.student_name,
                status=boarding.status.value,
                boarding_time=boarding.boarding_time,
                created_at=boarding.created_at,
            )
            for boarding in boardings
        ]

    except Exception as e:
        Logger.error(f"Error fetching boarding records: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch boarding records",
        )


@router.get(
    "/{trip_id}/stops/{stop_id}/boardings",
    response_model=List[StudentBoardingResponse],
    status_code=status.HTTP_200_OK,
    summary="Get boarding records for a specific stop",
    description="Retrieve all student boarding events for a specific stop",
)
async def get_stop_boardings(
    trip_id: int,
    stop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[StudentBoardingResponse]:
    """
    Get all boarding events for a specific stop.

    Args:
        trip_id: ID of the trip
        stop_id: ID of the stop
        db: Database session
        current_user: Authenticated user

    Returns:
        List of boarding records for the stop

    Raises:
        HTTPException: If error occurs
    """
    try:
        Logger.info(f"Fetching boarding records for stop {stop_id}")

        repo = DatabaseStudentBoardingRepository(db)
        boardings = await repo.get_stop_boardings(str(stop_id))

        Logger.info(f"Retrieved {len(boardings)} boarding records for stop {stop_id}")

        return [
            StudentBoardingResponse(
                id=int(boarding.id),
                trip_id=int(boarding.trip_id),
                stop_id=int(boarding.stop_id),
                student_id=int(boarding.student_id),
                student_name=boarding.student_name,
                status=boarding.status.value,
                boarding_time=boarding.boarding_time,
                created_at=boarding.created_at,
            )
            for boarding in boardings
        ]

    except Exception as e:
        Logger.error(f"Error fetching stop boarding records: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch stop boarding records",
        )