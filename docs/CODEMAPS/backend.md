<!-- Updated: 2026-08-12 | BQ-069 progression ledger -->

# FinTutor — Backend Codemap

## Entry point: `backend/app/main.py` (380 lines)
All routes live here. No router modules — single-file FastAPI app.

`authenticated_ownership` protects every user-data route. It validates the bearer token through
`app/auth.py` and injects the verified Supabase subject as `user_id`; a query-string UUID is discarded.
Only health and API-schema documentation routes are public.

## API Routes

```
GET  /health                    → {"status": "ok"}
GET  /health/db                 → SQLAlchemy probe; 503 if DATABASE_URL unset

GET  /holdings                  → list_holdings(db, user_id)
GET  /holdings/{id}             → get_holding(db, user_id, id)
POST /holdings                  → create_holding(…, characteristics: dict)
PATCH /holdings/{id}            → update_holding(…)
DELETE /holdings/{id}           → delete_holding(…)
POST /holding-reconciliation/resolve → validate owned target/new choice; authoritative transient diff
POST /holding-reconciliation/apply   → row-lock, stale recheck, merge shown fields or create new

GET  /income                    → list_income(db, user_id)
POST /income                    → create_income(db, user_id, sources: list)
PUT  /income/{id}               → update_income(…)

GET  /discretionary-categories  → list_discretionary_categories(…)
POST /discretionary-categories  → create_discretionary_category(…)

GET  /goals                     → list_goals(db, user_id)
POST /goals                     → create_goal(…, funded_by: list[{holding_id, earmarked}])
PUT  /goals/{id}/funding        → replace owned funded_by links; empty list allowed

GET  /consolidated              → compute_consolidated(db, user_id)
GET  /budget                    → compute_budget(db, user_id)
GET  /surfacing-candidates      → compute_surfacing_candidates(db, user_id)
GET  /loan-vs-invest            → compute_loan_vs_invest(…, prepay_amount)
GET  /esop-exercise-cost        → compute_esop_exercise_cost(…)
GET  /tax-saving-room           → compute_tax_saving_room(…, tax_regime)

GET  /streak                    → get_streak(db, user_id)
POST /streak/open               → record_app_open(…) + evaluate_reward(is_new_day)

GET  /onboarding-assessment             → read v2 state; 404 without creating
POST /onboarding-assessment/start       → strict 18+ acknowledgement; idempotent start/resume
POST /onboarding-assessment/answer      → normalized ordered answer
POST /onboarding-assessment/skip        → normalized undisclosed + one-step advance
POST /onboarding-assessment/handle      → global exit; fill unknowns neutrally
PUT  /onboarding-assessment/context/{q} → post-handle normalized context correction
POST /onboarding-assessment/clear       → clear context without reopening/completion loss

GET  /progression               → summary + authoritative current-stage progress bounds;
                                  synthesizes a zero Discovering state if no row
GET  /progression/history       → awarded-only user event records, newest first
POST /progression/event         → record_event; body {event_type, subject_key?, idempotency_key?}
                                  occurred_at is NOT accepted from the client — server clock only,
                                  or a caller could backdate across the day boundary for a fresh cap
                                  Calculator/scenario callers may include matching capability_family;
                                  the route accepts the completion before awarding first capability use
DELETE /progression             → hard delete across all three tiers (account deletion)

POST /chat                      → assemble_baseline → ask_teaching_engine → classify_holding_capture
                                  body: {question, deepen_alias?, onboarding?, onboarding_track_hint?,
                                         onboarding_last_ai_message?, learning_topic?}
                                  ordinary chat may add derived `learning_context`; legacy onboarding never does
```

## Services → what each computes

