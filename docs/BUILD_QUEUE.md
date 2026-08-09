# FinTutor — Build Queue

**This is the build worklist. Claude reads this file to find its build task.**

Rules for this file:
- Nothing enters this queue until the decision behind it has an ID in `docs/DECISION_LOG.md`.
- Items here are **already decided** — Claude executes them, it does not re-open them.
- If executing an item requires a new decision (new library, schema change, anything on
  the `CLAUDE.md` hard-stop list), **STOP and escalate to the owner**. Do not decide it here.
- One item per session. Move it to DONE with a date when complete.
- This file is build-task-tracking only (single home as of D-033 — see `docs/DECISION_LOG.md`).
- Before picking up an item, check `docs/KNOWN_LIMITATIONS.md` — a disclosed gap from a shipped feature
  may already flag exactly the edge case the new item is about to hit.

---

## READY — pick one of these

- **BQ-042 — Build the onboarding structured conversation flow.** Per
  `docs/features/onboarding/PRD.md`, confirmed D-084. Backend: new `OnboardingState` model + Alembic
  migration (`onboarding_states` table — `id`, `user_id` loose-ref, `track`, `stage`, `turns_in_stage`,
  modeled on `StreakState`); stage-transition logic for the four tracks (`fresh_starter`,
  `reactive_dabbler`, `habit_former`, `unclassified`), each ending in `complete`; `/chat` request/response
  changes to carry `track`/`stage`; the 4-turn fail-safe budget forcing an explicit "continue to the app"
  offer in the AI's own message. Frontend: wire `OnboardingScreen`/`ChatThread` to read/pass the new state.
  **Watch:** the `fresh_starter` → `sequencing` stage's copy carries a live compliance note (BRIEF-011) —
  fixed-order presentation risks reading as a recommendation; write it as "how these needs typically
  relate," never "do X first."

---

## BLOCKED — do not start

*(nothing blocked right now)*

---

## NOT IN THIS QUEUE — thinking-home only

These are open items that are **not build tasks** (Claude Code should not mistake them for work):
- Decision 3, Decision 2, and the UX principles section — all RESOLVED (D-038, D-059, D-075/D-076/D-077).
- FINDING 7 provenance — RESOLVED (D-029); execution was BQ-005 (see DONE).
- `savings_balance` 9th-taxonomy-type question — RESOLVED (D-079): schema-exempt, an instance of D-031's
  deferred Cash & bank family, nothing to build.
- AI-surfacing WHEN-stage verification — RESOLVED (D-080, Phase-1 Run 7): FINDING 8 does not reproduce
  0/5 against v0.8, live. `known_gaps` surfacing (already wired into every `/chat` call) can be treated as
  verified, not provisional.
- Conversation memory (PARKED — D-022). Subagents (PARKED — D-014). Legal review of D-009. Data privacy
  policy (D-010, unwritten).

---


> **DONE items archived (D-081).** Completed build items move to `docs/BUILD_QUEUE_ARCHIVE.md` as soon as
> they're marked done — this file stays limited to READY/BLOCKED/NOT-IN-QUEUE. This is a per-completion
> habit now (see `CLAUDE.md`'s checklist), not a one-time cleanup.

## DONE

See `docs/BUILD_QUEUE_ARCHIVE.md` — every completed item lives there, newest first.
