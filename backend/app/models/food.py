from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    calorie_100g = Column(Float, nullable=False)
    protein_100g = Column(Float, default=0)
    fat_100g = Column(Float, default=0)
    carb_100g = Column(Float, default=0)
    source = Column(String(50), default="manual")
