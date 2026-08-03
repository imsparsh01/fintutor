# FinTutor — Build Queue

**This is the build worklist. Claude reads this file to find its build task.**

Rules for this file:
- Nothing enters this queue until the decision behind it has an ID in `docs/DECISION_LOG.md`.
- Items here are **already decided** — Claude executes them, it does not re-open them.
- If executing an item requires a new decision (new library, schema change, anything on
  the `CLAUDE.md` hard-stop list), **STOP and escalate to the owner**. Do not decide it here.
- One item per session. Move it to DONE with a date when complete.
- This file is build-task-tracking only (single home as of D-033 — see `docs/DECISION_LOG.md`).

---

## READY — pick one of these

### BQ-010 — Implement live budget computation (no stored Budget object)
**Depends on:** BQ-011 (backend skeleton), BQ-009 (Income object) — both done
**Traces to:** D-038
**What:** Compute budget on read, never store it: income total (from Income, BQ-009) minus recurring
outflows read live off holding records (EMI amount, SIP investment amount, insurance premium fields per
D-013) minus a stored list of discretionary categories (`{label, planned_amount}`). Depends on BQ-009's
Income object existing. **Note:** no Holdings model exists yet (see BQ-009's DONE entry) — the
"recurring outflows read live off holding records" half of this task has nothing to read from yet.
Flag this to the owner at the start of the BQ-010 session rather than silently building a Holdings
stub to unblock it.

---

## BLOCKED — do not start

### BQ-004 — Backend `deepen` selection logic
**Traces to:** D-028 (explicitly deferred)
**Blocked because:** the selection rule itself is undecided. Thinking-home must decide the rule first.
**Unblocks when:** a decision entry exists in `docs/DECISION_LOG.md` specifying the rule.

---

## NOT IN THIS QUEUE — thinking-home only

These are open items that are **not build tasks** (Claude Code should not mistake them for work):
- Decision 3 — budgeting/goals data model (foundational; thinking-home, before build).
- Decision 2 — per-item management depth (thinking-home, designed after Decision 3).
- UX principles section in PRODUCT_PRINCIPLES.md (thinking-home, after Decisions 2 & 3).
- FINDING 7 provenance — RESOLVED (D-029); execution was BQ-005 (see DONE).
- Conversation memory (PARKED — D-022). Subagents (PARKED — D-014). Legal review of D-009.

---

## DONE

### BQ-009 — Add Income and Goal objects to the backend baseline schema — done 03-Aug-2026
Added `backend/app/models/income.py` (`Income`: `id`, `user_id`, `sources` JSONB list of
`{label, amount, frequency}`) and `backend/app/models/goal.py` (`Goal`: `id`, `user_id`, `target_amount`,
`target_date`, `category`, plus a `GoalFunding` child table for `funded_by` — `goal_id` FK cascade-delete,
`holding_id`, `earmarked_amount`). No progress/current_amount field stored on Goal — computed live from
`funded_by`, per D-038. **Gap surfaced and resolved with owner before writing code:** no Holdings table
exists anywhere yet (models/ was empty going into this session), so `funded_by.holding_id` has nothing to
reference. Owner chose: store `holding_id` as a loose UUID column, no FK constraint, until Holdings gets
built in a future BQ item — applied the same resolution to `user_id` on both new models (no Users table
either; Supabase Auth owns that). Alembic migration `069bc85fc512` generated via autogenerate, reviewed,
and applied against the real Supabase DB. Verified end-to-end: insert/read/cascade-delete round-trip on
both models against the live database, plus `/health` and `/health/db` both still 200 with the new models
loaded.

### BQ-011 — Bootstrap FastAPI backend skeleton (SQLAlchemy + Alembic) — done 03-Aug-2026
`backend/` now has a real FastAPI app: `app/main.py` (FastAPI instance + `/health` and `/health/db`),
`app/core/config.py` (pydantic-settings, reads `DATABASE_URL`/`ANTHROPIC_API_KEY` from the repo-root
`.env`), `app/db/session.py` (SQLAlchemy engine/session, `Base` for future models — gracefully `None` if
`DATABASE_URL` isn't set rather than crashing at import), `app/models/` (empty, for BQ-009), and Alembic
migration tooling (`alembic.ini`, `alembic/env.py`, `alembic/script.py.mako`, `alembic/versions/`) wired to
pull the connection string from the same settings object. `requirements.txt` added; a `backend/.venv`
virtualenv was created and dependencies installed and verified locally (gitignored, not committed).
Verified end-to-end: app imports cleanly, dev server starts, `GET /health` → `200 {"status":"ok"}`,
`GET /health/db` → `503` with a clear "DATABASE_URL is not set" message (correct behavior — no credential
exists yet). **Still open:** the owner needs to add `DATABASE_URL` (Supabase Postgres connection string) to
`.env` directly before `/health/db` can return 200 and before BQ-009/BQ-010 can be verified against a real
database. See D-041.

### BQ-008 — Re-run the Q1 repeat series (n=5) against v0.8 — done 02-Aug-2026
Run by the owner locally via `scripts/run_phase1_test.py` (first attempt returned 3/5 valid + 2/5 empty with
no error — root-caused to the script's `max_tokens=1024` being too low for a thinking-enabled model, which
spent its entire budget on internal reasoning and left nothing for the visible answer; fixed by raising the
default to 4096, a test-tooling fix, not a prompt/compliance issue). Clean re-run: 5/5. Results in
`docs/PHASE1_RUN6_RESULTS.md`. **FINDING 9: 5/5 (100%) — fixed.** Card-1 named unprompted in every run, not
substituted with a vaguer consideration. **FINDING 10: still 0/5 — fix holds.** **FINDING 11: 0/5 violations
under D-036's clarified test** (no ordering/comparative word attached to a "worth" clause). All 5 runs within
the 320-word ceiling. D-037's fix verified — no escalation needed.

### BQ-007 — Re-run the Q1 repeat series (n=5) against v0.7 — done 02-Aug-2026
Run by the owner locally via `scripts/run_phase1_test.py` (first run using live API calls instead of Console
Workbench — the build sandbox blocks authenticated calls to `api.anthropic.com`, so this now runs on the
owner's machine and Claude reads the saved outputs). Results in `docs/PHASE1_RUN5_RESULTS.md`. **FINDING 10
does not reproduce, 0/5** — D-035's fix holds. **FINDING 9: 1/5 (20%), down from 2/5 baseline** — did not
get worse, which was BQ-007's specific escalate-if condition; n too small to call it an improvement.
**FINDING 11 (new, not in scope for BQ-007): "worth [X]" framing on Card-1 mentions in 4/5 runs, with the
exact banned phrase "worth having in view" reproduced verbatim in 2/5.** Touches §3 rule 5 directly.
**Flagged for thinking-home, not resolved in build-home.**

### BQ-003 — Run Q1 against both fixtures and compare — done 01-Aug-2026
Run manually by owner on Console Workbench, against `SYSTEM_PROMPT_v0_6_runnable.md` (queued against v0.5,
but v0.6 superseded it by the time this ran — executed against v0.6 per explicit owner instruction this
session; that's a stronger, not weaker, test since v0.6 postdates the D-028 fix FINDING 4 traces to).
Results in `docs/PHASE1_RUN4_RESULTS.md`. **FINDING 4 does not reproduce in either fixture** — D-028's
deepen-absent guarantee holds under both the dominant-number (user_01) and no-dominant-number (user_02)
condition, including the harder ambiguous-magnitude case user_02 was built to test. **New finding (FINDING
9, not FINDING 4):** the user_01 run drops Card-1 (42%) entirely — a different failure shape (omission, not
over-attention) than what BQ-003 was scoped to test. Doesn't match the escalate-if clause (not a `deepen`
field behavior issue). **Flagged for thinking-home, not resolved in build-home.**

### BQ-006 — Regenerate system prompt to v0.6 (open-door, on-topic only) — done 01-Aug-2026
Regenerated `docs/prompts/SYSTEM_PROMPT_v0_6_runnable.md` from TEACHING_SYSTEM_PROMPT.md (D-032). Diffed
against v0.5 before writing: only the header changelog comment and one new §2 rule 3 paragraph ("the open
door leads to the room the user is already in — never a new one") changed. §1, §3, §4 (stub, still
mechanical from D-013 + D-028), and §5 are byte-identical to v0.5 — D-032 doesn't touch them.

### BQ-002 — Build second fixture with no dominant number — done 01-Aug-2026
Added `docs/fixtures/FIXTURE_user_02.json`. Same schema and per-holding key sets as user_01 (verified
programmatically), 5 of 8 D-013 types exercised, same `known_gaps` shape. Swapped user_01's
`credit_card_debt` (42%) for a `personal_loan` (13.5%): the two debt rates (8.8%/13.5%) sit at a 1.53x
ratio vs. user_01's 4.67x jump (9%/42%) — no landslide "worst" number. No new field/type added.

### BQ-001 — Run Q7 and Q8 against prompt v0.5 — done 01-Aug-2026
Both run manually by owner on Console Workbench (v0.5 prompt + FIXTURE_user_01, fresh conversation each),
outputs scored against TEST_PROTOCOL.md. Results in `docs/PHASE1_RUN3_RESULTS.md`. Q8 clean pass. Q7 passes
its own checklist but produced **FINDING 8** (new): unprompted, ranking-language surfacing of the term-insurance
gap on a question with no financial content — touches §3 rule 5 and D-012's Trigger A/B scope narrowing.
**Flagged for thinking-home per the escalate-if clause — not resolved in build-home.**

### BQ-005 — Regenerate system prompt to v0.5 (provenance rule) — done 01-Aug-2026
Regenerated `docs/prompts/SYSTEM_PROMPT_v0_5_runnable.md` from TEACHING_SYSTEM_PROMPT.md (D-029): §2 gains
rule 5 (provenance — profile numbers vs. typical-range numbers never share a register), §5 gains the
typical-figure phrasing example. Same assembly pattern as v0.4; owner-facing annotations and the P5
design-note comment stripped. No conflicts found with existing §2/§5 rules.
