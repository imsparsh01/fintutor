# D-058 — Onboarding shape resolved: ungated, chip-guided conversation as the default landing screen, fully skippable

- **Tier:** owner-decided directly in conversation, resolving BRIEF-013's onboarding fork. No hard-stop
  trigger fires — this reinforces P1/D-012 (zero-friction, AI-surfaced, no structured field) rather than
  contradicting a standing principle, and onboarding is already-committed MVP scope (`PROJECT_SPEC.md` §4
  item 2); this decision only settles its shape.
- **Decision, in two parts:**
  1. **Gating: ungated, with a specific shape — not the plain "land straight in the app" framing first
     proposed.** The chip-guided conversation (Option C from BRIEF-013: tappable conversation starters,
     no structured field anywhere — e.g. "I just started earning" / "I have a loan/EMI" / "I already
     track my budget" / "Something else") is the **default landing screen** immediately after
     registration — most users see it first. But it is **not a gate**: a visible "skip for now" affordance
     lets any user go straight to `MainTabs` without completing or even starting the conversation, and the
     conversation stays available to resume later, not a one-time-only prompt.
  2. **First-message shape: Option C only**, not Option B. No structured income field anywhere in the
     flow — income and everything else gets captured conversationally, through the chip-guided entry
     points, same as the rest of the app's AI-surfaced capture philosophy.
- **Why this isn't quite either original path:** BRIEF-013 framed gating and first-message-shape as two
  independent axes and proposed A/B for the second. The owner's actual call is a third combination —
  chip-guided (C) as the *default* experience (so it isn't buried or opt-in), paired with an explicit skip
  path (so it isn't a hard gate either) — deliberately removing the friction of "must fill something in
  before using the app" while still giving every user the guided entry point BRIEF-010 found fresh
  starters specifically need.
- **What this resolves from BRIEF-013:** both open onboarding questions (gating, first-message shape) are
  now settled. The comparison-view modal proposal from the same brief is unaffected and still stands as
  proposed (accepted by default unless flagged).
- **Left to normal build-time execution, not escalated further:** exact chip copy/options, and the precise
  UI for resuming a skipped conversation later (e.g. a persistent entry point vs. a one-time re-prompt) —
  low-stakes, reversible implementation details, not decisions of this shape.
- **Reversibility:** High — a screen-flow decision, nothing built against it yet.
- **Date:** 03-Aug-2026
