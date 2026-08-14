"""User-readable, reauthenticated export of FinTutor's active user data."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import (
    DiscretionaryCategory,
    FinancialContext,
    Goal,
    Holding,
    Income,
    OnboardingAssessment,
    OnboardingState,
    ProgressionDailyRollup,
    ProgressionEvent,
    ProgressionSummary,
    StreakState,
)


# Kept explicit so the coverage test fails when a new user-owned table is added
# without a deliberate export representation.
EXPORT_DATA_MODELS = (
    Holding,
    Income,
    Goal,
    DiscretionaryCategory,
    FinancialContext,
    OnboardingAssessment,
    OnboardingState,
    StreakState,
    ProgressionEvent,
    ProgressionDailyRollup,
    ProgressionSummary,
)


EXPORT_SECTIONS = {
    "holdings": {
        "description": "Investments, loans, and insurance the user has recorded.",
        "fields": "id, product type, user-facing display name, and recorded characteristics",
    },
    "income": {
        "description": "Income sources and the cadence supplied for each source.",
        "fields": "id and sources (label, amount, frequency, and optional typical amount)",
    },
    "goals": {
        "description": "Financial goals and the holdings earmarked toward them.",
        "fields": "id, target amount/date, category, and holding funding links",
    },
    "discretionary_categories": {
        "description": "User-defined planned spending categories.",
        "fields": "id, label, and planned amount",
    },
    "financial_context": {
        "description": "Optional confirmed context used for personalization and Portfolio Health.",
        "fields": "dependant count, emergency-fund months, and last update time",
    },
    "onboarding_context": {
        "description": "Optional normalized answers used to tailor explanations.",
        "fields": "flow state, normalized answers, eligibility and lifecycle timestamps",
    },
    "onboarding_progress": {
        "description": "The user's position in the legacy guided onboarding flow.",
        "fields": "track, stage, and turns in the current stage",
    },
    "streak": {
        "description": "App-open streak activity; it is not derived from financial values.",
        "fields": "current streak, longest streak, and last active date",
    },
    "learning_progression": {
        "description": "Learning stage, activity history, and retained daily history.",
        "fields": "user-facing summary, recorded events, and daily rollups retained after pruning",
    },
}


def _iso(value):
    return value.isoformat() if value is not None else None


def _rows(db: Session, model, user_id: uuid.UUID):
    return db.query(model).filter(model.user_id == user_id).all()


def build_data_export(
    db: Session,
    user_id: uuid.UUID,
    *,
    account_email: str | None = None,
    generated_at: datetime | None = None,
) -> dict:
    """Build a complete user-facing export without authentication or masking internals.

    Every query is independently ownership-scoped. Internal holding aliases,
    progression idempotency keys/floors, and request-local privacy-mask mappings are
    deliberately absent from the result.
    """
    generated_at = generated_at or datetime.now(timezone.utc)

    holdings = [
        {
            "id": str(row.id),
            "product_type": row.product_type,
            "display_name": row.display_name,
            "characteristics": row.characteristics,
        }
        for row in _rows(db, Holding, user_id)
    ]
    income = [
        {"id": str(row.id), "sources": row.sources}
        for row in _rows(db, Income, user_id)
    ]
    goals = [
        {
            "id": str(row.id),
            "target_amount": float(row.target_amount),
            "target_date": _iso(row.target_date),
            "category": row.category,
            "funded_by": [
                {
                    "holding_id": str(link.holding_id),
                    "earmarked_amount": float(link.earmarked_amount),
                }
                for link in row.funded_by
            ],
        }
        for row in _rows(db, Goal, user_id)
    ]
    discretionary = [
        {
            "id": str(row.id),
            "label": row.label,
            "planned_amount": float(row.planned_amount),
        }
        for row in _rows(db, DiscretionaryCategory, user_id)
    ]
    financial_context = [
        {
            "dependant_count": row.dependant_count,
            "emergency_fund_months": row.emergency_fund_months,
            "updated_at": _iso(row.updated_at),
        }
        for row in _rows(db, FinancialContext, user_id)
    ]
    assessments = [
        {
            "flow_version": row.flow_version,
            "status": row.status,
            "current_question": row.current_question,
            "immediate_intent": row.immediate_intent,
            "earning_context": row.earning_context,
            "responsibility_context": row.responsibility_context,
            "exposure_flags": list(row.exposure_flags) if row.exposure_flags is not None else None,
            "familiarity": row.familiarity,
            "eligibility_confirmed_at": _iso(row.eligibility_confirmed_at),
            "handled_at": _iso(row.handled_at),
            "handled_via": row.handled_via,
            "cleared_at": _iso(row.cleared_at),
            "created_at": _iso(row.created_at),
            "updated_at": _iso(row.updated_at),
        }
        for row in _rows(db, OnboardingAssessment, user_id)
    ]
    onboarding_progress = [
        {"track": row.track, "stage": row.stage, "turns_in_stage": row.turns_in_stage}
        for row in _rows(db, OnboardingState, user_id)
    ]
    streaks = [
        {
            "current_streak": row.current_streak,
            "longest_streak": row.longest_streak,
            "last_active_date": _iso(row.last_active_date),
        }
        for row in _rows(db, StreakState, user_id)
    ]
    events = [
        {
            "event_type": row.event_type,
            "subject_key": row.subject_key,
            "occurred_at": _iso(row.occurred_at),
            "local_date": _iso(row.local_date),
        }
        for row in _rows(db, ProgressionEvent, user_id)
    ]
    rollups = [
        {
            "local_date": _iso(row.local_date),
            "points_awarded": row.points_awarded,
            "awarded_types": row.awarded_types,
            "dimensions": row.dimensions,
            "return_day_awarded": row.return_day_awarded,
            "events_pruned": row.events_pruned,
        }
        for row in _rows(db, ProgressionDailyRollup, user_id)
    ]
    summaries = [
        {
            "displayed_points": row.displayed_points,
            "stage": row.stage,
            "active_dimensions": row.active_dimensions,
            "return_days": row.return_days,
            "last_event_at": _iso(row.last_event_at),
        }
        for row in _rows(db, ProgressionSummary, user_id)
    ]

    return {
        "format": "fintutor-data-export",
        "format_version": 1,
        "generated_at": generated_at.isoformat(),
        "account": {"user_id": str(user_id), "email": account_email},
        "schema": {
            "description": "A snapshot of active personal data stored by FinTutor at export time.",
            "sections": EXPORT_SECTIONS,
            "notes": [
                "Money amounts use the currency and units originally entered by the user.",
                "Internal aliases, authentication secrets, service credentials, and privacy-mask mappings are excluded.",
                "Daily learning rollups may represent older activity whose individual events were deleted under the retention policy.",
            ],
        },
        "data": {
            "holdings": holdings,
            "income": income,
            "goals": goals,
            "discretionary_categories": discretionary,
            "financial_context": financial_context,
            "onboarding_context": assessments,
            "onboarding_progress": onboarding_progress,
            "streak": streaks,
            "learning_progression": {
                "summary": summaries,
                "events": events,
                "daily_rollups": rollups,
            },
        },
    }
