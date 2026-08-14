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

## BLOCKED — do not start

### BQ-091 — Restore or supersede mandatory gstack plan/review gates — BLOCKED

Traces to D-107. The operating rules call the gates mandatory, while several sessions report the installed
commands absent or failing. Unblock by either proving one compatible plan and review invocation, or by an
owner decision superseding the tool-specific mandate with an explicit manual fallback.

### BQ-092 — Production hosting/deployment target — DEFERRED UNTIL EXTERNAL ACCESS IS REQUIRED

Traces to D-005/D-008/D-041/D-138/D-143. Supabase hosts Postgres and Auth, not the existing Python/FastAPI
application. Owner deferred selecting or paying for a backend host during internal MVP work. Unpark before
external activation testing, test-user distribution, or any production-like device validation requiring a
non-local backend. Provider selection must then use current pricing/region/security evidence. Before deploy,
also close D-095's CORS/dev-bypass cleanup and verify database SSL enforcement plus applicable network
restrictions.

### BQ-093 — Complete in-context AI surfacing coverage — BLOCKED ON PAIRING CONTENT

Traces to D-012/D-051. Generic capture supports the taxonomy, but deterministic surfacing has only the
loan→missing-term-insurance rule. Define owner-reviewed, on-topic pairings and precedence for remaining MVP
types, then implement them under D-080's verified WHEN constraint. Cold surfacing remains out of MVP.

### BQ-095 — Complete or narrow the Hook Loop trigger layer — BLOCKED ON PRODUCT DESIGN

Traces to D-060/D-061. Streaks and variable rewards shipped, but the adopted Hook Loop described a trigger/
notification layer without a concrete contract. Decide trigger shape, frequency and control without tying
engagement to financial outcomes, or explicitly narrow the full-adoption wording.

### BQ-096 — Consolidated valuation metadata defects — BLOCKED ON OWNER APPROVAL

Traces to D-065/D-097 and the D-125 audit. Unmapped product types can disappear from metadata and malformed
JSONB can fail the response. Approve neutral status/error semantics before changing financial aggregation.

### BQ-097 — Reconcile reminder due-day behavior — BLOCKED ON D4

Traces to D-101/BQ-084. D-101 approved days 1–31 with shorter months clamped to month end. Current recurring
triggers map 29–31 permanently to 28. Confirm that simplification as a supersession or approve a scheduling
design that preserves the actual due day in longer months.

### BQ-098 — Income-tax and HRA calculators — BLOCKED ON RULE CONTRACT

Traces to D-105/D-128. Both were approved, but require a supported financial year, authoritative rule source,
verification/update ownership, stale behavior and legal review before build.

### BQ-100 — Schedule progression retention pruning — DEFERRED WITH HOSTING

Traces to D-121/D-143. Tested `prune_raw_events()` exists, but no periodic job invokes it. Unpark with BQ-092
when external access requires a host; choose its scheduler and verify pruning, replay, failure alerting and
the 400-day boundary end to end before external users.

### BQ-102 — Reconcile empty-state personalized walkthrough promise — BLOCKED

Traces to D-089. Empty sections ship generic mechanism walkthroughs and send own-number application to Chat,
while D-089 literally promises an offered walkthrough using the user's own numbers. Owner must confirm the
two-stage handoff satisfies the decision or approve a bounded personalized walkthrough contract.

### BQ-103 — Remaining D-125 conformance defects — BLOCKED ON OWNER APPROVAL

Traces to D-048/D-069/D-070 and the D-125 audit. Decide exact fixes for strict income cadence; 80C cap and
negative inputs; ESOP equal-FMV wording, month-end vesting and zero-unit wording; and future-dated streak
state. BQ-096 separately owns the two consolidated defects. Pinning current behavior in tests is not approval
to preserve it; each correction remains money/tax/state gated.

### BQ-085 — Goal Affordability calculator — BLOCKED ON FORMULA CONTRACT

Traces to D-128. The MVP capability is approved, but D-128 explicitly forbids implementation before its
exact inputs, arithmetic, disclosures, validation and edge-case behavior are owner-approved. Unblock only
when that contract is logged; do not infer a target rate, horizon, contribution, or affordability verdict.

### BQ-086 — Term-insurance Coverage scenarios — BLOCKED ON IMPLEMENTATION CONTRACT

Traces to D-131/D-132. The user-controlled scenario direction is approved. Before build, decide the exact
component formulas, source/unknown semantics, finite/range validation, loading/stale-user behavior and
disclosures. India insurance/fintech counsel review is required before external launch, not before private
implementation once the contract exists.

### BQ-087 — Dedicated minimal financial-context record — BLOCKED ON PRIVACY-POLICY ARTIFACT

Traces to D-134/D-141. Build one optional per-user record for an explicitly confirmed dependant count and
self-reported emergency-fund months, then make it authoritative for Arya and Portfolio Health. D-137 through
D-140 settle authenticated ownership, retention, backup and deletion. D-141 places detailed disclosure in
the privacy policy while retaining clear optional labels and view/change/clear controls in-product. Do not
begin collection until the final applicable policy text and an accessible in-app link exist. The
implementation must prevent the current installation-global Health Score values crossing accounts.

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
