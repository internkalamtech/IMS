from pydantic import BaseModel

class BehavioralRemarkBase(BaseModel):
    student_id: int
    teacher_id: int
    type: str
    text: str

class BehavioralRemarkCreate(BehavioralRemarkBase):
    pass

class BehavioralRemarkUpdate(BehavioralRemarkBase):
    pass

class BehavioralRemarkOut(BehavioralRemarkBase):
    id: int
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True