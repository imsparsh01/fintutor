"""lock public tables behind FastAPI (BQ-104, D-142)

Revision ID: d142a104f001
Revises: c4e71b93a5d2
Create Date: 2026-08-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "d142a104f001"
down_revision: Union[str, None] = "c4e71b93a5d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Explicit by design: a new table must consciously join this boundary in its own migration.
_TABLES = (
    "alembic_version",
    "holdings",
    "incomes",
    "goals",
    "goal_fundings",
    "discretionary_categories",
    "streak_states",
    "onboarding_states",
    "onboarding_assessments",
    "progression_events",
    "progression_daily_rollups",
    "progression_summaries",
)


def upgrade() -> None:
    for table in _TABLES:
        op.execute(f'ALTER TABLE public."{table}" ENABLE ROW LEVEL SECURITY')
        op.execute(f'REVOKE ALL PRIVILEGES ON TABLE public."{table}" FROM anon, authenticated')

    # Alembic creates future tables as postgres. Prevent Supabase's client roles from receiving table
    # privileges by default; each future migration must still enable RLS explicitly.
    op.execute(
        "ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public "
        "REVOKE ALL PRIVILEGES ON TABLES FROM anon, authenticated"
    )


def downgrade() -> None:
    op.execute(
        "ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public "
        "GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLES TO anon, authenticated"
    )
    for table in reversed(_TABLES):
        op.execute(
            f'GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE public."{table}" '
            "TO anon, authenticated"
        )
        op.execute(f'ALTER TABLE public."{table}" DISABLE ROW LEVEL SECURITY')
