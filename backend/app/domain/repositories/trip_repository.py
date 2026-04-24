"""
Trip repository interfaces (contracts).
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.trip import Trip, TripStatus
from app.domain.entities.trip_stop import TripStop, StopStatus
from app.domain.entities.student_boarding import StudentBoarding


class TripRepository(ABC):
    """Abstract repository for Trip operations."""

    @abstractmethod
    async def create_trip(self, trip: Trip) -> Trip:
        """Create a new trip."""
        pass

    @abstractmethod
    async def get_trip(self, trip_id: str) -> Optional[Trip]:
        """Get trip by ID."""
        pass

    @abstractmethod
    async def update_trip_status(self, trip_id: str, status: TripStatus) -> Trip:
        """Update trip status."""
        pass

    @abstractmethod
    async def get_driver_trips(self, driver_id: str) -> List[Trip]:
        """Get all trips for a driver."""
        pass

    @abstractmethod
    async def get_today_trips(self, driver_id: str) -> List[Trip]:
        """Get all trips for a driver scheduled for today."""
        pass


class TripStopRepository(ABC):
    """Abstract repository for TripStop operations."""

    @abstractmethod
    async def create_stop(self, stop: TripStop) -> TripStop:
        """Create a new trip stop."""
        pass

    @abstractmethod
    async def get_stop(self, stop_id: str) -> Optional[TripStop]:
        """Get stop by ID."""
        pass

    @abstractmethod
    async def update_stop_status(self, stop_id: str, status: StopStatus) -> TripStop:
        """Update stop status."""
        pass

    @abstractmethod
    async def get_trip_stops(self, trip_id: str) -> List[TripStop]:
        """Get all stops for a trip."""
        pass


class StudentBoardingRepository(ABC):
    """Abstract repository for StudentBoarding operations."""

    @abstractmethod
    async def create_boarding(self, boarding: StudentBoarding) -> StudentBoarding:
        """Log a student boarding event."""
        pass

    @abstractmethod
    async def get_trip_boardings(self, trip_id: str) -> List[StudentBoarding]:
        """Get all boarding events for a trip."""
        pass