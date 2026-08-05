# D-043 — Income/Goal schema built with loose UUID references, no FK, to not-yet-built tables (owner-confirmed)
- **Tier:** 1 — bounded technical implementation detail surfaced mid-session, contained entirely within
  this session, no money-logic or teach-not-advise line touched, no MVP scope change, fully reversible (a
  later migration can add the real FK once the referenced table exists). Classifiable as the same shape as
  prior technical-implementation calls (D-041). Asked the owner directly rather than silently picking,
  since two live candidates existed (loose reference vs. build a stub table now) and it directly shaped
  `Goal.funded_by`'s implementation.
- **Decision:** Executing BQ-009 surfaced that `docs/BUILD_QUEUE.md` queued "Income and Goal, sibling to
  Holdings" while no Holdings table exists anywhere in the codebase (`backend/app/models/` was empty
  entering this session) — `Goal.funded_by`'s `holding_id` had nothing to reference. Owner chose: store
  `holding_id` (on the new `GoalFunding` table) as a plain `UUID` column with no foreign-key constraint,
  deferring the real FK to whichever future BQ item builds Holdings. Applied the same resolution to
  `user_id` on both `Income` and `Goal` (no Users table exists either — Supabase Auth owns that identity,
  not a local model).
- **Why:** keeps BQ-009 scoped to exactly what it named (Income + Goal) rather than silently pulling
  Holdings-stub work into a session that wasn't queued for it; the loose reference is cheap to tighten
  later and costs nothing today since no real holding/user rows exist yet to violate a future constraint.
- **Reversibility:** High — adding a real FK later is an additive migration, not a breaking one, as long as
  existing `holding_id`/`user_id` values are valid UUIDs (guaranteed by construction).
- **Date:** 03-Aug-2026
