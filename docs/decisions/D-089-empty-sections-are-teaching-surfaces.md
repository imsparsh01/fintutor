# D-089 — Empty sections are teaching surfaces: what an empty family section shows

- **Tier:** 2 — owner-confirmed. **Interprets D-076/P8** (settles the question P8 deliberately left open),
  and therefore carries a mandatory REVIEW-FLAG per D-020.
- **Date:** 10-Aug-2026

## Decision

P8 committed only to *reachability* — an empty section is shown, not hidden — and explicitly declined to
design what it shows. This entry fills that gap. An empty family section displays:

1. **What lives in this section**, described as *mechanisms and categories* — never as products, never as
   named instruments. The mockup's Insurance example: two mechanisms sit under "insurance" and behave very
   differently — one buys protection only, one mixes protection with savings.
2. **An offer to walk through it** using the user's own numbers, with the commitment stated plainly
   ("takes about two minutes and commits you to nothing").
3. **A manual add path**, present and visibly secondary (P1, D-074).

What it must never show: a product recommendation, a named instrument, a "get started by buying…" prompt,
or any framing that treats the absence of a holding as a deficiency to be corrected.

## Why this is an interpretation and not a fresh principle

P8's scope note says its silence on empty-state design was deliberate, pending "a real screen decision."
This is that decision, and it resolves in the direction P8 already leaned: a section with nothing in it is
the single highest-intent teaching moment in the app — the user has navigated to a category they know they
do not have. Treating that as a dead end wastes the clearest signal of curiosity the product ever gets.

The load-bearing constraint is the categories-never-products line. An empty section is precisely where a
conventional finance app would place a recommendation, and D-009's no-product-names stance plus P2 make
that forbidden. Stating the constraint inside the empty-state pattern keeps a future implementer from
reading "teaching surface" as licence to merchandise.

## Boundary against P9

The walk-through offered here is an *offer*, declinable, and declining costs the user nothing and unlocks
nothing. It is not a prerequisite for anything, and no content elsewhere becomes available by completing
it. See D-090, which draws the same guard for the full-screen walkthrough format.

## Lenses

- **Compliance — PASS**, conditional on the categories-never-products constraint, which is stated as part
  of the decision rather than left as guidance.
- **Product — PASS.** Converts the emptiest surface into the product's core activity.
- **Technical — PASS.** Static content per family; no new machinery.
- **Cost-and-Scope — PASS.** Screens already exist and already render an empty state; this changes what
  that state contains.

## Reversibility

High — screen content, no data or contract touched.
