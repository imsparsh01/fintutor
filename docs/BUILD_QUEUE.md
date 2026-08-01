# FinTutor — Build Queue

**This is the build-home worklist. Claude Code reads this file to find its task.**

Rules for this file:
- Nothing enters this queue until the decision behind it has an ID in `docs/DECISION_LOG.md`.
- Items here are **already decided** — Claude Code executes them, it does not re-open them.
- If executing an item requires a new decision (new library, schema change, anything on
  the `CLAUDE.md` hard-stop list), **STOP and escalate to the owner**. Do not decide it here.
- One item per session. Move it to DONE with a date when complete.
- This file lives only on the laptop. It is NOT uploaded to the Claude Project.

---

## READY — pick one of these

### BQ-005 — Regenerate system prompt to v0.5 (provenance rule)
**Traces to:** D-029 (BRIEF-003 resolved — Path C, provenance rule for non-profile numbers)
**Task:** The TEACHING_SYSTEM_PROMPT.md §2 rule 5 (provenance) and §5 (typical-figure example) edits are
already applied in thinking-home and present in the synced file. Regenerate
`docs/prompts/SYSTEM_PROMPT_v0_5_runnable.md` from the current TEACHING_SYSTEM_PROMPT.md, following the same
assembly pattern as v0.4 (strip owner-facing annotations, including the P5 design-note comment). Update the
version-header comment to note: "v0.5 (D-029): §2 gains rule 5 (provenance — profile numbers vs. typical-range
numbers never share a register); §5 gains a typical-figure phrasing example."
**Done when:** v0.5 runnable file exists, header comment updated, committed.
**Escalate if:** applying the rule reveals a conflict with another §2/§5 rule not anticipated here.

---

### BQ-001 — Run Q7 and Q8 against prompt v0.5
**Traces to:** D-024, D-027 (both runs recorded Q7/Q8 as never executed)
**Note:** run against v0.5 once BQ-005 is done (was originally written against v0.4).
**Task:** Run Q7 (memory claim) and Q8 (irrelevant-holding discipline) following `docs/TEST_PROTOCOL.md`,
using `docs/fixtures/FIXTURE_user_01.json`. Record results in the format of `docs/PHASE1_RUN2_RESULTS.md`.
**Done when:** both questions run, outputs captured, results file written, committed.
**Escalate if:** either question produces a compliance-line failure — that is a finding for thinking-home.

---

### BQ-002 — Build second fixture with no dominant number
**Traces to:** D-024, D-027 (§8: "highest-value untested thing remaining")
**Task:** Create `docs/fixtures/FIXTURE_user_02.json` modelled on `FIXTURE_user_01.json` but deliberately
**without a dominant number** — no equivalent of Card-1 at 42%. Same schema, comparable complexity.
**Done when:** fixture exists, is schema-valid against user_01's shape, committed.
**Escalate if:** building it requires adding a new field or product type to the schema — Tier 3 scope.

---

### BQ-003 — Run Q1 against both fixtures and compare
**Depends on:** BQ-002
**Traces to:** D-027 (FINDING 4 may be an artifact of user_01's loud number)
**Task:** Run Q1 against both fixtures using v0.5. Compare whether the structural-ranking behaviour in
FINDING 4 persists when no dominant number exists.
**Done when:** both outputs captured, comparison written up, committed.
**Escalate if:** the comparison suggests D-028's `deepen` field needs to behave differently — architecture.

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
- FINDING 7 provenance — RESOLVED (D-029); execution is BQ-005 above.
- Conversation memory (PARKED — D-022). Subagents (PARKED — D-014). Legal review of D-009.

---

## DONE

_(move completed items here with a date and a one-line result)_
