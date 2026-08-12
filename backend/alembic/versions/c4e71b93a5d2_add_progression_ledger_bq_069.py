"""add progression ledger, rollups, and summary (BQ-069, D-121)

Revision ID: c4e71b93a5d2
Revises: b8f25a9d4c31
Create Date: 2026-08-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4e71b93a5d2"
down_revision: Union[str, None] = "b8f25a9d4c31"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Kept as a literal rather than imported from the ruleset: a migration must describe the
# schema as of its own revision, not follow later edits to application constants.
_EVENT_TYPES = (
    "arya_exchange_completed",
    "calculator_completed",
    "capability_first_used",
    "context_prompt_handled",
    "onboarding_handled",
    "recap_completed",
    "scenario_completed",
    "teaching_moment_explored",
    "teaching_moment_revisited",
)


def upgrade() -> None:
    op.create_table(
        "progression_events",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("subject_key", sa.String(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("local_date", sa.Date(), nullable=False),
        sa.Column("idempotency_key", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "event_type IN (" + ", ".join(f"'{name}'" for name in _EVENT_TYPES) + ")",
            name="ck_progression_events_event_type",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id", "idempotency_key", name="uq_progression_events_user_idempotency"
        ),
    )
    op.create_index(
        op.f("ix_progression_events_user_id"), "progression_events", ["user_id"]
    )
    op.create_index(
        op.f("ix_progression_events_local_date"), "progression_events", ["local_date"]
    )

    op.create_table(
        "progression_daily_rollups",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("local_date", sa.Date(), nullable=False),
        sa.Column("points_awarded", sa.Integer(), nullable=False),
        sa.Column("awarded_types", sa.JSON(), nullable=False),
        sa.Column("dimensions", sa.JSON(), nullable=False),
        sa.Column("once_keys", sa.JSON(), nullable=False),
        sa.Column("return_day_awarded", sa.Boolean(), nullable=False),
        sa.Column("ruleset_version", sa.Integer(), nullable=False),
        sa.Column("events_pruned", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "points_awarded >= 0", name="ck_progression_rollups_points_non_negative"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id", "local_date", name="uq_progression_rollups_user_day"
        ),
    )
    op.create_index(
        op.f("ix_progression_daily_rollups_user_id"),
        "progression_daily_rollups",
        ["user_id"],
    )

    op.create_table(
        "progression_summaries",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("ruleset_version", sa.Integer(), nullable=False),
        sa.Column("lifetime_points", sa.Integer(), nullable=False),
        sa.Column("displayed_points", sa.Integer(), nullable=False),
        sa.Column("displayed_points_floor", sa.Integer(), nullable=False),
        sa.Column("stage", sa.String(), nullable=False),
        sa.Column("stage_floor_index", sa.Integer(), nullable=False),
        sa.Column("active_dimensions", sa.JSON(), nullable=False),
        sa.Column("return_days", sa.Integer(), nullable=False),
        sa.Column("last_event_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "last_rebuilt_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "displayed_points >= displayed_points_floor",
            name="ck_progression_summaries_display_at_or_above_floor",
        ),
        sa.CheckConstraint(
            "lifetime_points >= 0 AND displayed_points_floor >= 0",
            name="ck_progression_summaries_points_non_negative",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_progression_summaries_user"),
    )
    op.create_index(
        op.f("ix_progression_summaries_user_id"), "progression_summaries", ["user_id"]
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_progression_summaries_user_id"), "progression_summaries")
    op.drop_table("progression_summaries")
    op.drop_index(
        op.f("ix_progression_daily_rollups_user_id"), "progression_daily_rollups"
    )
    op.drop_table("progression_daily_rollups")
    op.drop_index(op.f("ix_progression_events_local_date"), "progression_events")
    op.drop_index(op.f("ix_progression_events_user_id"), "progression_events")
    op.drop_table("progression_events")
