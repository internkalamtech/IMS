from sqlalchemy import Column, Integer, Float, String, DateTime
from app.infrastructure.database import Base
import datetime


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    amount = Column(Float)
    payment_method = Column(String)
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)
