from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    activity: Optional[str] = None
    goal: Optional[str] = None
    target_calorie: Optional[float] = None
    target_weight: Optional[float] = None
    weight_note: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    activity: Optional[str] = None
    goal: Optional[str] = None
    target_calorie: Optional[float] = None
    target_weight: Optional[float] = None
    weight_note: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
