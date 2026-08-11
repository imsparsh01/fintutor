<!-- Updated: 2026-08-12 | BQ-065 onboarding assessment foundation -->

# FinTutor — Backend Codemap

## Entry point: `backend/app/main.py` (380 lines)
All routes live here. No router modules — single-file FastAPI app.

## API Routes

```
GET  /health                    → {"status": "ok"}
GET  /health/db                 → SQLAlchemy probe; 503 if DATABASE_URL unset

GET  /holdings                  → list_holdings(db, user_id)
GET  /holdings/{id}             → get_holding(db, user_id, id)
POST /holdings                  → create_holding(…, characteristics: dict)
PATCH /holdings/{id}            → update_holding(…)
DELETE /holdings/{id}           → delete_holding(…)

GET  /income                    → list_income(db, user_id)
POST /income                    → create_income(db, user_id, sources: list)
PUT  /income/{id}               → update_income(…)

GET  /discretionary-categories  → list_discretionary_categories(…)
POST /discretionary-categories  → create_discretionary_category(…)

GET  /goals                     → list_goals(db, user_id)
POST /goals                     → create_goal(…, funded_by: list[{holding_id, earmarked}])

GET  /consolidated              → compute_consolidated(db, user_id)
GET  /budget                    → compute_budget(db, user_id)
GET  /surfacing-candidates      → compute_surfacing_candidates(db, user_id)
GET  /loan-vs-invest            → compute_loan_vs_invest(…, prepay_amount)
GET  /esop-exercise-cost        → compute_esop_exercise_cost(…)
GET  /tax-saving-room           → compute_tax_saving_room(…, tax_regime)

GET  /streak                    → get_streak(db, user_id)
POST /streak/open               → record_app_open(…) + evaluate_reward(is_new_day)

POST /chat                      → assemble_baseline → ask_teaching_engine → classify_holding_capture
                                  body: {question, deepen_alias?, onboarding?, onboarding_track_hint?,
                                         onboarding_last_ai_message?}
```

## Services → what each computes

```
services/baseline.py (75)       assemble_baseline() — merges holdings+income+goals+surfacing into
                                 the dict injected into the teaching prompt. Central to every /chat call.
services/budget.py (~110)       compute_budget() — normalises recurring income/EMI/SIP/premium to monthly;
                                 returns provenance rows. Requires explicit recognised frequency on recurring
                                 items; D-112 includes six-month cadence variants at amount ÷ 6.
services/consolidated.py (99)   compute_consolidated() — per-family totals with valuation metadata:
                                 holding/valued/excluded/status per family so client never infers from 0.
services/holdings.py (137)      CRUD + serialisation. alias auto-generated (D-074) if not provided.
services/income.py (44)         CRUD for income sources (floor + optional amount_high, D-073).
services/goals.py (55)          CRUD + earmarked_amount linking to holdings.
services/onboarding.py (242)    start_or_resume() / record_turn() / build_onboarding_instruction()
                                 Track: fresh_starter | reactive_dabbler | habit_former | unclassified
                                 Stage: intro → sequencing → mechanism → reflect → gapscan → complete
services/onboarding_assessment.py
                                 Versioned v2 assessment state: start/get, ordered normalized answer/skip,
                                 global handle, clear-context, idempotent retry, row locking/concurrent start.
                                 No raw text and no legacy-track inference. API wiring is BQ-066.
services/teaching.py (48)       ask_teaching_engine() — single Anthropic API call (claude-3-5-sonnet).
                                 Raises TeachingEngineNotConfigured if ANTHROPIC_API_KEY unset.
services/holding_capture_classifier.py (139)  classify_holding_capture() — keyword-match heuristic;
                                 returns {product_type, alias, characteristics} proposal or None.
services/deepen_classifier.py (59)   classify_deepen() — picks alias from baseline to surface in depth.
services/surfacing.py (44)      compute_surfacing_candidates() — known_gaps list for /chat baseline.
services/rewards.py (22)        evaluate_reward(is_new_day) — returns reward signal on new-day open.
services/streaks.py (58)        record_app_open() / get_streak().
services/loan_vs_invest.py (102) Math: prepayment vs invest decision; uses hurdle rate (D-014).
services/esop_exercise_cost.py (115) ESOP exercise cost computation (D-066).
services/tax_saving_room.py (~60) 80C/NPS room left under old/new regime (D-016). D-112 strict cadence:
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
```

No FK to a Users table (D-043 — Supabase auth handles identity; the DB is data-only).

## Config / infra

```
backend/app/core/config.py (15)  Reads DATABASE_URL, ANTHROPIC_API_KEY from env.
backend/app/db/session.py (27)   SQLAlchemy engine + session factory + Base.
backend/alembic/                 Linear Postgres migration chain; BQ-065 head is `b8f25a9d4c31`.
backend/app/main.py:53           CORSMiddleware — localhost only (D-095, dev-only, tighten before deploy).
```
