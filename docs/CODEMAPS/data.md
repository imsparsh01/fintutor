<!-- Updated: 2026-08-12 | 7 model files | BQ-065 -->

# FinTutor — Data Codemap

## Database: Supabase (Postgres). ORM: SQLAlchemy.

Schema changes use the linear Alembic chain in `backend/alembic/versions/`; current head is
`b8f25a9d4c31` (BQ-065).
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
  funded_by       JSONB  — list of {holding_id: UUID, earmarked_amount: float}

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
```

## What goes to the LLM vs. what stays local

```
Sent to LLM (via assemble_baseline):
  holdings.alias + holdings.characteristics (never display_name — D-011)
  income.sources (label + amounts)
  goals (all fields)
  surfacing candidates (computed from holdings + known_gaps list)

Never sent to LLM:
  holdings.display_name  (real product/institution name — D-011)
  streak / onboarding state
  onboarding assessment by default (BQ-066 may send only the minimum relevant normalized abstraction)
  conversation history (D-022 — stateless calls; D-085 narrow exception for onboarding last AI turn)
```

## Key invariants

- `characteristics` is free-form JSONB — the schema lives in the frontend (`characteristicsSchema.ts`),
  not in the DB. Adding a field requires no migration.
- `alias` uniqueness is enforced DB-side (UniqueConstraint + 409 on conflict).
- No financial computation happens in the DB — all math is in Python services.
- Assessment v2 has no raw-answer/dialogue column. PostgreSQL checks constrain scalar values, lifecycle
  consistency, array contents, non-empty exposure answers, and sentinel exclusivity. Legacy
  `onboarding_states` rows are not read, inferred into v2, or modified by the v2 service.
