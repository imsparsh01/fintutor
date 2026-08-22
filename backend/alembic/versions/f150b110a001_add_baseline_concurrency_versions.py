"""add baseline lifecycle concurrency versions (BQ-110, D-149)

Revision ID: f150b110a001
Revises: e145c087a001
Create Date: 2026-08-23 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f150b110a001"
down_revision: Union[str, None] = "e145c087a001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TABLES = ("incomes", "discretionary_categories", "goals")


def upgrade() -> None:
    for table in _TABLES:
        op.add_column(
            table,
            sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        )


def downgrade() -> None:
    for table in reversed(_TABLES):
        op.drop_column(table, "version")
