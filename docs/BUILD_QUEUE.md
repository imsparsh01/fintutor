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

*(empty — see BLOCKED below)*

---

## BLOCKED — do not start

### BQ-004 — Backend `deepen` selection logic
**Traces to:** D-028 (explicitly deferred), re-scoped by D-049 (BRIEF-006)
**Blocked because:** no real conversation/question-intake interface exists yet — `app/` now has a
navigation+auth shell (BQ-014) but no chat/question surface at all — to design the selection rule
against, and nothing currently needs it — Phase 1 testing already
simulates `deepen` via D-028's hand-written fixture stub. D-049 also found that the two paths
buildable today either don't actually close the compliance gap (a narrow classifier model call) or
do little useful work in practice (text/alias matching, absent real UI signal).
**Unblocks when:** `app/` has a real conversation interface producing an actual user question the
backend can read — AND a decision exists specifying the selection rule itself (D-049 deferred the
rule, it did not settle it; BRIEF-006's regulatory question is still open for whenever this resumes).

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

### BQ-016 — Wire up CI: GitHub Actions runs the backend pytest suite — done 04-Aug-2026
Traces to D-055. Owner delegated the choice among three follow-on options from BQ-015's hand-off (CI,
a real-database/integration-test strategy, re-running the Phase 1 prompt regression battery); CI
picked as the one fully executable from this session — no live Anthropic API access here, and the
other two need undecided infrastructure choices. Added `.github/workflows/backend-tests.yml`:
`ubuntu-latest`, Python 3.11, installs `backend/requirements-dev.txt`, runs `pytest -q` from
`backend/`, triggered on push/PR touching `backend/**`. No secrets required — the suite fakes the DB
session and never calls the LLM. Does not cover `app/` (no test suite exists there yet) or Phase 1
prompt testing (would need the Anthropic API key stored as a repo secret — a separate decision, not
made here). **Still open:** app/ test coverage, DB/integration test strategy, Phase 1 regression gap.

### BQ-015 — Backend unit-test suite for compute_budget/compute_surfacing_candidates — done 04-Aug-2026
Traces to D-053, owner-directed mid-conversation off a read-only test-coverage review. Added
`backend/tests/` (pytest): `conftest.py`'s `FakeSession`/`FakeQuery` fake out `db.query(Model)...` so
`compute_budget()` and `compute_surfacing_candidates()` are unit tested with no real database — both
functions only ever call `.filter(...).all()`, never anything Postgres-specific. 35 tests across
`test_budget.py` (income normalization, all three recurring-outflow buckets, discretionary
totals/net), `test_surfacing.py` (including the D-051 Endowment/ULIP non-suppression rule), and
`test_main.py` (all four endpoints via `TestClient` + `get_db` override, including that `/health/db`
never echoes a raw exception). `pytest`/`httpx` added via new `backend/requirements-dev.txt` (kept
separate from `requirements.txt`). **Found, did not fix:** `compute_budget()` reads a SIP holding's
cumulative `invested_amount` instead of its monthly `monthly_sip_amount` — a money-calculation bug,
left as one deliberately failing (red) test pending owner sign-off per CLAUDE.md's hard-stop list.
**Update, same day:** owner explicitly confirmed the fix — applied, logged as **D-054**. Verified:
`pytest -q` from `backend/` → 35 passed, 0 failed. **Still open:** no CI wired up yet (tests only run
when invoked locally); real-database/integration test strategy (migrations, constraints, FK cascades)
not addressed by this pass.

