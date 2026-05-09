"""
Domain entity for Homework.

Entities represent core business objects with no dependencies
on external frameworks.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional


# Type alias for homework status
HomeworkStatus = Literal["pending", "submitted", "overdue", "completed"]


@dataclass
class Homework:
    """
    Homework entity representing a homework assignment in the system.

    Attributes:
        id: Unique identifier for the homework
        child_id: ID of the student (child) this homework belongs to
        teacher_id: ID of the teacher who assigned the homework
        subject: Subject name (e.g., Mathematics)
        title: Title of the homework
        description: Detailed description of the homework
        due_date: When the homework is due
        status: Current status of the homework
        created_at: When the homework was created
        updated_at: When the homework was last updated
    """

    id: int
    child_id: int
    teacher_id: Optional[int]
    subject: str
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    status: HomeworkStatus
    created_at: datetime
    updated_at: datetime

