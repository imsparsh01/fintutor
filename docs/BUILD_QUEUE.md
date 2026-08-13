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

### BQ-088 — Assessment context view/change/clear UI

Traces to D-119. The backend already provides post-handle update and clear-context routes, but the app has
no completed-assessment management surface. Add a bounded user-facing route to view the normalized context,
change approved normalized answers, and clear it without exposing internal IDs/timestamps or raw data. Use
the existing endpoints and approved vocabularies; do not add schema or change onboarding progression rules.

### BQ-090 — Synchronize the session-close skill with D-135

Traces to D-062/D-135. Update the existing session-close skill so it performs the mandatory decision-delivery
disposition check before archiving/commit/push. This is maintenance of an already-adopted skill, not a new
tool or workflow. Verify its instructions match the live `CLAUDE.md` close sequence.

## BLOCKED — do not start

### BQ-089 — Enforce Supabase JWT ownership across backend routes — BLOCKED ON D3

Traces to D-005/D-008/D-052. Frontend authentication exists, but backend routes trust caller-supplied UUIDs.
After the owner approves D3, validate the Supabase access token, derive the subject server-side, remove
caller authority over ownership, and update every client wrapper. Do not infer the exact boundary here.

### BQ-091 — Restore or supersede mandatory gstack plan/review gates — BLOCKED

Traces to D-107. The operating rules call the gates mandatory, while several sessions report the installed
commands absent or failing. Unblock by either proving one compatible plan and review invocation, or by an
owner decision superseding the tool-specific mandate with an explicit manual fallback.

### BQ-092 — Production hosting/deployment target — BLOCKED ON OWNER CONFIRMATION

Traces to D-005/D-008/D-041. Supabase database and frontend auth are present, but no repository artifact
proves where FastAPI is hosted. Confirm whether the old “Supabase hosting” wording still governs the backend
or must be superseded, then create the bounded deployment implementation. Before any non-development deploy,
also close D-095's CORS/dev-bypass cleanup.

### BQ-085 — Goal Affordability calculator — BLOCKED ON FORMULA CONTRACT

Traces to D-128. The MVP capability is approved, but D-128 explicitly forbids implementation before its
exact inputs, arithmetic, disclosures, validation and edge-case behavior are owner-approved. Unblock only
when that contract is logged; do not infer a target rate, horizon, contribution, or affordability verdict.

### BQ-086 — Term-insurance Coverage scenarios — BLOCKED ON IMPLEMENTATION CONTRACT

Traces to D-131/D-132. The user-controlled scenario direction is approved. Before build, decide the exact
component formulas, source/unknown semantics, finite/range validation, loading/stale-user behavior and
disclosures. India insurance/fintech counsel review is required before external launch, not before private
implementation once the contract exists.

### BQ-087 — Dedicated minimal financial-context record — BLOCKED ON D3 + D-010

Traces to D-134. Build one optional per-user record for an explicitly confirmed dependant count and
self-reported emergency-fund months, then make it authoritative for Arya and Portfolio Health. Do not begin
until authenticated ownership (D3) and the applicable D-010 retention/deletion/backup contract are decided.
The implementation must prevent the current installation-global Health Score values crossing accounts.

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
