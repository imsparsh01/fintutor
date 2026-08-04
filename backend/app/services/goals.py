import uuid

from sqlalchemy.orm import Session

from app.models import Goal, GoalFunding


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
