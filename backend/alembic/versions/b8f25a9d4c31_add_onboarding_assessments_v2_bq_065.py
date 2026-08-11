"""add onboarding assessments v2 (BQ-065, D-118/D-119)

Revision ID: b8f25a9d4c31
Revises: f3a9c7d1b820
Create Date: 2026-08-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "b8f25a9d4c31"
down_revision: Union[str, None] = "f3a9c7d1b820"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "onboarding_assessments",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("flow_version", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("current_question", sa.String(), nullable=True),
        sa.Column("immediate_intent", sa.String(), nullable=True),
        sa.Column("earning_context", sa.String(), nullable=True),
        sa.Column("responsibility_context", sa.String(), nullable=True),
        sa.Column("exposure_flags", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("familiarity", sa.String(), nullable=True),
        sa.Column("eligibility_confirmed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("handled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("handled_via", sa.String(), nullable=True),
        sa.Column("cleared_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("flow_version > 0", name="ck_onboarding_assessments_version_positive"),
        sa.CheckConstraint(
            "status IN ('in_progress', 'handled')",
            name="ck_onboarding_assessments_status",
        ),
        sa.CheckConstraint(
            "current_question IS NULL OR current_question IN "
            "('immediate_intent', 'earning_context', 'responsibility_context', "
            "'exposure_flags', 'familiarity')",
            name="ck_onboarding_assessments_current_question",
        ),
        sa.CheckConstraint(
            "handled_via IS NULL OR handled_via IN ('completed', 'global_exit')",
            name="ck_onboarding_assessments_handled_via",
        ),
        sa.CheckConstraint(
            "immediate_intent IS NULL OR immediate_intent IN "
            "('learn_basics', 'connect_picture', 'understand_existing', 'model_future', "
            "'build_routine', 'ask_arya', 'explore', 'undisclosed')",
            name="ck_onboarding_assessments_immediate_intent",
        ),
        sa.CheckConstraint(
            "earning_context IS NULL OR earning_context IN "
            "('student', 'pre_earning', 'early_earner', 'established_earner', "
            "'variable_or_transitioning', 'undisclosed')",
            name="ck_onboarding_assessments_earning_context",
        ),
        sa.CheckConstraint(
            "responsibility_context IS NULL OR responsibility_context IN "
            "('self', 'shared', 'dependents', 'variable', 'undisclosed')",
            name="ck_onboarding_assessments_responsibility_context",
        ),
        sa.CheckConstraint(
            "familiarity IS NULL OR familiarity IN "
            "('foundations', 'working_basics', 'connecting', 'deeper_context', "
            "'variable', 'undisclosed')",
            name="ck_onboarding_assessments_familiarity",
        ),
        sa.CheckConstraint(
            "(status = 'in_progress' AND current_question IS NOT NULL "
            "AND handled_at IS NULL AND handled_via IS NULL) OR "
            "(status = 'handled' AND current_question IS NULL "
            "AND handled_at IS NOT NULL AND handled_via IS NOT NULL)",
            name="ck_onboarding_assessments_state_consistency",
        ),
        sa.CheckConstraint(
            "status != 'handled' OR (immediate_intent IS NOT NULL "
            "AND earning_context IS NOT NULL AND responsibility_context IS NOT NULL "
            "AND exposure_flags IS NOT NULL AND familiarity IS NOT NULL)",
            name="ck_onboarding_assessments_handled_answers_present",
        ),
        sa.CheckConstraint(
            "exposure_flags IS NULL OR exposure_flags <@ ARRAY["
            "'spending', 'saving', 'investing', 'borrowing', 'insurance', 'goals', "
            "'workplace_and_tax', 'none', 'unsure', 'undisclosed']::varchar[]",
            name="ck_onboarding_assessments_exposure_allowed",
        ),
        sa.CheckConstraint(
            "exposure_flags IS NULL OR cardinality(exposure_flags) > 0",
            name="ck_onboarding_assessments_exposure_nonempty",
        ),
        sa.CheckConstraint(
            "exposure_flags IS NULL OR NOT ("
            "exposure_flags && ARRAY['none', 'unsure', 'undisclosed']::varchar[] "
            "AND cardinality(exposure_flags) > 1)",
            name="ck_onboarding_assessments_exposure_sentinel_exclusive",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id", "flow_version", name="uq_onboarding_assessments_user_version"
        ),
    )
    op.create_index(
        op.f("ix_onboarding_assessments_user_id"),
        "onboarding_assessments",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_onboarding_assessments_user_id"),
        table_name="onboarding_assessments",
    )
    op.drop_table("onboarding_assessments")
