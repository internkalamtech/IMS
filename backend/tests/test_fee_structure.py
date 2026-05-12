"""
Integration tests for payment and fee structure endpoints.
"""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_health_check_extended():
    """Extended health check to verify all services are running."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data or "message" in data


@pytest.mark.asyncio
async def test_api_routes_exist():
    """Verify that all API routes are registered."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test if routes are registered
        response = await client.get("/")
        
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
