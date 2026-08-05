# D-038 — Budgeting/Goals data model resolved (Decision 3): explicit thin links, computed budget, new Income object
- **Tier:** 2 — no §2.1 trigger fired (no money movement; goals/budgets are the user's own labels, not
  products, so D-009 doesn't reach them; no goals/budget data exists yet so the touched-data test keeps this
  reversible; already committed MVP scope per §4 item 5, not an increase; classifiable — same
  product/technical boundary shape as D-011/D-013). Real tradeoffs existed between candidate paths, which is
  what puts it at Tier 2 rather than Tier 1.
- **Decision:** Resolves PROJECT_SPEC.md §8 "Decision 3." Three sub-parts:
  1. **Goal→holding funding links are explicit and thin.** `Goal { target_amount, target_date, category,
     funded_by: [{holding_id, earmarked_amount}] }`. Progress is always computed live as the sum of earmarked
     holdings' current values — never duplicated onto the Goal record. Rejected: tag-based inference (breaks
     down when one holding should split across two goals — ambiguous percentage) and no structural link at
     all (guts the teaching mechanism — can't produce "this SIP is funding 60% of your house goal").
  2. **Budget is a fully computed view, not a stored object.** No "Budget" row exists in the database.
     Recurring outflows (EMI, SIP amount, insurance premium) are read live off the holding records that
     already carry those fields (D-013). Only Income (see below) and a short list of discretionary
     categories (`{label, planned_amount}`) are stored, because those have no holding to live on. Rejected:
     a stored, periodically-reconciled monthly snapshot — real product upside (enables "your budget changed
     since last month" moments) but not needed for MVP, which teaches from the live baseline and has already
     parked historical/trend recall (D-022).
  3. **Income is a new first-class object**, sibling to Holdings in the baseline: `Income { sources:
     [{label, amount, frequency}] }`. Not a live tradeoff — it's the only place income can go once it sits
     outside D-013's product taxonomy; feeds sub-part 2's computation directly.
- **Rule extracted (reusable, same shape as D-013's split-vs-merge test):** **the reference-vs-store test** —
  if a number already lives on a holding record, Goals/Budget reference it live and never duplicate it; if a
  number has no holding home (income, discretionary categories, goal targets), it is stored directly on the
  new object. This is what makes sub-parts 1 and 2 consistent with each other and converts future
  "does X get its own field or a live reference" questions from judgment into application.
- **Lenses:**
```
      Compliance      PASS      Goal/budget labels are the user's own categories, not third-party
                                 products or securities — D-009/D-010 don't reach them. No new data
                                 leaves to the LLM under a different shape than D-010 already governs.
      Product         PASS      Explicit links + live computation directly serve D-015's
                                 mechanism-plus-personal-context requirement; the rejected stored-
                                 snapshot path would add real product value (trend-teaching) but
                                 that's not an MVP capability, so choosing against it isn't a loss
                                 against anything currently promised.
      Technical       PASS      Simplest of the candidate paths in all three sub-parts — no new
                                 reconciliation object (vs. stored Budget), no ambiguous split logic
                                 (vs. tag-based goal funding).
      Cost-and-Scope  PASS      Avoids the ongoing reconciliation/sync burden a stored Budget
                                 snapshot would add, and avoids the split-logic maintenance a
                                 tag-based goal link would add.
```
  All four PASS — no CONCERN, no deadlock, nothing to answer beyond the reasoning above.
- **Why:** Path A won on all three sub-parts because it's the option that gives the teaching engine real,
  live material without adding a data object or reconciliation burden that MVP doesn't need yet. The
  alternatives weren't wrong, just paying cost for capability (historical trend-teaching) that's explicitly
  post-MVP per D-022's own logic — the same reasoning, applied to a new data shape rather than conversation
  memory.
- **Reversibility:** High right now — no goals/budget data exists yet (touched-data test, §2.2), so this is
  exactly the "schema field added before any data is captured" case the test names as reversible. This
  becomes low-reversibility the moment real user Goal/Income records are populated under this shape — build
  against it with that window in mind.
- **Feeds:** unblocks build tasks for the Income/Goal schema additions and the live budget computation logic
  (queued in `docs/BUILD_QUEUE.md`). Also partially unblocks PROJECT_SPEC.md §8 "Decision 2" (per-item
  management depth), which was waiting on this data model existing — its other dependency (a real Phase 1
  section to react to) still stands.
- **Date:** 03-Aug-2026
