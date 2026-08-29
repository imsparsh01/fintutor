# D-168 — A changed Scenario input immediately removes the prior result

- **Tier:** 2.
- **Decision:** Editing any dependent input immediately removes the prior numeric/component result and replaces
  it with “Inputs changed — run again to see a result for these values.” Until rerun there is no current result
  to announce, hand off or reward.
- **Lenses:** Compliance PASS — no advice/legal reinterpretation; Product PASS — visible inputs always own the
  visible result; Technical PASS — simpler and safer than retaining disabled stale controls;
  Cost-and-scope PASS — bounded in-memory component behavior.
- **Why:** A warning cannot fully neutralize a still-visible personal financial number. Immediate removal makes
  stale provenance impossible to mistake for current arithmetic.
- **Reversibility:** UI state only; no persistence or calculation change.
- **Date:** 29-Aug-2026
