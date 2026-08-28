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

### BQ-121 — Consolidate Onboarding functional, content and safety contracts — READY (after BQ-120)

Traces to D-158/D-118/D-119/D-126. Objective: specify inputs, outputs, persistence, API ownership, privacy,
accessibility, progression, analytics, content, neutral wording and failure semantics for every BQ-120 state.
Accept: optionality and eligibility are unambiguous; skipped/unknown values are never inferred; disclosure is
never rewarded or required; prohibited data and claims are explicit; account/cache races fail closed; and
every contract traces to standing decisions. Size M. Definition only. Depends on BQ-120.

### BQ-122 — Onboarding acceptance matrix and decision register — READY (after BQ-121)

Traces to D-158/D-148. Objective: map each requirement and state to a prototype task plus eventual automated
or manual evidence, and route every genuine unresolved fork through the tier protocol. Accept: 5–8 critical
owner journeys cover new, interrupted, globally skipped, legacy, context-management and failure/recovery
paths; every requirement has evidence; no settled D-118/D-119/D-126 rule is reopened without new information;
and any Tier-3 fork stops for the owner before prototype assumptions harden. Size S/M. Definition only.
Depends on BQ-121.

### BQ-123 — Onboarding clickable fixture prototype and exhaustive agent QA — READY (after BQ-122)

Traces to D-158/D-148. Objective: build a standalone controlled-data prototype for all approved journeys and
complete agent-led QA before asking the owner to validate it. Accept: all critical scenarios are clickable;
state/recovery/account-transition behavior matches the contracts; syntax, forbidden APIs/storage, every route
and interaction, responsive layouts, keyboard/accessibility semantics, contrast, themes, reduced motion and
console integrity are tested and recorded; no network, model, production code, schema, API, dependency or
money-logic mutation. Size L. Depends on BQ-122.

### BQ-124 — Onboarding owner validation walkthrough and disposition — READY (after BQ-123)

Traces to D-158/D-148. Objective: present the already-tested prototype for owner validation and record PASS /
REVISE / PARK / ESCALATE. Accept: every critical task records coaching, comprehension, optionality/neutrality,
recovery, confusion, trust surprises and dead ends; PASS freezes the package at its prototype commit.
Owner-gated. Size S. Depends on BQ-123. Production implementation remains separately bounded.

## BLOCKED — do not start

### BQ-092 — Production hosting/deployment target — DEFERRED UNTIL EXTERNAL ACCESS IS REQUIRED

Traces to D-005/D-008/D-041/D-138/D-143. Supabase hosts Postgres and Auth, not the existing Python/FastAPI
application. Owner deferred selecting or paying for a backend host during internal MVP work. Unpark before
external activation testing, test-user distribution, or any production-like device validation requiring a
non-local backend. Provider selection must then use current pricing/region/security evidence. Before deploy,
also close D-095's CORS/dev-bypass cleanup and verify database SSL enforcement plus applicable network
restrictions and enable Supabase leaked-password protection.


### BQ-098 — Income-tax and HRA calculators — DEFERRED ON RULE CONTRACT

Traces to D-105/D-128/D-145. Unpark only when one supported financial year, official primary sources, a
verification owner/date, stale-rule shutdown and qualified India tax/fintech counsel review are established.

### BQ-100 — Schedule progression retention pruning — DEFERRED WITH HOSTING

Traces to D-121/D-143. Tested `prune_raw_events()` exists, but no periodic job invokes it. Unpark with BQ-092
when external access requires a host; choose its scheduler and verify pruning, replay, failure alerting and
the 400-day boundary end to end before external users.


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
- Conversation memory (PARKED — D-022). Qualified India legal review (DEFERRED — D-009, before external
  collection/launch). Execution subagents were unparked by D-093/D-115; Privacy Policy v1 shipped in BQ-087.

---


> **DONE items archived (D-081).** Completed build items move to `docs/BUILD_QUEUE_ARCHIVE.md` as soon as
> they're marked done — this file stays limited to READY/BLOCKED/NOT-IN-QUEUE. This is a per-completion
> habit now (see `CLAUDE.md`'s checklist), not a one-time cleanup.

## DONE

See `docs/BUILD_QUEUE_ARCHIVE.md` — every completed item lives there, newest first.
