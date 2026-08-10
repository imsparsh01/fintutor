# D-091 — The "what we won't say" block is adopted as a standing UI pattern

- **Tier:** 3 — owner-decided directly in conversation. Trigger 2 (legal/regulatory: this is
  compliance-messaging, it changes how the advice line is communicated to the user) and trigger 3
  (interprets P2, a Compliance-category principle — Tier 3 only, no exceptions).
- **Date:** 10-Aug-2026

## Decision

Adopted **as drawn**, without rewording. Wherever a verdict is the natural next thought, the interface
carries an explicit block naming the verdict FinTutor is declining to give, plus what it will do instead.

The three instances in the mockups, adopted verbatim in shape:

- **Holding detail** — "Whether to keep it, surrender it, or make it paid-up. We'll show what each of those
  does to your numbers, in the same detail, whenever you ask."
- **80C room** — "Which instrument to fill it with, or whether to fill it at all." Paired with the line
  that does the real work: *"Room isn't an instruction."*
- **ESOP exercise cost** — names the missing input precisely: "A view on whether the company's value
  holds. Nothing here estimates that."

## Why the owner chose "as drawn" over rewording per-context

The alternative on the table was to keep the pattern but vary the wording so it would not read as repeated
boilerplate. It was rejected: consistency is the point. A block that reads the same way every time is
recognisable as a standing property of the product rather than a caveat attached to one awkward answer.
Varying it per surface would make each instance read as a bespoke hedge about *that* topic — which is
closer to the evasiveness this pattern exists to prevent.

## What it is answering

BRIEF-010's business lens named the risk directly: **neutrality reads as evasive.** Silence where a user
expects a verdict is indistinguishable, from the user's side, from the app having no answer. This block
converts silence into a stated, bounded position — the app is not failing to answer, it is declining a
specific question and saying what it will answer instead. It is the difference between a gap and a policy.

## The load-bearing constraint

The wording matters more than the placement, which is why this is Tier 3 and not a styling call. Each
instance must:

1. **Name the specific verdict** being declined, concretely — not gesture at "we don't give advice."
2. **State what the app will do instead**, as a real offer the user can act on immediately.
3. **Never apologise** for the silence, and never imply the answer exists and is being withheld for legal
   reasons. The refusal is a property of what FinTutor *is*, not a limitation it is working around.

Point 3 is the one most easily lost in a future rewrite: "we can't tell you that" and "that's not a
question we answer" read very differently to a user deciding whether the product is useful.

## Paths considered

- **A — adopt as drawn.** *Chosen.* Maximum consistency; the pattern becomes a recognisable product
  property.
- **B — adopt, reword per context.** Rejected: per-instance wording reads as a bespoke hedge and reopens
  the compliance-wording question at every new surface.
- **C — reject; rely on the model's existing refusal behaviour.** Rejected: leaves the boundary invisible
  wherever the user did not explicitly ask for a verdict, which is precisely the holding-detail and
  computed-figure surfaces where the expectation is strongest and no question was asked at all.

## Relationship to D-092

D-092 (the same session) *declines* the analogous meta-statement in the comparison flow. The two are
consistent: this pattern appears where the user is looking at **their own figure** and a verdict is the
natural next thought unprompted. D-092's case is one where the neutral structure is already visible on
screen and narrating it adds nothing.

## Reversibility

High — UI copy. No data, schema, or contract touched. Note the compliance-category caveat: reversing it is
also a Tier-3 decision, not a Tier-1 copy edit.
