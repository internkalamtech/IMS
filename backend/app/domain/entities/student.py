from dataclasses import dataclass
from typing import Optional

@dataclass
class Student:
    id: int
    name: str
    student_class: str
    route_stop: Optional[str]
