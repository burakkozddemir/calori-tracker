import base64
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.daily_food import DailyFood
from app.models.food import Food
from app.models.water_intake import WaterIntake
from app.schemas.daily_food import (
    DailyFoodCreate,
    DailyFoodResponse,
    DailySummary,
    TextAnalysisRequest,
    AIAnalysisResponse,
    WaterLog,
    WaterResponse,
)
from app.services.ai_service import analyze_text, analyze_image_base64
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/food", tags=["food"])


@router.post("/analyze-text", response_model=AIAnalysisResponse)
async def analyze_text_endpoint(
    request: TextAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    result = await analyze_text(request.text)
    return result


@router.post("/analyze-image", response_model=AIAnalysisResponse)
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    contents = await file.read()
    image_base64 = base64.b64encode(contents).decode("utf-8")
    result = await analyze_image_base64(image_base64)
    return result


@router.post("/add", response_model=DailyFoodResponse)
def add_food(
    food_data: DailyFoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    daily_food = DailyFood(
        user_id=current_user.id,
        food_id=food_data.food_id,
        food_name=food_data.food_name,
        gram=food_data.gram,
        calorie=food_data.calorie,
        protein=food_data.protein,
        fat=food_data.fat,
        carb=food_data.carb,
        meal_type=food_data.meal_type,
        date=food_data.date or date.today(),
    )
    db.add(daily_food)
    db.commit()
    db.refresh(daily_food)
    return daily_food


@router.delete("/{food_id}")
def delete_food(
    food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    daily_food = db.query(DailyFood).filter(
        DailyFood.id == food_id, DailyFood.user_id == current_user.id
    ).first()
    if not daily_food:
        raise HTTPException(status_code=404, detail="Yemek bulunamadı")
    db.delete(daily_food)
    db.commit()
    return {"detail": "Silindi"}


@router.get("/daily", response_model=DailySummary)
def get_daily_summary(
    target_date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from datetime import datetime as dt
    if target_date:
        query_date = dt.strptime(target_date, "%Y-%m-%d").date()
    else:
        query_date = date.today()
    meals = (
        db.query(DailyFood)
        .filter(DailyFood.user_id == current_user.id, DailyFood.date == query_date)
        .all()
    )
    water = (
        db.query(WaterIntake)
        .filter(WaterIntake.user_id == current_user.id, WaterIntake.date == query_date)
        .all()
    )
    total_cal = sum(m.calorie for m in meals)
    total_protein = sum(m.protein for m in meals)
    total_fat = sum(m.fat for m in meals)
    total_carb = sum(m.carb for m in meals)
    total_water = sum(w.amount_ml for w in water)

    return DailySummary(
        date=query_date,
        total_calorie=total_cal,
        total_protein=total_protein,
        total_fat=total_fat,
        total_carb=total_carb,
        target_calorie=current_user.target_calorie,
        remaining_calorie=(current_user.target_calorie or 2000) - total_cal,
        meals=[DailyFoodResponse.model_validate(m) for m in meals],
        water_ml=total_water,
    )


@router.get("/search")
def search_foods(
    query: str,
    db: Session = Depends(get_db),
):
    foods = (
        db.query(Food)
        .filter(Food.name.ilike(f"%{query}%"))
        .limit(20)
        .all()
    )
    return [
        {
            "id": f.id,
            "name": f.name,
            "calorie_100g": f.calorie_100g,
            "protein_100g": f.protein_100g,
            "fat_100g": f.fat_100g,
            "carb_100g": f.carb_100g,
        }
        for f in foods
    ]


@router.post("/water", response_model=WaterResponse)
def add_water(
    data: WaterLog,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    water_date = data.date or date.today()
    water = WaterIntake(
        user_id=current_user.id,
        amount_ml=data.amount_ml,
        date=water_date,
    )
    db.add(water)
    db.commit()
    today_water = (
        db.query(WaterIntake)
        .filter(WaterIntake.user_id == current_user.id, WaterIntake.date == water_date)
        .all()
    )
    total = sum(w.amount_ml for w in today_water)
    return WaterResponse(total_ml=total, date=water_date)
