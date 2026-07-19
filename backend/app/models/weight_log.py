from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String
from datetime import datetime
from app.database import Base


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    weight = Column(Float, nullable=False)
    condition = Column(String(10), nullable=False)
    date = Column(DateTime, default=datetime.now)
