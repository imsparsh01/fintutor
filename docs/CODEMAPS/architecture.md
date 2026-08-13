<!-- Updated: 2026-08-12 | BQ-069 progression ledger -->

# FinTutor — Architecture Overview

## System shape

```
Expo (React Native / Web)          FastAPI (Python)         Supabase (Postgres)
  app/                    ←─ HTTP ─→  backend/app/main.py  ←─ SQLAlchemy ─→  DB
  RootNavigator                        port 8000
```

Authentication: Supabase Auth (JWT). The app attaches its current access token to every protected
request. D-137/BQ-089 middleware validates it through Supabase Auth and replaces any incoming `user_id`
with the verified token subject before route parsing; callers cannot select ownership. Health/schema
documentation routes contain no user data and remain public. No local Users table; owned records retain
their Supabase subject UUID as `user_id`.

## Data flow: Chat (the core teaching loop)

```
ChatScreen / OnboardingScreen
  → POST /chat?user_id=…
      assemble_baseline()          ← holdings + income + goals + gaps from DB
      classify_deepen()            ← picks one alias to "deepen" on
      [onboarding: start_or_resume() + build_onboarding_instruction()]
      ask_teaching_engine()        ← Anthropic API call (claude-3-5-sonnet)
      classify_holding_capture()   ← extracts type/fields from locally name-redacted text
      build_reconciliation_proposal() ← backend selects zero/one/many owned candidates
      record_turn()                ← updates OnboardingState.turns_in_stage
  ← {response, transient holding_proposal, onboarding_state}
ChatThread renders the response; HoldingProposalCard resolves ambiguity and shows the field diff.
Explicit apply re-locks the owned row and merges only confirmed fields; stale fields return a refreshed diff.

Before every model call in `/chat`, one random-nonce `PrivacyEnvelope` converts the question, prior AI
context, complete baseline identities/references/goal labels, locally-known Indian institutions, and structured
identifiers to collision-safe request-local tokens. All Haiku/Sonnet calls share that envelope. Output restores
known complete tokens in one pass; injected, unknown, old-namespace, malformed, or partial tokens fail closed.
```

## Data flow: Onboarding assessment v2

```
Onboarding v2 UI (BQ-067)
  → dedicated /onboarding-assessment/* normalized actions
      onboarding_assessment service → onboarding_assessments table
  ← minimal structural state + normalized answers

No baseline assembly, model call, deepen/capture classifier, Portfolio Health math, or legacy-track
transition runs on these routes. Ordinary /chat may receive only derived presentation style and one
topic-matched prior-exposure boolean; never the full assessment.

BQ-068 adds a presence-only compatibility read against `onboarding_states`. Any legacy row grandfathers
app access across devices without exposing, translating, or changing its old track. Legacy users can opt
into v2 from one dismissible Home invitation; an interrupted v2 row then resumes normally.
```

## Data flow: Learning progression (BQ-069)

```
caller → POST /progression/event {event_type, subject_key?, idempotency_key?}
    progression_events        ← append-only; INSERT deduped by DB unique constraint
    rebuild()                 ← replays the WHOLE ledger under ruleset v1
        per-day: repeat limits → 60-point daily cap → derived return day
    progression_daily_rollups ← upserted per active day
    progression_summaries     ← stage, displayed points, durable floors
  ← {recorded, summary}

Points live in progression_ruleset.py, never on an event row. Replay never reads the wall
clock — every window comes from the event's materialized Asia/Kolkata `local_date`.
BQ-069 built this ledger backend-only. BQ-071 then added the emitters — record_context_prompt /
record_onboarding_handled / record_arya_exchange, called from main.py after the host request's own
writes commit — and BQ-070 added the reading surfaces (ProgressScreen, plus Consolidated, Calculator
and Scenario). The loop is closed end to end.
```

## Navigation structure

```
RootNavigator
  ├── NotConfiguredScreen      (Supabase not configured)
  ├── AuthStack
  │     ├── LoginScreen
  │     └── RegisterScreen
  └── AuthenticatedApp
        ├── OnboardingScreen   (v2 server state; five optional normalized questions)
        └── MainTabs (bottom tabs)
              │  -- 5 visible tabs (D-106) --
              ├── Consolidated  → ConsolidatedScreen   (tabBarLabel "Home")
              ├── Portfolio     → PortfolioScreen
              ├── Goals         → GoalsScreen
              ├── Tools         → ToolsScreen
              ├── Chat          → ChatScreen
              │  -- hidden routes (tabBarButton: () => null), reachable via navigate() --
              ├── Calculator    → CalculatorScreen
              ├── Scenario      → ScenarioScreen
              ├── Investments   → InvestmentsScreen
              ├── Loans         → LoansScreen
              ├── Insurance     → InsuranceScreen
              ├── Budgeting     → BudgetingScreen
              ├── HealthScore   → HealthScoreScreen
              ├── Progress      → ProgressScreen
              └── Assessment    → VoluntaryAssessmentScreen (legacy opt-in route)

Investments / Loans / Insurance each own a local Stack: List → Detail (HoldingDetailScreen).
HoldingDetailScreen is therefore NOT a MainTabs route — reach it by pushing "Detail" from a family screen.
```

## Key design constraints (affect every build task)

- **D-009 / teach-not-advise**: app explains mechanisms, never recommends. P2 does-not-says test.
- **P10 (D-087)**: no valence colour on real financial figures. All figures render in `colors.ink`.
- **P11 (D-088)**: teaching copy uses `font.tutor` (Newsreader); UI chrome uses `font.ui` (IBM Plex).
- **D-022**: zero conversation memory per call (Anthropic stateless). D-085 narrows one exception for onboarding.
- **D-078**: holding proposals are never auto-saved; user must confirm via POST /holdings.
- **D-119**: onboarding v2 persists normalized category codes only in a separate versioned table;
  legacy four-track rows keep their original meaning. API shipped in BQ-066; frontend is BQ-067.
- **D-121**: progression records learning participation, never financial outcomes (D-114's Path A
  boundary). Progress never visibly decreases; stage never regresses. Consent is essential first-party
  with no toggle — the user gets visibility into their own records, not an opt-out.
