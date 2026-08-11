# FinTutor — Decision Log

> One entry per meaningful decision. Format: what / why / reversibility / date.
> Rule: a decision isn't real until it's here. Don't reopen a logged decision without new information.
>
> **Format (all entries, D-081 onward — D-046 started this for new decisions, D-081 applied it
> retroactively to every entry):** each entry is a short index — title, one teaser line quoted from the
> decision's own text (not paraphrased), a pointer to the full write-up in `docs/decisions/D-0NN-slug.md`,
> and the date. Full reasoning, lens tables, and paths-modeled detail live in that file, not here.
>
> **Rolling window (D-081):** this file holds only the most recent ~20 decisions. Once a session's new
> entries push the count past that, move the OLDEST entries (down to ~15) into
> `docs/DECISION_LOG_ARCHIVE.md` verbatim, in the same condensed form — pure relocation, never a rewrite.
> This is a per-session-close habit now (see `CLAUDE.md`'s checklist), not a one-time cleanup. To look up
> an older decision by ID, grep `docs/DECISION_LOG_ARCHIVE.md` or `docs/decisions/` directly rather than
> reading either file wholesale.

---

### D-095 — Local web-preview infrastructure to verify the D-094 rebuild (CORS + dev bypass)
- **Tier:** mixed. The CORS backend change was explicitly owner-approved in conversation; the frontend dev
  aids are Tier-1 dev-infrastructure, env-gated and inert in a real build. Added FastAPI `CORSMiddleware`
  (localhost origins only) so the browser preview can reach the backend; fixed `EXPO_PUBLIC_BACKEND_URL`
  (blank → `http://localhost:8000`, the cause of the "Unexpected token '<'" errors — empty string defeated
  the `??` fallback); added an env-gated dev auth bypass (`EXPO_PUBLIC_DEV_USER_ID`) + `displayName` so the
  preview renders inner screens without a password. **Cleanup owed before any non-dev deploy:** tighten CORS
  to real origins, leave the dev env vars unset (real login flow is unchanged and default). Full write-up:
  `docs/decisions/D-095-local-preview-infrastructure.md`.
- **Date:** 10-Aug-2026

### D-094 — Full mockup-match rebuild authorised: scope expanded beyond D-093's reskin-only grant
- **Tier:** 3, owner-decided directly in conversation. **Extends D-093.** Authorises bringing the running
  app into line with the v1 mockups across visual style AND workflow — not just the reskin of existing
  screens D-093 permitted. Owner now owns the boundary crossings D-093 reserved: new dependencies
  (`expo-font` + the drawn Google Fonts, `react-native-reanimated`), new screens/flows (onboarding chip
  conversation, wired teaching walkthrough, engagement surfaces), and workflow changes to match Flows
  01–07. **Still NOT authorised, flagged not absorbed:** backend/schema changes (hard stop, unchanged); the
  reconciliation UI (no mockup drawn — cannot build what isn't designed); BQ-052's Tier-3 ESOP-block
  wording (owner still owes it, agents leave existing wording untouched). Concern recorded: authorised off
  a desktop RN-Web preview that is not the real mobile target, with drawn fonts not yet installed — owner
  chose full rebuild over diagnosing first, knowingly. Full write-up:
  `docs/decisions/D-094-full-mockup-match-rebuild-authorised.md`.
- **Date:** 10-Aug-2026

### D-106 — Feature expansion sub-decisions round 2: 5-tab nav, Health Score formula, scenario priority, portfolio overlap approach
- **Tier:** Mixed. Nav = 5 tabs (Home · Portfolio · Goals · Tools · Chat) — existing Invest/Loans/Insure/Budget tabs become stack screens accessible from Portfolio tab. Health Score formula approved: 4 sub-scores averaged (Investment rate, Insurance, Emergency buffer, Tax utilisation) with coverage-breadth framing. Scenario batch 1 = S-05/03/06/07; S-01 uses user-set corpus target; S-04 parked (schema change). Portfolio overlap = Category concentration indicator (no scheme data, no external API). Full write-up: `docs/decisions/D-106-feature-expansion-sub-decisions-round2.md`.
- **Date:** 11-Aug-2026

### D-105 — Feature expansion sub-decisions round 1: Arya persona, calculator batch 1, tax approval, Health Score display
- **Tier:** Mixed (3 for persona/P2 ruling; 1 for calculator priority; hard stop resolved for C-16/C-23). Persona = "Arya" (replaces Ankur). Calculator batch 1: SIP goal planner, Home loan EMI, Inflation impact, Step-up SIP, CAGR backward (C-04/10/17/22/24). C-16 income tax + C-23 HRA both approved as mechanism comparisons with D-091 "what we won't say" framing. Health Score display = single 0-100 (NW-style); "scoring formula still TBD in next decision." Full write-up: `docs/decisions/D-105-feature-expansion-sub-decisions-round1.md`.
- **Date:** 11-Aug-2026

### D-104 — Competitive feature expansion: scope confirmed from Richify + Novelty Wealth analysis
- **Tier:** 3, owner-decided directly in conversation. Eight MVP feature areas confirmed (Financial Health Score, named persona, scenarios, 21 new calculators, portfolio overlap, Portfolio screen restructure, Goals screen restructure, Home restructure). Account Aggregator explicitly post-MVP. Mascot/Ankur removal confirmed → BQ-053 READY. "Nothing builds until each area's blocking sub-decision is logged — see BUILD_QUEUE BLOCKED." Full write-up: `docs/decisions/D-104-competitive-scope-confirmed.md`.
- **Date:** 11-Aug-2026

### D-103 — ESOP "what we won't say" block: offer half added (resolves BQ-052)
- **Tier:** 3, owner-decided directly in conversation. Adds the missing offer half to the ESOP
  exercise-cost modal's block: "What this screen does give you: the cash cost and the spread — the
  two numbers that bound your decision regardless of the valuation call." Full write-up:
  `docs/decisions/D-103-esop-wont-say-offer-half.md`.
- **Date:** 11-Aug-2026

### D-102 — Token-lean codemaps added; session-start protocol updated to use them
- **Tier:** 1. Generates `docs/CODEMAPS/{architecture,backend,frontend,data}.md` covering all 48
  source files in ~2K tokens total; `CLAUDE.md` step 2c now reads `architecture.md` always plus the
  relevant layer maps per task, replacing cold source-file reads for orientation. Full write-up:
  `docs/decisions/D-102-codemaps-session-orientation.md`.
- **Date:** 11-Aug-2026

### D-093 — D-014 unparked: execution subagents authorised, scoped to the D-086..D-092 reskin
- **Tier:** 3, owner-decided. **Interprets D-014** by satisfying its unpark condition, not overriding it:
  Phase 1 is validated (D-080) and the design decisions now exist (D-086..D-092), honouring D-014's own
  "user decides; agents execute." Authorises presentation-layer work only. Explicitly NOT authorised for
  any agent: backend/schema changes (verified unnecessary — every drawn data shape already has a service),
  new dependencies (`react-native-reanimated`, `expo-font`, `@expo-google-fonts/*`), new screens beyond
  the reskin, or deliberate-only files. Records the model-tiering pattern (Haiku/Sonnet/Opus by nature of
  work). D-014's broader standing-capability ambition stays parked. Full write-up:
  `docs/decisions/D-093-d014-unparked-execution-subagents.md`.
- **Date:** 10-Aug-2026

### D-108 — Scenario build conventions: the app never asserts a rate, and prefills are always editable
- **Tier:** 1 — records existing precedent from CalculatorScreen, does not create a new principle.
  "A return figure the app hands the user is a forecast the app then has to defend. Asking for it is
  not." Applied across BQ-056's five scenarios: every rate is a user input (S-07 asks for two);
  every prefill from real data is editable and labelled; RDs excluded from the deposit total because
  their stored figure is an instalment, not a balance. S-01 follows D-106's wording (years/age to a
  user-set target) over BUILD_QUEUE's compressed "shows SIP needed", which would have duplicated
  C-04. Flags two things for the owner rather than deciding them: the "Inaction tax" label's P2
  tension, and whether to elevate the no-asserted-rate rule to a named principle. Full write-up:
  `docs/decisions/D-108-scenario-build-conventions.md`.
- **Date:** 12-Aug-2026

### D-107 — gstack sprint methodology adopted for all FinTutor build sessions
- **Tier:** 3, owner-decided directly in conversation. "Plan and Review were the structural gaps — ad-hoc
  rather than mandatory. D-107 closes both." garrytan/gstack cloned to `~/.claude/skills/gstack/`; text-based
  skills (planning, review, retro) are live. Browser skills (/qa, /browse) pending `bun` install. Adapted
  sprint: Plan (`/plan-eng-review`) mandatory before non-trivial code; Review (`/review`) mandatory before
  committing; Test (`/qa`) best-effort for UI changes; Ship stays D-056 direct-merge (no PR). GBrain and
  gstack team mode not adopted. Full write-up: `docs/decisions/D-107-gstack-sprint-methodology.md`.
- **Date:** 11-Aug-2026

### D-109 — The Health Score's 80C figure excludes a premium with no stated cadence
- **Tier:** 2, owner-confirmed (escalated under the "calculations users rely on" hard stop). Resolves the
  BQ-054 `taxUtil`-always-0 defect. The real question was not how to normalise free text — `_to_monthly`
  already exists — but which of two *disagreeing* precedents to follow when `premium_frequency` is missing:
  `tax_saving_room.py`'s lenient read-as-monthly, or `budget.py`'s strict Option C. Chose strict, because
  "the failure modes are not symmetric ... A score that is too low invites the user to look; a score that is
  falsely maxed tells them to stop looking." Accepted cost, logged in `docs/KNOWN_LIMITATIONS.md`: the Health
  Score's 80C total and the "Check my 80C room" figure can disagree for a holding with no stated cadence.
  Full write-up: `docs/decisions/D-109-80c-premium-annualisation-in-health-score.md`.
- **Date:** 12-Aug-2026

### D-110 — Portfolio and Health Score share a lightweight computed snapshot
- **Tier:** 2, owner-confirmed. Interprets D-106. "It solves the actual risk—two surfaces calculating
  from different fetches—without establishing a new app-wide state architecture for one feature."
  Full write-up: `docs/decisions/D-110-health-score-lightweight-shared-snapshot.md`.
- **Date:** 12-Aug-2026

### D-111 — Home shows a tappable Portfolio Health grid, and “Health Score” is renamed
- **Tier:** 3, owner-decided. Interprets D-105/D-106. “Showing the sub-scores on Home makes the aggregate
  legible: the user can see the four inputs and enter the exact mechanism behind any one of them rather
  than treating the single number as an unexplained verdict.” Full write-up:
  `docs/decisions/D-111-portfolio-health-home-grid-and-naming.md`.
- **Date:** 12-Aug-2026

### D-112 — Both 80C calculations use strict cadence handling and recognise six-month premiums
- **Tier:** 2, owner-confirmed. “Missing or unrecognised cadence is excluded; it is never silently treated
  as monthly.” Both frontend and backend recognise an explicit six-month cadence as two payments per year.
  Full write-up: `docs/decisions/D-112-80c-cadence-consistency-and-six-month-conversion.md`.
- **Date:** 12-Aug-2026

### D-113 — Primary navigation uses five named icons with full-width mobile layout
- **Tier:** 1, owner-directed. “Hidden navigator destinations occupy no tab-bar layout width.” Adds a
  coherent code-native icon set without a new dependency. Full write-up:
  `docs/decisions/D-113-primary-navigation-iconography.md`.
- **Date:** 12-Aug-2026

### D-114 — Learning progression strategy adopted; real financial change is never game progress
- **Tier:** 3, owner-decided. “Actual financial changes remain visible and factual, but never affect XP,
  levels, streaks, rewards, celebrations, or cosmetic status.” Expands the target direction to students
  through ~10-year working professionals and establishes learning/activity progression as a top priority.
  Full write-up: `docs/features/progression/decisions/D-114-learning-progression-strategy-and-path-a-boundary.md`.
- **Date:** 12-Aug-2026

### D-115 — Standing execution-agent authorisation for already-decided work
- **Tier:** 3, owner-decided. “This is standing mechanical authority, not delegated product judgment.”
  Supersedes D-093’s reskin-only scope and fully unparks D-014, while preserving every hard stop and the
  primary agent’s integration/review responsibility. Full write-up:
  `docs/decisions/D-115-standing-execution-agent-authorisation.md`.
- **Date:** 12-Aug-2026

### D-116 — Five-stage learning journey adopted
- **Tier:** 3, owner-decided. “You have meaningfully explored more of FinTutor, across more kinds of
  learning activity and over time.” Adopts Discovering → Exploring → Connecting → Deepening → Expanding,
  with continuous progress backed by Explore/Model/Reflect/Return behavior. Full write-up:
  `docs/features/progression/decisions/D-116-five-stage-learning-journey.md`.
- **Date:** 12-Aug-2026

### D-117 — Learning progression event rules v1
- **Tier:** 2, REVIEW-FLAGGED; decided autonomously while pre-build and reversible. “Context disclosure is
  never rewarded by amount, completeness, financial value, or sensitivity.” Sets deterministic event
  weights, a 60-point repeatable daily cap, breadth/return-day gates, and open-ended Expanding milestones.
  Full write-up: `docs/features/progression/decisions/D-117-learning-progression-event-rules-v1.md`.
- **Date:** 12-Aug-2026

### D-118 — Five-axis onboarding assessment product contract
- **Tier:** 2, REVIEW-FLAGGED. “Every user starts at Discovering.” Replaces the four-track product flow
  with five optional self-reported axes, no amounts or public persona, equal progress for answer/skip, and
  no inferred migration. Implementation awaits the Tier-3 persistence/privacy package. Full write-up:
  `docs/features/onboarding/decisions/D-118-five-axis-onboarding-assessment-contract.md`.
- **Date:** 12-Aug-2026
