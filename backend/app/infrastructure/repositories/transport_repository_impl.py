from typing import List, Optional
from datetime import datetime, timedelta
from app.domain.entities.transport import (
    TransportRepository, Route, Alert, Document, ComplianceStatus, TransportStats
)


class TransportRepositoryImpl(TransportRepository):
    """Transport repository implementation with mock data."""

    # Mock data for demonstration - in production this would come from database
    MOCK_ROUTES = [
        {
            "id": "route_001",
            "name": "Route A - School Express",
            "status": "on_time",
            "total_stops": 8,
            "total_students": 45,
            "assigned_bus": "BUS-001",
            "driver": "John Smith",
            "next_stop": "Stop 3 - Oak Street",
            "next_time": "14:15",
            "current_location": {"lat": 28.6139, "lng": 77.2090},
            "delay_minutes": 0
        },
        {
            "id": "route_002",
            "name": "Route B - City Loop",
            "status": "delayed",
            "total_stops": 12,
            "total_students": 62,
            "assigned_bus": "BUS-003",
            "driver": "Mike Johnson",
            "next_stop": "Stop 7 - Central Mall",
            "next_time": "14:30",
            "current_location": {"lat": 28.7041, "lng": 77.1025},
            "delay_minutes": 15
        },
        {
            "id": "route_003",
            "name": "Route C - Residential Area",
            "status": "on_time",
            "total_stops": 10,
            "total_students": 38,
            "assigned_bus": "BUS-005",
            "driver": "Sarah Wilson",
            "next_stop": "Stop 4 - Green Valley",
            "next_time": "15:00",
            "current_location": {"lat": 28.5355, "lng": 77.3910},
            "delay_minutes": 0
        }
    ]

    MOCK_ALERTS = [
        {
            "id": "alert_001",
            "bus_id": "BUS-007",
            "type": "danger",
            "message": "Over-speeding detected - 68 km/h in 50 km/h zone",
            "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(),
            "location": "NH-8 Highway",
            "resolved": False
        },
        {
            "id": "alert_002",
            "bus_id": "BUS-002",
            "type": "warning",
            "message": "Route B delayed by 10 minutes due to traffic",
            "timestamp": (datetime.now() - timedelta(minutes=25)).isoformat(),
            "location": "Ring Road Junction",
            "resolved": False
        },
        {
            "id": "alert_003",
            "bus_id": "BUS-012",
            "type": "maintenance",
            "message": "Insurance expires in 7 days",
            "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
            "location": "N/A",
            "resolved": False
        },
        {
            "id": "alert_004",
            "bus_id": "BUS-005",
            "type": "alert",
            "message": "Student misbehavior reported",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "location": "Stop 3 - Oak Street",
            "resolved": False
        }
    ]

    MOCK_DOCUMENTS = [
        {
            "id": "doc_001",
            "bus_id": "BUS-012",
            "type": "Insurance",
            "document_number": "INS2024001",
            "expiry_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "status": "expiring_soon",
            "days_left": 7
        },
        {
            "id": "doc_002",
            "bus_id": "BUS-008",
            "type": "Pollution Certificate",
            "document_number": "PC2024005",
            "expiry_date": (datetime.now() + timedelta(days=14)).isoformat(),
            "status": "expiring_soon",
            "days_left": 14
        },
        {
            "id": "doc_003",
            "bus_id": "BUS-003",
            "type": "Fitness Certificate",
            "document_number": "FC2024012",
            "expiry_date": (datetime.now() - timedelta(days=5)).isoformat(),
            "status": "expired",
            "days_left": -5
        }
    ]

    async def get_routes(self) -> List[Route]:
        """Get all transport routes."""
        routes = []
        for route_data in self.MOCK_ROUTES:
            route = Route(**route_data)
            routes.append(route)
        return routes

    async def get_route(self, route_id: str) -> Optional[Route]:
        """Get a specific route by ID."""
        route_data = next((r for r in self.MOCK_ROUTES if r["id"] == route_id), None)
        if not route_data:
            return None
        return Route(**route_data)

    async def get_alerts(self, limit: Optional[int] = 10) -> List[Alert]:
        """Get recent alerts."""
        alerts = []
        for alert_data in self.MOCK_ALERTS[:limit]:
            alert = Alert(**alert_data)
            alerts.append(alert)
        return alerts

    async def get_expiring_documents(self, days: int = 30) -> List[Document]:
        """Get documents expiring within specified days."""
        documents = []
        for doc_data in self.MOCK_DOCUMENTS:
            if doc_data["days_left"] <= days and doc_data["days_left"] > 0:
                doc = Document(**doc_data)
                documents.append(doc)
        return documents

    async def get_compliance_status(self) -> ComplianceStatus:
        """Get compliance status summary."""
        valid_count = 0
        expiring_count = 0
        expired_count = 0

        for doc in self.MOCK_DOCUMENTS:
            if doc["status"] == "valid":
                valid_count += 1
            elif doc["status"] == "expiring_soon":
                expiring_count += 1
            elif doc["status"] == "expired":
                expired_count += 1

        # Add some mock valid documents that aren't in our expiring list
        valid_count += 24  # Total valid documents

        return ComplianceStatus(
            valid_documents=valid_count,
            expiring_soon=expiring_count,
            expired=expired_count
        )

    async def get_transport_stats(self) -> TransportStats:
        """Get comprehensive transport statistics."""
        # Calculate stats from mock data
        total_routes = len(self.MOCK_ROUTES)
        active_trips = len([r for r in self.MOCK_ROUTES if r["status"] in ["on_time", "delayed"]])
        total_students = sum(r["total_students"] for r in self.MOCK_ROUTES)
        total_buses = len(set(r["assigned_bus"] for r in self.MOCK_ROUTES))

        # Compliance stats
        valid_docs = 24
        expiring_docs = len([d for d in self.MOCK_DOCUMENTS if d["status"] == "expiring_soon"])
        expired_docs = len([d for d in self.MOCK_DOCUMENTS if d["status"] == "expired"])

        # Alert stats
        active_alerts = len([a for a in self.MOCK_ALERTS if not a["resolved"]])

        return TransportStats(
            total_routes=total_routes,
            active_trips=active_trips,
            total_students=total_students,
            total_buses=total_buses,
            valid_documents=valid_docs,
            expiring_documents=expiring_docs,
            expired_documents=expired_docs,
            active_alerts=active_alerts
        )
