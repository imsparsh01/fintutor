import uuid

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import (
    DiscretionaryCategory,
    FinancialContext,
    Goal,
    GoalFunding,
    Holding,
    Income,
    OnboardingAssessment,
    OnboardingState,
    ProgressionDailyRollup,
    ProgressionEvent,
    ProgressionSummary,
    StreakState,
)

ACCOUNT_DATA_MODELS = (
    ProgressionEvent,
    ProgressionDailyRollup,
    ProgressionSummary,
    OnboardingAssessment,
    OnboardingState,
    StreakState,
    DiscretionaryCategory,
    FinancialContext,
    Income,
    Goal,
    Holding,
)


async def reauthenticate_password(email: str, password: str, expected_user_id: uuid.UUID) -> None:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(status_code=503, detail="Authentication is not configured")
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password",
                headers={"apikey": settings.supabase_anon_key},
                json={"email": email, "password": password},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Authentication service unavailable") from exc
    try:
        authenticated_id = uuid.UUID(response.json()["user"]["id"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Reauthentication failed") from exc
    if response.status_code != 200 or authenticated_id != expected_user_id:
        raise HTTPException(status_code=401, detail="Reauthentication failed")


def delete_active_user_data(db: Session, user_id: uuid.UUID) -> None:
    goal_ids = db.query(Goal.id).filter(Goal.user_id == user_id)
    db.query(GoalFunding).filter(GoalFunding.goal_id.in_(goal_ids)).delete(
        synchronize_session=False
    )
    for model in ACCOUNT_DATA_MODELS:
        db.query(model).filter(model.user_id == user_id).delete(synchronize_session=False)
    db.commit()


async def delete_supabase_auth_user(user_id: uuid.UUID) -> None:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Account deletion is not configured")
    key = settings.supabase_service_role_key
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.request(
                "DELETE",
                f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users/{user_id}",
                headers={"Authorization": f"Bearer {key}", "apikey": key},
                json={"should_soft_delete": False},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Account deletion could not be completed") from exc
    if response.status_code not in (200, 204, 404):
        raise HTTPException(status_code=503, detail="Account deletion could not be completed")
