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

### BQ-076 — Complete the optional onboarding first-action handoff — READY

Traces to D-126. Rework the existing handled-state handoff so it presents the available existing routes
clearly: Arya, add/understand something already managed, create/explore a goal, calculators/scenarios, or
Home. The immediate-intent answer may highlight a starting choice but must not remove the others. All choices
and skipping must finish onboarding identically; no extra financial question, persistence, route, schema,
dependency, recommendation, or progression event is authorised.

Acceptance: all five choices plus Home are visible and accessible; the suggested choice follows normalized
immediate intent defensively; every route reaches an existing surface; choosing Home requires no disclosure;
answer/skip/global-exit and legacy opt-in paths remain correct; TypeScript and native QA pass/best-effort.

### BQ-077 — Implement user-confirmed holding reconciliation — READY AFTER BQ-076

Traces to D-127. Extend conversational holding capture into a transient new/update/conflict proposal. Backend
code, not the model, owns candidate identity; exact locally matched display names are redacted before Haiku,
and ambiguous same-type candidates require the user to select a holding or “Add as new.” Resolve an
authoritative field diff, show old/new values neutrally, and apply only explicitly confirmed fields after
rechecking current state under a row lock. Preserve unstated fields. Reuse the current holdings table and
D-099 response contract; no proposal/history persistence, schema, dependency, deletion, non-holding mutation,
fuzzy matching, model-selected target, progression event, or financial-calculation change.

Acceptance: no conversational write occurs before confirmation; real display names never reach reconciliation
Haiku; zero/one/many same-type candidates follow D-127; owned-target checks prevent cross-user resolution or
apply; added/unchanged/conflicting field diffs are accurate; stale same-field changes require re-confirmation;
confirmed updates merge only shown fields; dismiss/classifier failure writes nothing; new/manual capture stays
functional; focused API/service tests, full backend suite, TypeScript, codemap updates, and native QA pass or
are attempted as applicable.

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
