from pydantic import BaseModel
from typing import Optional


class FoodBase(BaseModel):
    name: str
    calorie_100g: float
    protein_100g: float = 0
    fat_100g: float = 0
    carb_100g: float = 0
    source: str = "manual"


class FoodCreate(FoodBase):
    pass


class FoodResponse(FoodBase):
    id: int

    class Config:
        from_attributes = True


class FoodSearch(BaseModel):
    query: str
