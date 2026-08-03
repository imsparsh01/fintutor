# BRIEF-013 — MVP screen/navigation shape (PRD v1) for BRIEF-012's must-haves

> Turns BRIEF-012's must-have list into an actual screen/navigation structure, grounded in the real
> `app/` skeleton (BQ-014), not a fresh invention. Most of this is direct, low-risk execution of
> already-committed scope (no new decision needed). Two pieces are genuinely proposed, not decided —
> flagged clearly, not silently settled — because they're foundational and BRIEF-011 already flagged real
> stakes on both (first-session trust, and every decision-shaped teaching moment depending on one of them).
> **Date raised:** 03-Aug-2026, same session as D-053 through D-057.

---

## What exists today (checked against the real code, not assumed)

`app/navigation/`: `AuthStack` (Login/Register, Supabase-backed) → `MainTabs` (bottom tabs: Consolidated,
Investments, Loans, Insurance — all placeholder screens, BQ-014). No onboarding step between auth and the
tab shell. No Budgeting/Goals screen, despite the backend already having it (`GET /budget`, BQ-010; Goal
model, BQ-009). No conversational/teaching surface anywhere — this is the single largest gap, since nearly
every BRIEF-012 must-have needs *some* place to actually appear.

## Direct execution — no new decision, just filling already-committed scope

- **Add a Budgeting/Goals tab** to `MainTabs`. `PROJECT_SPEC.md` §4 item 5 already locks this into MVP;
  the backend (BQ-009/BQ-010) has been ready and unused since 03-Aug. This is closing an
  implementation gap, not a new scope call.
- **A lightweight, read-only holding-detail view**, reachable by tapping a holding inside its section.
  This is *not* Decision 2 (per-item management — edit/delete/recategorize authority, still explicitly
  BLOCKED in §8). It's a narrower thing: several BRIEF-012 must-haves (the reactive-dabblers explainer, the
  EPF mechanism explainer) need *somewhere* to show mechanism content about one specific holding. A
  display-only surface doesn't touch what Decision 2 is actually deciding (what actions a user may take on
  a holding) — it just needs to exist for teaching content to have a home. Judged low-risk enough to build
  directly rather than escalate, since it forecloses nothing Decision 2 still needs to settle.
- **Teaching-moment surfacing needs a real conversational/chat-style screen** — this doesn't exist in
  `app/` at all yet. All of the shared and per-profile must-haves from BRIEF-012 (EPF explainer, gap
  surfacing, sequencing explainer, reflective questions, loan-vs-invest, tax-saving, breakeven calculator,
  "number to watch") are things the AI *says* inside a conversation, not standalone screens. This is the
  real, central missing piece — everything else in this PRD is secondary to getting this surface built.

## Proposed, not decided — comparison-view pattern for decision-shaped moments

**Shape proposed:** a full-screen modal, launched from within the teaching conversation when a
decision-shaped question is detected (loan-vs-invest, tax-saving, eventually ESOP-timing) — not a
separate tab, since it's contextual to one moment, not a persistent section. Two (or three) path cards
side by side, each showing: mechanism name, the user's real numbers, the computed outcome/range, and the
breakeven or "number to watch" figure. Closes back into the conversation, no ranking anywhere in the
layout (card order is neutral — e.g. alphabetical or input order, never by computed favorability, which
would smuggle in structural ranking the same way BRIEF-002/D-028 already found once).

**Why proposed, not just built:** this is a genuinely new UI pattern, and card *order* is a real compliance
surface (an ordering choice can imply preference even with neutral content) — worth the owner's eyes before
it's built, even though it doesn't fire a hard-stop trigger on its own. Judged appropriate to propose
directly (one shape, not three paths) since the risk is low and reversible, not a full Tier-3 brief.

## Proposed, not decided — onboarding flow shape (§4 item 2's open question)

`PROJECT_SPEC.md` explicitly flags this as undesigned. Given BRIEF-011's finding that "abandoned onboarding
= no baseline = no future value" is the segment's biggest adoption cliff, and that first impressions carry
real compliance-messaging risk ("teach never advise" reading as evasive before trust exists), this is
higher-stakes than the comparison UI — presented as two real paths, not a single proposal, per the same
discipline `DECISION_PROTOCOL.md` uses when the stakes justify it.

**Path A — conversational onboarding, AI-guided from message one.** Register → straight into a chat-style
first conversation ("tell me about your income, and anything you're already managing"), profile builds
progressively as the user talks, matching D-012's philosophy most literally. Value-ratchet: after each
piece of info, the AI immediately reflects something computed back (e.g. states the take-home breakdown
the moment income is mentioned) rather than waiting for a "complete" profile. Risk: highest fidelity to
the product's core AI-surfaced philosophy, but also the least scaffolded — a user who doesn't know what to
say might stall immediately, which is exactly the campus-to-first-job profile's near-zero-urgency risk
BRIEF-010/011 already named.

**Path B — a minimal structured first step (income only) then conversational from there.** Register → one
lightweight screen asking only for income (the one number nearly every teaching moment needs) → then drops
into the same AI-guided conversation as Path A for everything else. Slightly less pure to D-012 (one
structured field exists), but guarantees every user reaches a working first value-moment (the take-home
breakdown) even if they never say another word — directly answers BRIEF-011's "app must earn value from
thin data, inside two minutes" requirement for the campus-to-first-job profile specifically.

**Not decided here.** Both are real, reversible, cheap-to-build options; the choice is a product-philosophy
call (purity to D-012 vs. guaranteed first-session value) more than a technical one — flagged for the
owner rather than picked.

---

## What only the owner needs to weigh in on

1. **Onboarding shape — Path A or B** (or a third option, if neither fits).
2. **Sanity-check on the comparison-view proposal** — flag if the neutral-ordering approach or the
   full-screen-modal shape seems wrong before it's built; otherwise treated as accepted by default since
   it was proposed as a single low-risk shape, not a fork requiring a pick.

Everything else in this brief (Budgeting/Goals tab, read-only holding detail, building the conversational
teaching surface itself) needs no owner input and can proceed directly.

## Not yet decided

The two flagged BRIEF-012 scope questions (numbers-changed nudges, and this brief's onboarding/comparison
proposals) all still need the owner's eyes. Actual screen implementation work is a build-queue item once
the onboarding shape is picked — not started as code in this brief, which stays design-only per this
session's "one question at a time, but don't stop unnecessarily" pacing.
