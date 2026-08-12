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

### D-119 — Assessment v2 persistence, privacy, eligibility, and migration package approved
- **Tier:** 3, owner-approved. “Store only normalized category codes and structural completion state—never
  raw answers or dialogue.” Approves 18+ initial release, a separate versioned assessment table,
  minimum-context Arya exposure, backend-authoritative completion, user control/deletion, and
  grandfathered non-inference migration. Full write-up:
  `docs/features/onboarding/decisions/D-119-assessment-v2-persistence-privacy-package.md`.
- **Date:** 12-Aug-2026

### D-121 — Progression instrumentation, privacy, retention, and rebuild package approved
- **Tier:** 3, owner-approved. “An event records *that a qualifying action happened*, not what it was
  worth.” Approves an append-only event ledger with derived rollups and summary, essential first-party
  consent posture with no new consent surface, 400-day raw retention, a never-decreasing displayed-points
  floor, fixed Asia/Kolkata day boundaries, and D-119's onboarding credit as the only historical backfill.
  Unblocks BQ-069. Full write-up:
  `docs/features/progression/decisions/D-121-progression-instrumentation-privacy-package.md`.
- **Date:** 12-Aug-2026

### D-122 — Customer-outcome gaps become MVP exit gates
- **Tier:** 3, owner-directed. “Feature-complete is not MVP-complete.” Requires resolved activation,
  real-user evidence, connected value loop, visible progression/return value, launch trust/safety,
  initial wedge, and distribution/business viability before external-user MVP readiness. Full write-up:
  `docs/decisions/D-122-customer-outcome-mvp-exit-gates.md`.
- **Date:** 12-Aug-2026

### D-123 — Progression completion package approved
- **Tier:** 3, owner-approved. “Awarding progress never creates a completion state or new product surface
  by itself.” Defers teaching/recap emitters, preserves P9, and approves a Home summary plus hidden detail
  screen with stage, continuous progress, gate explanations, recent attribution, and factual Expanding
  milestones. Full write-up: `docs/features/progression/decisions/D-123-progression-completion-package.md`.
- **Date:** 12-Aug-2026

### D-124 — Activation test v1 and evidence thresholds
- **Tier:** 2, REVIEW-FLAGGED. “Activation requires both value and comprehension.” Defines 12 moderated
  sessions, a primary 8/12 personal-insight-within-five-minutes threshold, and independent continuation,
  neutrality, trust, and subgroup gates. Full write-up:
  `docs/features/activation/decisions/D-124-activation-test-v1.md`.
- **Date:** 12-Aug-2026

### D-125 — Complete and internally validate the approved MVP before external testing
- **Tier:** 3, owner-decided. “The immediate bottleneck is therefore implementation fidelity and integration,
  not participant recruitment.” Supersedes D-122/D-124 sequencing only: audit and build the approved MVP,
  owner-validates it, then external activation testing begins. Full write-up:
  `docs/decisions/D-125-internal-mvp-completion-before-external-testing.md`.
- **Date:** 12-Aug-2026

### D-126 — Onboarding ends with an optional, user-chosen first action
- **Tier:** 3, owner-decided. “The user needs direction after orientation but does not owe FinTutor a
  financial census before receiving value.” Preserves D-118/D-119's five-axis orientation, then offers
  Arya, an existing item, a goal, Tools, or Home without forced disclosure. Full write-up:
  `docs/decisions/D-126-optional-guided-onboarding-handoff.md`.
- **Date:** 12-Aug-2026

### D-127 — Conversational holding reconciliation uses a user-confirmed field diff
- **Tier:** 3, owner-decided. “The AI extracts and compares; the user retains authority over the
  financial-data write.” New, updated, and conflicting holding information shows its target and exact diff;
  ambiguity requires user selection and nothing writes without confirmation. Full write-up:
  `docs/decisions/D-127-user-confirmed-holding-reconciliation.md`.
- **Date:** 12-Aug-2026
