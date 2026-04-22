"""
Pydantic schemas for class-related API operations.
"""

from pydantic import BaseModel, ConfigDict


class AssignTeacherRequest(BaseModel):
    """Request body for assigning or removing a class teacher."""

    teacherUserId: int | None

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"teacherUserId": 5},
                {"teacherUserId": None},
            ]
        }
    )
