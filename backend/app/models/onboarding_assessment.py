import uuid
from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, Integer, JSON, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class OnboardingAssessment(Base):
    """Versioned, normalized onboarding context — D-118/D-119, BQ-065.

    This table intentionally does not contain raw answers or dialogue. The legacy
    ``onboarding_states`` table keeps its original four-track meaning unchanged.
    """

    __tablename__ = "onboarding_assessments"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "flow_version", name="uq_onboarding_assessments_user_version"
        ),
        CheckConstraint("flow_version > 0", name="ck_onboarding_assessments_version_positive"),
        CheckConstraint(
            "status IN ('in_progress', 'handled')",
            name="ck_onboarding_assessments_status",
        ),
        CheckConstraint(
            "current_question IS NULL OR current_question IN "
            "('immediate_intent', 'earning_context', 'responsibility_context', "
            "'exposure_flags', 'familiarity')",
            name="ck_onboarding_assessments_current_question",
        ),
        CheckConstraint(
            "handled_via IS NULL OR handled_via IN ('completed', 'global_exit')",
            name="ck_onboarding_assessments_handled_via",
        ),
        CheckConstraint(
            "immediate_intent IS NULL OR immediate_intent IN "
            "('learn_basics', 'connect_picture', 'understand_existing', 'model_future', "
            "'build_routine', 'ask_arya', 'explore', 'undisclosed')",
            name="ck_onboarding_assessments_immediate_intent",
        ),
        CheckConstraint(
            "earning_context IS NULL OR earning_context IN "
            "('student', 'pre_earning', 'early_earner', 'established_earner', "
            "'variable_or_transitioning', 'undisclosed')",
            name="ck_onboarding_assessments_earning_context",
        ),
        CheckConstraint(
            "responsibility_context IS NULL OR responsibility_context IN "
            "('self', 'shared', 'dependents', 'variable', 'undisclosed')",
            name="ck_onboarding_assessments_responsibility_context",
        ),
        CheckConstraint(
            "familiarity IS NULL OR familiarity IN "
            "('foundations', 'working_basics', 'connecting', 'deeper_context', "
            "'variable', 'undisclosed')",
            name="ck_onboarding_assessments_familiarity",
        ),
        CheckConstraint(
            "(status = 'in_progress' AND current_question IS NOT NULL "
            "AND handled_at IS NULL AND handled_via IS NULL) OR "
            "(status = 'handled' AND current_question IS NULL "
            "AND handled_at IS NOT NULL AND handled_via IS NOT NULL)",
            name="ck_onboarding_assessments_state_consistency",
        ),
        CheckConstraint(
            "status != 'handled' OR (immediate_intent IS NOT NULL "
            "AND earning_context IS NOT NULL AND responsibility_context IS NOT NULL "
            "AND exposure_flags IS NOT NULL AND familiarity IS NOT NULL)",
            name="ck_onboarding_assessments_handled_answers_present",
        ),
        CheckConstraint(
            "exposure_flags IS NULL OR exposure_flags <@ ARRAY["
            "'spending', 'saving', 'investing', 'borrowing', 'insurance', 'goals', "
            "'workplace_and_tax', 'none', 'unsure', 'undisclosed']::varchar[]",
            name="ck_onboarding_assessments_exposure_allowed",
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            "exposure_flags IS NULL OR cardinality(exposure_flags) > 0",
            name="ck_onboarding_assessments_exposure_nonempty",
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            "exposure_flags IS NULL OR NOT ("
            "exposure_flags && ARRAY['none', 'unsure', 'undisclosed']::varchar[] "
            "AND cardinality(exposure_flags) > 1)",
            name="ck_onboarding_assessments_exposure_sentinel_exclusive",
        ).ddl_if(dialect="postgresql"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    flow_version: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    status: Mapped[str] = mapped_column(String, nullable=False, default="in_progress")
    current_question: Mapped[str | None] = mapped_column(
        String, nullable=True, default="immediate_intent"
    )

    immediate_intent: Mapped[str | None] = mapped_column(String, nullable=True)
    earning_context: Mapped[str | None] = mapped_column(String, nullable=True)
    responsibility_context: Mapped[str | None] = mapped_column(String, nullable=True)
    # PostgreSQL stores a typed string array; JSON is only the SQLite test variant. The
    # production migration adds array-content constraints that reject arbitrary/raw data.
    exposure_flags: Mapped[list[str] | None] = mapped_column(
        JSON().with_variant(ARRAY(String), "postgresql"), nullable=True
    )
    familiarity: Mapped[str | None] = mapped_column(String, nullable=True)

    eligibility_confirmed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    handled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    handled_via: Mapped[str | None] = mapped_column(String, nullable=True)
    cleared_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow, server_default=func.now()
    )
