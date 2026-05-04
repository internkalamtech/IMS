"""
Tests for dashboard endpoints.

Tests the parent and student dashboard endpoints that were created for issue #429.
"""

import pytest
from app.api.schemas import (
    RecentUpdate,
    ChildInfo,
    ParentDashboardResponse,
    StudentDashboardResponse,
    StatItem,
)


@pytest.mark.asyncio
async def test_dashboard_schemas_valid():
    """Test that dashboard schemas are properly defined."""
    
    # Test RecentUpdate schema
    update = RecentUpdate(
        icon="book",
        title="Test Update",
        subtitle="Test Subtitle",
        timestamp="2 hours ago",
        type="homework"
    )
    assert update.icon == "book"
    assert update.title == "Test Update"
    assert update.type == "homework"
    print("✅ RecentUpdate schema validated")
    
    # Test ChildInfo schema
    child = ChildInfo(
        id="123",
        name="Child Name",
        class_name="7-A",
        roll_number="001",
        avatar_initials="CN"
    )
    assert child.name == "Child Name"
    assert child.avatar_initials == "CN"
    print("✅ ChildInfo schema validated")
    
    # Test StatItem schema
    stat = StatItem(label="Attendance", value="88%")
    assert stat.label == "Attendance"
    assert stat.value == "88%"
    print("✅ StatItem schema validated")
    
    # Test ParentDashboardResponse schema
    parent_response = ParentDashboardResponse(
        role="Parent",
        child=child,
        stats=[stat],
        recent_updates=[update]
    )
    assert parent_response.role == "Parent"
    assert parent_response.child.name == "Child Name"
    assert len(parent_response.stats) == 1
    assert len(parent_response.recent_updates) == 1
    print("✅ ParentDashboardResponse schema validated")
    
    # Test StudentDashboardResponse schema
    student_response = StudentDashboardResponse(
        role="Student",
        stats=[stat],
        recent_updates=[update]
    )
    assert student_response.role == "Student"
    assert len(student_response.stats) == 1
    assert len(student_response.recent_updates) == 1
    print("✅ StudentDashboardResponse schema validated")


@pytest.mark.asyncio
async def test_dashboard_imports():
    """Test that all dashboard imports work correctly."""
    try:
        from app.api.v1.endpoints.dashboard import router
        from app.infrastructure.database.models import StudentModel, ParentModel
        
        assert router is not None
        assert StudentModel is not None
        assert ParentModel is not None
        print("✅ Dashboard imports successful")
        print(f"✅ Router has {len(router.routes)} routes")
    except ImportError as e:
        pytest.fail(f"Import error in dashboard module: {e}")


@pytest.mark.asyncio
async def test_dashboard_endpoint_routes():
    """Test that dashboard endpoint routes are registered."""
    from app.api.v1.endpoints.dashboard import router
    
    # Check that router has routes
    assert hasattr(router, 'routes')
    
    # Get all route paths
    route_paths = []
    for route in router.routes:
        if hasattr(route, 'path'):
            route_paths.append(route.path)
    
    print(f"✅ Found {len(route_paths)} routes in dashboard router")
    print(f"   Routes: {route_paths}")
    
    # Should have /stats, /parent, and /student endpoints
    assert any('/stats' in path for path in route_paths), "Missing /stats endpoint"
    print("✅ /stats endpoint registered")


@pytest.mark.asyncio  
async def test_recent_update_types():
    """Test RecentUpdate type validation."""
    valid_types = ["homework", "exam", "announcement", "fee", "meeting"]
    
    for update_type in valid_types:
        update = RecentUpdate(
            icon="test",
            title="Test",
            subtitle="Test",
            timestamp="now",
            type=update_type
        )
        assert update.type == update_type
    
    print(f"✅ All {len(valid_types)} RecentUpdate types validated: {valid_types}")


@pytest.mark.asyncio
async def test_child_info_validation():
    """Test ChildInfo data validation."""
    child = ChildInfo(
        id="12345",
        name="Aarav Kumar",
        class_name="7-B",
        roll_number="23",
        avatar_initials="AK"
    )
    
    # Validate all fields are present and correct
    assert child.id == "12345"
    assert child.name == "Aarav Kumar"
    assert child.class_name == "7-B"
    assert child.roll_number == "23"
    assert child.avatar_initials == "AK"
    
    print("✅ ChildInfo data validation passed")


@pytest.mark.asyncio
async def test_parent_dashboard_response_with_data():
    """Test ParentDashboardResponse with realistic data."""
    child = ChildInfo(
        id="1",
        name="Aarav Kumar",
        class_name="7-B",
        roll_number="23",
        avatar_initials="AK"
    )
    
    stats = [
        StatItem(label="Attendance", value="88%"),
        StatItem(label="Avg Marks", value="85%"),
    ]
    
    updates = [
        RecentUpdate(
            icon="book",
            title="New Homework Assigned",
            subtitle="Mathematics - Due on Jan 25",
            timestamp="2 hours ago",
            type="homework"
        ),
        RecentUpdate(
            icon="checkmark-circle",
            title="Test Results Published",
            subtitle="Science - Score: 92/100",
            timestamp="1 day ago",
            type="exam"
        ),
        RecentUpdate(
            icon="calendar",
            title="Parent-Teacher Meeting",
            subtitle="January 28, 2026 at 3:00 PM",
            timestamp="2 days ago",
            type="meeting"
        ),
    ]
    
    response = ParentDashboardResponse(
        role="Parent",
        child=child,
        stats=stats,
        recent_updates=updates
    )
    
    # Validate response structure
    assert response.role == "Parent"
    assert response.child.name == "Aarav Kumar"
    assert len(response.stats) == 2
    assert len(response.recent_updates) == 3
    assert response.stats[0].label == "Attendance"
    assert response.recent_updates[0].type == "homework"
    
    print("✅ ParentDashboardResponse with realistic data validated")


@pytest.mark.asyncio
async def test_student_dashboard_response_with_data():
    """Test StudentDashboardResponse with realistic data."""
    stats = [
        StatItem(label="Attendance", value="94.5%"),
        StatItem(label="Avg Marks", value="87.2%"),
    ]
    
    updates = [
        RecentUpdate(
            icon="book",
            title="Mathematics Homework Assigned",
            subtitle="Chapter 5 - Algebra",
            timestamp="2 hours ago",
            type="homework"
        ),
        RecentUpdate(
            icon="school",
            title="Science Test Result Published",
            subtitle="Score: 85/100",
            timestamp="5 hours ago",
            type="exam"
        ),
        RecentUpdate(
            icon="megaphone",
            title="Sports Day Announcement",
            subtitle="January 25, 2026",
            timestamp="1 day ago",
            type="announcement"
        ),
        RecentUpdate(
            icon="mail",
            title="Fee Payment Reminder",
            subtitle="Due: January 30, 2026",
            timestamp="2 days ago",
            type="fee"
        ),
    ]
    
    response = StudentDashboardResponse(
        role="Student",
        stats=stats,
        recent_updates=updates
    )
    
    # Validate response structure
    assert response.role == "Student"
    assert len(response.stats) == 2
    assert len(response.recent_updates) == 4
    assert response.stats[0].value == "94.5%"
    assert response.recent_updates[0].type == "homework"
    assert response.recent_updates[3].type == "fee"
    
    print("✅ StudentDashboardResponse with realistic data validated")
