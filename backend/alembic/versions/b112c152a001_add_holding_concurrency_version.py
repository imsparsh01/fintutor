"""add holding lifecycle concurrency version (BQ-112, D-149)

Revision ID: b112c152a001
Revises: f150b110a001
Create Date: 2026-08-24 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b112c152a001"
down_revision: Union[str, None] = "f150b110a001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "holdings",
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("holdings", "version")
