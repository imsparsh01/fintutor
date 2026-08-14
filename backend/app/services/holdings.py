import math
import uuid

from sqlalchemy.orm import Session

from app.models import Holding


def _validate_tax_inputs(product_type: str, characteristics: dict) -> None:
    """Reject new invalid values that feed the D-070 Section 80C calculation."""
    fields: tuple[str, ...] = ()
    if product_type == "ppf_epf":
        fields = ("annual_contribution",)
    elif product_type in ("term_insurance", "endowment_ulip"):
        fields = ("premium",)
    for field in fields:
        value = characteristics.get(field)
        if value is None:
            continue
        try:
            numeric = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"{field} must be a finite non-negative number") from exc
        if not math.isfinite(numeric) or numeric < 0:
            raise ValueError(f"{field} must be a finite non-negative number")


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
    effective_type = product_type if product_type is not None else holding.product_type
    effective_characteristics = (
        characteristics if characteristics is not None else (holding.characteristics or {})
    )
    if characteristics is not None or (
        product_type is not None and product_type != holding.product_type
    ):
        _validate_tax_inputs(effective_type, effective_characteristics)
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
    result = _to_dict(holding)
    result["reconciliation"] = {
        "status": "updated",
        "product_type": product_type,
        "changed_fields": list((characteristics or {}).keys()),
    }
    return result


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


def _humanize_product_type(product_type: str) -> str:
    return " ".join(word.capitalize() for word in product_type.split("_"))


def _generate_alias(db: Session, user_id: uuid.UUID, product_type: str) -> str:
    """D-074: the next unused "{Humanized Product Type}-{n}" label scoped to this exact
    product_type for this user — e.g. "Home Loan-1", "Home Loan-2". Existing (user_id, alias)
    uniqueness + the caller's IntegrityError->409 handling is the safety net if this ever
    collides (e.g. a race); this loop is not itself relied on for correctness under concurrency.
    """
    prefix = _humanize_product_type(product_type)
    existing_aliases = {
        h.alias
        for h in db.query(Holding)
        .filter(Holding.user_id == user_id, Holding.product_type == product_type)
        .all()
    }
    n = 1
    while f"{prefix}-{n}" in existing_aliases:
        n += 1
    return f"{prefix}-{n}"


def create_holding(
    db: Session,
    user_id: uuid.UUID,
    product_type: str,
    alias: str | None,
    display_name: str | None,
    characteristics: dict,
) -> dict:
    """Raises sqlalchemy.exc.IntegrityError on a duplicate (user_id, alias) — caller's job
    to turn that into a 409, same responsibility split main.py already uses elsewhere.
    D-074: alias is optional — the manual add-holding UI never sends one, and gets one
    generated here. Direct API callers may still supply their own, unchanged."""
    if alias is None:
        alias = _generate_alias(db, user_id, product_type)
    _validate_tax_inputs(product_type, characteristics or {})
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
    result = _to_dict(holding)
    result["reconciliation"] = {
        "status": "new",
        "product_type": holding.product_type,
        "changed_fields": list((characteristics or {}).keys()),
    }
    return result
