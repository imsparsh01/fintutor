import uuid

from sqlalchemy.orm import Session

from app.models import Income


def _to_dict(income: Income) -> dict:
    return {
        "id": str(income.id),
        "user_id": str(income.user_id),
        "sources": income.sources,
    }


def list_income(db: Session, user_id: uuid.UUID) -> list[dict]:
    rows = db.query(Income).filter(Income.user_id == user_id).all()
    return [_to_dict(row) for row in rows]


def create_income(db: Session, user_id: uuid.UUID, sources: list[dict]) -> dict:
    income = Income(user_id=user_id, sources=sources)
    db.add(income)
    db.commit()
    db.refresh(income)
    return _to_dict(income)


def update_income(
    db: Session, user_id: uuid.UUID, income_id: uuid.UUID, sources: list[dict]
) -> dict | None:
    """Full replace of `sources` (PUT semantics, not partial). Returns None if no matching
    row exists for this user."""
    income = (
        db.query(Income)
        .filter(Income.user_id == user_id, Income.id == income_id)
        .first()
    )
    if income is None:
        return None
    income.sources = sources
    db.commit()
    db.refresh(income)
    return _to_dict(income)
