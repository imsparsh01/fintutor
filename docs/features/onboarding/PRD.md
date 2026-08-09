# Onboarding — structured conversation flow PRD (draft, blocked on one open question)

> Piloting the `docs/features/<slug>/` convention (D-082). This PRD is a **draft awaiting the owner's call
> on the question below** — nothing past that point is designed yet, deliberately, per D-082's own
> "does not proceed past it without the owner's explicit call."

## Confirmed scope (D-082)

- **Onboarding only.** The general Chat tab and every other `/chat` entry point are unchanged. Revisit
  extending this pattern there later, as its own decision.
- **Structured *flow*, not structured *fields*.** D-058 still holds: no form field anywhere in onboarding.
  What changes is that each turn is aware of where the user is in a defined structure, instead of every
  turn being one isolated free-form question into the general teaching engine.
- **Fail-safe requirement:** every AI turn must end in either a clear next-step (chip/prompt) or an
  explicit "onboarding complete" state. No turn may leave the user with nowhere to go, and the flow may not
  loop without a way out.

## Open question #1 — blocking, must be resolved before any flow design — cross-turn state

A structured flow, by definition, needs the backend to know what stage/path a user is already in in when a
new message arrives. Today there is **zero** cross-turn state: [chat.ts](../../../app/lib/chat.ts) and
[teaching.py](../../../backend/app/services/teaching.py) both document that every `/chat` call is fully
independent — no history, no memory, by design (D-022). `PROJECT_SPEC.md` §8 has full conversation memory
explicitly PARKED under D-022 — it fired the project's hard scope-growth trigger *and* a data-retention
trigger, gated on Phase 1 validation **and** the still-unwritten D-010 privacy policy.

Two real paths, not yet picked:

**Path A — minimal stage state, not dialogue memory.** Persist only a small structured indicator (e.g.
"onboarding_stage: emergency_fund_check", or a short list of which topics are already covered) — never
raw transcript, never sent back to the model as conversation history, just enough for the backend to pick
the next stage/prompt. Argument this doesn't reopen D-022: D-022 parked *dialogue recall* specifically
(retrieving what was said in a past session); a stage pointer is closer to existing account state (like
`hasSeenOnboarding` in `app/lib/onboarding.ts` today) than to stored conversation content. Still a genuinely
new piece of persisted user state, so this argument needs the owner's sign-off, not just an assumption.

**Path B — resolve D-010 (data privacy policy) first, then design memory properly.** If stage-state is
judged close enough to D-022's parked territory to count, the honest move is writing the D-010 policy now
(it's already an open, owner-only item, unrelated to onboarding until this moment) rather than routing
around it with a narrower label.

**This PRD stops here pending that call.** Once resolved, the next section of this document defines the
actual stage/path structure (using the four existing chip starters — started-earning, loan/EMI,
already-budgets, something-else — as the likely first-level split) and the fail-safe/loop-exit mechanics.

## Not yet written (depends on the above)

- Stage/path map and transition rules
- Exact persisted-state shape (if Path A) or memory/retention design (if Path B)
- Loop/dead-end guard mechanics
- How this interacts with the existing "Skip for now" / resume-later behavior
- Backend and frontend implementation plan
