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

### BQ-065 — Onboarding v2 persisted assessment foundation

Traces to D-118/D-119. Add the separate versioned normalized assessment model and Alembic migration,
backend state service, validation/transition tests, and legacy-safe reads. Store no raw answers/dialogue;
do not modify the meaning of legacy `onboarding_states` columns.

### BQ-066 — Onboarding v2 API and minimum-context Arya integration

Traces to D-118/D-119. Add the normalized question/action/state API, deterministic chip transitions,
handled/skip semantics, and minimum relevant assessment abstraction in the teaching baseline. Do not run
holding capture inside assessment v2 and do not send the full profile by default.

### BQ-067 — Onboarding v2 frontend flow and eligibility acknowledgement

Traces to D-118/D-119. Replace the four starter tracks for new users with the five-question chip-assisted
flow, 18+ acknowledgement, per-question/global skip, clear progress/exit states, tailored non-financial
navigation handoff, and backend-authoritative cross-device completion with local cache fallback.

### BQ-068 — Onboarding v2 legacy compatibility and voluntary reassessment

Traces to D-119. Grandfather legacy users, infer no v2 answers, preserve old rows through compatibility,
and add one dismissible “Personalize how Arya explains things” route for voluntary v2 assessment. Verify
legacy-complete, legacy-incomplete, second-device, reinstall, interruption, and clear-context paths.

---

## BLOCKED — do not start

### BQ-069 — Progression event ledger and rebuildable summary — TOP PRIORITY, BLOCKED

Traces to D-114/D-116/D-117. Do not build until the instrumentation/privacy package settles event-ledger
schema, timestamps/day boundaries, consent, retention/deletion, rebuild/version rules, and historical
credit. D-119 approves onboarding assessment storage only—not this broader behavior ledger.

### BQ-070 — Progression surfaces and placement — TOP PRIORITY, BLOCKED

Traces to D-114/D-116. Await the placement decision for stage, continuous progress, attribution, recap,
profile coverage, and Expanding milestones, plus BQ-069's approved data contract.

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
