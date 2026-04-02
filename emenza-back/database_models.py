from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    stud_kartica = Column(String, nullable=False)
    status = Column(String, nullable=False)
    
    meals = relationship("Meal", back_populates="owner", uselist=False)

class Meal(Base):
    __tablename__ = "meals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dorucak_rasp = Column(Integer, default=0)
    dorucak_preo = Column(Integer, default=30)
    rucak_rasp = Column(Integer, default=0)
    rucak_preo = Column(Integer, default=30)
    vecera_rasp = Column(Integer, default=0)
    vecera_preo = Column(Integer, default=30)
    last_reset_month = Column(Integer, default=0)

    owner = relationship("User", back_populates="meals")