# Critical brief — progression instrumentation, privacy, and rebuild package

**Status:** OPEN — blocks BQ-069, which blocks BQ-070. No other READY work exists.
**Why Tier 3:** new durable behavioral schema; retention/deletion; consent posture; and
low-reversibility once users hold progression history (D-114's own reversibility note).

## What is already settled

D-114 fixed the strategy and the Path A boundary: progress reflects learning and participation, never
financial outcomes. D-116 fixed the five stages. D-117 fixed the exact event ruleset, point values, caps,
and stage floors — and explicitly deferred storage, timestamps, day boundaries, consent, retention,
deletion, and historical recalculation to this package. D-119 approved assessment v2 storage only and
named the progression event ledger as excluded.

Two constraints from those decisions shape everything below:

- D-117: *"The app may show a progress percentage and explain which action moved it."* The product must be
  able to attribute progress to a specific action.
- D-117: *"The values above are a pre-launch v1 baseline."* QA is expected to simulate usage and retune the
  constants before launch. Retuning is only possible if progress can be recomputed.

Together these rule out storing a running total alone. The system must keep what happened, not just the
score. That is what BQ-069's "rebuildable summary" means, and it is the one part of this package that is
effectively forced rather than chosen.

## Recommended package

### 1. Ledger + derived summary, with a prunable raw tier

Three objects: an append-only event ledger, a per-user-per-day rollup, and one current summary row per
user. The summary is a cache — always reconstructible by replaying the ledger under a ruleset version.
Raw events are prunable after a retention window; rollups and summary persist for account life.

### 2. Points are never stored on an event row

An event records *that a qualifying action happened*, not what it was worth. Point values, dimension
mapping, caps, and stage floors all live in the ruleset version and are applied at computation time.
Storing points on the row freezes v1 into the data and destroys replayability — which is the entire
purpose of keeping a ledger. This is the load-bearing schema decision in this brief.

Proposed columns:

| Column | Purpose |
|---|---|
| `id` UUID PK | |
| `user_id` UUID indexed | no FK, per D-043 |
| `event_type` | one of D-117's ten eligible events |
| `subject_key` | the repeat-limit discriminator: teaching subject, calculator type, capability family, prompt/version. One normalized string serves every per-subject rule in D-117 |
| `occurred_at` timestamptz | true instant |
| `local_date` date | materialized user-day; see §3 |
| `idempotency_key` | `UniqueConstraint(user_id, idempotency_key)` |
| `created_at` timestamptz | |

`dimension` is deliberately absent — it is derivable from `event_type` via the ruleset, and storing it
would freeze a second v1 assumption into the rows.

The unique constraint is what enforces D-117's *"identical payloads, retries, refreshes, back-navigation,
and add-delete cycles do not create new events."* Dedup becomes a database guarantee rather than service
logic. It also satisfies D-119's "without allowing a duplicate award" requirement for grandfathered
onboarding credit at no extra cost — see §7.

### 3. Day boundary: fixed Asia/Kolkata, materialized at write time

D-117 depends on day semantics in eight places (the 60-point daily cap, per-type per-day limits, the
three-per-day Arya cap, one revisit award per day, meaningful return days, the 7-calendar-day revisit
window, and the rolling seven-day recap window).

Fix the boundary to Asia/Kolkata for v1 and materialize `local_date` on write. This is correct for the
entire intended audience (D-114: Indian students and early-career earners; the whole product is
India-tax-shaped), it is deterministic, and it keeps replay reproducible. Because the day is stored rather
than computed on read, moving to per-user timezones later is a forward migration, not a rewrite of history.

Accepted limitation: a user who travels or emigrates keeps IST day boundaries. Disclose in
`docs/KNOWN_LIMITATIONS.md` rather than solving now.

### 4. Consent: first-party essential, no new consent surface, no third-party vendor

The ledger is visible product function — the user sees their own progress and asks why it moved. It is not
hidden measurement, and gating it behind a consent modal would add friction to the ungated-onboarding
principle for no user benefit.

Treat it as essential first-party data covered by the D-010 privacy policy, with three boundaries:
business measurement (D-114's north-star metrics) runs on internal de-identified aggregates only; no raw
progression data leaves the system; and no third-party analytics service without a separate decision —
which D-119 already excluded.

The user gets visibility, not a toggle: they can view their own progression history and see what each
event was. Account deletion removes everything. **Selective clearing of progression is deliberately not
offered** — D-119 already established that clearing assessment context never removes earned progress, so
progress is intentionally sticky, and a "delete my achievements" control inverts that.

### 5. Retention

| Tier | Retention | Rationale |
|---|---|---|
| Raw events | 400 days, then pruned | Covers a full year plus margin; supports D7/D30 and year-over-year analysis |
| Daily rollups | Account life | One row per active day; preserves return-day counts and dimension breadth after pruning, so the summary stays honest and rebuildable |
| Summary | Account life | |
| Account deletion | Hard delete, all three tiers | Already committed in D-119 |

**Flag:** these numbers are not meaningful until backup retention is settled. A 400-day prune sitting on
90-day backups is really a 490-day retention. D-119 deferred backups and provider terms to D-010; that
deferral now has a concrete dependent number, and D-010 should adopt whatever is approved here rather than
setting a second, conflicting one.

### 6. Rebuild and version rules

Store `ruleset_version` on the summary, never on the event. A rebuild replays a user's ledger under a
named version and rewrites the summary.

Rebuild must be **deterministic and idempotent**: same events plus same version yields the same summary
every time. That forbids wall-clock reads during replay — all windows compute from `local_date`, never
from `now()`.

Two monotonicity invariants preserve D-117's *"Progress never decreases"* through a retune:

- Visible points never decrease. The summary carries a `displayed_points_floor`; a replay that produces a
  lower total leaves the displayed figure at the floor.
- Stage never regresses. A user who reached Connecting stays there.

Pre-launch, replay freely. Post-launch, a ruleset change is a new decision, and the monotonicity floor is
what makes it survivable rather than a user-visible clawback.

### 7. Historical credit: the D-119 onboarding award only, nothing inferred

Grant grandfathered users the one-time onboarding-handled credit that D-119 already committed to, keyed
`onboarding_handled:v{flow_version}` so the unique constraint prevents duplicates automatically.

Backfill nothing else. There is no historical ledger, so any other credit — inferring return days from
`streak_states.longest_streak`, or capability-first-use from existing holdings — is fabricated data
entering a ledger whose whole value is that it records what actually happened. D-119 set exactly this
precedent for assessment: *"do not infer new fields from old tracks."* The practical cost is near zero:
the current user base is the founder plus test users.

## Alternatives considered

- **Summary only, no ledger.** Smallest footprint and the smallest privacy surface. Rejected: it makes
  D-117's "explain which action moved it" impossible, forecloses the retuning D-117 explicitly anticipates,
  and leaves no way to correct a scoring bug.
- **Ledger with points stored per row.** Simpler reads, no replay engine needed. Rejected: freezes v1
  constants into user data on day one, converting every future tuning change into a migration.
- **Full raw retention forever.** Maximum analytical power. Rejected: unbounded behavioral data on a
  personal-finance app is a liability that buys little beyond what daily rollups preserve.
- **UTC day boundaries.** Simplest. Rejected: puts the boundary at 05:30 IST, splitting a late-night
  session across two days and effectively doubling that user's daily cap.
- **Per-user timezone from launch.** Most correct. Deferred: adds a column, a settings surface, and an
  unresolved question about whether changing it re-buckets history — for an audience that is currently
  entirely in one timezone.
- **Consent toggle for progression tracking.** Maximally conservative. Rejected: it implies the data is
  non-essential when it is the feature itself, and a user who declines gets a broken product surface.
- **Backfill inferred history from streaks and holdings.** More generous to existing users. Rejected:
  fabricates ledger entries and contradicts D-119's no-inference precedent.

## Sequencing question for the owner

This package sets concrete retention numbers, but D-010 (the privacy policy, still unchecked in
`PROJECT_SPEC.md` §8) is the document that publishes them. Two orders are possible: approve this now and
have D-010 adopt these numbers when written, or write D-010 first and derive these from it. The first
unblocks BQ-069 immediately and carries the risk that D-010 later forces a retention change — cheap while
no real users exist, expensive after. Recommendation is to approve now and bind D-010 to these numbers.

## What this unblocks

BQ-069 (event ledger and rebuildable summary) moves to READY. BQ-070 (progression surfaces) remains
blocked on its own placement decision but gains the data contract it was also waiting on. The READY queue
is currently empty; this is the only item standing between the project and buildable work.

## Owner response

_Pending._
