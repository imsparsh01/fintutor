import logging
import uuid

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import engine, get_db
from app.services.budget import compute_budget
from app.services.holdings import (
    create_holding,
    delete_holding,
    get_holding,
    list_holdings,
    update_holding,
)
from app.services.income import create_income, list_income, update_income
from app.services.surfacing import compute_surfacing_candidates

logger = logging.getLogger("fintutor.health")

app = FastAPI(title="FinTutor API")


class HoldingCreate(BaseModel):
    product_type: str
    alias: str
    display_name: str | None = None
    characteristics: dict = {}


class HoldingUpdate(BaseModel):
    product_type: str | None = None
    alias: str | None = None
    display_name: str | None = None
    characteristics: dict | None = None


class IncomeSource(BaseModel):
    label: str
    amount: float
    frequency: str = "monthly"


class IncomeCreate(BaseModel):
    sources: list[IncomeSource]


class IncomeUpdate(BaseModel):
    sources: list[IncomeSource]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/budget")
def get_budget(user_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    return compute_budget(db, user_id)


@app.get("/surfacing-candidates")
def get_surfacing_candidates(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[dict]:
    return compute_surfacing_candidates(db, user_id)


@app.get("/holdings")
def get_holdings(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[dict]:
    return list_holdings(db, user_id)


@app.get("/holdings/{holding_id}")
def get_holding_by_id(
    holding_id: uuid.UUID, user_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    holding = get_holding(db, user_id, holding_id)
    if holding is None:
        raise HTTPException(status_code=404, detail="Holding not found")
    return holding


@app.post("/holdings", status_code=201)
def post_holding(
    user_id: uuid.UUID, body: HoldingCreate, db: Session = Depends(get_db)
) -> dict:
    try:
        return create_holding(
            db, user_id, body.product_type, body.alias, body.display_name, body.characteristics
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A holding with alias '{body.alias}' already exists for this user",
        )


@app.patch("/holdings/{holding_id}")
def patch_holding(
    holding_id: uuid.UUID, user_id: uuid.UUID, body: HoldingUpdate, db: Session = Depends(get_db)
) -> dict:
    try:
        updated = update_holding(
            db,
            user_id,
            holding_id,
            body.product_type,
            body.alias,
            body.display_name,
            body.characteristics,
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A holding with alias '{body.alias}' already exists for this user",
        )
    if updated is None:
        raise HTTPException(status_code=404, detail="Holding not found")
    return updated


@app.delete("/holdings/{holding_id}", status_code=204)
def remove_holding(holding_id: uuid.UUID, user_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    if not delete_holding(db, user_id, holding_id):
        raise HTTPException(status_code=404, detail="Holding not found")


@app.get("/income")
def get_income(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[dict]:
    return list_income(db, user_id)


@app.post("/income", status_code=201)
def post_income(user_id: uuid.UUID, body: IncomeCreate, db: Session = Depends(get_db)) -> dict:
    return create_income(db, user_id, [s.model_dump() for s in body.sources])


@app.put("/income/{income_id}")
def put_income(
    income_id: uuid.UUID, user_id: uuid.UUID, body: IncomeUpdate, db: Session = Depends(get_db)
) -> dict:
    updated = update_income(db, user_id, income_id, [s.model_dump() for s in body.sources])
    if updated is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return updated


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
