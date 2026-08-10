# D-087 — P10 added: a real financial figure is never styled by valence

- **Tier:** 2 — owner-confirmed. Sets a new principle, so it is logged as a decision, not applied silently.
- **Date:** 10-Aug-2026

## Decision

New principle **P10** in `PRODUCT_PRINCIPLES.md`:

> **P10 — A real financial figure is never styled by valence.**
> **Test:** Does this styling choice tell the user something is *true*, or something is *good*? The first
> is presentation and is permitted; the second is a verdict delivered by typography and is forbidden.

Real figures — holding values, balances, rates, EMI amounts, goal progress, budget lines — are set in one
mono face on a hairline ledger, undecorated. No green/red by direction, no up/down arrows, no coloured
progress fill, no emphasis that implies good or bad, no scoring, no mood.

## Why this needed a principle rather than a style note

Valence styling is the single most reflexive convention in consumer fintech — green gains, red losses, a
progress bar that turns amber when you are "behind." Every one of those is a verdict the app is forbidden
to deliver in words (P2), smuggled in through a channel P2's "what the output *does*, not what it says"
test was written to catch. Without P10 stated as its own test, a future screen adds a red figure and no
existing principle names the failure crisply — the reviewer has to reason from P2 each time, and
eventually someone won't.

The concrete case already in the mockups: a goal at 27% is drawn in neutral ink. It is not failing; it is
at 27%. Colouring it would be the app forming an opinion about the user's pace toward a target only the
user set.

## Relationship to existing principles

- **P2 (teach, never advise)** — P10 is P2's "does, not says" test extended into the visual channel. P2
  governs copy and structure; P10 names the styling channel explicitly so it cannot be treated as a
  neutral presentation choice.
- **P7 (engagement on behaviour only)** — P7 already forbids gamifying a real number. P10 covers the
  quieter case P7 does not: ordinary, non-game styling that still encodes a judgement. Together they close
  the surface — P7 blocks the mascot reacting to net worth, P10 blocks the net worth itself being coloured.
- **P6 (the user sees their real world)** — unaffected. P10 constrains decoration, never legibility or
  completeness. Stripping valence must not strip information.

## What it forbids

Green/red by direction or performance; arrows or trend glyphs implying good/bad; coloured or gradient
progress fills; conditional emphasis (bold/size/colour) triggered by a threshold; any "on track" /
"behind" styling; celebratory treatment attached to a figure rather than to an action the user took.

## Lenses

- **Compliance — PASS.** Strictly reduces the surface on which an implied verdict could be read. Moves in
  the safe direction; raises no new exposure.
- **Product — PASS.** Directly reinforces the product's founding commitment.
- **Technical — PASS.** Removes conditional styling logic rather than adding any.
- **Cost-and-Scope — PASS.** No scope change.

## Reversibility

High — a principle can be amended by a later decision, and no data or code contract is touched.
