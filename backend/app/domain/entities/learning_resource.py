"""
Domain entity for Learning Resource.

Entities represent core business objects with no dependencies
on external frameworks.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional


# Type alias for resource types
ResourceType = Literal["pdf", "ppt", "video", "link", "document"]
ResourceCategory = Literal["textbook", "reference", "solved_problems", "notes", "practice"]


@dataclass
class LearningResource:
    """
    Learning Resource entity representing educational materials in the system.

    Attributes:
        id: Unique identifier for the resource
        title: Title of the resource
        description: Detailed description of the resource
        resource_type: Type of resource (pdf, ppt, video, link, document)
        category: Category of the resource (textbook, reference, etc.)
        subject_id: ID of the subject this resource belongs to
        class_id: ID of the class this resource is for
        file_path: Local file path if uploaded
        external_link: External link if it's a URL resource
        file_size: Size of the file in bytes
        content_type: MIME type of the resource
        uploaded_by_id: ID of the user who uploaded the resource
        is_published: Whether the resource is published and visible to students
        created_at: When the resource was created
        updated_at: When the resource was last updated
    """

    id: int
    title: str
    description: Optional[str]
    resource_type: ResourceType
    category: ResourceCategory
    subject_id: int
    class_id: int
    file_path: Optional[str]
    external_link: Optional[str]
    file_size: Optional[int]
    content_type: Optional[str]
    uploaded_by_id: Optional[int]
    is_published: bool
    created_at: datetime
    updated_at: datetime
