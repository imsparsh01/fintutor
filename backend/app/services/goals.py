import uuid
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session

from app.models import Goal, GoalFunding, Holding


class GoalFundingValidationError(ValueError):
    pass


def _validate_funding(db: Session, user_id: uuid.UUID, funded_by: list[dict]) -> None:
    for item in funded_by:
        try:
            amount = Decimal(str(item["earmarked_amount"]))
        except (InvalidOperation, ValueError):
            raise GoalFundingValidationError("Earmarked amounts must be valid numbers")
        if not amount.is_finite() or amount <= 0:
            raise GoalFundingValidationError("Each selected holding needs a finite earmarked amount above zero")
        if amount > Decimal("999999999999.99") or amount.as_tuple().exponent < -2:
            raise GoalFundingValidationError(
                "Earmarked amounts must fit 12 whole digits and 2 decimal places"
            )
    ids = [item["holding_id"] for item in funded_by]
    if len(ids) != len(set(ids)):
        raise GoalFundingValidationError("Each holding can fund a goal only once")
    owned = {
        row[0]
        for row in db.query(Holding.id)
        .filter(Holding.user_id == user_id, Holding.id.in_(ids))
        .all()
    }
    if owned != set(ids):
        raise GoalFundingValidationError("Every funded holding must belong to this user")


def _to_dict(goal: Goal) -> dict:
    funded_by = [
        {"holding_id": str(f.holding_id), "earmarked_amount": float(f.earmarked_amount)}
        for f in goal.funded_by
    ]
    return {
        "id": str(goal.id),
        "user_id": str(goal.user_id),
        "target_amount": float(goal.target_amount),
        "target_date": goal.target_date.isoformat(),
        "category": goal.category,
        "funded_by": funded_by,
        # D-038: progress is computed live as the sum of earmarked amounts, never stored
        # on the Goal record itself.
        "progress": sum(f["earmarked_amount"] for f in funded_by),
    }


def list_goals(db: Session, user_id: uuid.UUID) -> list[dict]:
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    return [_to_dict(g) for g in goals]


def create_goal(
    db: Session,
    user_id: uuid.UUID,
    target_amount: float,
    target_date,
    category: str,
    funded_by: list[dict],
) -> dict:
    """`funded_by` is a list of {holding_id, earmarked_amount}. Raises
    sqlalchemy.exc.IntegrityError if a holding_id doesn't exist (FK constraint) — caller's
    job to turn that into a 4xx, same responsibility split as create_holding."""
    _validate_funding(db, user_id, funded_by)
    goal = Goal(
        user_id=user_id,
        target_amount=target_amount,
        target_date=target_date,
        category=category,
        funded_by=[
            GoalFunding(holding_id=f["holding_id"], earmarked_amount=f["earmarked_amount"])
            for f in funded_by
        ],
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _to_dict(goal)


def update_goal_funding(
    db: Session,
    user_id: uuid.UUID,
    goal_id: uuid.UUID,
    funded_by: list[dict],
) -> dict | None:
    goal = db.query(Goal).filter(Goal.user_id == user_id, Goal.id == goal_id).first()
    if goal is None:
        return None
    _validate_funding(db, user_id, funded_by)
    goal.funded_by = [
        GoalFunding(holding_id=item["holding_id"], earmarked_amount=item["earmarked_amount"])
        for item in funded_by
    ]
    db.commit()
    db.refresh(goal)
    return _to_dict(goal)
