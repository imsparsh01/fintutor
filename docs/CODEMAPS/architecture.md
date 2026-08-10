<!-- Generated: 2026-08-11 | Files scanned: 48 source files | Token estimate: ~400 -->

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
