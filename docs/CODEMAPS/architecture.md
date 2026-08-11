<!-- Updated: 2026-08-12 | BQ-066 onboarding assessment API -->

# FinTutor — Architecture Overview

## System shape

```
Expo (React Native / Web)          FastAPI (Python)         Supabase (Postgres)
  app/                    ←─ HTTP ─→  backend/app/main.py  ←─ SQLAlchemy ─→  DB
  RootNavigator                        port 8000
```

Single-user auth: Supabase Auth (JWT). All backend endpoints take `user_id: UUID` as a
query param — no middleware auth layer yet (D-043). No Users table; holdings/income/goals
have a loose `user_id` FK by convention.

## Data flow: Chat (the core teaching loop)

```
ChatScreen / OnboardingScreen
  → POST /chat?user_id=…
      assemble_baseline()          ← holdings + income + goals + gaps from DB
      classify_deepen()            ← picks one alias to "deepen" on
      [onboarding: start_or_resume() + build_onboarding_instruction()]
      ask_teaching_engine()        ← Anthropic API call (claude-3-5-sonnet)
      classify_holding_capture()   ← detects if user mentioned a new holding
      record_turn()                ← updates OnboardingState.turns_in_stage
  ← {response, holding_proposal, onboarding_state}
ChatThread.tsx renders response; HoldingProposalCard renders proposal (D-078 Fork 2)
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
```

## Navigation structure

```
RootNavigator
  ├── NotConfiguredScreen      (Supabase not configured)
  ├── AuthStack
  │     ├── LoginScreen
  │     └── RegisterScreen
  └── AuthenticatedApp
        ├── OnboardingScreen   (first launch; marks seen → goes to MainTabs)
        └── MainTabs (bottom tabs)
              ├── Consolidated  → ConsolidatedScreen
              ├── Chat          → ChatScreen
              ├── Investments   → InvestmentsScreen
              ├── Loans         → LoansScreen
              ├── Insurance     → InsuranceScreen
              └── Budgeting     → BudgetingScreen
```

## Key design constraints (affect every build task)

- **D-009 / teach-not-advise**: app explains mechanisms, never recommends. P2 does-not-says test.
- **P10 (D-087)**: no valence colour on real financial figures. All figures render in `colors.ink`.
- **P11 (D-088)**: teaching copy uses `font.tutor` (Newsreader); UI chrome uses `font.ui` (IBM Plex).
- **D-022**: zero conversation memory per call (Anthropic stateless). D-085 narrows one exception for onboarding.
- **D-078**: holding proposals are never auto-saved; user must confirm via POST /holdings.
- **D-119**: onboarding v2 persists normalized category codes only in a separate versioned table;
  legacy four-track rows keep their original meaning. API shipped in BQ-066; frontend is BQ-067.
