import bcrypt
import os
import shutil
import uuid
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from datetime import datetime, timedelta, time
import calendar
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from database_models import User, Meal, CardRenewalRequest, MealLog
from schemas import RegisterUser, LoginUser, QRScanRequest
import qrcode
from fastapi.responses import StreamingResponse
import io
import qrcode
from itsdangerous import URLSafeTimedSerializer



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
serializer = URLSafeTimedSerializer(SECRET_KEY)
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

def get_days_in_current_month():
    now = datetime.utcnow()
    return calendar.monthrange(now.year, now.month)[1]

def apply_monthly_meal_reset(meals, month: int):
    monthly_limit = get_days_in_current_month()
    meals.dorucak_preo = monthly_limit
    meals.rucak_preo = monthly_limit
    meals.vecera_preo = monthly_limit
    meals.dorucak_rasp = 0
    meals.rucak_rasp = 0
    meals.vecera_rasp = 0
    meals.dorucak_danas = 0
    meals.rucak_danas = 0
    meals.vecera_danas = 0
    meals.last_reset_month = month
    meals.last_daily_reset_day = datetime.now().date().isoformat()

def reset_meals_if_new_month(db_user, db: Session):
    current_month = datetime.utcnow().month
    if db_user.meals.last_reset_month != current_month:
        apply_monthly_meal_reset(db_user.meals, current_month)
        db.commit()
        db.refresh(db_user.meals)

def reset_daily_meals_if_new_day(db_user, db: Session):
    current_day = datetime.now().date().isoformat()
    if db_user.meals.last_daily_reset_day != current_day:
        db_user.meals.dorucak_danas = 0
        db_user.meals.rucak_danas = 0
        db_user.meals.vecera_danas = 0
        db_user.meals.last_daily_reset_day = current_day
        db.commit()
        db.refresh(db_user.meals)

def get_current_meal_type():
    current_time = datetime.now().time()

    if time(7, 0) <= current_time <= time(10, 0):
        return "dorucak"
    if time(11, 25) <= current_time <= time(16, 0):
        return "rucak"
    if time(17, 0) <= current_time <= time(20, 30):
        return "vecera"

    return None

