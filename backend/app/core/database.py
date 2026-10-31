from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from app.core.config import settings

# Synchronous SQLAlchemy 2.0 Engine with Connection Pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG and settings.ENVIRONMENT == "development",
)

# Session factory for synchronous DB operations
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """
    Base Declarative Class for all Brightloop SQLAlchemy models.
    Provides common UUID primary key and audit timestamps.
    """
    pass


def get_db() -> Generator:
    """
    FastAPI dependency that yields an independent database session per request
    and guarantees proper closure upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """
    Utility used by the /api/health endpoint to safely probe database responsiveness.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "connected", "database": settings.POSTGRES_DB}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}
