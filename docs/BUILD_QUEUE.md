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

### BQ-008 — Re-run the Q1 repeat series (n=5) against v0.8
**Traces to:** D-037 (Tier 2, REVIEW-FLAGGED — resolves FINDING 9)
**Task:** Run Q1 against `FIXTURE_user_01.json` five times using `SYSTEM_PROMPT_v0_8_runnable.md` (same
setup as BQ-007 — use `scripts/run_phase1_test.py --label bq008`). Score each run for: (a) FINDING 9 — is
Card-1 named in all 5, and does the emergency-fund/liquidity-substitution pattern stop; (b) make sure
FINDING 10 still doesn't reproduce (confirm D-035's fix wasn't disturbed by the new paragraph); (c) re-check
for FINDING 11-style "worth" framing now that D-036 has clarified what's actually forbidden (ordering words
only).
**Escalate if:** Card-1 still gets dropped at a similar rate — that's real evidence the fix didn't work and
needs owner attention, not another silent iteration. Otherwise append results to a new PHASE1_RUN6_RESULTS.md
and move this to DONE.

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