def get_user_status_data(db_user):
    return {
        "dorucak_rasp": db_user.meals.dorucak_rasp,
        "rucak_rasp": db_user.meals.rucak_rasp,
        "vecera_rasp": db_user.meals.vecera_rasp,
        "dorucak_preo": db_user.meals.dorucak_preo,
        "rucak_preo": db_user.meals.rucak_preo,
        "vecera_preo": db_user.meals.vecera_preo,
        "dorucak_danas": db_user.meals.dorucak_danas,
        "rucak_danas": db_user.meals.rucak_danas,
        "vecera_danas": db_user.meals.vecera_danas,
        "user_balance": db_user.balance,
        "status": db_user.status
    }

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
        stud_kartica=user.stud_kartica,
        status=user.status,
        balance=100000.00
    )
    current_month = datetime.utcnow().month
    initial_meals = Meal()
    apply_monthly_meal_reset(initial_meals, current_month)

    new_user.meals = initial_meals
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.refresh(new_user.meals)

    token = create_access_token({"sub": new_user.email})

    return {
        "user": {
            "email": new_user.email,
            "stud-kartica": new_user.stud_kartica,
            "status": new_user.status,
            "balance": new_user.balance
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
            "stud-kartica": db_user.stud_kartica,
            "status": db_user.status,
            "balance": db_user.balance
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

def get_current_user_id(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(401, "Invalid token")

def save_uploaded_file(file: UploadFile, upload_dir: Path):
    upload_dir.mkdir(parents=True, exist_ok=True)
    original_name = Path(file.filename or "file").name
    extension = Path(original_name).suffix
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = upload_dir / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path

@app.post("/card-renewal/upload")
def upload_card_renewal_documents(
    token: str = Form(...),
    potvrda: UploadFile = File(...),
    indeks: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    email = get_current_user_id(token)
    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(404, "User not found")

    project_root = Path(__file__).resolve().parent.parent
    upload_dir = project_root / "emenza-front" / "public" / "uploads" / "renewals"

    potvrda_file_path = save_uploaded_file(potvrda, upload_dir)
    indeks_file_path = save_uploaded_file(indeks, upload_dir)

    potvrda_public_path = f"/uploads/renewals/{potvrda_file_path.name}"
    indeks_public_path = f"/uploads/renewals/{indeks_file_path.name}"

    existing_request = db.query(CardRenewalRequest).filter(CardRenewalRequest.user_id == db_user.id).first()

    if existing_request:
        existing_request.potvrda_o_studiranju_path = potvrda_public_path
        existing_request.skenirani_indeks_path = indeks_public_path
        renewal_request = existing_request
    else:
        renewal_request = CardRenewalRequest(
            user_id=db_user.id,
            potvrda_o_studiranju_path=potvrda_public_path,
            skenirani_indeks_path=indeks_public_path
        )
        db.add(renewal_request)

    db.commit()
    db.refresh(renewal_request)

    return {
        "message": "Zahtev za produženje kartice je uspešno poslat",
        "potvrda_o_studiranju_path": renewal_request.potvrda_o_studiranju_path,
        "skenirani_indeks_path": renewal_request.skenirani_indeks_path
    }

@app.get("/meals/my-status")
def get_meals(token: str, db: Session = Depends(get_db)):
    email = get_current_user_id(token)
    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(404, "User not found")

    reset_meals_if_new_month(db_user, db)
    reset_daily_meals_if_new_day(db_user, db)

    return get_user_status_data(db_user)

@app.post("/meals/purchase")
def purchase_meals(token: str, meal_type: str, amount: int, db: Session = Depends(get_db)):
    email = get_current_user_id(token)
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(404, "Korisnik nije pronađen")

    reset_meals_if_new_month(db_user, db)
    reset_daily_meals_if_new_day(db_user, db)

    if amount <= 0:
        raise HTTPException(400, "Količina mora biti veća od 0")

    current_day = datetime.utcnow().day
    if db_user.status == "budzet" and current_day <= 21 and amount % 10 != 0:
        raise HTTPException(400, "Budžetski korisnici do 21. u mesecu mogu kupovati samo u koracima od 10")

    PRICES = {
        "budzet": {"DORUČAK": 56.0, "RUČAK": 120.0, "VEČERA": 90.0},
        "samofinansiranje": {"DORUČAK": 190.0, "RUČAK": 450.0, "VEČERA": 380.0}
    }

    meal_type_upper = meal_type.upper()
    if meal_type_upper not in PRICES[db_user.status]:
        raise HTTPException(400, "Nevalidan tip obroka")

    price_per_meal = PRICES[db_user.status][meal_type_upper]
    total_cost = price_per_meal * amount

    if db_user.balance < total_cost:
        raise HTTPException(400, f"Nemate dovoljno novca. Potrebno: {total_cost} RSD")

    meals = db_user.meals

    if meal_type_upper == "DORUČAK":
        if amount > meals.dorucak_preo:
            raise HTTPException(400, "Nema dovoljno preostalih obroka")
        meals.dorucak_rasp += amount
        meals.dorucak_preo -= amount
    elif meal_type_upper == "RUČAK":
        if amount > meals.rucak_preo:
            raise HTTPException(400, "Nema dovoljno preostalih obroka")
        meals.rucak_rasp += amount
        meals.rucak_preo -= amount
    elif meal_type_upper == "VEČERA":
        if amount > meals.vecera_preo:
            raise HTTPException(400, "Nema dovoljno preostalih obroka")
        meals.vecera_rasp += amount
        meals.vecera_preo -= amount

    db_user.balance -= total_cost

    db.add(meals)
    db.commit()
    db.refresh(db_user)
    db.refresh(meals)
    return {
        "message": "Uspešna kupovina",
        "new_data": get_user_status_data(db_user)
    }

@app.post("/meals/consume")
def consume_meal(token: str, db: Session = Depends(get_db)):
    email = get_current_user_id(token)
    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(404, "User not found")

    reset_meals_if_new_month(db_user, db)
    reset_daily_meals_if_new_day(db_user, db)

    current_meal_type = get_current_meal_type()
    if not current_meal_type:
        raise HTTPException(400, "Obrok nije u toku")

    meals = db_user.meals
    rasp_attr = f"{current_meal_type}_rasp"
    danas_attr = f"{current_meal_type}_danas"

    if getattr(meals, rasp_attr) <= 0:
        raise HTTPException(400, "Nema raspoloživih obroka")

    if getattr(meals, danas_attr) >= 2:
        raise HTTPException(400, "Dnevni limit za ovaj obrok je dostignut")

    setattr(meals, rasp_attr, getattr(meals, rasp_attr) - 1)
    setattr(meals, danas_attr, getattr(meals, danas_attr) + 1)
    new_log = MealLog(
    user_id=db_user.id,
    meal_type=current_meal_type,
    datetimestamp=datetime.now(),
    card_number=db_user.stud_kartica
)
    db.add(meals)
    db.add(new_log) 
    db.commit()
    db.refresh(db_user)
    db.refresh(meals)

    return {
        "message": "Obrok uspešno potrošen",
        "new_data": get_user_status_data(db_user)
    }

@app.get("/meals/qr-code")
def generate_qr_code_for_meals(token: str, db: Session = Depends(get_db)):
    email = get_current_user_id(token)
    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(404, "Korisnik nije pronađen")
    secure_qr_token = serializer.dumps(db_user.stud_kartica)
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(secure_qr_token)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    return StreamingResponse(buf, media_type="image/png")

@app.post("/meals/scan-consume")
def scan_consume_meal(request: QRScanRequest, db: Session = Depends(get_db)):
    try:
        card_number = serializer.loads(request.qr_token, max_age=60)
    except Exception:
        raise HTTPException(400, "QR kod je istekao ili je nevažeći. Osvežite stranicu.")
    
    
    db_user = db.query(User).filter(User.stud_kartica == card_number).first()
    
    if not db_user:
        raise HTTPException(404, "Korisnik nije pronađen u sistemu.")

    reset_meals_if_new_month(db_user, db)
    reset_daily_meals_if_new_day(db_user, db)

    current_meal_type = get_current_meal_type()
    if not current_meal_type:
        raise HTTPException(400, "Trenutno nije vreme nijednog obroka.")

    meals = db_user.meals
    rasp_attr = f"{current_meal_type}_rasp"
    danas_attr = f"{current_meal_type}_danas"

    if getattr(meals, rasp_attr) <= 0:
        raise HTTPException(400, f"Korisnik nema preostalih {current_meal_type} obroka.")

    if getattr(meals, danas_attr) >= 2:
        raise HTTPException(400, f"Korisnik je već iskoristio limit za {current_meal_type} danas.")

    setattr(meals, rasp_attr, getattr(meals, rasp_attr) - 1)
    setattr(meals, danas_attr, getattr(meals, danas_attr) + 1)
    new_log = MealLog(
    user_id=db_user.id,
    meal_type=current_meal_type,
    datetimestamp=datetime.now(),
    card_number=db_user.stud_kartica
    )

    db.add(meals)
    db.add(new_log)
    db.commit()
    db.refresh(db_user)

    return {
        "message": f"Uspešno skenirano! Prijatan {current_meal_type}.",
        "new_data": get_user_status_data(db_user)
    }
@app.get("/meals/history")
def get_meal_history(token: str, db: Session = Depends(get_db)):
    email = get_current_user_id(token)
    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(404, "User not found")

    logs = db.query(MealLog).filter(MealLog.user_id == db_user.id)\
             .order_by(MealLog.datetimestamp.desc()).limit(10).all()

    return logs