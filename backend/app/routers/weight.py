from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.database import get_db
from app.models.user import User
from app.models.weight_log import WeightLog
from app.utils.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/weight", tags=["weight"])


class WeightCreate(BaseModel):
    weight: float
    condition: str


class WeightResponse(BaseModel):
    id: int
    weight: float
    condition: str
    date: datetime

    class Config:
        from_attributes = True


@router.post("/add", response_model=WeightResponse)
def add_weight(
    data: WeightCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = WeightLog(
        user_id=current_user.id,
        weight=data.weight,
        condition=data.condition,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/history")
def get_weight_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    since = datetime.now() - timedelta(days=days)
    logs = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id, WeightLog.date >= since)
        .order_by(desc(WeightLog.date))
        .all()
    )
    return [
        {
            "id": l.id,
            "weight": l.weight,
            "condition": l.condition,
            "date": l.date.isoformat(),
        }
        for l in logs
    ]


@router.get("/today")
def get_today_weight(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    log = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id,
            WeightLog.date >= today_start,
            WeightLog.date < today_end,
        )
        .order_by(desc(WeightLog.date))
        .first()
    )
    if log:
        return {"weight": log.weight, "condition": log.condition, "date": log.date.isoformat()}
    return None


@router.get("/projection")
def get_projection(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_weight = current_user.target_weight
    if not target_weight:
        return {"target_weight": None, "days": None, "daily_avg": None, "note": None}

    logs = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id)
        .order_by(asc(WeightLog.date))
        .all()
    )

    if len(logs) < 2:
        return {
            "target_weight": target_weight,
            "days": None,
            "daily_avg": None,
            "note": "Tahmin için en az 2 tartı ölçümü gerekli",
            "note_text": current_user.weight_note,
        }

    first_log = logs[0]
    last_log = logs[-1]
    day_diff = (last_log.date - first_log.date).days

    if day_diff == 0:
        return {
            "target_weight": target_weight,
            "days": None,
            "daily_avg": None,
            "note": "Tahmin için farklı günlerde ölçüm gerekli",
            "note_text": current_user.weight_note,
        }

    total_change = last_log.weight - first_log.weight
    daily_avg = total_change / day_diff
    remaining = target_weight - last_log.weight

    if daily_avg == 0:
        return {
            "target_weight": target_weight,
            "days": None,
            "daily_avg": 0,
            "note": "Kilo değişimi tespit edilemedi",
            "note_text": current_user.weight_note,
        }

    if (remaining > 0 and daily_avg < 0) or (remaining < 0 and daily_avg > 0):
        return {
            "target_weight": target_weight,
            "days": None,
            "daily_avg": round(daily_avg, 3),
            "note": "Yön ters! Hedefe ulaşmak için rotanı değiştir",
            "note_text": current_user.weight_note,
        }

    days_to_target = abs(int(remaining / daily_avg))

    return {
        "target_weight": target_weight,
        "days": days_to_target,
        "daily_avg": round(daily_avg, 3),
        "note": None,
        "note_text": current_user.weight_note,
    }