### BQ-014 — Bootstrap Expo app skeleton (React Navigation, Supabase auth) — done 04-Aug-2026
Traces to D-052. First code ever in `app/`. Expo + TypeScript project (`create-expo-app`,
blank-typescript template) — stripped its auto-generated `AGENTS.md`/`CLAUDE.md`/`.claude/`/`LICENSE`
boilerplate immediately, since a second, different operating-rules pair nested in `app/` would have
directly recreated the exact drift risk D-045 eliminated at the repo root. React Navigation (manual
setup, owner's call over Expo Router): `AuthStack` (Login/Register, Supabase-backed) shown with no
session; `MainTabs` (bottom tabs) shown once authenticated, with placeholder screens for
Investments/Loans/Insurance/Consolidated per D-031. `app/lib/supabase.ts` degrades to a null client
with a clear `NotConfiguredScreen` (mirrors `backend/app/db/session.py`'s missing-`DATABASE_URL`
pattern) rather than crashing when `EXPO_PUBLIC_SUPABASE_URL`/`_ANON_KEY` are absent. `app/lib/backend.ts`
pings `/health`, surfaced on the Consolidated screen. Verified: `tsc --noEmit` clean, Metro bundled
cleanly (1069 modules, no errors/warnings). **Also fixed:** root `.gitignore`'s `.env.*` rule was
unintentionally catching `app/.env.example` (a safe template, no secrets) — added a `!.env.example`
negation.

**Update, same day:** owner navigated the Supabase dashboard (Settings → API Keys) with me watching
via the Browser pane; found the project URL (`https://ojdyrmkyallorfmbsxbo.supabase.co`) and the
Publishable key (Supabase's own current term for the client-safe key — explicitly labeled "safe to
share publicly," not the Secret/service_role key). Owner confirmed writing both into `app/.env`.
Re-verified headlessly: started the dev server, confirmed the log shows `EXPO_PUBLIC_SUPABASE_URL`/
`_ANON_KEY` loaded, and confirmed both values are correctly inlined in the served JS bundle — so
`isSupabaseConfigured` now evaluates `true` and the app should show Login/Register, not
`NotConfiguredScreen`. D-052's dependency flag is resolved.
**Still open:** the iOS Simulator panel tool crash-looped both times it was tried and its own error
said retrying would not help — visual/interactive confirmation (actually seeing the login screen,
testing register/login against the real Supabase project) is still pending the panel recovering;
not claimed as verified beyond what the headless bundle check can show.

### BQ-013 — Surfacing candidate selection (WHICH half of D-012's trigger logic) — done 03-Aug-2026
Traces to D-051 (BRIEF-007 resolved, Path A staged). Added `backend/app/services/surfacing.py`'s
`compute_surfacing_candidates()` — a fixed pairing-rule table run against stored Holdings only, no
model judgment anywhere. v1 table: `home_loan`/`personal_loan` present + no `term_insurance` held →
candidate `term_insurance`, regardless of `endowment_ulip` (owner-confirmed the gap stands either
way — D-013 split Term from Endowment/ULIP because the teaching moment differs). Rule order is the
fixed precedence a future WHEN-stage tie-break would use; v1's single rule never exercises it.
Exposed via `GET /surfacing-candidates?user_id=`. **WHEN stays gated per D-051** — nothing here
decides to surface anything to a user; that requires D-032's on-topic constraint re-verified via
Phase-1 fixture testing first. Verified end-to-end against the live Supabase DB across four
scenarios (loan + no insurance → candidate; loan + Endowment/ULIP but no Term → candidate, correctly
not suppressed; loan + Term already held → no candidate; no loans → no candidate); test rows deleted
after verification.

### BQ-010 — Implement live budget computation (no stored Budget object) — done 03-Aug-2026
Traces to D-038. Added `backend/app/models/discretionary_category.py` (new `discretionary_categories`
table — owner chose this over a JSONB field on Income, logged as **D-048**) and
`backend/app/services/budget.py`'s `compute_budget()`, exposed via `GET /budget?user_id=`. Nothing
stored: income total (from Income, frequency-normalized to monthly) minus recurring outflows read
live off `Holding.characteristics` (EMI for home_loan/personal_loan, SIP investment amount for
equity/debt mutual funds only when `investment_mode == "SIP"`, insurance premium for
term_insurance/endowment_ulip, frequency-normalized) minus discretionary categories, summed as-is.
Alembic migration `ce8262c241ff` applied against the live Supabase DB. Verified end-to-end: inserted
a test user's Income/holdings/discretionary rows, confirmed `/budget` matches the hand-computed
total exactly (including correctly excluding a lumpsum-mode fund from recurring outflows), test rows
deleted after verification.

### BQ-012 — Build the real Holdings model — done 03-Aug-2026
Owner-directed mid-session, as the direct follow-up to BQ-009's flagged gap (no Holdings table existed to
back `Goal.funded_by.holding_id`). Traces to already-decided design: D-010 (architectural aliasing), D-011
(alias/characteristics/re-humanizing framework), D-013 (8-type taxonomy). Added
`backend/app/models/holding.py`: single `holdings` table (`id`, `user_id` — loose UUID, no FK, same as
Income/Goal — `product_type`, `alias`, `display_name`, `characteristics` JSONB), unique on
`(user_id, alias)`. Two implementation choices owner-confirmed before writing code, logged as **D-044**:
(1) JSONB characteristics over one child table per D-013 type — matches the flat shape already used in
`docs/fixtures/FIXTURE_user_01.json`; (2) `product_type` left as a plain string, not a DB enum/CHECK
constraint, so as not to silently resolve `PROJECT_SPEC.md` §8's still-open `savings_balance` taxonomy
question. Also wired `GoalFunding.holding_id` to a real FK (`holdings.id`, `ON DELETE CASCADE`) — the exact
item D-043 deferred until Holdings existed. Alembic migration `a6cd8d30a707` generated, reviewed (fixed an
autogenerate bug: the downgrade's `drop_constraint` was passed `None` instead of the FK's name, which would
have failed if ever run — named it explicitly), and applied against the live Supabase DB. Verified: FK
cascade delete confirmed against the real DB (deleting a Holding removes its GoalFunding rows), round-trip
insert/read confirmed, `/health` and `/health/db` both 200 with all four models loaded.

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
