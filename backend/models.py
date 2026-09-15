from sqlalchemy import Column, Integer, String, Float
from database import Base


class Watershed(Base):
    __tablename__ = "watersheds"

    id = Column(Integer, primary_key=True, index=True)
    watershed_id = Column(String, unique=True, index=True, nullable=False)

    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)

    priority = Column(String)
    area = Column(Float)
    interventions = Column(Integer)
    monitored = Column(Integer)

    rainfall = Column(Float)
    ndvi = Column(Float)
    water_index = Column(Float)
    base_ndvi = Column(Float)
    base_water = Column(Float)

    lat = Column(Float)
    lng = Column(Float)
    structure = Column(String)
    change = Column(String)
    confidence = Column(Integer)

    status = Column(String)


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)

    evidence_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    title = Column(String, nullable=False)

    watershed_id = Column(
        String,
        nullable=False,
        index=True
    )

    intervention = Column(String)

    location = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)

    captured_date = Column(String)
    captured_time = Column(String)

    camera = Column(String)

    filename = Column(String)

    image_path = Column(String, nullable=False)

    status = Column(
        String,
        default="Pending Review"
    )

    observation = Column(String)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Project Officer")
    department = Column(String, default="Department of Water Resources & Watershed Development")
    created_at = Column(String)