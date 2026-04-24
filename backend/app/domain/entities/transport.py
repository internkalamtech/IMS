from typing import List, Optional, Dict
from abc import ABC, abstractmethod


class Route:
    """Transport route entity."""

    def __init__(
        self,
        id: str,
        name: str,
        status: str,
        total_stops: int,
        total_students: int,
        assigned_bus: str,
        driver: str,
        next_stop: Optional[str] = None,
        next_time: Optional[str] = None,
        current_location: Optional[Dict[str, float]] = None,
        delay_minutes: int = 0
    ):
        self.id = id
        self.name = name
        self.status = status
        self.total_stops = total_stops
        self.total_students = total_students
        self.assigned_bus = assigned_bus
        self.driver = driver
        self.next_stop = next_stop
        self.next_time = next_time
        self.current_location = current_location
        self.delay_minutes = delay_minutes


class Alert:
    """Transport alert entity."""

    def __init__(
        self,
        id: str,
        bus_id: str,
        type: str,
        message: str,
        timestamp: str,
        location: str,
        resolved: bool = False
    ):
        self.id = id
        self.bus_id = bus_id
        self.type = type
        self.message = message
        self.timestamp = timestamp
        self.location = location
        self.resolved = resolved


class Document:
    """Compliance document entity."""

    def __init__(
        self,
        id: str,
        bus_id: str,
        type: str,
        document_number: str,
        expiry_date: str,
        status: str,
        days_left: int
    ):
        self.id = id
        self.bus_id = bus_id
        self.type = type
        self.document_number = document_number
        self.expiry_date = expiry_date
        self.status = status
        self.days_left = days_left


class ComplianceStatus:
    """Compliance status summary entity."""

    def __init__(
        self,
        valid_documents: int,
        expiring_soon: int,
        expired: int
    ):
        self.valid_documents = valid_documents
        self.expiring_soon = expiring_soon
        self.expired = expired


class TransportStats:
    """Transport statistics entity."""

    def __init__(
        self,
        total_routes: int,
        active_trips: int,
        total_students: int,
        total_buses: int,
        valid_documents: int,
        expiring_documents: int,
        expired_documents: int,
        active_alerts: int
    ):
        self.total_routes = total_routes
        self.active_trips = active_trips
        self.total_students = total_students
        self.total_buses = total_buses
        self.valid_documents = valid_documents
        self.expiring_documents = expiring_documents
        self.expired_documents = expired_documents
        self.active_alerts = active_alerts


class TransportRepository(ABC):
    """Transport repository interface."""

    @abstractmethod
    async def get_routes(self) -> List[Route]:
        """Get all transport routes."""
        pass

    @abstractmethod
    async def get_route(self, route_id: str) -> Optional[Route]:
        """Get a specific route by ID."""
        pass

    @abstractmethod
    async def get_alerts(self, limit: Optional[int] = 10) -> List[Alert]:
        """Get recent alerts."""
        pass

    @abstractmethod
    async def get_expiring_documents(self, days: int = 30) -> List[Document]:
        """Get documents expiring within specified days."""
        pass

    @abstractmethod
    async def get_compliance_status(self) -> ComplianceStatus:
        """Get compliance status summary."""
        pass

    @abstractmethod
    async def get_transport_stats(self) -> TransportStats:
        """Get comprehensive transport statistics."""
        pass
