import uuid

from sqlalchemy.orm import Session

from app.models import Holding


def _to_dict(holding: Holding) -> dict:
    return {
        "id": str(holding.id),
        "product_type": holding.product_type,
        "alias": holding.alias,
        "display_name": holding.display_name,
        "characteristics": holding.characteristics,
    }


def list_holdings(db: Session, user_id: uuid.UUID) -> list[dict]:
    holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
    return [_to_dict(h) for h in holdings]


def get_holding(db: Session, user_id: uuid.UUID, holding_id: uuid.UUID) -> dict | None:
    holding = (
        db.query(Holding)
        .filter(Holding.user_id == user_id, Holding.id == holding_id)
        .first()
    )
    return _to_dict(holding) if holding else None


def update_holding(
    db: Session,
    user_id: uuid.UUID,
    holding_id: uuid.UUID,
    product_type: str | None,
    alias: str | None,
    display_name: str | None,
    characteristics: dict | None,
) -> dict | None:
    """Partial update — only fields explicitly passed (non-None) are changed. Returns None if
    no matching holding exists. Raises sqlalchemy.exc.IntegrityError on a duplicate (user_id,
    alias), same caller responsibility as create_holding."""
    holding = (
        db.query(Holding)
        .filter(Holding.user_id == user_id, Holding.id == holding_id)
        .first()
    )
    if holding is None:
        return None
    if product_type is not None:
        holding.product_type = product_type
    if alias is not None:
        holding.alias = alias
    if display_name is not None:
        holding.display_name = display_name
    if characteristics is not None:
        holding.characteristics = characteristics
    db.commit()
    db.refresh(holding)
    return _to_dict(holding)


def delete_holding(db: Session, user_id: uuid.UUID, holding_id: uuid.UUID) -> bool:
    """Returns False if no matching holding exists (caller turns that into a 404)."""
    holding = (
        db.query(Holding)
        .filter(Holding.user_id == user_id, Holding.id == holding_id)
        .first()
    )
    if holding is None:
        return False
    db.delete(holding)
    db.commit()
    return True


def create_holding(
    db: Session,
    user_id: uuid.UUID,
    product_type: str,
    alias: str,
    display_name: str | None,
    characteristics: dict,
) -> dict:
    """Raises sqlalchemy.exc.IntegrityError on a duplicate (user_id, alias) — caller's job
    to turn that into a 409, same responsibility split main.py already uses elsewhere."""
    holding = Holding(
        user_id=user_id,
        product_type=product_type,
        alias=alias,
        display_name=display_name,
        characteristics=characteristics or {},
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return _to_dict(holding)
