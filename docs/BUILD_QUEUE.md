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

### BQ-091 — Replace unavailable gstack commands with equivalent mandatory gates — READY

Implement D-145's tool-independent written plan and pre-commit review gates in the operating rules. Preserve
the sprint discipline, use named commands when available, and record equivalent manual checks otherwise.

### BQ-093 — Complete bounded in-context comparison coverage — READY

Implement D-145's deterministic pairing table under D-080: on-topic only, at most one absent-type candidate,
mechanism-only copy, no cold surfacing or advice, and D-078 confirmation before capture.

### BQ-095 — Add the opt-in ethical learning reminder — READY

Implement D-145's once-daily local reminder after meaningful learning: user-chosen time, explicit opt-in,
generic behavior-only copy, complete settings controls, and no financial/outcome/streak-loss targeting.

### BQ-096 — Preserve unvalued and unclassified holding metadata — READY

Implement D-145's per-holding fail-soft valuation semantics, family invalid counts and top-level unclassified
count. Never silently zero, guess a family, call a non-empty portfolio empty, or fail the whole response.

### BQ-097 — Preserve the selected reminder due day — READY

Implement D-145's per-month clamping: selected day 1–31, month-end only when necessary, restoration in longer
months, and no permanent day-28 rewrite.

### BQ-102 — Add an interactive own-numbers walkthrough — READY

Implement D-145's skippable mechanism walkthrough using consented known context plus only necessary missing
inputs. Show provenance, never fabricate/default unknowns, save nothing without confirmation, and do not
gate, quiz, reward or advise.

### BQ-103 — Correct remaining budget, tax-room, ESOP and streak defects — READY

Implement every D-145 conformance correction, including strict income cadence, bounded 80C room, ESOP
wording and clamped-anniversary timing, and future-date streak no-op behavior. Add regression tests.

### BQ-085 — Build the neutral Goal Affordability gap calculator — READY

Implement D-145's user-controlled month-end model, ending value, required contribution and signed gap with
adjustable scenarios, validation and disclosures. Never make an affordability/on-track verdict.

### BQ-086 — Build context-first term-insurance exploration — READY

Implement D-145's consented, source-visible component exploration with critical-unknown blocking, transient
scenarios, editable inclusion and neutral cover difference. Never recommend purchase or reward outcomes.

### BQ-087 — Publish Privacy Policy v1 and build dedicated context — READY

Draft and link D-145's internal-MVP policy, then build the optional per-user context record, authoritative
consumers, cross-account containment, legacy handling, controls, export/deletion coverage and tests. External
collection/launch remains gated on qualified India counsel review.

## BLOCKED — do not start

### BQ-092 — Production hosting/deployment target — DEFERRED UNTIL EXTERNAL ACCESS IS REQUIRED

Traces to D-005/D-008/D-041/D-138/D-143. Supabase hosts Postgres and Auth, not the existing Python/FastAPI
application. Owner deferred selecting or paying for a backend host during internal MVP work. Unpark before
external activation testing, test-user distribution, or any production-like device validation requiring a
non-local backend. Provider selection must then use current pricing/region/security evidence. Before deploy,
also close D-095's CORS/dev-bypass cleanup and verify database SSL enforcement plus applicable network
restrictions.


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
- Conversation memory (PARKED — D-022). Subagents (PARKED — D-014). Legal review of D-009. Data privacy
  policy (D-010, unwritten).

---


> **DONE items archived (D-081).** Completed build items move to `docs/BUILD_QUEUE_ARCHIVE.md` as soon as
> they're marked done — this file stays limited to READY/BLOCKED/NOT-IN-QUEUE. This is a per-completion
> habit now (see `CLAUDE.md`'s checklist), not a one-time cleanup.

## DONE

See `docs/BUILD_QUEUE_ARCHIVE.md` — every completed item lives there, newest first.
