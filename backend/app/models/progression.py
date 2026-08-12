"""Learning progression ledger, rollups, and summary — BQ-069, approved by D-121.

Three objects, in order of authority:

``progression_events``          append-only record of what happened. Never stores points.
``progression_daily_rollups``   per-user-day aggregate. Survives raw-event pruning and
                                becomes the frozen record for pruned days.
``progression_summaries``       one row per user. A cache of the replay result, except
                                for the monotonicity floors, which are durable.
"""

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Integer,
    JSON,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.services.progression_ruleset import RECORDABLE_EVENT_TYPES

_RECORDABLE_SQL_LIST = ", ".join(f"'{name}'" for name in sorted(RECORDABLE_EVENT_TYPES))


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ProgressionEvent(Base):
    """Append-only ledger of qualifying actions.

    Deliberately absent: any point value, and any ``dimension`` column. Both are
    derivable from ``event_type`` via the ruleset version, and storing either would
    freeze a v1 assumption into user data (D-121).
    """

    __tablename__ = "progression_events"
    __table_args__ = (
        # D-117: "identical payloads, retries, refreshes, back-navigation, and
        # add-delete cycles do not create new events." Enforced by the database rather
        # than by service logic, so a race cannot slip a duplicate through.
        UniqueConstraint(
            "user_id", "idempotency_key", name="uq_progression_events_user_idempotency"
        ),
        CheckConstraint(
            f"event_type IN ({_RECORDABLE_SQL_LIST})",
            name="ck_progression_events_event_type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String, nullable=False)
    # The repeat-limit discriminator: teaching subject, calculator type, capability
    # family, prompt/version. Null for event types with no per-subject rule.
    subject_key: Mapped[str | None] = mapped_column(String, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    # Materialized user-day on a fixed Asia/Kolkata boundary. Stored rather than
    # computed on read, so per-user timezones later are a forward migration rather than
    # a rewrite of history.
    local_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    idempotency_key: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, server_default=func.now()
    )


class ProgressionDailyRollup(Base):
    """One row per user-day that produced at least one award.

    After raw events for a day are pruned, this row *is* the record of that day —
    ``events_pruned`` marks it frozen, and replay reuses its stored values instead of
    recomputing. That is what keeps return-day counts and dimension breadth honest past
    the retention window.
    """

    __tablename__ = "progression_daily_rollups"
    __table_args__ = (
        UniqueConstraint("user_id", "local_date", name="uq_progression_rollups_user_day"),
        CheckConstraint("points_awarded >= 0", name="ck_progression_rollups_points_non_negative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    local_date: Mapped[date] = mapped_column(Date, nullable=False)
    points_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Event types that actually awarded that day — lets a frozen day still answer the
    # rolling-window questions (e.g. when recap last awarded).
    awarded_types: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    dimensions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    # Once-ever award keys first consumed that day, so a pruned day still prevents a
    # second award for the same subject.
    once_keys: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    return_day_awarded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    ruleset_version: Mapped[int] = mapped_column(Integer, nullable=False)
    events_pruned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_utcnow,
        onupdate=_utcnow,
        server_default=func.now(),
    )


class ProgressionSummary(Base):
    """Current progression state, one row per user.

    Mostly a cache — recomputable by replaying the ledger under ``ruleset_version``.
    The two exceptions are ``displayed_points_floor`` and ``stage_floor_index``, which
    are durable: they are what make D-117's "progress never decreases" survive a
    retune, and they cannot be derived from the events.
    """

    __tablename__ = "progression_summaries"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_progression_summaries_user"),
        CheckConstraint(
            "displayed_points >= displayed_points_floor",
            name="ck_progression_summaries_display_at_or_above_floor",
        ),
        CheckConstraint(
            "lifetime_points >= 0 AND displayed_points_floor >= 0",
            name="ck_progression_summaries_points_non_negative",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    ruleset_version: Mapped[int] = mapped_column(Integer, nullable=False)
    # What replay actually produced under the current ruleset.
    lifetime_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # What the user is shown: never below the floor.
    displayed_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    displayed_points_floor: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    stage: Mapped[str] = mapped_column(String, nullable=False, default="discovering")
    # Index into ruleset STAGES. A user who reached Connecting stays there.
    stage_floor_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active_dimensions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    return_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_event_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_rebuilt_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_utcnow,
        onupdate=_utcnow,
        server_default=func.now(),
    )
