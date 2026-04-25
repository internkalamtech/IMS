"""
backend/app/domain/repositories/all_repositories.py
PHASE 4-7: All Repository Abstractions
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


# PARENT PORTAL REPOSITORIES
class AcademicRepository(ABC):
    @abstractmethod
    async def get_student_marks(self, student_id: str, academic_year: str) -> List[Any]: pass
    
    @abstractmethod
    async def get_performance_analytics(self, student_id: str) -> Any: pass


class AttendanceRepository(ABC):
    @abstractmethod
    async def get_student_attendance(self, student_id: str, month: str) -> List[Any]: pass
    
    @abstractmethod
    async def create_leave_request(self, leave_data: Dict) -> Any: pass


class ConductRepository(ABC):
    @abstractmethod
    async def get_conduct_records(self, student_id: str) -> List[Any]: pass


class ExamRepository(ABC):
    @abstractmethod
    async def get_exam_schedule(self, student_id: str) -> List[Any]: pass
    
    @abstractmethod
    async def get_exam_results(self, student_id: str) -> List[Any]: pass


class TransportRepository(ABC):
    @abstractmethod
    async def get_bus_schedule(self, student_id: str) -> Any: pass
    
    @abstractmethod
    async def get_real_time_location(self, vehicle_id: str) -> Any: pass


# TEACHER PORTAL REPOSITORIES
class TeacherAcademicRepository(ABC):
    @abstractmethod
    async def get_class_list(self, teacher_id: str, class_id: str) -> List[Any]: pass
    
    @abstractmethod
    async def bulk_enter_marks(self, marks_data: List[Dict]) -> int: pass


class AssessmentRepository(ABC):
    @abstractmethod
    async def create_test(self, test_data: Dict) -> Any: pass
    
    @abstractmethod
    async def auto_score_test(self, test_id: str, responses: Dict) -> Dict: pass


class TeacherLeaveRepository(ABC):
    @abstractmethod
    async def submit_leave_request(self, leave_data: Dict) -> Any: pass
    
    @abstractmethod
    async def get_leave_balance(self, teacher_id: str, academic_year: str) -> Any: pass


# TRANSPORT REPOSITORIES
class VehicleRepository(ABC):
    @abstractmethod
    async def get_vehicle_documents(self, vehicle_id: str) -> Dict: pass
    
    @abstractmethod
    async def update_compliance_record(self, checklist_data: Dict) -> Any: pass


class RouteRepository(ABC):
    @abstractmethod
    async def optimize_route(self, constraints: Dict) -> Any: pass
    
    @abstractmethod
    async def calculate_route_cost(self, route_id: str) -> float: pass


class DriverRepository(ABC):
    @abstractmethod
    async def verify_driver(self, driver_id: str) -> Dict: pass
    
    @abstractmethod
    async def get_driver_documents(self, driver_id: str) -> Dict: pass
