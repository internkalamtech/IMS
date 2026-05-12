"""
Repository interface for learning resource data access.

Repositories define abstract interfaces for data operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.learning_resource import LearningResource, ResourceCategory


class LearningResourceRepository(ABC):
    """
    Abstract repository for learning resource operations.

    This interface defines the contract for learning resource data access.
    Concrete implementations are provided in the infrastructure layer.
    """

    @abstractmethod
    async def get_resources_by_subject(
        self, subject_id: int, class_id: int
    ) -> List[LearningResource]:
        """
        Get all learning resources for a specific subject and class.

        Args:
            subject_id: Unique identifier of the subject
            class_id: Unique identifier of the class

        Returns:
            List of LearningResource entities for the subject and class

        Raises:
            DatabaseError: If database operation fails
        """
        pass

    @abstractmethod
    async def get_resources_by_category(
        self, subject_id: int, class_id: int, category: ResourceCategory
    ) -> List[LearningResource]:
        """
        Get learning resources filtered by category.

        Args:
            subject_id: Unique identifier of the subject
            class_id: Unique identifier of the class
            category: Category to filter by

        Returns:
            List of LearningResource entities matching the category

        Raises:
            DatabaseError: If database operation fails
        """
        pass

    @abstractmethod
    async def get_resource_by_id(self, resource_id: int) -> Optional[LearningResource]:
        """
        Get a specific learning resource by ID.

        Args:
            resource_id: Unique identifier of the resource

        Returns:
            LearningResource entity if found, None otherwise

        Raises:
            DatabaseError: If database operation fails
        """
        pass

    @abstractmethod
    async def get_published_resources_by_subject(
        self, subject_id: int, class_id: int
    ) -> List[LearningResource]:
        """
        Get only published learning resources for a subject and class.

        Args:
            subject_id: Unique identifier of the subject
            class_id: Unique identifier of the class

        Returns:
            List of published LearningResource entities

        Raises:
            DatabaseError: If database operation fails
        """
        pass
