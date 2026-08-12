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

### BQ-071 — Wire progression emitters into existing features

Traces to D-117 (event rules) and D-121 (ledger approved). BQ-069 shipped the ledger and the four
`/progression` routes, but nothing emits into it — progression is reachable and inert. This item makes it
live. Added 12-Aug-2026 at the owner's explicit request after BQ-069.

**Mostly a frontend task.** Verified during BQ-069's close: `CalculatorScreen` and `app/lib/scenarios.ts`
both compute client-side with no backend call, so those results are only observable in `app/`.

| Event | Where it fires | Notes |
|---|---|---|
| `arya_exchange_completed` | backend, `POST /chat` | Non-empty question + successful response. Key off the turn. |
| `onboarding_handled` | backend, `onboarding_assessment` handle | Use the existing `grant_onboarding_credit()`. |
| `context_prompt_handled` | backend, assessment answer/skip | Answer, skip and defer all earn the same — D-117 is explicit that disclosure never earns more. |
| `calculator_completed` | frontend, `CalculatorScreen` | On a rendered valid result, not on screen entry. `subject_key` = calculator type. |
| `scenario_completed` | frontend, `ScenarioScreen` | Same rule. `subject_key` = scenario type. |
| `teaching_moment_explored` | frontend, `TeachingBlock` / `TeachingWalkthrough` | **Blocked on a threshold decision — see below.** |
| `capability_first_used` | wherever its family's qualifying event fires | May accompany that event. Families: teaching, calculator, scenario, Arya. |
| `recap_completed` | — | **Not buildable: no recap feature exists.** Leave unwired, including its capability family. |
| `meaningful_return_day` | — | Derived during replay. Nothing to wire, and it is not recordable. |

**Escalate before building the teaching emitter.** D-117 says "opening and immediately leaving does not
qualify" but sets no threshold, and it does not define what a teaching *subject* is in a codebase where
teaching renders as blocks inside topic screens. Both are product judgment calls, not implementation
details. Build every other emitter and stop at this one.

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
