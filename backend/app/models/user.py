import enum
from sqlalchemy import Column, Integer, String, Float, Enum
from app.database import Base


class Gender(str, enum.Enum):
    male = "male"
    female = "female"


class ActivityLevel(str, enum.Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"


class Goal(str, enum.Enum):
    lose = "lose"
    maintain = "maintain"
    gain = "gain"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    gender = Column(Enum(Gender), nullable=True)
    activity = Column(Enum(ActivityLevel), nullable=True)
    goal = Column(Enum(Goal), nullable=True)
    target_calorie = Column(Float, nullable=True)
    target_weight = Column(Float, nullable=True)
    weight_note = Column(String(500), nullable=True)
