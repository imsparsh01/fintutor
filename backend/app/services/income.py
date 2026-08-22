import uuid

from sqlalchemy.orm import Session

from app.models import Income
from app.services.baseline_lifecycle import require_version


def _source_with_id(income_id: uuid.UUID, index: int, source: dict) -> dict:
    normalized = dict(source)
    normalized.setdefault("id", str(uuid.uuid5(income_id, f"source:{index}")))
    return normalized


def _normalized_sources(income: Income) -> list[dict]:
    return [_source_with_id(income.id, index, source) for index, source in enumerate(income.sources)]


def _to_dict(income: Income) -> dict:
    return {
        "id": str(income.id),
        "user_id": str(income.user_id),
        "sources": _normalized_sources(income),
        "version": income.version or 1,
    }


def _owned(
    db: Session, user_id: uuid.UUID, income_id: uuid.UUID, *, lock: bool = False
) -> Income | None:
    query = db.query(Income).filter(Income.user_id == user_id, Income.id == income_id)
    if lock:
        query = query.with_for_update()
    return query.first()


def _new_source(source: dict) -> dict:
    normalized = dict(source)
    normalized["id"] = str(normalized.get("id") or uuid.uuid4())
    return normalized


def list_income(db: Session, user_id: uuid.UUID) -> list[dict]:
    return [_to_dict(row) for row in db.query(Income).filter(Income.user_id == user_id).all()]


def create_income(db: Session, user_id: uuid.UUID, sources: list[dict]) -> dict:
    income = Income(user_id=user_id, sources=[_new_source(source) for source in sources])
    db.add(income)
    db.commit()
    db.refresh(income)
    return _to_dict(income)


def update_income(
    db: Session,
    user_id: uuid.UUID,
    income_id: uuid.UUID,
    sources: list[dict],
    expected_version: int | None = None,
) -> dict | None:
    income = _owned(db, user_id, income_id, lock=True)
    if income is None:
        return None
    proposed = {"sources": sources}
    if expected_version is not None:
        require_version(_to_dict(income), expected_version, proposed)
    income.sources = [_new_source(source) for source in sources]
    income.version = (income.version or 1) + 1
    db.commit()
    db.refresh(income)
    return _to_dict(income)


def income_source_deletion_impact(
    db: Session, user_id: uuid.UUID, income_id: uuid.UUID, source_id: uuid.UUID
) -> dict | None:
    income = _owned(db, user_id, income_id)
    if income is None:
        return None
    source = next((item for item in _normalized_sources(income) if item["id"] == str(source_id)), None)
    if source is None:
        return None
    return {
        "record_type": "income_source",
        "record_id": str(source_id),
        "label": source.get("label"),
        "amount": source.get("amount"),
        "frequency": source.get("frequency"),
        "affects": ["computed_budget"],
        "version": income.version or 1,
    }


def replace_income_source(
    db: Session,
    user_id: uuid.UUID,
    income_id: uuid.UUID,
    source_id: uuid.UUID,
    source: dict,
    expected_version: int,
) -> dict | None:
    income = _owned(db, user_id, income_id, lock=True)
    if income is None:
        return None
    current = _to_dict(income)
    proposed = {"source_id": str(source_id), "source": source}
    require_version(current, expected_version, proposed)
    sources = _normalized_sources(income)
    index = next((i for i, item in enumerate(sources) if item["id"] == str(source_id)), None)
    if index is None:
        return None
    sources[index] = {**source, "id": str(source_id)}
    income.sources = sources
    income.version = (income.version or 1) + 1
    db.commit()
    db.refresh(income)
    return _to_dict(income)


def delete_income_source(
    db: Session,
    user_id: uuid.UUID,
    income_id: uuid.UUID,
    source_id: uuid.UUID,
    expected_version: int,
) -> dict | None:
    income = _owned(db, user_id, income_id, lock=True)
    if income is None:
        return None
    current = _to_dict(income)
    proposed = {"delete_source_id": str(source_id)}
    require_version(current, expected_version, proposed)
    sources = _normalized_sources(income)
    remaining = [item for item in sources if item["id"] != str(source_id)]
    if len(remaining) == len(sources):
        return None
    income.sources = remaining
    income.version = (income.version or 1) + 1
    db.commit()
    db.refresh(income)
    return {"deleted": True, "impact": {
        "record_type": "income_source",
        "record_id": str(source_id),
        "label": next(item.get("label") for item in sources if item["id"] == str(source_id)),
        "affects": ["computed_budget"],
    }, "current": _to_dict(income)}
