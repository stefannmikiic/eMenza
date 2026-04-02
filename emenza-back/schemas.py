from pydantic import BaseModel, EmailStr, Field

class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    confirmPassword: str
    stud_kartica: str = Field(alias="stud-kartica")
    status: str

    class Config:
        populate_by_name = True

class LoginUser(BaseModel):
    email: EmailStr
    password: str