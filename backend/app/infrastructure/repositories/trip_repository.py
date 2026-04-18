"""
Database-backed implementation of Trip repositories.

This module implements the TripRepository, TripStopRepository, and 
StudentBoardingRepository interfaces using PostgreSQL with SQLAlchemy ORM.

Following Clean Architecture principles:
- Implements domain repository interfaces
- Uses infrastructure layer (database models)
- Handles data mapping between database models and domain entities
- Proper error handling and logging
- Async/await for database operations
"""

from datetime import datetime, date
from typing import List, Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import (
    DatabaseError,
    NotFoundError,
)
from app.core.logger import Logger
from app.domain.entities.trip import Trip, TripStatus, TripType
from app.domain.entities.trip_stop import TripStop, StopStatus
from app.domain.entities.student_boarding import StudentBoarding, BoardingStatus
from app.domain.repositories.trip_repository import (
    TripRepository,
    TripStopRepository,
    StudentBoardingRepository,
)
from app.infrastructure.database.models import (
    TripModel,
    TripStopModel,
    StudentBoardingModel,
)


# ============================================================================
# TRIP REPOSITORY IMPLEMENTATION
# ============================================================================

class DatabaseTripRepository(TripRepository):
    """
    Database-backed implementation of TripRepository.

    Uses PostgreSQL with SQLAlchemy for data persistence and async operations.
    Handles creation, retrieval, and status updates for trips.
    """

    def __init__(self, db_session: AsyncSession) -> None:
        """
        Initialize repository with database session.

        Args:
            db_session: SQLAlchemy async session for database operations
        """
        self.db = db_session

    async def create_trip(self, trip: Trip) -> Trip:
        """
        Create a new trip in the database.

        Args:
            trip: Trip domain entity to be created

        Returns:
            Trip entity with database ID and timestamps set

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Creating trip for driver {trip.driver_id}")

            # Create database model from domain entity
            db_trip = TripModel(
                driver_id=int(trip.driver_id),
                route_id=trip.route_id,
                vehicle_id=trip.vehicle_id,
                trip_type=trip.trip_type.value,
                status=trip.status.value,
                scheduled_start=trip.scheduled_start,
                total_students=trip.total_students,
                boarded_count=trip.boarded_count,
                notes=trip.notes,
            )

            # Add to session and flush (insert without commit)
            self.db.add(db_trip)
            await self.db.flush()

            # Update domain entity with database-generated values
            trip.id = str(db_trip.id)
            trip.created_at = db_trip.created_at
            trip.updated_at = db_trip.updated_at

            Logger.info(f"Trip created successfully with ID: {db_trip.id}")
            return trip

        except Exception as e:
            Logger.error(f"Database error creating trip: {e}", exc_info=True)
            raise DatabaseError(f"Failed to create trip: {str(e)}")

    async def get_trip(self, trip_id: str) -> Optional[Trip]:
        """
        Retrieve a trip by ID.

        Args:
            trip_id: Unique identifier of the trip

        Returns:
            Trip entity if found, None otherwise

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching trip with ID: {trip_id}")

            # Query trip by ID
            result = await self.db.execute(
                select(TripModel).where(TripModel.id == int(trip_id))
            )
            db_trip = result.scalar_one_or_none()

            if not db_trip:
                Logger.warning(f"Trip not found with ID: {trip_id}")
                return None

            Logger.info(f"Trip retrieved successfully: {trip_id}")
            return self._model_to_entity(db_trip)

        except ValueError:
            # Invalid trip_id format
            Logger.warning(f"Invalid trip ID format: {trip_id}")
            return None
        except Exception as e:
            Logger.error(f"Database error fetching trip: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch trip: {str(e)}")

    async def update_trip_status(self, trip_id: str, status: TripStatus) -> Trip:
        """
        Update the status of a trip.

        Also sets actual_start when trip transitions to IN_PROGRESS
        and actual_end when trip is COMPLETED.

        Args:
            trip_id: ID of the trip to update
            status: New status for the trip

        Returns:
            Updated Trip entity

        Raises:
            NotFoundError: If trip not found
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Updating trip {trip_id} status to {status.value}")

            # Fetch trip
            result = await self.db.execute(
                select(TripModel).where(TripModel.id == int(trip_id))
            )
            db_trip = result.scalar_one_or_none()

            if not db_trip:
                Logger.warning(f"Trip not found for update: {trip_id}")
                raise NotFoundError(f"Trip with ID {trip_id} not found")

            # Update status
            db_trip.status = status.value
            db_trip.updated_at = datetime.utcnow()

            # Set actual_start when trip starts
            if status == TripStatus.IN_PROGRESS and not db_trip.actual_start:
                db_trip.actual_start = datetime.utcnow()
                Logger.info(f"Trip {trip_id} started at {db_trip.actual_start}")

            # Set actual_end when trip completes
            elif status == TripStatus.COMPLETED and not db_trip.actual_end:
                db_trip.actual_end = datetime.utcnow()
                Logger.info(f"Trip {trip_id} completed at {db_trip.actual_end}")

            await self.db.flush()

            Logger.info(f"Trip {trip_id} status updated to {status.value}")
            return self._model_to_entity(db_trip)

        except NotFoundError:
            raise
        except ValueError:
            Logger.warning(f"Invalid trip ID format: {trip_id}")
            raise DatabaseError("Invalid trip ID format")
        except Exception as e:
            Logger.error(f"Database error updating trip status: {e}", exc_info=True)
            raise DatabaseError(f"Failed to update trip status: {str(e)}")

    async def get_driver_trips(self, driver_id: str) -> List[Trip]:
        """
        Retrieve all trips for a specific driver.

        Args:
            driver_id: ID of the driver

        Returns:
            List of Trip entities for the driver

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching all trips for driver {driver_id}")

            result = await self.db.execute(
                select(TripModel)
                .where(TripModel.driver_id == int(driver_id))
                .order_by(TripModel.scheduled_start.desc())
            )
            db_trips = result.scalars().all()

            trips = [self._model_to_entity(trip) for trip in db_trips]

            Logger.info(f"Retrieved {len(trips)} trips for driver {driver_id}")
            return trips

        except ValueError:
            Logger.warning(f"Invalid driver ID format: {driver_id}")
            return []
        except Exception as e:
            Logger.error(f"Database error fetching driver trips: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch driver trips: {str(e)}")

    async def get_today_trips(self, driver_id: str) -> List[Trip]:
        """
        Retrieve all trips for a driver today.

        Args:
            driver_id: ID of the driver

        Returns:
            List of Trip entities scheduled for today

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching today's trips for driver {driver_id}")

            today = date.today()
            today_start = datetime(today.year, today.month, today.day, 0, 0, 0)
            today_end = datetime(today.year, today.month, today.day, 23, 59, 59)

            result = await self.db.execute(
                select(TripModel).where(
                    and_(
                        TripModel.driver_id == int(driver_id),
                        TripModel.scheduled_start >= today_start,
                        TripModel.scheduled_start <= today_end,
                    )
                )
                .order_by(TripModel.scheduled_start.asc())
            )
            db_trips = result.scalars().all()

            trips = [self._model_to_entity(trip) for trip in db_trips]

            Logger.info(f"Retrieved {len(trips)} trips for driver {driver_id} today")
            return trips

        except ValueError:
            Logger.warning(f"Invalid driver ID format: {driver_id}")
            return []
        except Exception as e:
            Logger.error(f"Database error fetching today's trips: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch today's trips: {str(e)}")

    @staticmethod
    def _model_to_entity(db_trip: TripModel) -> Trip:
        """
        Convert database model to domain entity.

        Args:
            db_trip: SQLAlchemy TripModel instance

        Returns:
            Trip domain entity

        Note:
            This is a static method because it doesn't need instance state.
            It can be called without instantiating the repository.
        """
        return Trip(
            id=str(db_trip.id),
            driver_id=str(db_trip.driver_id),
            route_id=db_trip.route_id,
            vehicle_id=db_trip.vehicle_id,
            trip_type=TripType(db_trip.trip_type),
            status=TripStatus(db_trip.status),
            scheduled_start=db_trip.scheduled_start,
            actual_start=db_trip.actual_start,
            actual_end=db_trip.actual_end,
            total_students=db_trip.total_students,
            boarded_count=db_trip.boarded_count,
            notes=db_trip.notes,
            created_at=db_trip.created_at,
            updated_at=db_trip.updated_at,
        )


# ============================================================================
# TRIP STOP REPOSITORY IMPLEMENTATION
# ============================================================================

class DatabaseTripStopRepository(TripStopRepository):
    """
    Database-backed implementation of TripStopRepository.

    Manages creation and retrieval of trip stops with status tracking.
    """

    def __init__(self, db_session: AsyncSession) -> None:
        """Initialize repository with database session."""
        self.db = db_session

    async def create_stop(self, stop: TripStop) -> TripStop:
        """
        Create a new trip stop.

        Args:
            stop: TripStop domain entity

        Returns:
            TripStop entity with database ID and timestamps

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(
                f"Creating stop '{stop.location_name}' "
                f"(sequence: {stop.stop_sequence}) for trip {stop.trip_id}"
            )

            db_stop = TripStopModel(
                trip_id=int(stop.trip_id),
                stop_sequence=stop.stop_sequence,
                location_name=stop.location_name,
                latitude=stop.latitude,
                longitude=stop.longitude,
                scheduled_time=stop.scheduled_time,
                expected_students=stop.expected_students,
                status=stop.status.value,
            )

            self.db.add(db_stop)
            await self.db.flush()

            stop.id = str(db_stop.id)
            stop.created_at = db_stop.created_at
            stop.updated_at = db_stop.updated_at

            Logger.info(f"Stop created successfully with ID: {db_stop.id}")
            return stop

        except Exception as e:
            Logger.error(f"Database error creating stop: {e}", exc_info=True)
            raise DatabaseError(f"Failed to create stop: {str(e)}")

    async def get_stop(self, stop_id: str) -> Optional[TripStop]:
        """
        Retrieve a trip stop by ID.

        Args:
            stop_id: Unique identifier of the stop

        Returns:
            TripStop entity if found, None otherwise

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching stop with ID: {stop_id}")

            result = await self.db.execute(
                select(TripStopModel).where(TripStopModel.id == int(stop_id))
            )
            db_stop = result.scalar_one_or_none()

            if not db_stop:
                Logger.warning(f"Stop not found with ID: {stop_id}")
                return None

            return self._model_to_entity(db_stop)

        except ValueError:
            Logger.warning(f"Invalid stop ID format: {stop_id}")
            return None
        except Exception as e:
            Logger.error(f"Database error fetching stop: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch stop: {str(e)}")

    async def update_stop_status(self, stop_id: str, status: StopStatus) -> TripStop:
        """
        Update the status of a trip stop.

        Sets actual_arrival when stop is reached (IN_PROGRESS)
        and actual_departure when stop is completed.

        Args:
            stop_id: ID of the stop
            status: New status

        Returns:
            Updated TripStop entity

        Raises:
            NotFoundError: If stop not found
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Updating stop {stop_id} status to {status.value}")

            result = await self.db.execute(
                select(TripStopModel).where(TripStopModel.id == int(stop_id))
            )
            db_stop = result.scalar_one_or_none()

            if not db_stop:
                Logger.warning(f"Stop not found for update: {stop_id}")
                raise NotFoundError(f"Stop with ID {stop_id} not found")

            db_stop.status = status.value
            db_stop.updated_at = datetime.utcnow()

            # Record arrival time
            if status == StopStatus.IN_PROGRESS and not db_stop.actual_arrival:
                db_stop.actual_arrival = datetime.utcnow()
                Logger.info(f"Stop {stop_id} arrival recorded")

            # Record departure time
            elif status == StopStatus.COMPLETED and not db_stop.actual_departure:
                db_stop.actual_departure = datetime.utcnow()
                Logger.info(f"Stop {stop_id} departure recorded")

            await self.db.flush()

            Logger.info(f"Stop {stop_id} status updated to {status.value}")
            return self._model_to_entity(db_stop)

        except NotFoundError:
            raise
        except ValueError:
            Logger.warning(f"Invalid stop ID format: {stop_id}")
            raise DatabaseError("Invalid stop ID format")
        except Exception as e:
            Logger.error(f"Database error updating stop status: {e}", exc_info=True)
            raise DatabaseError(f"Failed to update stop status: {str(e)}")

    async def get_trip_stops(self, trip_id: str) -> List[TripStop]:
        """
        Retrieve all stops for a trip, ordered by sequence.

        Args:
            trip_id: ID of the trip

        Returns:
            List of TripStop entities ordered by sequence

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching stops for trip {trip_id}")

            result = await self.db.execute(
                select(TripStopModel)
                .where(TripStopModel.trip_id == int(trip_id))
                .order_by(TripStopModel.stop_sequence.asc())
            )
            db_stops = result.scalars().all()

            stops = [self._model_to_entity(stop) for stop in db_stops]

            Logger.info(f"Retrieved {len(stops)} stops for trip {trip_id}")
            return stops

        except ValueError:
            Logger.warning(f"Invalid trip ID format: {trip_id}")
            return []
        except Exception as e:
            Logger.error(f"Database error fetching trip stops: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch trip stops: {str(e)}")

    @staticmethod
    def _model_to_entity(db_stop: TripStopModel) -> TripStop:
        """Convert database model to domain entity."""
        return TripStop(
            id=str(db_stop.id),
            trip_id=str(db_stop.trip_id),
            stop_sequence=db_stop.stop_sequence,
            location_name=db_stop.location_name,
            latitude=db_stop.latitude,
            longitude=db_stop.longitude,
            scheduled_time=db_stop.scheduled_time,
            actual_arrival=db_stop.actual_arrival,
            actual_departure=db_stop.actual_departure,
            expected_students=db_stop.expected_students,
            boarded_students=db_stop.boarded_students,
            status=StopStatus(db_stop.status),
            notes=db_stop.notes,
            created_at=db_stop.created_at,
            updated_at=db_stop.updated_at,
        )


# ============================================================================
# STUDENT BOARDING REPOSITORY IMPLEMENTATION
# ============================================================================

class DatabaseStudentBoardingRepository(StudentBoardingRepository):
    """
    Database-backed implementation of StudentBoardingRepository.

    Manages logging and retrieval of student boarding events.
    """

    def __init__(self, db_session: AsyncSession) -> None:
        """Initialize repository with database session."""
        self.db = db_session

    async def create_boarding(self, boarding: StudentBoarding) -> StudentBoarding:
        """
        Log a student boarding event.

        Args:
            boarding: StudentBoarding domain entity

        Returns:
            StudentBoarding entity with database ID and timestamps

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(
                f"Logging boarding: Student {boarding.student_id} "
                f"({boarding.student_name}) at stop {boarding.stop_id}"
            )

            # Use current time if not provided
            boarding_time = boarding.boarding_time or datetime.utcnow()

            db_boarding = StudentBoardingModel(
                trip_id=int(boarding.trip_id),
                stop_id=int(boarding.stop_id),
                student_id=int(boarding.student_id),
                student_name=boarding.student_name,
                status=boarding.status.value,
                boarding_time=boarding_time,
                notes=boarding.notes,
            )

            self.db.add(db_boarding)
            await self.db.flush()

            boarding.id = str(db_boarding.id)
            boarding.boarding_time = db_boarding.boarding_time
            boarding.created_at = db_boarding.created_at

            Logger.info(f"Boarding logged successfully with ID: {db_boarding.id}")
            return boarding

        except Exception as e:
            Logger.error(f"Database error logging boarding: {e}", exc_info=True)
            raise DatabaseError(f"Failed to log boarding: {str(e)}")

    async def get_boarding(self, boarding_id: str) -> Optional[StudentBoarding]:
        """
        Retrieve a boarding event by ID.

        Args:
            boarding_id: Unique identifier of the boarding event

        Returns:
            StudentBoarding entity if found, None otherwise

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching boarding with ID: {boarding_id}")

            result = await self.db.execute(
                select(StudentBoardingModel).where(
                    StudentBoardingModel.id == int(boarding_id)
                )
            )
            db_boarding = result.scalar_one_or_none()

            if not db_boarding:
                Logger.warning(f"Boarding not found with ID: {boarding_id}")
                return None

            return self._model_to_entity(db_boarding)

        except ValueError:
            Logger.warning(f"Invalid boarding ID format: {boarding_id}")
            return None
        except Exception as e:
            Logger.error(f"Database error fetching boarding: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch boarding: {str(e)}")

    async def get_stop_boardings(self, stop_id: str) -> List[StudentBoarding]:
        """
        Retrieve all boarding events for a specific stop.

        Args:
            stop_id: ID of the stop

        Returns:
            List of StudentBoarding entities

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching boardings for stop {stop_id}")

            result = await self.db.execute(
                select(StudentBoardingModel)
                .where(StudentBoardingModel.stop_id == int(stop_id))
                .order_by(StudentBoardingModel.boarding_time.asc())
            )
            db_boardings = result.scalars().all()

            boardings = [self._model_to_entity(b) for b in db_boardings]

            Logger.info(f"Retrieved {len(boardings)} boardings for stop {stop_id}")
            return boardings

        except ValueError:
            Logger.warning(f"Invalid stop ID format: {stop_id}")
            return []
        except Exception as e:
            Logger.error(f"Database error fetching stop boardings: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch stop boardings: {str(e)}")

    async def get_trip_boardings(self, trip_id: str) -> List[StudentBoarding]:
        """
        Retrieve all boarding events for a specific trip.

        Args:
            trip_id: ID of the trip

        Returns:
            List of StudentBoarding entities

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching boardings for trip {trip_id}")

            result = await self.db.execute(
                select(StudentBoardingModel)
                .where(StudentBoardingModel.trip_id == int(trip_id))
                .order_by(StudentBoardingModel.boarding_time.asc())
            )
            db_boardings = result.scalars().all()

            boardings = [self._model_to_entity(b) for b in db_boardings]

            Logger.info(f"Retrieved {len(boardings)} boardings for trip {trip_id}")
            return boardings

        except ValueError:
            Logger.warning(f"Invalid trip ID format: {trip_id}")
            return []
        except Exception as e:
            Logger.error(f"Database error fetching trip boardings: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch trip boardings: {str(e)}")

    @staticmethod
    def _model_to_entity(db_boarding: StudentBoardingModel) -> StudentBoarding:
        """Convert database model to domain entity."""
        return StudentBoarding(
            id=str(db_boarding.id),
            trip_id=str(db_boarding.trip_id),
            stop_id=str(db_boarding.stop_id),
            student_id=str(db_boarding.student_id),
            student_name=db_boarding.student_name,
            status=BoardingStatus(db_boarding.status),
            boarding_time=db_boarding.boarding_time,
            notes=db_boarding.notes,
            created_at=db_boarding.created_at,
            updated_at=db_boarding.updated_at,
        )