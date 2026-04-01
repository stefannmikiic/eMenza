import bcrypt
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from database_models import User
from schemas import RegisterUser, LoginUser

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "moj_podrazumevani_tajni_kljuc")
ALGORITHM = "HS256"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/auth/register")
def register(user: RegisterUser, db: Session = Depends(get_db)):

    if user.password != user.confirmPassword:
        raise HTTPException(400, "Passwords do not match")

    if len(user.password.encode()) > 72:
        raise HTTPException(400, "Password too long")

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(400, "User already exists")

    new_user = User(
        email=user.email,
        password=hash_password(user.password),
        stud_kartica=user.stud_kartica
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email})

    return {
        "user": {
            "email": new_user.email,
            "stud-kartica": new_user.stud_kartica
        },
        "token": token
    }

@app.post("/auth/login")
def login(user: LoginUser, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({"sub": db_user.email})

    return {
        "user": {
            "email": db_user.email,
            "stud-kartica": db_user.stud_kartica
        },
        "token": token
    }

@app.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.delete("/delete/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == id).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(existing_user)
    db.commit()

    return {"message": "User deleted successfully"}

@app.put("/update/{id}")
def update_user(id: int, stud: str, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == id).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user.stud_kartica = stud

    db.commit()

    return {"message": "User updated"}
