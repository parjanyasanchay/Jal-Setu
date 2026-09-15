import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("jalsetu.database")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "parjanya.db")

raw_db_url = os.getenv("DATABASE_URL")
if not raw_db_url or not raw_db_url.strip():
    DATABASE_URL = f"sqlite:///{DB_PATH}"
else:
    DATABASE_URL = raw_db_url.strip()
    # Normalize postgres:// to postgresql:// for SQLAlchemy 1.4/2.0 compatibility
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # Managed PostgreSQL / PostGIS configuration
    pool_size = int(os.getenv("DB_POOL_SIZE", "10"))
    max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=pool_size,
        max_overflow=max_overflow
    )

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def init_postgis(eng):
    """Attempt to enable PostGIS extension on PostgreSQL databases if supported."""
    if not str(eng.url).startswith("sqlite"):
        try:
            with eng.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
                logger.info("PostGIS extension verified/initialized successfully.")
        except Exception as err:
            logger.info("PostGIS extension initialization notice (optional/handled): %s", err)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
