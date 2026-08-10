# Gap Analysis: Running App vs. Approved v1 Mockups

Produced 10-Aug-2026 by a read-only exploration pass over `docs/ux/mockups/MOCKUPS_v1_NOTES.md`,
D-086..D-094, and the current `app/` code (branch `design/mockup-match-rebuild`). No app code changed in
producing it. Handed to build agents as the authoritative build reference for the D-094 mockup-match work.

---

## SHARED FOUNDATION — do once, centrally, before per-screen work

### 1. `fontWeight` + base-token pairing (touches every screen — one pass)
`app/design/tokens.ts` now loads the real mockup faces and defines weight-specific families
(`font.uiSemibold`, `font.uiBold`, `font.monoMedium`, `font.monoSemibold`, `font.tutorMedium`,
`font.tutorSemibold`). But **59 occurrences across 21 files** still pair a base token (`font.ui`,
`font.mono`, `font.tutor`) with a raw `fontWeight: '500'/'600'/'700'`. On native, custom faces do NOT
synthesise bold from `fontWeight` — so every "bold" label, button, hero figure, and section title
currently renders in the REGULAR weight. This is likely a large part of the "flat/broken" look. Mechanical
fix: replace each pairing with the weight-specific token. Mapping: `'500'`→Medium, `'600'`→SemiBold,
`'700'`→Bold.

Affected: `BudgetingScreen`, `ConsolidatedScreen`, `HoldingDetailScreen`, `RegisterScreen`, `LoginScreen`,
`NotConfiguredScreen`, `LoansScreen`, `InsuranceScreen`, `InvestmentsScreen`, `OnboardingScreen`,
`ChatThread`, `EsopExerciseCostModal`, `HoldingProposalCard`, `TeachingWalkthrough`,
`ConsolidatedTotalsCard`, `StreakBadge`, `HoldingEditModal`, `TaxSavingRoomModal`, `Mascot`,
`TeachingBlock`, `LoanVsInvestModal`.

### 2. Motion dependency installed, unused
`react-native-reanimated` is installed (D-094) but not imported anywhere. `TeachingWalkthrough` uses RN's
built-in `Animated`. Only wire reanimated if a flow actually needs its motion; otherwise it's dead weight.

### 3. Duplicated style objects — extract to `app/design/typography.ts`
The same ledger-label/ledger-value/primary-button/section-title style objects are re-declared independently
in 8+ components. Extract shared style constants in the same pass as #1 to prevent drift.

### 4. BLOCKED items intersecting multiple flows (owner decisions, NOT engineering)
BQ-049 (empty-section walkthrough wiring), BQ-050 (walkthrough content source), BQ-051
(`ConsolidatedTotalsCard` zero-vs-absent), BQ-052 (ESOP wording, Tier 3 compliance). Do not resolve by
picking the reasonable option.

---

## Per-flow summary

| Flow | Tag | Key blocker(s) |
|---|---|---|
| 01 Onboarding | MODERATE | "first value moment" content undefined; skip-state tied to Flow 02 |
| 02 Home | **LARGE** | Near-total rebuild; BQ-051 blocks correct data-state logic; dev backend-health box must go |
| 03 Teaching+capture | MODERATE | Mechanism-card treatment is new; reconciliation is OUT OF SCOPE |
| 04 Sections | TRIVIAL (mostly done) | BQ-049/BQ-050 block the walkthrough wiring |
| 05 Decision-shaped | TRIVIAL (mostly done) | BQ-052 (ESOP wording) OUT OF SCOPE, rest near parity |
| 06 Budget | LARGE | "Goal set in chat" is a BACKEND hard stop; provenance rows need an owner call |
| 07 Engagement | LARGE / escalate | Reward-fact content is a BACKEND hard stop; push tray/reminders scope ambiguous |

### Flow 01 — Onboarding
Register/Login are bare token-colored forms (TRIVIAL once weights land). "First value moment" has no
distinct surface — after a chip tap it's just another chat bubble (MODERATE, needs product definition of
what it shows). "Skipped-state home" is not a distinct state (same gap as Flow 02's fresh-starter state).

### Flow 02 — Home (largest gap)
`ConsolidatedScreen.tsx` is self-described "Placeholder": Mascot → StreakBadge → static title →
`ConsolidatedTotalsCard` → a dev-facing "BACKEND HEALTH" diagnostic box → Sign out. No greeting header, no
data-state differentiation (fresh starter / reactive dabbler / habit-former), no recent-activity list.
BQ-051 blocks correct zero-vs-absent rendering. Remove the backend-health box (TRIVIAL, no mockup
counterpart). Full rebuild is LARGE and gated on BQ-051.

### Flow 03 — Teaching + capture
Every assistant reply is a uniform bubble; no distinct "mechanism card with ranges" treatment (MODERATE,
may need a `/chat` response-shape field = backend, verify `app/lib/chat.ts`). Confirm cards
(`HoldingProposalCard`) are near parity. "Reconciled" half = reconciliation UI = **OUT OF SCOPE (D-094,
undrawn)**; build only the "saved" half.

### Flow 04 — Sections (closest to parity)
Built against D-089, reads line-for-line with the notes. BQ-049/BQ-050 block the one remaining piece
(walkthrough CTA wired to a `/chat` prefill, not the built-but-unwired `TeachingWalkthrough`). Loans
section built by analogy (undrawn) — provisional. Detail + add sheet near parity.

### Flow 05 — Decision-shaped (second-closest)
All three modals built against the mockup's structural devices. BQ-052 (ESOP wording) is **OUT OF SCOPE**.
Otherwise only the weight migration applies.

### Flow 06 — Budget
"From holding" provenance rows don't exist — backend returns only summed totals; client reconstruction
would duplicate backend logic (drift risk) — **flag, don't silently build**; clean fix is a backend shape
change (**hard stop**). Variable income + goals substantially done. "Goal set in chat" needs a new backend
classifier = **hard stop, escalate**. Income-as-own-screen is now buildable under D-094 but undecided.

### Flow 07 — Engagement
Variable-ratio reward mechanism is real server-side, but the reward has no *content* — Mascot just says
"Nice one!"; surfacing "a fact worth knowing" needs a new backend field = **hard stop, escalate**. Push
tray + reminders surface don't exist and need a backend notification service = **hard stop + scope-ambiguous
under D-094's wording, escalate before building**.

---

## OUT OF SCOPE — do not touch
1. Baseline reconciliation UI (undrawn, D-094).
2. BQ-052 ESOP wording (Tier 3 compliance, owner-owed).
3. Any backend/schema change (hard stop): goal-in-chat classifier, budget provenance response shape,
   reward-fact content field, push/reminder service.
4. BQ-049/050/051 (owner-decision-blocked, not buildable-yet).
5. Deliberate-only files.
