from sqlalchemy import Column, Integer, Float, ForeignKey, Date
from datetime import date
from app.database import Base


class WaterIntake(Base):
    __tablename__ = "water_intake"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_ml = Column(Float, nullable=False)
    date = Column(Date, default=date.today)
