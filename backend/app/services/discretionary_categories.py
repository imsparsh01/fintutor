import uuid

from sqlalchemy.orm import Session

from app.models import DiscretionaryCategory
from app.services.baseline_lifecycle import require_version


def _to_dict(category: DiscretionaryCategory) -> dict:
    return {
        "id": str(category.id),
        "label": category.label,
        "planned_amount": float(category.planned_amount),
        "version": category.version or 1,
    }


def _owned(
    db: Session, user_id: uuid.UUID, category_id: uuid.UUID, *, lock: bool = False
) -> DiscretionaryCategory | None:
    query = db.query(DiscretionaryCategory).filter(
        DiscretionaryCategory.user_id == user_id,
        DiscretionaryCategory.id == category_id,
    )
    if lock:
        query = query.with_for_update()
    return query.first()


def list_discretionary_categories(db: Session, user_id: uuid.UUID) -> list[dict]:
    return [_to_dict(row) for row in db.query(DiscretionaryCategory).filter(
        DiscretionaryCategory.user_id == user_id
    ).all()]


def create_discretionary_category(
    db: Session, user_id: uuid.UUID, label: str, planned_amount: float
) -> dict:
    category = DiscretionaryCategory(user_id=user_id, label=label, planned_amount=planned_amount)
    db.add(category)
    db.commit()
    db.refresh(category)
    return _to_dict(category)


def discretionary_deletion_impact(
    db: Session, user_id: uuid.UUID, category_id: uuid.UUID
) -> dict | None:
    category = _owned(db, user_id, category_id)
    if category is None:
        return None
    return {"record_type": "discretionary_category", "record_id": str(category.id),
            "label": category.label, "planned_amount": float(category.planned_amount),
            "affects": ["computed_budget"], "version": category.version or 1}


def update_discretionary_category(
    db: Session, user_id: uuid.UUID, category_id: uuid.UUID, label: str,
    planned_amount: float, expected_version: int
) -> dict | None:
    category = _owned(db, user_id, category_id, lock=True)
    if category is None:
        return None
    proposed = {"label": label, "planned_amount": planned_amount}
    require_version(_to_dict(category), expected_version, proposed)
    category.label = label
    category.planned_amount = planned_amount
    category.version = (category.version or 1) + 1
    db.commit()
    db.refresh(category)
    return _to_dict(category)


def delete_discretionary_category(
    db: Session, user_id: uuid.UUID, category_id: uuid.UUID, expected_version: int
) -> dict | None:
    category = _owned(db, user_id, category_id, lock=True)
    if category is None:
        return None
    current = _to_dict(category)
    require_version(current, expected_version, {"delete_id": str(category_id)})
    impact = discretionary_deletion_impact(db, user_id, category_id)
    db.delete(category)
    db.commit()
    return {"deleted": True, "impact": impact}
