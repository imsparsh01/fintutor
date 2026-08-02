from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.db.session import engine

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
        raise HTTPException(status_code=503, detail=f"Database connection failed: {exc}") from exc
    return {"status": "ok"}
