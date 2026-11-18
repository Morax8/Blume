"""
Setup database: engine, session, dan Base untuk model ORM.

Default pakai SQLite (file blume.db) supaya bisa langsung jalan.
Untuk produksi tinggal set DATABASE_URL ke PostgreSQL.

@format
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite butuh ini agar bisa dipakai lintas thread (FastAPI + socket.io)
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Base declarative untuk semua model."""


def get_db():
    """Dependency FastAPI: buka sesi, tutup otomatis setelah request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
