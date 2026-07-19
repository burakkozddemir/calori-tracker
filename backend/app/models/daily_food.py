from sqlalchemy import Column, Integer, Float, ForeignKey, String, Date
from sqlalchemy.orm import relationship
from datetime import date
from app.database import Base


class DailyFood(Base):
    __tablename__ = "daily_foods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=True)
    food_name = Column(String(255), nullable=False)
    gram = Column(Float, nullable=False)
    calorie = Column(Float, nullable=False)
    protein = Column(Float, default=0)
    fat = Column(Float, default=0)
    carb = Column(Float, default=0)
    meal_type = Column(String(20), default="other")
    date = Column(Date, default=date.today)

    user = relationship("User")
    food = relationship("Food")
