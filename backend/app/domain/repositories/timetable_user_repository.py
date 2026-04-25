"""
backend/app/domain/repositories/timetable_repository.py
backend/app/domain/repositories/user_repository.py
PHASE_3: Timetable & User Repositories
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.entities.timetable_entity import TimetableEntity
from app.domain.entities.user_entity import UserEntity


class TimetableRepository(ABC):
    @abstractmethod
    async def create(self, entity: TimetableEntity) -> TimetableEntity:
        pass
    
    @abstractmethod
    async def get_by_id(self, timetable_id: str) -> Optional[TimetableEntity]:
        pass
    
    @abstractmethod
    async def get_by_class(self, class_id: str, academic_year: str) -> Optional[TimetableEntity]:
        pass
    
    @abstractmethod
    async def list_all(self, skip: int = 0, limit: int = 50) -> tuple[List[TimetableEntity], int]:
        pass
    
    @abstractmethod
    async def detect_conflicts(self, timetable_id: str) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def approve(self, timetable_id: str, approved_by: str) -> Optional[TimetableEntity]:
        pass


class UserRepository(ABC):
    @abstractmethod
    async def create(self, entity: UserEntity) -> UserEntity:
        pass
    
    @abstractmethod
    async def get_by_id(self, user_id: str) -> Optional[UserEntity]:
        pass
    
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[UserEntity]:
        pass
    
    @abstractmethod
    async def list_by_role(self, role: str, skip: int = 0, limit: int = 50) -> tuple[List[UserEntity], int]:
        pass
    
    @abstractmethod
    async def bulk_import(self, users: List[UserEntity]) -> tuple[int, List[str]]:
        """Import multiple users. Returns (success_count, error_messages)"""
        pass
    
    @abstractmethod
    async def update_permissions(self, user_id: str, permissions: List[str]) -> Optional[UserEntity]:
        pass
