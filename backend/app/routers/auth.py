from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserProfile, UserResponse
from app.utils.auth import get_current_user
from app.utils.calories import get_target_calorie

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile: UserProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in profile.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    if current_user.weight and current_user.height and current_user.age and current_user.gender:
        current_user.target_calorie = get_target_calorie(current_user)

    db.commit()
    db.refresh(current_user)
    return current_user
