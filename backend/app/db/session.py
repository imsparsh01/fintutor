from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url) if settings.database_url else None
SessionLocal = (
    sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    if SessionLocal is None:
        raise RuntimeError(
            "DATABASE_URL is not set — add the Supabase Postgres connection string to .env."
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
