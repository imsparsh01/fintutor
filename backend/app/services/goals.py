import uuid
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session

from app.models import Goal, GoalFunding, Holding
from app.services.baseline_lifecycle import require_version
from app.services.goal_progress import compute_goal_progress


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


def _to_dict(goal: Goal, progress: dict | None = None) -> dict:
    funded_by = [
        {"holding_id": str(f.holding_id), "earmarked_amount": float(f.earmarked_amount)}
        for f in goal.funded_by
    ]
    result = {
        "id": str(goal.id),
        "user_id": str(goal.user_id),
        "target_amount": float(goal.target_amount),
        "target_date": goal.target_date.isoformat(),
        "category": goal.category,
        "version": goal.version or 1,
        "funded_by": funded_by,
    }
    result.update(progress or {
        "progress": 0.0,
        "progress_status": "measured",
        "progress_is_partial": False,
        "progress_provenance": [],
    })
    return result


def list_goals(db: Session, user_id: uuid.UUID) -> list[dict]:
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    progress = compute_goal_progress(db, user_id, goals)
    return [_to_dict(goal, progress[goal.id]) for goal in goals]


def _to_live_dict(db: Session, user_id: uuid.UUID, goal: Goal) -> dict:
    progress = compute_goal_progress(db, user_id)
    return _to_dict(goal, progress[goal.id])


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
    return _to_live_dict(db, user_id, goal)


def update_goal_funding(
    db: Session,
    user_id: uuid.UUID,
    goal_id: uuid.UUID,
    funded_by: list[dict],
    expected_version: int | None = None,
) -> dict | None:
    goal = db.query(Goal).filter(
        Goal.user_id == user_id, Goal.id == goal_id
    ).with_for_update().first()
    if goal is None:
        return None
    if expected_version is not None:
        require_version(_to_live_dict(db, user_id, goal), expected_version, {"funded_by": funded_by})
    _validate_funding(db, user_id, funded_by)
    goal.funded_by = [
        GoalFunding(holding_id=item["holding_id"], earmarked_amount=item["earmarked_amount"])
        for item in funded_by
    ]
    goal.version = (goal.version or 1) + 1
    db.commit()
    db.refresh(goal)
    return _to_live_dict(db, user_id, goal)


def goal_deletion_impact(db: Session, user_id: uuid.UUID, goal_id: uuid.UUID) -> dict | None:
    goal = db.query(Goal).filter(Goal.user_id == user_id, Goal.id == goal_id).first()
    if goal is None:
        return None
    return {
        "record_type": "goal",
        "record_id": str(goal.id),
        "category": goal.category,
        "target_amount": float(goal.target_amount),
        "target_date": goal.target_date.isoformat(),
        "funding_links_removed": len(goal.funded_by),
        "affects": ["goal_list", "computed_goal_progress"],
        "version": goal.version or 1,
    }


def update_goal(
    db: Session, user_id: uuid.UUID, goal_id: uuid.UUID, *, target_amount: float,
    target_date, category: str, funded_by: list[dict], expected_version: int
) -> dict | None:
    goal = db.query(Goal).filter(
        Goal.user_id == user_id, Goal.id == goal_id
    ).with_for_update().first()
    if goal is None:
        return None
    proposed = {"target_amount": target_amount, "target_date": target_date.isoformat(),
                "category": category, "funded_by": funded_by}
    require_version(_to_live_dict(db, user_id, goal), expected_version, proposed)
    _validate_funding(db, user_id, funded_by)
    goal.target_amount = target_amount
    goal.target_date = target_date
    goal.category = category
    goal.funded_by = [GoalFunding(holding_id=item["holding_id"],
                                  earmarked_amount=item["earmarked_amount"])
                      for item in funded_by]
    goal.version = (goal.version or 1) + 1
    db.commit()
    db.refresh(goal)
    return _to_live_dict(db, user_id, goal)


def delete_goal(
    db: Session, user_id: uuid.UUID, goal_id: uuid.UUID, expected_version: int
) -> dict | None:
    goal = db.query(Goal).filter(
        Goal.user_id == user_id, Goal.id == goal_id
    ).with_for_update().first()
    if goal is None:
        return None
    current = _to_live_dict(db, user_id, goal)
    require_version(current, expected_version, {"delete_id": str(goal_id)})
    impact = {
        "record_type": "goal", "record_id": str(goal.id), "category": goal.category,
        "target_amount": float(goal.target_amount), "target_date": goal.target_date.isoformat(),
        "funding_links_removed": len(goal.funded_by),
        "affects": ["goal_list", "computed_goal_progress"], "version": goal.version or 1,
    }
    db.delete(goal)
    db.commit()
    return {"deleted": True, "impact": impact}
