<!-- Updated: 2026-08-12 | BQ-069 progression ledger -->

# FinTutor — Data Codemap

## Database: Supabase (Postgres). ORM: SQLAlchemy.

Schema changes use the linear Alembic chain in `backend/alembic/versions/`; current head is
`c4e71b93a5d2` (BQ-069).
No FK to a Users table (D-043). Auth is Supabase-side; the DB stores data only, keyed by `user_id UUID`.

## Tables

```
holdings
  id              UUID PK
  user_id         UUID (indexed, no FK — D-043)
  product_type    string   — one of D-013's 8 types (open string, not enum — D-044)
  alias           string   — LLM-visible name e.g. "Fund-A". UniqueConstraint(user_id, alias)
  display_name    string?  — real institution/product name. NEVER sent to LLM (D-011)
  characteristics JSONB    — per-type fields (see characteristicsSchema.ts for field definitions)
  BQ-077 reconciliation uses this existing row only: transient proposals are never stored;
                  confirmed updates row-lock and merge supplied fields without deleting unstated fields

income
  id      UUID PK
  user_id UUID (indexed)
  sources JSONB  — list of {label, amount, frequency, amount_high?}
                   amount = floor/conservative figure (used in budget math, D-073)
                   amount_high = optional typical figure (display only, not computed)

goals
  id              UUID PK
  user_id         UUID (indexed)
  target_amount   float
  target_date     date
  category        string
  funded_by       relationship via goal_fundings — owned holding links + earmarked amounts;
                  replaced atomically by PUT /goals/{id}/funding

discretionary_categories
  id              UUID PK
  user_id         UUID (indexed)
  label           string
  planned_amount  float

streak_states
  id                UUID PK
  user_id           UUID UniqueConstraint  — one row per user
  current_streak    int
  longest_streak    int
  last_active_date  date?

onboarding_states
  id              UUID PK
  user_id         UUID UniqueConstraint  — one row per user
  track           string?  — fresh_starter | reactive_dabbler | habit_former | unclassified
  stage           string?  — intro | sequencing | mechanism | reflect | gapscan | complete
  turns_in_stage  int

onboarding_assessments
  id                        UUID PK
  user_id                   UUID indexed (no FK)
  flow_version              int; UniqueConstraint(user_id, flow_version)
  status                    in_progress | handled
  current_question          one of the five normalized axes, nullable when handled
  immediate_intent          normalized string?
  earning_context           normalized string?
  responsibility_context    normalized string?
  exposure_flags            constrained varchar[]?; only approved generic category codes
  familiarity               normalized string?
  eligibility_confirmed_at  timestamptz
  handled_at / handled_via  timestamptz? / completed | global_exit
  cleared_at                timestamptz?
  created_at / updated_at   timestamptz

progression_events            — append-only ledger (BQ-069, D-121)
  id               UUID PK
  user_id          UUID indexed (no FK)
  event_type       one of D-117's nine recordable events (CheckConstraint)
  subject_key      string? — repeat-limit discriminator: teaching subject, calculator
                     type, capability family, prompt/version
  occurred_at      timestamptz — true instant
  local_date       date indexed — materialized Asia/Kolkata user-day, set at write time
  idempotency_key  string; UniqueConstraint(user_id, idempotency_key)
  created_at       timestamptz
  NO points column and NO dimension column — deliberately. Both derive from the ruleset
  version at computation time (D-121's load-bearing schema decision).

progression_daily_rollups     — per-user-day aggregate; survives raw-event pruning
  id / user_id / local_date   UniqueConstraint(user_id, local_date)
  points_awarded      int
  awarded_types       JSON list — event types that awarded that day
  dimensions          JSON list
  once_keys           JSON list — once-ever keys first consumed that day
  return_day_awarded  bool
  ruleset_version     int
  events_pruned       bool — true once the day's raw events are gone; replay then
                        reuses this row instead of recomputing
  created_at / updated_at

progression_summaries         — one row per user; a cache, except the two floors
  id / user_id                UniqueConstraint(user_id)
  ruleset_version         int
  lifetime_points         int — raw replay output; never exposed to the client
  displayed_points        int — high-water mark; what the user sees
  displayed_points_floor  int — durable. Makes "progress never decreases" survive a retune
  stage / stage_floor_index   durable stage floor; a user who reached Connecting stays there
  active_dimensions       JSON list (of explore/model/reflect/return)
  return_days             int
  last_event_at / last_rebuilt_at / created_at / updated_at
```

## What goes to the LLM vs. what stays local

```
Sent to LLM (via assemble_baseline):
  holdings.alias + holdings.characteristics (never display_name — D-011)
  income.sources (label + amounts)
  goals (all fields)
  surfacing candidates (computed from holdings + known_gaps list)
  derived learning_context on ordinary chat only: explanation_style and, for a caller-supplied generic
    topic, one matching prior_exposure_to_current_topic boolean

Never sent to LLM:
  holdings.display_name  (real product/institution name — D-011)
  streak / onboarding state
  complete onboarding assessment, immediate intent, earning/responsibility context, eligibility,
    lifecycle/timestamps, unanswered/undisclosed/cleared context
  conversation history (D-022 — stateless calls; D-085 narrow exception for onboarding last AI turn)
  raw user-text institution/product names and structured identifiers (PAN/account/policy/card/email/phone):
    request-local opaque tokens only; mapping is never persisted
```

## Key invariants

- `characteristics` is free-form JSONB — the schema lives in the frontend (`characteristicsSchema.ts`),
  not in the DB. Adding a field requires no migration.
- `alias` uniqueness is enforced DB-side (UniqueConstraint + 409 on conflict).
- No financial computation happens in the DB — all math is in Python services.
- Assessment v2 has no raw-answer/dialogue column. PostgreSQL checks constrain scalar values, lifecycle
  consistency, array contents, non-empty exposure answers, and sentinel exclusivity. Legacy
  `onboarding_states` rows are not read, inferred into v2, or modified by the v2 service.
- Progression points are never stored on an event row. Replay applies the ruleset version at computation
  time, which is what makes pre-launch retuning possible at all.
- Progression dedup is a database guarantee (`UniqueConstraint(user_id, idempotency_key)`), not service
  logic. Once-ever *awards* are suppressed during replay instead, so a second event row for an
  already-earned subject is recorded honestly but earns nothing.
- Progression retention: raw events prune at 400 days; rollups and summary persist for account life;
  account deletion hard-deletes all three. The 400-day figure is only meaningful once D-010 settles backup
  retention.
