import logging
import uuid

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import engine, get_db
from app.services.budget import compute_budget

logger = logging.getLogger("fintutor.health")

app = FastAPI(title="FinTutor API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/budget")
def get_budget(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return compute_budget(db, user_id)


@app.get("/health/db")
def health_db() -> dict[str, str]:
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="DATABASE_URL is not set in .env — add the Supabase Postgres connection string.",
        )
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        # Never echo the raw exception back to the caller — it can embed the DSN
        # (host/user, sometimes more) which must not leave the server process.
        logger.exception("Database health check failed")
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {type(exc).__name__} (see server logs for detail)",
        ) from exc
    return {"status": "ok"}
