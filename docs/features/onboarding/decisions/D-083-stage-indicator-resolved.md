# D-083 — D-082's open fork resolved: a narrow stage-indicator, not conversation memory

- **Tier:** 3, owner-decided directly in conversation, resolving the specific fork
  [D-082](../../../decisions/D-082-onboarding-structured-flow-scope.md) left open and explicitly refused to
  proceed past without a call.

## Decision

**Path A adopted.** Onboarding will track progress via a small, structured stage indicator — not
conversation memory, not a stored transcript, nothing sent back to the model as dialogue history. Something
in the shape of `onboarding_stage: <enum value>` (exact taxonomy is the PRD's next section, not fixed by
this entry), persisted per user, read by the backend before assembling a turn's prompt and updated after it
based on what was just covered.

## Why this doesn't reopen D-022

D-022 parked **dialogue recall** specifically — retrieving what was actually said in a past turn or
session, the shape of thing that carries real retention/privacy stakes (what did the user tell the AI,
verbatim, and for how long is that kept). A stage indicator carries none of that: it's a single small piece
of account state answering "where in a known, fixed structure is this user," structurally the same category
as `hasSeenOnboarding` (`app/lib/onboarding.ts`) or the streak/session-open state already persisted today
— not a new class of data, just a new value in an existing class. Nothing about the user's actual words is
stored or replayed.

## What this does NOT do

- Does **not** reopen or relax D-022 itself — full conversation memory stays parked, exactly as it was,
  pending D-010.
- Does **not** decide the stage taxonomy, the transition rules, or the fail-safe/loop-exit mechanics —
  those are real design questions, addressed next in `docs/features/onboarding/PRD.md`, not settled by
  this entry.
- Does **not** queue a build item. `docs/BUILD_QUEUE.md` stays untouched until the stage/path design in the
  PRD is itself confirmed — matching this project's standing design-then-build sequencing.

## Reversibility

High — still no code written against this. The indicator is a small, additive schema decision; nothing
about it is hard to unwind if the stage design changes shape before it's built.

**Date:** 05-Aug-2026
