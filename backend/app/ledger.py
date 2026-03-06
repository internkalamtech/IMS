from sqlalchemy import Column, Integer, Float, DateTime, String
from app.infrastructure.database import Base
import datetime


class Ledger(Base):
    __tablename__ = "student_ledger"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer)
    debit = Column(Float)
    credit = Column(Float)
    balance = Column(Float)
    description = Column(String)
    transaction_date = Column(DateTime, default=datetime.datetime.utcnow)
