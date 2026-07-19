from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    database_url: str = ""
    secret_key: str = "change-this-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    openrouter_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

if not settings.database_url:
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "calori_tracker.db")
    settings.database_url = f"sqlite:///{db_path}"

is_postgres = settings.database_url.startswith("postgresql")

engine = create_engine(
    settings.database_url,
    **({} if is_postgres else {"connect_args": {"check_same_thread": False}}),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
