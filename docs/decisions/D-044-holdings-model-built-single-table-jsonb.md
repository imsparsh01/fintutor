# D-044 — Holdings model built: single table + JSONB characteristics; product_type left unconstrained
- **Tier:** 1 — executes already-decided design (D-010 aliasing, D-011 framework, D-013 taxonomy) rather than
  making new product/compliance decisions; both technical sub-choices are bounded, reversible, contained
  within this session. Owner confirmed the JSONB-vs-per-type-table fork directly before code was written
  (two live candidate paths with real tradeoffs, same pattern as D-043).
- **Decision:** Two implementation choices, made building `backend/app/models/holding.py`:
  1. **Single `holdings` table with a `characteristics` JSONB column**, not one child table per D-013 type.
     Owner-confirmed over the 9-table relational alternative — matches the flat shape already used in
     `docs/fixtures/FIXTURE_user_01.json` (alias + product_type + fields), which is literally what the
     backend sends to the LLM per D-010, and avoids a migration per type for MVP-stage field churn.
  2. **`product_type` is a plain string column, not a DB-level enum/CHECK constraint.** Deliberately does
     NOT resolve `PROJECT_SPEC.md` §8's open `savings_balance` question (D-013 names 8 types; fixtures
     already use a 9th, `savings_balance`, not yet formally added) — constraining the column now would
     silently answer an owner-open question as a side effect of a build task, which `CLAUDE.md` forbids.
  3. **`GoalFunding.holding_id` wired to a real foreign key** (`holdings.id`, `ON DELETE CASCADE`) — this
     was the exact deferred item D-043 flagged ("wire up the real FK once Holdings is built"), completed the
     moment its precondition existed. Also added `display_name` (nullable) on `Holding` for the real
     product/institution name — never sent to the LLM, exists only for D-011's re-humanizing step in the UI.
- **Why:** Both choices are pure technical implementation detail once D-010/D-011/D-013 already fixed *what*
  gets tracked — this decision is only about *how* it's stored. Verified against the real DB: FK cascade
  delete confirmed (deleting a Holding correctly removes its `GoalFunding` rows), round-trip insert/read
  confirmed, `/health` and `/health/db` still 200 with all four models loaded.
- **Reversibility:** Medium — JSONB→relational is a real migration once holdings data exists; constraining
  `product_type` to an enum later is cheap and additive once the savings_balance question is answered.
- **Date:** 03-Aug-2026
