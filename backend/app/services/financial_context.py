import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import FinancialContext


def _serialize(row: FinancialContext | None) -> dict:
    return {
        "dependant_count": row.dependant_count if row else None,
        "emergency_fund_months": row.emergency_fund_months if row else None,
        "updated_at": row.updated_at.isoformat() if row and row.updated_at else None,
    }


def get_financial_context(db: Session, user_id: uuid.UUID) -> dict:
    row = db.query(FinancialContext).filter(FinancialContext.user_id == user_id).one_or_none()
    return _serialize(row)


def set_financial_context(
    db: Session,
    user_id: uuid.UUID,
    dependant_count: int | None,
    emergency_fund_months: float | None,
) -> dict:
    if dependant_count is None and emergency_fund_months is None:
        return clear_financial_context(db, user_id)
    row = db.query(FinancialContext).filter(FinancialContext.user_id == user_id).one_or_none()
    if row is None:
        row = FinancialContext(user_id=user_id)
        db.add(row)
    row.dependant_count = dependant_count
    row.emergency_fund_months = emergency_fund_months
    try:
        db.commit()
    except IntegrityError:
        # Two first writes can both observe no row. The unique user_id constraint is
        # authoritative; the loser retries against the winner instead of surfacing a 500.
        db.rollback()
        row = db.query(FinancialContext).filter(
            FinancialContext.user_id == user_id
        ).with_for_update().one()
        row.dependant_count = dependant_count
        row.emergency_fund_months = emergency_fund_months
        db.commit()
    db.refresh(row)
    return _serialize(row)


def patch_financial_context(
    db: Session,
    user_id: uuid.UUID,
    values: dict,
) -> dict:
    """Update only explicitly supplied fields, preserving null as an explicit clear."""
    row = db.query(FinancialContext).filter(
        FinancialContext.user_id == user_id
    ).with_for_update().one_or_none()
    dependant_count = (
        values["dependant_count"]
        if "dependant_count" in values
        else (row.dependant_count if row else None)
    )
    emergency_fund_months = (
        values["emergency_fund_months"]
        if "emergency_fund_months" in values
        else (row.emergency_fund_months if row else None)
    )
    if dependant_count is None and emergency_fund_months is None:
        return clear_financial_context(db, user_id)
    if row is None:
        return set_financial_context(
            db, user_id, dependant_count, emergency_fund_months
        )
    row.dependant_count = dependant_count
    row.emergency_fund_months = emergency_fund_months
    db.commit()
    db.refresh(row)
    return _serialize(row)


def clear_financial_context(db: Session, user_id: uuid.UUID) -> dict:
    db.query(FinancialContext).filter(FinancialContext.user_id == user_id).delete(
        synchronize_session=False
    )
    db.commit()
    return _serialize(None)
