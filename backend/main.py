from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy import text

from database import Base, engine, SessionLocal
from models import Watershed, Evidence, User
from satellite_service import get_temporal_comparison
from chat_service import process_chat
from init_db import init_database
from pydantic import BaseModel
from typing import Optional

import os
import uuid
import hashlib
import secrets
import datetime


# Auto-initialize tables and benchmarks
init_database()

app = FastAPI(title="Jal Setu API", version="1.0.0")

# Security, Host, and CORS Environment Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "jalsetu-default-insecure-secret-key-change-in-production")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")

ALLOWED_ORIGINS_RAW = os.getenv("ALLOWED_ORIGINS", "*").strip()
if ALLOWED_ORIGINS_RAW == "*" or not ALLOWED_ORIGINS_RAW:
    cors_origins = ["*"]
else:
    cors_origins = [o.strip() for o in ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True if cors_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_HOSTS_RAW = os.getenv("ALLOWED_HOSTS", "*").strip()
if ALLOWED_HOSTS_RAW != "*" and ALLOWED_HOSTS_RAW:
    allowed_hosts = [h.strip() for h in ALLOWED_HOSTS_RAW.split(",") if h.strip()]
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)


# Folder for uploaded photographs
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

UPLOAD_DIR_CONFIG = os.getenv("UPLOAD_DIR", "uploads/evidence")
if os.path.isabs(UPLOAD_DIR_CONFIG):
    UPLOAD_FOLDER = UPLOAD_DIR_CONFIG
else:
    UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, UPLOAD_DIR_CONFIG)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
uploads_mount_dir = os.path.dirname(UPLOAD_FOLDER) if os.path.basename(UPLOAD_FOLDER) == "evidence" else UPLOAD_FOLDER
os.makedirs(uploads_mount_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_mount_dir), name="uploads")


# Healthcheck endpoint for cloud monitoring and orchestrators (Render, Docker, K8s)
@app.get("/health")
def health():
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as err:
        db_status = f"error: {str(err)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "Jal Setu API",
        "database": db_status,
        "version": "1.0.0",
        "storage": "persistent" if os.path.exists(UPLOAD_FOLDER) else "ephemeral",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


# Password hashing helpers
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return f"{salt}:{pwd_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, pwd_hash = stored_hash.split(":")
        computed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return secrets.compare_digest(computed, pwd_hash)
    except Exception:
        return False


# Static Frontend Routing for Unified Production Deployment
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")
if not os.path.exists(DIST_DIR):
    DIST_DIR = os.path.join(os.getcwd(), "dist")

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static-assets")

    @app.get("/", include_in_schema=False)
    def serve_home():
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Jal Setu API is running"}

    @app.get("/portal", include_in_schema=False)
    @app.get("/portal.html", include_in_schema=False)
    @app.get("/dashboard", include_in_schema=False)
    def serve_portal():
        portal_file = os.path.join(DIST_DIR, "portal.html")
        if os.path.exists(portal_file):
            return FileResponse(portal_file)
        return RedirectResponse("/")

    @app.get("/auth", include_in_schema=False)
    @app.get("/auth.html", include_in_schema=False)
    def serve_auth():
        auth_file = os.path.join(DIST_DIR, "auth.html")
        if os.path.exists(auth_file):
            return FileResponse(auth_file)
        return RedirectResponse("/")

    @app.get("/map", include_in_schema=False)
    @app.get("/map.html", include_in_schema=False)
    def serve_map():
        map_file = os.path.join(DIST_DIR, "map.html")
        if os.path.exists(map_file):
            return FileResponse(map_file)
        return RedirectResponse("/")
else:
    @app.get("/")
    def root():
        return {"message": "Jal Setu API is running"}



# Pydantic Schemas
class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: Optional[str] = "Project Officer"
    department: Optional[str] = "Department of Water Resources & Watershed Development"


class LoginRequest(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    question: str
    watershed_id: Optional[str] = None
    intervention_id: Optional[str] = None
    language: Optional[str] = "English"


@app.post("/api/auth/register")
def register(data: RegisterRequest):
    email_clean = data.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="A valid email address is required.")

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    if not data.full_name.strip():
        raise HTTPException(status_code=400, detail="Full name is required.")

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email_clean).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

        user_id = "USR-" + uuid.uuid4().hex[:8].upper()
        new_user = User(
            user_id=user_id,
            full_name=data.full_name.strip(),
            email=email_clean,
            password_hash=hash_password(data.password),
            role=data.role or "Project Officer",
            department=data.department or "Department of Water Resources & Watershed Development",
            created_at=datetime.datetime.now().isoformat()
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = "token-" + secrets.token_hex(24)
        initials = "".join([part[0].upper() for part in new_user.full_name.split() if part][:2]) or "JS"

        return {
            "message": "Registration successful",
            "token": token,
            "user": {
                "id": new_user.user_id,
                "fullName": new_user.full_name,
                "email": new_user.email,
                "role": new_user.role,
                "department": new_user.department,
                "initials": initials
            }
        }
    finally:
        db.close()


@app.post("/api/auth/login")
def login(data: LoginRequest):
    email_clean = data.email.strip().lower()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email_clean).first()
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password. Please verify your credentials."
            )

        token = "token-" + secrets.token_hex(24)
        initials = "".join([part[0].upper() for part in user.full_name.split() if part][:2]) or "JS"

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user.user_id,
                "fullName": user.full_name,
                "email": user.email,
                "role": user.role,
                "department": user.department,
                "initials": initials
            }
        }
    finally:
        db.close()



