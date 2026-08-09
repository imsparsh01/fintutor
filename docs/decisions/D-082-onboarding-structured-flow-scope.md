# D-082 — Onboarding reopened for a structured *conversation flow* (not structured fields); new per-feature subfolder convention adopted, piloted on onboarding

- **Tier:** 3, owner-decided directly in conversation (session 2026-08-05, local Mac). Deliberately reopens
  and narrows [D-058](D-058-onboarding-shape.md), which this project's own hard-stop list treats as
  "contradicts a standing principle" — surfaced explicitly rather than silently overridden, per
  `CLAUDE.md`'s rule that this category always stops and asks.

## What triggered this

Live-tested the real onboarding chat (2026-08-05d's verification work, first genuine login) and got a
~300+ word, three-topic answer to "I just started earning and I'm not sure where to begin." Traced this to
two facts, not a bug: (1) `OnboardingScreen` has no onboarding-specific logic at all — chip taps just fire
a canned first message into the same general-purpose `/chat` → `ask_teaching_engine` pipeline the Chat tab
uses ([OnboardingScreen.tsx](../../app/screens/OnboardingScreen.tsx), [ChatThread.tsx](../../app/components/ChatThread.tsx));
(2) that is exactly what D-058 chose — "no structured field anywhere... conversationally, through the
chip-guided entry points" — Option C, deliberately not a structured flow. The owner's reaction was that
this shape is wrong for onboarding specifically and should be reopened.

## What's decided now

1. **Axis clarified: the objection is to conversation *flow* shape, not to structured *fields*.** D-058's
   "no structured field anywhere" holds — onboarding still never shows a form field, still captures
   everything through free text/chips. What's reopened is *flow*: instead of one wide-open free-form
   question reusing the general teaching engine, onboarding should be a **structured conversation flow** —
   defined stages/paths, with the model (not a fixed decision tree in code) reading the user's input and
   selecting which stage/path applies, repeating that at each subsequent turn until onboarding completes.
2. **Scope: onboarding only, for now.** The general Chat tab (and any other `/chat` entry point) is
   explicitly out of scope for this decision. Whether the same structured-flow approach should extend there
   is deferred, not decided — the owner asked to revisit that later, and this project's evidence-before-
   generalizing discipline (D-006, D-067 precedent) argues for letting onboarding prove the pattern first
   anyway.
3. **Fail-safe requirement, stated concretely:** a user must never reach a turn with no way forward.
   Concretely this means every AI turn in the structured flow must end in one of: (a) a clear next-step
   prompt/chip, or (b) an explicit "onboarding complete, continue to app" state — never a dead end, and
   never an unbounded loop the user can't exit. The existing "Skip for now" affordance is one instance of
   this, not the whole answer — the structured design needs its own loop/dead-end guard, see open question
   below.
4. **New repo convention adopted: per-feature subfolder for strategy + build docs together, piloted here.**
   `docs/features/<slug>/` holds a feature's PRD/design docs, its own `decisions/` (full D-0NN write-ups,
   same format as `docs/decisions/`, just relocated), and any feature-specific supporting material — built
   as the reusable, scalable model for future features the owner asked for, not a one-off for onboarding.
   `docs/BUILD_QUEUE.md` stays the single global build-task queue (READY/BLOCKED, one item per session) —
   this convention does not fork that; it only relocates strategy/design artifacts, keeping `CLAUDE.md`'s
   mandatory-reading discipline (D-081) intact. `docs/DECISION_LOG.md` keeps indexing every decision
   regardless of where its full write-up lives, exactly as it already does for `docs/decisions/`.

## The open question this decision does NOT resolve — flagged, not answered here

A structured, multi-turn conversation flow needs the backend to know **what stage/path the user is
already in** when a new turn arrives — that's what "structured" means. Right now [chat.ts](../../app/lib/chat.ts)
and [teaching.py](../../backend/app/services/teaching.py) are explicit that there is **no conversation
memory of any kind** — "each call is independent, carrying only the current question" (D-022's standing
implementation). `PROJECT_SPEC.md` §8 already has conversation memory PARKED under D-022: it fired the
hard scope trigger *and* a data-retention trigger, and is explicitly gated on "Revisit only after Phase 1
is validated AND the D-010 data privacy policy settles retention/deletion" — and D-010 is still unwritten.

This does not automatically block the structured-flow idea — there is a real, narrower design available
(tracking only a small structured stage/path indicator per turn, not storing dialogue transcripts or
history) that may not trigger the same retention/privacy shape D-022 was parked for. But that is a design
judgment call with real stakes (it is, functionally, a new piece of state persisted about the user), not
something to wave through inside this decision. **The PRD in `docs/features/onboarding/PRD.md` opens with
this fork and does not proceed past it without the owner's explicit call.**

## Reversibility

High — no code changes yet. The subfolder convention is pure file organization; the structured-flow design
itself is unbuilt.

**Date:** 05-Aug-2026
