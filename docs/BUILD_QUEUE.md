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

### BQ-071 — Wire progression emitters into existing features — PARTIALLY SHIPPED, one emitter blocked

Traces to D-117 (event rules) and D-121 (ledger approved). BQ-069 shipped the ledger and the four
`/progression` routes, but nothing emits into it — progression is reachable and inert. This item makes it
live. Added 12-Aug-2026 at the owner's explicit request after BQ-069.

**Shipped 12-Aug-2026:** Arya exchanges, context prompts, onboarding handled, calculators, scenarios, and
the capability-first-use milestone for each of those four families. 79 backend tests pass; `tsc` clean.

**Remaining: the teaching emitter only — BLOCKED on a decision, see below.** Do not close this item, and do
not build the teaching emitter, until that decision exists.

**Mostly a frontend task.** Verified during BQ-069's close: `CalculatorScreen` and `app/lib/scenarios.ts`
both compute client-side with no backend call, so those results are only observable in `app/`.

| Event | Where it fires | Notes |
|---|---|---|
| `arya_exchange_completed` | backend, `POST /chat` | Non-empty question + successful response. Key off the turn. |
| `onboarding_handled` | backend, `onboarding_assessment` handle | Use the existing `grant_onboarding_credit()`. |
| `context_prompt_handled` | backend, assessment answer/skip | Answer, skip and defer all earn the same — D-117 is explicit that disclosure never earns more. |
| `calculator_completed` | frontend, `CalculatorScreen` | On a rendered valid result, not on screen entry. `subject_key` = calculator type. |
| `scenario_completed` | frontend, `ScenarioScreen` | Same rule. `subject_key` = scenario type. |
| `teaching_moment_explored` | frontend, `TeachingBlock` / `TeachingWalkthrough` | **BLOCKED — collides with D-090's P9 guard. See below.** |
| `capability_first_used` | wherever its family's qualifying event fires | Shipped for calculator, scenario and Arya. The *teaching* family is blocked with the event above. |
| `recap_completed` | — | **Not buildable: no recap feature exists.** Leave unwired, including its capability family. |
| `meaningful_return_day` | — | Derived during replay. Nothing to wire, and it is not recordable. |

**The teaching emitter collides with D-090's P9 guard — this is a hard stop, not a threshold question.**

D-117 requires `teaching_moment_explored` to distinguish engaging with a teaching moment from opening and
immediately leaving. `TeachingWalkthrough` is built so that distinction cannot be made: D-090's P9 guard
names "no `onComplete` prop, no 'finished'/'completed' state, and no value this component reports that
differs from calling `onDismiss` early," and D-090 states that an implementation missing any of its four
guards "is not a permitted variant of `1f` — it is the lesson tree `PROJECT_SPEC.md` §2 and P9 forbid."
The component's own header adds that a feature wanting such a signal "needs its own new decision record,
not a prop added here."

So the two decisions are in direct conflict on this one event, and it cannot be resolved in a build
session. Separately, D-117 also never defines what a teaching *subject* is where teaching renders as
`TeachingBlock` callouts inside topic screens.

Note the static `TeachingBlock` surface is a *different* question from the walkthrough — a viewport-dwell
signal there gates nothing and unlocks nothing, so it may not engage P9 at all. That is the likely way
through, but it is the owner's call, not this queue's.

**Hard constraints:**

- Recording must never change a computed figure. This item touches screens that display money math; it
  adds emission only, and no calculator or scenario output may move.
- Emission must be fire-and-forget. A failed or slow `POST /progression/event` must never block, delay, or
  error a user's actual result.
- `record_event` rejects a repeatable event with no `idempotency_key`, by design. Every frontend emitter
  must supply one that is stable across a re-render or back-navigation but distinct per genuine repeat.
- Do not send `occurred_at` — the route does not accept it.

---

## BLOCKED — do not start

### BQ-070 — Progression surfaces and placement — TOP PRIORITY, BLOCKED

Traces to D-114/D-116. The data contract it was waiting on is now settled (D-121), but it remains blocked
on its own placement decision for stage, continuous progress, attribution, recap, profile coverage, and
Expanding milestones.

### BQ-072 — Customer-outcome MVP exit-gate programme — BLOCKED until current major build work closes

Traces to D-122. This is the owner-directed programme that makes the customer outcome, rather than feature
count, the MVP completion standard. It is deliberately **not READY**: the seven gates need to be converted
one at a time into bounded decisions, research protocols, or implementation tasks. Do not treat this item
as permission to add scope.

Required gates: validated first-session activation; real-user evidence; a connected context → insight →
baseline → return loop; visible learning progression and return value; production trust/safety (privacy,
JWT ownership, QA, deployment posture, legal review); an evidence-backed initial wedge; and a credible
initial distribution plus monetization hypothesis.

**First work after unblock:** define the target-user activation test and its pass/fail threshold. This is
the cheapest test of the main customer-value hypothesis, and it may change which implementation work is
actually justified next.

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
