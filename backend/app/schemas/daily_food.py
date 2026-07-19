from pydantic import BaseModel
from typing import Optional
from datetime import date


class DailyFoodCreate(BaseModel):
    food_name: str
    gram: float
    calorie: float
    protein: float = 0
    fat: float = 0
    carb: float = 0
    meal_type: str = "other"
    food_id: Optional[int] = None
    date: Optional[date] = None


class DailyFoodResponse(BaseModel):
    id: int
    food_name: str
    gram: float
    calorie: float
    protein: float
    fat: float
    carb: float
    meal_type: str
    date: date

    class Config:
        from_attributes = True


class DailySummary(BaseModel):
    date: date
    total_calorie: float
    total_protein: float
    total_fat: float
    total_carb: float
    target_calorie: Optional[float]
    remaining_calorie: float
    meals: list[DailyFoodResponse]
    water_ml: float


class TextAnalysisRequest(BaseModel):
    text: str


class FoodItem(BaseModel):
    name: str
    gram: float
    calorie: float
    protein: float = 0
    fat: float = 0
    carb: float = 0
    ml: Optional[float] = None


class AIAnalysisResponse(BaseModel):
    foods: list[FoodItem]


class WaterLog(BaseModel):
    amount_ml: float
    date: Optional[date] = None


class WaterResponse(BaseModel):
    total_ml: float
    date: date
