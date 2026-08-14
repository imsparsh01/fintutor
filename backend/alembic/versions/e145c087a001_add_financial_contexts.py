"""add owned optional financial contexts (BQ-087, D-145)

Revision ID: e145c087a001
Revises: d142a104f001
Create Date: 2026-08-14 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "e145c087a001"
down_revision: Union[str, None] = "d142a104f001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
_TABLES = ("financial_contexts",)


def upgrade() -> None:
    op.create_table(
        "financial_contexts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dependant_count", sa.Integer(), nullable=True),
        sa.Column("emergency_fund_months", sa.Float(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("dependant_count >= 0 AND dependant_count <= 100", name="ck_financial_context_dependants"),
        sa.CheckConstraint("emergency_fund_months >= 0 AND emergency_fund_months <= 1200", name="ck_financial_context_emergency_months"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_financial_contexts_user_id"),
    )
    op.create_index("ix_financial_contexts_user_id", "financial_contexts", ["user_id"])
    for table in _TABLES:
        op.execute(f'ALTER TABLE public."{table}" ENABLE ROW LEVEL SECURITY')
        op.execute(f'REVOKE ALL PRIVILEGES ON TABLE public."{table}" FROM anon, authenticated')


def downgrade() -> None:
    op.drop_index("ix_financial_contexts_user_id", table_name="financial_contexts")
    op.drop_table("financial_contexts")
