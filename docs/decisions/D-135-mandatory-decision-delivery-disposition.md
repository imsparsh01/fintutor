# D-135 — Every decision requires an explicit delivery disposition

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided governance and deliberate-only operating-rule change.  

## Decision

A decision is not operationally closed merely because its reasoning is approved and indexed. Every new
decision must receive exactly one delivery disposition in `docs/DECISION_DELIVERY_TRACKER.md` in the same
session:

- `NO_BUILD` — no implementation artifact is required;
- `READY → BQ-###` — fully specified and executable;
- `BLOCKED → BQ-###` — approved delivery exists but a named prerequisite remains;
- `DEFERRED` — intentionally postponed with an explicit unpark condition;
- `SHIPPED → BQ-### / commit or artifact` — completed and verified; or
- `SUPERSEDED → D-###` — replaced by a later decision.

No decision session may close with a blank or implied disposition. Build completion, supersession, or an
unpark event updates the tracker; it does not rewrite the original decision.

The tracker is a delivery-control index, not a second decision log. Full reasoning remains append-only in
the decision file; executable detail remains in `BUILD_QUEUE.md`; completed build history remains in
`BUILD_QUEUE_ARCHIVE.md`.

## Historical reconciliation rule

The first tracker records every presently open build-relevant decision and the historical decisions known
to be intentionally deferred. Completed historical decisions remain evidenced by their BQ/artifact traces
in the decision and build archives. A future audit must treat any decision with no trace and no tracker row
as an error, never as implicitly complete.

## Why

D-128 approved five calculators, but only three became build items. Goal Affordability and Term-insurance
Coverage remained approved yet absent from the live queue. The existing decision log preserved intent and
the build queue preserved executable work, but nothing enforced the handoff between them. A mandatory
delivery disposition closes that gap without turning the build queue into a mixture of decisions, research,
legal gates, and executable tasks.

## Rule extraction

“Decided” and “delivered” are separate states. Every decision must name its delivery state before the
session closes, and every non-terminal state must name either a queue item or a measurable unpark condition.
