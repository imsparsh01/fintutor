"""add onboarding_states table (BQ-042, D-083/D-084)

Revision ID: f3a9c7d1b820
Revises: 974126e6d41f
Create Date: 2026-08-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3a9c7d1b820'
down_revision: Union[str, None] = '974126e6d41f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('onboarding_states',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('track', sa.String(), nullable=True),
    sa.Column('stage', sa.String(), nullable=True),
    sa.Column('turns_in_stage', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', name='uq_onboarding_states_user_id')
    )
    op.create_index(op.f('ix_onboarding_states_user_id'), 'onboarding_states', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_onboarding_states_user_id'), table_name='onboarding_states')
    op.drop_table('onboarding_states')
