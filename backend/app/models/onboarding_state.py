import uuid

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class OnboardingState(Base):
    """Structured onboarding progress per user — D-083/D-084, BQ-042. A stage indicator, not
    conversation memory (D-083's own distinction): answers "where in a known, fixed structure is
    this user," nothing about what was actually said is stored. One row per user, same shape as
    StreakState."""

    __tablename__ = "onboarding_states"
    __table_args__ = (UniqueConstraint("user_id", name="uq_onboarding_states_user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # No Users table exists yet — loose reference, no FK (same convention as StreakState et al).
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    # fresh_starter / reactive_dabbler / habit_former / unclassified — None until the first turn
    # resolves it.
    track: Mapped[str | None] = mapped_column(String, nullable=True)
    # intro / sequencing / mechanism / reflect / gapscan / complete — None until track is set.
    stage: Mapped[str | None] = mapped_column(String, nullable=True)
    turns_in_stage: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
