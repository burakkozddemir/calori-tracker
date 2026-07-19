from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

DEFAULT_USER_ID = 1


def get_current_user(db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == DEFAULT_USER_ID).first()
    if not user:
        user = User(
            id=DEFAULT_USER_ID,
            name="Burak",
            email="burak@local",
            hashed_password="none",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
