import uuid

from sqlalchemy.orm import Session

from app.models import DiscretionaryCategory


def _to_dict(category: DiscretionaryCategory) -> dict:
    return {
        "id": str(category.id),
        "label": category.label,
        "planned_amount": float(category.planned_amount),
    }


def list_discretionary_categories(db: Session, user_id: uuid.UUID) -> list[dict]:
    rows = (
        db.query(DiscretionaryCategory)
        .filter(DiscretionaryCategory.user_id == user_id)
        .all()
    )
    return [_to_dict(row) for row in rows]


def create_discretionary_category(
    db: Session, user_id: uuid.UUID, label: str, planned_amount: float
) -> dict:
    category = DiscretionaryCategory(user_id=user_id, label=label, planned_amount=planned_amount)
    db.add(category)
    db.commit()
    db.refresh(category)
    return _to_dict(category)
