import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

from app.core.password import hash_password
from app.core.security import create_access_token
from app.infrastructure.database.models import (
    RoleModel,
    StudentProfileModel,
    UserModel,
    parent_child_link,
)
from app.main import app


async def _get_or_create_role(db, role_name: str):
    result = await db.execute(select(RoleModel).where(RoleModel.name == role_name))
    role = result.scalar_one_or_none()
    if role is None:
        role = RoleModel(name=role_name, description=f"{role_name.capitalize()} role")
        db.add(role)
        await db.commit()
        await db.refresh(role)
    return role


async def _create_user(db, email: str, name: str, role_name: str):
    role = await _get_or_create_role(db, role_name)
    user = UserModel(
        email=email,
        password_hash=hash_password("password123"),
        name=name,
        is_active=True,
    )
    user.roles.append(role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.mark.asyncio
async def test_parent_dashboard_stats_returns_children(db):
    suffix = uuid.uuid4().hex[:8]
    parent_user = await _create_user(
        db,
        f"parent-test-{suffix}@myuser.com",
        "Parent Test",
        "parent",
    )
    student_user = await _create_user(
        db,
        f"student-test-{suffix}@myuser.com",
        "Student Test",
        "student",
    )

    await db.execute(
        parent_child_link.insert().values(
            parent_id=parent_user.id,
            child_id=student_user.id,
        )
    )

    # Create profile for student child
    profile = StudentProfileModel(
        student_id=student_user.id,
        attendance_percent=96,
        avg_marks=912,
        fee_status="Pending",
        outstanding_fee=450,
    )
    db.add(profile)
    await db.commit()

    token = create_access_token(
        data={"sub": str(parent_user.id), "email": parent_user.email}
    )
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as client:
        response = await client.get("/api/v1/dashboard/stats")

    assert response.status_code == 200
    body = response.json()
    assert body["role"] == "Parent"
    assert isinstance(body.get("children"), list)
    assert body["children"][0]["name"] == "Student Test"
    assert body["selected_child_id"] == str(student_user.id)


@pytest.mark.asyncio
async def test_student_dashboard_stats_returns_profile_values(db):
    suffix = uuid.uuid4().hex[:8]
    student_user = await _create_user(
        db,
        f"student-test2-{suffix}@myuser.com",
        "Student Test2",
        "student",
    )
    profile = StudentProfileModel(
        student_id=student_user.id,
        attendance_percent=87,
        avg_marks=830,
        fee_status="Paid",
        outstanding_fee=0,
    )
    db.add(profile)
    await db.commit()

    token = create_access_token(
        data={"sub": str(student_user.id), "email": student_user.email}
    )
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as client:
        response = await client.get("/api/v1/dashboard/stats")

    assert response.status_code == 200
    body = response.json()
    assert body["role"] == "Student"
    att_item = next(s for s in body["stats"] if s["label"] == "Attendance")
    assert att_item["value"] == "87%"
