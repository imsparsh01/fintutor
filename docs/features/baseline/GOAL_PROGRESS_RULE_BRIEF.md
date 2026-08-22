# Goal progress rule brief

## Decision still required

For each goal, how should live holding value be capped and allocated when one holding links to multiple goals,
linked earmarks exceed current value, or valuation is unknown?

## Shared invariants

- Only a recognized, finite, non-negative current-value field may contribute.
- Loans and insurance cover are not available funding value.
- Unknown valuation is never coerced to zero.
- Links do not move, lock or reserve money.
- The UI must expose source value, earmark, applied value and exclusion/unknown reason.

## Paths

### Path A: independent goal caps

Each goal receives `min(link earmark, current holding value)` independently. Easy to explain per goal, but the
same holding value can be counted in multiple goals and total displayed progress can exceed owned value.

### Path B: shared proportional allocation

Across all goals linked to a holding, use at most its current value. When total earmarks exceed value, scale each
goal's applied amount proportionally to its earmark. Unknown value makes that holding contribution unknown for
every linked goal. Prevents double counting but creates cross-goal coupling when value or another link changes.

### Path C: exclusive user allocation

At write time, prevent total earmarks across goals from exceeding current recognized value. If value later falls,
scale existing links proportionally until the user revises them. Unknown-value holdings cannot contribute to a
progress figure but may remain linked as an unmeasured plan. Strongest user control, highest correction friction.

## What only the owner can judge

Whether goal progress should favour independent planning flexibility, system-wide no-double-counting, or strict
user-owned allocation. This is money logic; no path is authorised by D-149's live-value direction alone.
