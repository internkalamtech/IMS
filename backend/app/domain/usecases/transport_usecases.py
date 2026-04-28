from typing import List, Optional
from app.domain.entities.transport import (
    TransportRepository, Route, Alert, Document,
    ComplianceStatus, TransportStats
)


class GetRoutesUseCase:
    """Use case for getting all transport routes."""

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self) -> List[Route]:
        """Execute the get routes use case."""
        return await self.transport_repository.get_routes()


class GetRouteUseCase:
    """Use case for getting a specific route."""

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self, route_id: str) -> Optional[Route]:
        """Execute the get route use case."""
        return await self.transport_repository.get_route(route_id)


class GetAlertsUseCase:
    """Use case for getting transport alerts."""

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self, limit: Optional[int] = 10) -> List[Alert]:
        """Execute the get alerts use case."""
        return await self.transport_repository.get_alerts(limit)


class GetExpiringDocumentsUseCase:
    """Use case for getting expiring documents."""

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self, days: int = 30) -> List[Document]:
        """Execute the get expiring documents use case."""
        return await self.transport_repository.get_expiring_documents(days)


class GetComplianceStatusUseCase:
    """Use case for getting compliance status."""

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self) -> ComplianceStatus:
        """Execute the get compliance status use case."""
        return await self.transport_repository.get_compliance_status()


class GetTransportStatsUseCase:
    """Use case for getting transport statistics."""

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self) -> TransportStats:
        """Execute the get transport stats use case."""
        return await self.transport_repository.get_transport_stats()
