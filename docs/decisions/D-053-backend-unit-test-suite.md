# D-053 — Introduce pytest as the backend unit-test framework; unit-test compute_budget/compute_surfacing_candidates

- **Tier:** Documenting a decision the owner made in conversation (per CLAUDE.md's append-only
  decision-log lane) — the owner asked for a read-only test-coverage review, then explicitly approved
  acting on its top recommendation ("standing up a minimal pytest suite" around the two backend
  business-logic functions). Introducing pytest is technically a new library per CLAUDE.md's hard-stop
  list ("introducing a new library... that wasn't already decided"), so it's logged here as the
  owner-confirmed decision it needed, rather than picked silently.
- **Decision:**
  1. **pytest + httpx** adopted as the backend test stack (`backend/requirements-dev.txt`, kept
     separate from `requirements.txt` so production installs stay lean).
  2. **No real database dependency for these tests.** `compute_budget()` and
     `compute_surfacing_candidates()` only ever call `db.query(Model).filter(...).all()` — a fake
     `Session`/`Query` pair (`backend/tests/conftest.py`) that dispatches by model class to
     hand-built rows is enough to unit test them fully. This deliberately avoids the harder question
     of a shared strategy for real-database/integration tests (SQLite type-compatibility shims vs. a
     disposable Postgres via Docker vs. a throwaway Supabase schema) — that question is real but
     **not** blocking this slice, and is left open below.
  3. **35 tests added**, covering `_to_monthly()`, `compute_budget()` (income normalization, all
     three recurring-outflow buckets, discretionary totals, net), `compute_surfacing_candidates()`
     (including the D-051 Endowment/ULIP non-suppression rule), and the four FastAPI endpoints
     (including that `/health/db` never echoes a raw exception — the behavior `app/main.py`'s own
     comment calls out).
- **Bug found, NOT fixed here (separate hard-stop item):** one test
  (`test_sip_equity_fund_counts_monthly_sip_amount_not_cumulative_invested`) documents that
  `compute_budget()` currently reads a SIP holding's `invested_amount` (cumulative total invested to
  date) as if it were the monthly recurring contribution, instead of `monthly_sip_amount` (the actual
  monthly figure, per every fixture and the D-013 field list in this log). This test is left failing
  (red) rather than silently patched, since the fix touches a money calculation — CLAUDE.md hard-stop,
  owner sign-off required before `backend/app/services/budget.py` is edited.
- **Why:** The alternative (continuing to "verify" this logic only by writing rows into the live
  Supabase dev DB by hand and eyeballing the response, per BQ-009/010/012/013's session notes) is
  exactly how the SIP bug above went unnoticed — it's non-repeatable and doesn't check the specific
  field a value came from, only that a number round-tripped.
- **What this does NOT decide:** whether/how to add CI (no `.github/workflows/` exists yet — running
  these tests today still requires a human to run `pytest` locally), and the real-database/integration
  test strategy for migrations, constraints, and FK-cascade behavior. Both are still open — see the
  session log for today's date.
- **Reversibility:** High — test-only files, no production code touched.
- **Date:** 04-Aug-2026
