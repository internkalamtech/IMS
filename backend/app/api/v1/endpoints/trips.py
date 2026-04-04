"""
Trip management endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.trip_repository import DatabaseTripRepository
from app.api.schemas import TripCreateRequest, TripResponse

router = APIRouter(prefix="/trips", tags=["Trip Management"])


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    request: TripCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new trip."""
    try:
        from app.domain.entities.trip import Trip, TripStatus, TripType
        from datetime import datetime
        
        trip = Trip(
            id="temp",
            driver_id=str(request.driver_id),
            route_id=request.route_id,
            vehicle_id=request.vehicle_id,
            trip_type=TripType(request.trip_type),
            status=TripStatus.SCHEDULED,
            scheduled_start=request.scheduled_start,
            total_students=request.total_students,
        )
        
        repo = DatabaseTripRepository(db)
        created_trip = await repo.create_trip(trip)
        await db.commit()
        
        return TripResponse(
            id=int(created_trip.id),
            driver_id=int(created_trip.driver_id),
            status=created_trip.status.value,
            total_students=created_trip.total_students,
            boarded_count=created_trip.boarded_count,
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: int, db: AsyncSession = Depends(get_db)):
    """Get a trip by ID."""
    try:
        repo = DatabaseTripRepository(db)
        trip = await repo.get_trip(str(trip_id))
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        return TripResponse(
            id=int(trip.id),
            driver_id=int(trip.driver_id),
            status=trip.status.value,
            total_students=trip.total_students,
            boarded_count=trip.boarded_count,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))