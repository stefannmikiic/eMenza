from pydantic import BaseModel, EmailStr, Field

class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    confirmPassword: str
    stud_kartica: str = Field(alias="stud-kartica")
    status: str
    balance: float = 100000.00

    class Config:
        populate_by_name = True

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class QRScanRequest(BaseModel):
    qr_token: str