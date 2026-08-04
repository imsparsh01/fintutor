"""add streak_states table (BQ-029, D-060)

Revision ID: 974126e6d41f
Revises: ce8262c241ff
Create Date: 2026-08-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '974126e6d41f'
down_revision: Union[str, None] = 'ce8262c241ff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('streak_states',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('current_streak', sa.Integer(), nullable=False),
    sa.Column('longest_streak', sa.Integer(), nullable=False),
    sa.Column('last_active_date', sa.Date(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', name='uq_streak_states_user_id')
    )
    op.create_index(op.f('ix_streak_states_user_id'), 'streak_states', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_streak_states_user_id'), table_name='streak_states')
    op.drop_table('streak_states')
