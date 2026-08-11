import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.dialects.postgresql import insert as postgresql_insert
from sqlalchemy.orm import Session

from app.models import OnboardingAssessment

FLOW_VERSION = 2
QUESTION_ORDER = (
    "immediate_intent",
    "earning_context",
    "responsibility_context",
    "exposure_flags",
    "familiarity",
)

ALLOWED_VALUES: dict[str, frozenset[str]] = {
    "immediate_intent": frozenset(
        {
            "learn_basics",
            "connect_picture",
            "understand_existing",
            "model_future",
            "build_routine",
            "ask_arya",
            "explore",
            "undisclosed",
        }
    ),
    "earning_context": frozenset(
        {
            "student",
            "pre_earning",
            "early_earner",
            "established_earner",
            "variable_or_transitioning",
            "undisclosed",
        }
    ),
    "responsibility_context": frozenset(
        {"self", "shared", "dependents", "variable", "undisclosed"}
    ),
    "exposure_flags": frozenset(
        {
            "spending",
            "saving",
            "investing",
            "borrowing",
            "insurance",
            "goals",
            "workplace_and_tax",
            "none",
            "unsure",
            "undisclosed",
        }
    ),
    "familiarity": frozenset(
        {
            "foundations",
            "working_basics",
            "connecting",
            "deeper_context",
            "variable",
            "undisclosed",
        }
    ),
}

