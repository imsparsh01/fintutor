# D-037 — FINDING 9 (Card-1 omission): §2 rule 2 now requires naming a materially higher-cost holding, not substituting a vaguer consideration for it
- **Tier:** 2 — REVIEW-FLAGGED. Ran the §2.1 trigger checklist rather than defaulting to a Tier-3 brief:
  trigger 2 (compliance) does not fire — D-025 already settled that naming a collateral-relevant holding
  "with its numbers, without ordering it" is required, not merely permitted (§3 rule 5's own carve-out); this
  entry clarifies reliability of an already-decided compliance-safe practice, not a new interpretation of
  where the advisory line sits. Trigger 3 fires (interprets D-015, which classifies as **product-judgment**,
  not compliance — §1.2), so per §4.3 this is Tier 2 with a mandatory REVIEW-FLAG, not Tier 3. Trigger 5
  (scope) does not fire — this clarifies an existing requirement's reach, it does not add a product type,
  screen, or capability. No other trigger fires.
- **Interprets:** D-015 — rule 2's "name every path" is settled to also cover a materially higher-cost
  holding outside the two paths the question is actually deciding between (e.g. Card-1 relative to a
  prepay-vs-invest question), not only the two named decision paths. D-015 still governs; this states what
  "every path" means in a case it did not explicitly address.
- **Decision:** §2 rule 2 gains a new paragraph: a holding whose rate or cost is clearly more urgent than
  what the question is about must be named, with its own number, even when it is not one of the two decision
  paths — and the model may not substitute a vaguer consideration (liquidity, an emergency-fund observation)
  in its place. This targets the exact pattern both FINDING 9 misses shared (v0.6: 2/5; v0.7: 1/5 — all three
  reached for emergency-fund/liquidity framing instead of Card-1, not a random omission).
- **Lenses:**
```
      Compliance      PASS      Naming a materially relevant holding without ranking it is already
                                 required by D-025/§3 rule 5's own carve-out; this doesn't move the
                                 advisory line, it makes an existing requirement's reach explicit.
      Product         CONCERN   No PRODUCT_PRINCIPLES.md principle cleanly resolves this (§3.7's
                                 "clean resolution" bar isn't met — not a Tier-1 principle
                                 application), so it's evaluated directly: reliably naming the
                                 highest-cost holding matters for "mechanism + personal context
                                 always paired," but rule 2 already technically permitted (didn't
                                 strictly require) this, so tightening it is a real behavior change.
                                 Answered by scoping the new text narrowly to "materially
                                 higher-cost" rather than "every tangentially relevant holding."
      Technical       PASS      Prompt-level text, reversible, no build complexity.
      Cost-and-Scope  CONCERN   Length is already near the 200-300 target/320 ceiling in recent
                                 runs (283-304 words); an added naming requirement could push it
                                 further. Answered by keeping the addition to one short paragraph
                                 rather than a general "always mention everything" instruction.
```
- **Why:** two CONCERNs, same direction (both about doing this narrowly rather than broadly), not opposing —
  not a deadlock per §3.4. Evidence base is real but modest (3 misses across 10 total runs, two prompt
  versions), which is why this carries a REVIEW-FLAG rather than proceeding silently: the owner should see
  this and can veto or ask for more data before it's treated as settled.
- **Reversibility:** High — prompt-level text, no data touched, easily reverted.
- **Dependency flag:** needs a re-test (queued as BQ-008) before this counts as confirmed, same discipline as
  every prior prompt fix here.
- **Date:** 02-Aug-2026
