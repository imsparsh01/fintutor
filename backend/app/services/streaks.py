import uuid
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import StreakState


def _to_dict(state: StreakState) -> dict:
    return {
        "user_id": str(state.user_id),
        "current_streak": state.current_streak,
        "longest_streak": state.longest_streak,
        "last_active_date": state.last_active_date.isoformat() if state.last_active_date else None,
    }


def get_streak(db: Session, user_id: uuid.UUID) -> dict:
    state = db.query(StreakState).filter(StreakState.user_id == user_id).first()
    if state is None:
        return {
            "user_id": str(user_id),
            "current_streak": 0,
            "longest_streak": 0,
            "last_active_date": None,
        }
    return _to_dict(state)


def record_app_open(db: Session, user_id: uuid.UUID) -> dict:
    """D-060/BQ-029: increments the streak on a new calendar day's first open (server date),
    resets to 1 on a missed day, no-ops (returns unchanged state) if today was already
    recorded — so a client can safely call this on every app foreground."""
    today = date.today()
    state = db.query(StreakState).filter(StreakState.user_id == user_id).first()

    if state is None:
        state = StreakState(
            user_id=user_id, current_streak=1, longest_streak=1, last_active_date=today
        )
        db.add(state)
        db.commit()
        db.refresh(state)
        return _to_dict(state)

    if state.last_active_date == today:
        return _to_dict(state)

    if state.last_active_date == today - timedelta(days=1):
        state.current_streak += 1
    else:
        state.current_streak = 1
    state.longest_streak = max(state.longest_streak, state.current_streak)
    state.last_active_date = today

    db.commit()
    db.refresh(state)
    return _to_dict(state)