@app.get("/api/watersheds")
def watersheds():
    db = SessionLocal()

    rows = db.query(Watershed).all()

    result = []

    for w in rows:
        result.append({
            "id": w.watershed_id,
            "name": w.name,
            "state": w.state,
            "district": w.district,
            "priority": w.priority,
            "area": w.area,
            "interventions": w.interventions,
            "monitored": w.monitored,
            "rainfall": w.rainfall,
            "ndvi": round(w.ndvi, 2) if w.ndvi is not None else None,
            "water": round(w.water_index, 2) if w.water_index is not None else None,
            "baseNdvi": round(w.base_ndvi, 2) if w.base_ndvi is not None else None,
            "baseWater": round(w.base_water, 2) if w.base_water is not None else None,
            "ndviChange": round(w.ndvi - w.base_ndvi, 2) if (w.ndvi is not None and w.base_ndvi is not None) else None,
            "waterChange": round(w.water_index - w.base_water, 2) if (w.water_index is not None and w.base_water is not None) else None,
            "lat": w.lat,
            "lng": w.lng,
            "structure": w.structure,
            "change": w.change,
            "confidence": w.confidence,
            "status": w.status
        })

    db.close()

    return {
        "data": result,
        "count": len(result)
    }


@app.get("/api/dashboard")
def dashboard():
    db = SessionLocal()

    watershed_count = db.query(Watershed).count()
    evidence_count = db.query(Evidence).count()

    db.close()

    return {
        "watersheds": watershed_count,
        "field_photos": evidence_count,
        "under_monitoring": 2,
        "evidence_issues": 1,
        "data_status": "DEMO"
    }


@app.get("/api/evidence")
def get_evidence():
    db = SessionLocal()

    rows = db.query(Evidence).order_by(Evidence.id.desc()).all()

    result = []

    for e in rows:
        result.append({
            "id": e.evidence_id,
            "title": e.title,
            "watershedId": e.watershed_id,
            "intervention": e.intervention,
            "location": e.location,
            "latitude": e.latitude,
            "longitude": e.longitude,
            "date": e.captured_date,
            "time": e.captured_time,
            "camera": e.camera,
            "filename": e.filename,
            "image": e.image_path,
            "status": e.status,
            "observation": e.observation
        })

    db.close()

    return {
        "data": result,
        "count": len(result)
    }


@app.post("/api/evidence/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    title: str = Form("Field Evidence"),
    watershed_id: str = Form(...),
    intervention_type: str = Form("Other"),
    latitude: str = Form(""),
    longitude: str = Form("")
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a photograph."
        )

    allowed_types = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WebP images are allowed."
        )

    file_data = await file.read()

    if len(file_data) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 10 MB."
        )

    extension = os.path.splitext(file.filename)[1].lower()

    if not extension:
        extension = ".jpg"

    new_name = str(uuid.uuid4()) + extension

    save_path = os.path.join(
        UPLOAD_FOLDER,
        new_name
    )

    with open(save_path, "wb") as output_file:
        output_file.write(file_data)

    evidence_id = "EVD-" + uuid.uuid4().hex[:8].upper()

    db = SessionLocal()

    evidence = Evidence(
        evidence_id=evidence_id,
        title=title,
        watershed_id=watershed_id,
        intervention=intervention_type,
        location=f"{latitude}, {longitude}",
        latitude=float(latitude) if latitude else None,
        longitude=float(longitude) if longitude else None,
        captured_date="",
        captured_time="",
        camera="Uploaded image",
        filename=file.filename,
        image_path=f"/uploads/evidence/{new_name}",
        status="Pending Review",
        observation="Field photograph uploaded successfully."
    )

    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    db.close()

    return {
        "message": "Field evidence uploaded successfully.",
        "data": {
            "id": evidence.evidence_id,
            "title": evidence.title,
            "watershedId": evidence.watershed_id,
            "intervention": evidence.intervention,
            "latitude": evidence.latitude,
            "longitude": evidence.longitude,
            "filename": evidence.filename,
            "image": evidence.image_path,
            "status": evidence.status
        }
    }


@app.get("/api/watershed/{watershed_id}/temporal-comparison")
@app.get("/api/watersheds/{watershed_id}/temporal-comparison")
def temporal_comparison(watershed_id: str):
    db = SessionLocal()
    try:
        w = db.query(Watershed).filter(Watershed.watershed_id == watershed_id).first()
        return get_temporal_comparison(watershed_id, db_watershed=w)
    finally:
        db.close()


@app.post("/api/chat")
def chat_endpoint(data: ChatRequest):
    db = SessionLocal()
    try:
        return process_chat(
            db=db,
            question=data.question,
            watershed_id=data.watershed_id,
            intervention_id=data.intervention_id,
            language=data.language or "English"
        )
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
