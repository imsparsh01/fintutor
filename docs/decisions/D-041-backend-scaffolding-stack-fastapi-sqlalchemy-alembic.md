# D-041 — Backend scaffolding stack: FastAPI + SQLAlchemy + Alembic (owner-confirmed)
- **Tier:** owner-decided directly in conversation — escalated per CLAUDE.md's explicit hard stop on
  introducing a new library/architectural pattern (no de-minimis exception, same logic as trigger 5).
  Logged as a full entry rather than a bare one-liner because it's a real architecture choice other code
  will depend on, not routine mechanics.
- **Decision:** `backend/` is bootstrapped this session (BQ-011) as a FastAPI app using SQLAlchemy for the
  ORM/query layer and Alembic for migrations, connecting to the existing Supabase-hosted Postgres
  (`fintutor-dev`, D-008). Supabase continues to own auth/hosting (D-005) — this only adds a conventional
  data-access layer on top of the same Postgres instance. Scope for this session is the skeleton only (app
  structure, DB connection wiring, migrations tooling, a health-check endpoint) — the D-013 Holdings model
  and D-038's Income/Goal/Budget model are deliberately deferred to their own session (BQ-009/BQ-010),
  respecting BUILD_QUEUE.md's one-item-per-session discipline.
- **Why:** SQLAlchemy + Alembic over the Supabase Python client directly — real migration tooling matters
  once the schema starts growing (Holdings' 8-type taxonomy, then Income/Goal/Budget, then whatever
  Decision 2 produces), and it's the conventional pairing for FastAPI + Postgres regardless of which
  managed platform hosts the database.
- **Reversibility:** Medium once real data exists (touched-data test) — no data exists yet, so this is the
  cheap window to make this call.
- **Dependency flag:** needs `DATABASE_URL` (the Supabase Postgres connection string) added to `.env` by
  the owner before the DB connection can be verified end-to-end — Claude does not have and should not be
  given this credential through chat.
- **Date:** 03-Aug-2026
