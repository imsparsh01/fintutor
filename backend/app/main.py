import logging

from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.db.session import engine

logger = logging.getLogger("fintutor.health")

app = FastAPI(title="FinTutor API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


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
