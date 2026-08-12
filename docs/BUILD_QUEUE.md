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

### BQ-074 — Complete goal-to-holding funding flow — READY

Traces to D-038 and D-125. The approved `funded_by[{holding_id, earmarked_amount}]` model and goal-progress
calculation are shipped, but every frontend-created goal sends an empty list and no UI can link or update
funding. Add the bounded backend mutation and frontend holding-selection/earmarked-amount interaction needed
to create and edit those already-approved links. Validate that every selected holding belongs to the same
user; do not add schema, automatic recommendations, allocation verdicts, or new financial formulas.

Acceptance: a user can create or update a goal with zero or more owned holdings and earmarked amounts;
cross-user holding IDs are rejected; goal progress reflects the saved links; empty funding remains valid;
loading/error/empty states and backend tests are present; native QA is attempted.

### BQ-075 — Surface the approved loan-versus-invest scenario from Tools — READY AFTER BQ-074

Traces to D-104/D-106 and D-125. S-02 already exists as `LoanVsInvestModal` but is discoverable only from
an eligible loan detail. Add a Tools scenario entry that lets the user choose an eligible owned loan and
opens/navigates to the existing experience. Reuse the existing calculation and disclosure verbatim; do not
change money logic, add assumptions, or create a second calculator implementation.

Acceptance: Tools exposes S-02; zero/one/multiple eligible-loan states are coherent; selection is neutral;
the existing holding-detail route remains functional; TypeScript and native QA pass/best-effort.

### BQ-076 — Complete the optional onboarding first-action handoff — READY AFTER BQ-075

Traces to D-126. Rework the existing handled-state handoff so it presents the available existing routes
clearly: Arya, add/understand something already managed, create/explore a goal, calculators/scenarios, or
Home. The immediate-intent answer may highlight a starting choice but must not remove the others. All choices
and skipping must finish onboarding identically; no extra financial question, persistence, route, schema,
dependency, recommendation, or progression event is authorised.

Acceptance: all five choices plus Home are visible and accessible; the suggested choice follows normalized
immediate intent defensively; every route reaches an existing surface; choosing Home requires no disclosure;
answer/skip/global-exit and legacy opt-in paths remain correct; TypeScript and native QA pass/best-effort.

## BLOCKED — do not start

### BQ-072 — Customer-outcome MVP exit-gate programme — DEFERRED UNTIL INTERNAL MVP VALIDATION

Traces to D-122. This is the owner-directed programme that makes the customer outcome, rather than feature
count, the MVP completion standard. It is deliberately **not READY**: the seven gates need to be converted
one at a time into bounded decisions, research protocols, or implementation tasks. Do not treat this item
as permission to add scope.

Required gates: validated first-session activation; real-user evidence; a connected context → insight →
baseline → return loop; visible learning progression and return value; production trust/safety (privacy,
JWT ownership, QA, deployment posture, legal review); an evidence-backed initial wedge; and a credible
initial distribution plus monetization hypothesis.

**Completed autonomously:** D-124 / `docs/features/activation/ACTIVATION_TEST_V1.md` defines the target-user
activation test and pass/fail thresholds. D-125 changes the sequence: first reconcile and build the complete
approved MVP, then the owner live-validates it, and only then recruit/schedule 12 qualifying participants.
Do not recruit, infer results, or start evidence-dependent product changes before that internal gate passes.

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