```
services/baseline.py (75)       assemble_baseline() — merges holdings+income+goals+surfacing into
                                 the dict injected into the teaching prompt. Central to every /chat call.
services/budget.py (~110)       compute_budget() — normalises recurring income/EMI/SIP/premium to monthly;
                                 returns provenance rows. Outflows require an explicit recognised frequency;
                                 income currently falls back to monthly for blank/unknown cadence (a confirmed,
                                 owner-gated defect). D-112 adds six-month premium variants at amount ÷ 6.
services/consolidated.py (99)   compute_consolidated() — per-family totals with valuation metadata:
                                 holding/valued/excluded/status per family so client never infers from 0.
services/holdings.py (137)      CRUD + serialisation. alias auto-generated (D-074) if not provided.
services/income.py (44)         CRUD for income sources (floor + optional amount_high, D-073).
services/goals.py               Create/list + owned earmarked_amount link replacement.
services/onboarding.py (242)    start_or_resume() / record_turn() / build_onboarding_instruction()
                                 Track: fresh_starter | reactive_dabbler | habit_former | unclassified
                                 Stage: intro → sequencing → mechanism → reflect → gapscan → complete
services/onboarding_assessment.py
                                 Versioned v2 assessment state: start/get, ordered normalized answer/skip,
                                 global handle, clear-context, idempotent retry, row locking/concurrent start.
                                 API-safe response projection, post-handle correction, and minimum derived
                                 Arya presentation context. No raw text and no legacy-track inference.
services/progression_ruleset.py D-117's ruleset v1 as versioned constants: ten event rules (points,
                                 dimension, repeat limits), the 60/day repeatable cap, the fixed
                                 Asia/Kolkata day boundary, five stage floors, Expanding milestones.
                                 Nothing here is ever written to a row. To retune, add a version.
services/progression.py         record_event() / rebuild() / prune_raw_events() / delete_progression().
                                 rebuild() is the replay engine: deterministic and idempotent, replays
                                 the whole ledger, never reads the wall clock (all windows come from
                                 local_date). Frozen days (events_pruned) are reused as stored rather
                                 than recomputed. meaningful_return_day is DERIVED during replay, not
                                 recordable by a caller. grant_onboarding_credit() is the only
                                 historical backfill D-121 authorises.
                                 BQ-071 emitters: record_arya_exchange() / record_context_prompt() /
                                 record_onboarding_handled(), each wrapped in @_never_raises so an
                                 emitter failure can never break the route that called it. Call them
                                 only AFTER the host request's own writes have committed — the guard
                                 rolls back, and it must have nothing of the caller's left to undo.
services/teaching.py (48)       ask_teaching_engine() — single Anthropic API call (claude-sonnet-5;
                                 the Haiku-side classifiers use claude-haiku-4-5-20251001).
                                 Raises TeachingEngineNotConfigured if ANTHROPIC_API_KEY unset.
                                 Runtime D-119 addendum limits `learning_context` to presentation only.
services/holding_capture_classifier.py  classify_holding_capture() — Haiku extracts product type +
                                 supplied characteristics from locally display-name-redacted text;
                                 never selects a record and never writes.
services/holding_reconciliation.py  Deterministic same-type candidate resolution, user-facing field diff,
                                 owned-target validation, row-locked stale check, confirmed merge/create.
                                 Proposals are transient; no history/proposal table.
services/privacy_masking.py      Random-nonce request envelope across question/prior context/full baseline
                                 and every model call. Masks local identities/UUID refs/goal labels, Indian
                                 institution dictionary, PAN/account/policy/card/email/phone/UPI/CIF/customer
                                 ID/Aadhaar-like shapes. One-pass restoration rejects unknown/partial tokens.
                                 Open-world limit: generic phrases deliberately pass; reviewed names mask,
                                 and name-shaped unknown institutions fail closed, but the local dictionary
                                 requires ongoing review because no finite list can enumerate every brand.
services/holding_fields.py       Shared reconciliation product/characteristic allowlist + scalar validation.
services/deepen_classifier.py (59)   classify_deepen() — picks alias from baseline to surface in depth.
services/surfacing.py (44)      compute_surfacing_candidates() — known_gaps list for /chat baseline.
services/rewards.py (22)        evaluate_reward(is_new_day) — returns reward signal on new-day open.
services/streaks.py (58)        record_app_open() / get_streak().
services/loan_vs_invest.py (102) Math: prepayment vs invest decision; uses hurdle rate (D-014).
services/esop_exercise_cost.py (115) ESOP exercise cost computation (D-066).
services/tax_saving_room.py (~60) 80C room left under old/new regime (D-016). No NPS/80CCD handling
                                  exists — D-070's formula is ppf_epf annual_contribution plus annualised
                                  insurance premiums only. D-112 strict cadence:
                                  blank/unknown premium frequency excluded; six-month variants count ×2/year.
services/baseline.py (75)       Assembles prompt context dict (holdings, income, goals, gaps, deepen).
services/discretionary_categories.py (32) CRUD for user-labelled discretionary spend buckets.
```

## DB Models (all in `backend/app/models/`)

```
Holding           holdings table    — product_type, alias, display_name, characteristics (JSONB)
                                      UniqueConstraint(user_id, alias)
Income            income table      — sources (JSONB list of {label, amount, frequency, amount_high?})
Goal              goals table       — target_amount, target_date, category, funded_by (JSONB)
DiscretionaryCategory               — label, planned_amount
StreakState       streak_states     — current_streak, longest_streak, last_active_date
OnboardingState   onboarding_states — track, stage, turns_in_stage (one row per user)
OnboardingAssessment onboarding_assessments — versioned normalized five-axis context, structural
                                      question/status state, eligibility/handled/clear timestamps
ProgressionEvent     progression_events — append-only ledger; no points/dimension columns
                                      UniqueConstraint(user_id, idempotency_key)
ProgressionDailyRollup progression_daily_rollups — per-user-day aggregate; frozen record once pruned
ProgressionSummary   progression_summaries — current state + the durable monotonicity floors
```

No FK to a Users table (D-043 — Supabase auth handles identity; the DB is data-only).

## Config / infra

```
backend/app/core/config.py (15)  Reads DATABASE_URL, ANTHROPIC_API_KEY from env.
backend/app/db/session.py (27)   SQLAlchemy engine + session factory + Base.
backend/alembic/                 Linear Postgres migration chain; BQ-069 head is `c4e71b93a5d2`.
backend/app/main.py:53           CORSMiddleware — localhost only (D-095, dev-only, tighten before deploy).
```
