"""
SQLAlchemy database setup for Mail Sentinel.
Configured for PostgreSQL with automatic graceful fallback to SQLite for local development.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    try:
        # Test connecting to configured DATABASE_URL
        test_engine = create_engine(db_url, pool_pre_ping=True)
        with test_engine.connect() as conn:
            pass
        return test_engine
    except Exception as e:
        # Fallback to local SQLite if PostgreSQL is unreachable or requires auth
        sqlite_url = settings.SQLITE_FALLBACK_URL
        print(f"[Database] PostgreSQL connection notice: {e}")
        print(f"[Database] Using local SQLite fallback database: {sqlite_url}")
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    import app.models.scan  # noqa: F401
    Base.metadata.create_all(bind=engine)

# Ensure tables exist
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
