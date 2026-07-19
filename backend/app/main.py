import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.routers import auth, food, weight

Base.metadata.create_all(bind=engine)

db = SessionLocal()
if not db.query(User).filter(User.id == 1).first():
    db.add(User(id=1, name="Burak", email="burak@local", hashed_password="none"))
    db.commit()
db.close()

app = FastAPI(title="Kalori Takip Sistemi", version="1.0.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(food.router)
app.include_router(weight.router)


@app.get("/")
def root():
    return {"message": "Kalori Takip Sistemi API"}