_EXCLUSIVE_EXPOSURE_VALUES = {"none", "unsure", "undisclosed"}
# frozenset iteration is intentionally not used for persistence order.
_EXPOSURE_ORDER = (
    "spending",
    "saving",
    "investing",
    "borrowing",
    "insurance",
    "goals",
    "workplace_and_tax",
    "none",
    "unsure",
    "undisclosed",
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _to_dict(assessment: OnboardingAssessment) -> dict[str, Any]:
    return {
        "user_id": str(assessment.user_id),
        "flow_version": assessment.flow_version,
        "status": assessment.status,
        "current_question": assessment.current_question,
        "immediate_intent": assessment.immediate_intent,
        "earning_context": assessment.earning_context,
        "responsibility_context": assessment.responsibility_context,
        "exposure_flags": list(assessment.exposure_flags or []),
        "familiarity": assessment.familiarity,
        "eligibility_confirmed_at": assessment.eligibility_confirmed_at,
        "handled_at": assessment.handled_at,
        "handled_via": assessment.handled_via,
        "cleared_at": assessment.cleared_at,
    }


def get_assessment(
    db: Session, user_id: uuid.UUID, flow_version: int = FLOW_VERSION
) -> dict[str, Any] | None:
    assessment = (
        db.query(OnboardingAssessment)
        .filter(
            OnboardingAssessment.user_id == user_id,
            OnboardingAssessment.flow_version == flow_version,
        )
        .first()
    )
    return _to_dict(assessment) if assessment else None


def start_assessment(
    db: Session,
    user_id: uuid.UUID,
    *,
    eligibility_confirmed: bool,
    flow_version: int = FLOW_VERSION,
) -> dict[str, Any]:
    if not eligibility_confirmed:
        raise ValueError("18+ eligibility acknowledgement is required")
    if flow_version <= 0:
        raise ValueError("flow_version must be positive")

    existing = (
        db.query(OnboardingAssessment)
        .filter(
            OnboardingAssessment.user_id == user_id,
            OnboardingAssessment.flow_version == flow_version,
        )
        .first()
    )
    if existing:
        return _to_dict(existing)

    now = _utcnow()
    if db.get_bind().dialect.name == "postgresql":
        # The uniqueness constraint is the concurrency arbiter. A simultaneous start
        # becomes a no-op, then both callers read the same normalized record.
        statement = (
            postgresql_insert(OnboardingAssessment)
            .values(
                id=uuid.uuid4(),
                user_id=user_id,
                flow_version=flow_version,
                status="in_progress",
                current_question=QUESTION_ORDER[0],
                eligibility_confirmed_at=now,
                created_at=now,
                updated_at=now,
            )
            .on_conflict_do_nothing(
                constraint="uq_onboarding_assessments_user_version"
            )
        )
        db.execute(statement)
        db.commit()
        assessment = (
            db.query(OnboardingAssessment)
            .filter(
                OnboardingAssessment.user_id == user_id,
                OnboardingAssessment.flow_version == flow_version,
            )
            .one()
        )
        return _to_dict(assessment)

    assessment = OnboardingAssessment(
        user_id=user_id,
        flow_version=flow_version,
        status="in_progress",
        current_question=QUESTION_ORDER[0],
        eligibility_confirmed_at=now,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return _to_dict(assessment)


def _load_current(
    db: Session, user_id: uuid.UUID, flow_version: int = FLOW_VERSION
) -> OnboardingAssessment:
    assessment = (
        db.query(OnboardingAssessment)
        .filter(
            OnboardingAssessment.user_id == user_id,
            OnboardingAssessment.flow_version == flow_version,
        )
        .with_for_update()
        .first()
    )
    if assessment is None:
        raise LookupError("assessment has not been started")
    return assessment


def _normalize_exposure(value: object) -> list[str]:
    if not isinstance(value, list) or not value:
        raise ValueError("exposure_flags must be a non-empty list")
    if not all(isinstance(item, str) for item in value):
        raise ValueError("exposure_flags must contain only normalized string codes")
    values = list(dict.fromkeys(value))
    invalid = set(values) - ALLOWED_VALUES["exposure_flags"]
    if invalid:
        raise ValueError(f"unsupported exposure_flags: {sorted(invalid)}")
    exclusive = set(values) & _EXCLUSIVE_EXPOSURE_VALUES
    if exclusive and len(values) != 1:
        raise ValueError("none, unsure, and undisclosed cannot be combined with other exposure flags")
    return sorted(values, key=_EXPOSURE_ORDER.index)


def _normalize_answer(question: str, value: object) -> str | list[str]:
    if question == "exposure_flags":
        return _normalize_exposure(value)
    if not isinstance(value, str) or value not in ALLOWED_VALUES[question]:
        raise ValueError(f"unsupported {question} value")
    return value


def answer_current_question(
    db: Session,
    user_id: uuid.UUID,
    question: str,
    value: object,
    flow_version: int = FLOW_VERSION,
) -> dict[str, Any]:
    assessment = _load_current(db, user_id, flow_version)
    if question not in QUESTION_ORDER:
        raise ValueError("unsupported assessment question")
    normalized = _normalize_answer(question, value)

    # A network retry of an already-applied answer is idempotent; it never advances twice.
    stored = getattr(assessment, question)
    current_index = (
        QUESTION_ORDER.index(assessment.current_question)
        if assessment.current_question in QUESTION_ORDER
        else len(QUESTION_ORDER)
    )
    question_index = QUESTION_ORDER.index(question)
    if question_index < current_index or assessment.status == "handled":
        if stored == normalized:
            return _to_dict(assessment)
        raise ValueError("assessment question was already handled with a different value")
    if question != assessment.current_question:
        raise ValueError(f"expected answer for {assessment.current_question}")

    setattr(assessment, question, normalized)
    if question_index == len(QUESTION_ORDER) - 1:
        assessment.status = "handled"
        assessment.current_question = None
        assessment.handled_at = _utcnow()
        assessment.handled_via = "completed"
    else:
        assessment.current_question = QUESTION_ORDER[question_index + 1]

    db.commit()
    db.refresh(assessment)
    return _to_dict(assessment)


def skip_current_question(
    db: Session,
    user_id: uuid.UUID,
    question: str,
    flow_version: int = FLOW_VERSION,
) -> dict[str, Any]:
    value: str | list[str] = ["undisclosed"] if question == "exposure_flags" else "undisclosed"
    return answer_current_question(db, user_id, question, value, flow_version)


def handle_assessment(
    db: Session, user_id: uuid.UUID, flow_version: int = FLOW_VERSION
) -> dict[str, Any]:
    assessment = _load_current(db, user_id, flow_version)
    if assessment.status == "handled":
        return _to_dict(assessment)

    for question in QUESTION_ORDER:
        if getattr(assessment, question) is None:
            setattr(assessment, question, ["undisclosed"] if question == "exposure_flags" else "undisclosed")
    assessment.status = "handled"
    assessment.current_question = None
    assessment.handled_at = _utcnow()
    assessment.handled_via = "global_exit"
    db.commit()
    db.refresh(assessment)
    return _to_dict(assessment)


def clear_assessment(
    db: Session, user_id: uuid.UUID, flow_version: int = FLOW_VERSION
) -> dict[str, Any]:
    assessment = _load_current(db, user_id, flow_version)
    for question in QUESTION_ORDER:
        setattr(assessment, question, ["undisclosed"] if question == "exposure_flags" else "undisclosed")
    if assessment.status != "handled":
        assessment.status = "handled"
        assessment.handled_at = _utcnow()
        assessment.handled_via = "global_exit"
    assessment.current_question = None
    assessment.cleared_at = _utcnow()
    db.commit()
    db.refresh(assessment)
    return _to_dict(assessment)
