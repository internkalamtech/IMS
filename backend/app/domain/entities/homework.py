"""
Domain entity for Homework.

Entities represent core business objects with no dependencies
on external frameworks.
"""

from dataclasses import dataclass
from typing import Literal


# Type alias for homework status
HomeworkStatus = Literal["pending", "submitted", "overdue"]


@dataclass
class Homework:
    """
    Homework entity representing a homework assignment in the system.

    Attributes:
        id: Unique identifier for the homework
        child_id: ID of the student (child) this homework belongs to
        subject: Subject name (e.g., Mathematics)
        title: Title of the homework
        status: Current status of the homework
    """

    id: str
    child_id: str
    subject: str
    title: str
    status: HomeworkStatus
