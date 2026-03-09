from pydantic import BaseModel
from typing import List


class DashboardStat(BaseModel):
    label: str
    value: str


class DashboardResponse(BaseModel):
    stats: List[DashboardStat]