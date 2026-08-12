# D-121 — Progression instrumentation, privacy, retention, and rebuild package approved

**Date:** 12-Aug-2026  
**Tier:** 3 — owner approved the recommended package directly in conversation ("1 to 5: A, A, A, A, A").  
**Implements:** D-114, D-116, D-117; unblocks BQ-069.  
**Brief:** `docs/features/progression/BRIEF-progression-instrumentation-privacy.md`

## Decision

The recommended package in the brief is approved in full. The five questions put to the owner in
`DECISIONS_FOR_YOU.md` were answered A across the board:

1. **Consent — essential first-party, no new consent surface.** The progression ledger is visible product
   function, not hidden measurement, so it is not gated behind a consent modal. Three boundaries hold it
   in place: progression data is never sold, it never reaches a third-party analytics service without a
   separate decision, and the user can always view their own records. Business measurement runs on
   internal de-identified aggregates only.
2. **Retention — 400 days for raw events**, then pruned; daily rollups and the summary persist for account
   life; account deletion hard-deletes all three tiers.
3. **Monotonicity — visible progress never decreases.** The system may retune and replay freely; the
   user-facing number is floored. Stage never regresses.
4. **Historical credit — the D-119 onboarding award only.** Nothing else is backfilled or inferred.
5. **Sequencing — decide now, build now.** D-010 (the privacy policy), when written, adopts these numbers
   rather than setting its own.

The technical judgment calls carried in the brief are approved with them: a fixed Asia/Kolkata day boundary
materialized at write time; points never stored on an event row (point values, dimension mapping, caps and
stage floors live in the ruleset version and are applied at computation time); and dedup enforced by a
database unique constraint on `(user_id, idempotency_key)` rather than by service logic.

## Approved implementation boundary

This authorises: an append-only progression event ledger, a per-user-per-day rollup, one current summary
row per user carrying `ruleset_version` and `displayed_points_floor`, the deterministic replay/rebuild
path, the 400-day prune job, hard-delete on account deletion, a user-visible progression history surface,
and the one-time grandfathered onboarding credit keyed `onboarding_handled:v{flow_version}`.

Exact table and column names, index choices, API field names, and the mechanics of the prune job are
bounded implementation details.

It does not authorise: a selective "clear my progression" control (deliberately not offered — D-119
established that clearing assessment context never removes earned progress, so progress is intentionally
sticky), per-user timezones, any third-party analytics service, financial-outcome progression, or the
progression *surfaces* and their placement — BQ-070 remains blocked on its own placement decision.

## Why

Two constraints from D-117 make the ledger forced rather than chosen: the product must be able to explain
which action moved someone's progress, and the v1 point values are an explicitly pre-launch baseline
expected to be retuned. Neither is possible if only a running total is stored. Keeping points off the
event row is what preserves replayability — storing them would freeze v1 constants into user data on day
one and convert every future tuning change into a migration.

The consent posture follows from what the data is: a scoreboard the user is actively looking at. A toggle
implies the data is non-essential when it is the feature itself, and a user who declines gets a broken
screen. The protections that do the real work here are the three boundaries above, not a modal.

The 400-day window covers a full year plus margin for year-over-year comparison, after which the detail
earns its keep less and less while the risk of holding it stays flat. Daily rollups preserve return-day
counts and dimension breadth past the prune, so the summary stays honest and rebuildable.

Historical credit beyond D-119's would mean fabricating entries in a ledger whose entire value is that it
records what actually happened — and D-119 set exactly this precedent by declining to infer assessment
answers from old tracks. The practical cost is near zero: the current user base is the founder plus test
users, which is a good argument for doing the clean thing while it is free.

## Carried forward — not resolved by this decision

- **Backup retention is still open.** A 400-day prune sitting on 90-day backups is really 490 days. D-010
  must settle the backup window and adopt 400 days as the raw-event number rather than setting a second,
  conflicting one. Until then, the number FinTutor can stand behind publicly is 400 days *plus* an
  undecided backup window. This does not block BQ-069.
- **This is a privacy-law-adjacent call.** The owner already has legal review before public launch on the
  open list. The consent posture in particular should be checked by that review rather than treated as
  settled forever.
- **IST day boundary for travelling users** — disclosed in `docs/KNOWN_LIMITATIONS.md`, not solved.

## Reversibility

Low once real users hold progression history — D-114 flagged this in its own reversibility note, and it is
why this package was Tier 3. Before real-user launch it is high: the ledger can be replayed under any
ruleset version, and pre-launch retuning is expected rather than exceptional. The `displayed_points_floor`
is what converts a post-launch retune from a user-visible clawback into a survivable change.
