import bcrypt
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
import pydantic
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from jose import jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "podrazumevani_tajni_kljuc")
ALGORITHM = "HS256"

users_db = []


class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    confirmPassword: str
    stud_kartica: str = pydantic.Field(alias="stud-kartica")
    class Config:
        populate_by_name = True

class LoginUser(BaseModel):
    email: EmailStr
    password: str

def hash_password(password: str):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    password_byte_enc = plain_password.encode('utf-8')
    hashed_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_byte_enc)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/auth/register")
async def register(user: RegisterUser):
    if user.password != user.confirmPassword:
        raise HTTPException(status_code=400, detail="Lozinke se ne podudaraju")
    
    if len(user.password.encode('utf-8')) > 72:
        raise HTTPException(status_code=400, detail="Lozinka je predugačka")

    new_user = {
        "email": user.email,
        "password": hash_password(user.password),
        "stud-kartica": user.stud_kartica
    }
    users_db.append(new_user)
    
    token = create_access_token({"sub": user.email})
    return {
        "user": {
            "email": user.email, 
            "stud-kartica": user.stud_kartica
        }, 
        "token": token
    }

@app.post("/auth/login")
async def login(user: LoginUser):
    found_user = next((u for u in users_db if u["email"] == user.email), None)
    
    if not found_user or not verify_password(user.password, found_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pogrešan email ili lozinka"
        )
    
    token = create_access_token({"sub": found_user["email"]})
    
    return {
        "user": {"email": found_user["email"], "stud-kartica": found_user["stud-kartica"]},
        "token": token
    }
@app.get("/auth/me")
async def get_current_user(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Nevažeći token")
        return next((u for u in users_db if u["email"] == email), None)
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Nevažeći token")
    