# FinTutor — Build Queue Archive (DONE items)

> Every completed build item, moved here verbatim from `docs/BUILD_QUEUE.md` (D-081) — the DONE section
> was almost the entire file's token cost and is essentially never needed to decide what to build next,
> only the READY/BLOCKED section is. Newest first (unchanged from the live file's own ordering).
>
> **Never edited after being moved here.** A shipped item that needs revisiting gets a new BQ- number in
> the live file, tracing back to this entry by ID — this file is historical record.
>
> **Do not read this file wholesale as part of routine session start.** Grep it for a specific BQ- number
> when you actually need one.

---

## BQ-104 — Enforce FastAPI-only Supabase table access — DONE 14-Aug-2026

Applied the previously approved progression schema catch-up and then D-142's versioned security migration to
`fintutor-dev`. All 12 public tables now have RLS enabled with no client policies and zero privileges for
`anon` or `authenticated`; direct reads as both roles fail with permission denied. FastAPI's private
`postgres` connection retains access. A coverage test forces every future ORM table to be named in the
security boundary. Verified at Alembic head `d142a104f001`, 327 backend tests, Supabase MCP inspection, and
security-advisor review.

## BQ-099 — Whole-account deletion integration — DONE 14-Aug-2026

Added a Home deletion surface with scope and seven-day backup disclosure, password reauthentication, and a
separate final irreversible action. The authenticated backend deletes every current per-user table in a
data-first transaction, then permanently deletes the same verified Supabase Auth subject through the
server-only Admin API. Failure ordering and repeated empty-account retries are tested; frontend success signs
out and clears local account state. Added a quarantine-only restore runbook that reconciles current active
Auth IDs before cutover. Requires `SUPABASE_SERVICE_ROLE_KEY` in backend `.env`; it is never exposed to Expo.
Verified with 326 backend tests, 36 frontend tests, TypeScript, Expo web export, and clean diff review.

## BQ-089 — Enforce Supabase JWT ownership across backend routes — DONE 14-Aug-2026

Added a fail-closed authentication middleware that validates Supabase bearer tokens through Auth and replaces
every caller-supplied `user_id` with the verified token subject before route parsing. All frontend user-data
wrappers now attach the current session token and no longer send a user ID over HTTP. Public health/schema
routes remain public. Tests cover missing, invalid and expired tokens, subject derivation, spoofed query IDs,
two-user cross-account read/write/delete denial, and token-owned creation. Verified with 318 backend tests,
36 frontend tests, TypeScript and Expo web export.

## BQ-101 — Align recurring-contribution timing and disclosures — DONE 14-Aug-2026

Corrected Step-up SIP to D-129's confirmed Option A: each month's existing corpus grows first, then the
month-end contribution is added and begins compounding in the following month. The annual step-up still starts
with the first contribution of each new 12-month block. SIP Goal and Step-up SIP now both disclose the timing
beside results. Extracted pure arithmetic and added 3 focused regressions. Verified: 36 frontend tests,
TypeScript, Expo web export, and clean diff check.

## BQ-094 — Repair standalone decision-file evidence gaps — DONE 14-Aug-2026

Created faithful compact primary artifacts for D-021, D-022, D-050, D-057 and D-064 from preserved
authoritative text without editing the append-only archive or inventing rationale. A recursive verification
now resolves every D-001–D-136 ID to exactly one primary decision artifact.

## BQ-090 — Synchronize the session-close skill with D-135 — DONE 14-Aug-2026

Updated the existing session-close skill with D-135's mandatory disposition check, including valid statuses,
BQ linkage, deferred unpark conditions, and missing/duplicate failure behavior. Renumbered and corrected all
later steps to match the live `CLAUDE.md` close sequence.

## BQ-088 — Assessment context view/change/clear UI — DONE 14-Aug-2026

Added a persistent Home entry and handled-assessment management UI using the existing normalized update and
clear endpoints. Users can view labels, change any approved axis, or clear all context without seeing raw
values or internal metadata. Shared vocabulary prevents capture/management drift; focus reload prevents stale
mounted-route state. Verified: TypeScript, 33 frontend tests, Expo web export, and clean diff check.

## BQ-084 — Correct the reminder recurrence (D-125 audit F-3) — DONE 12-Aug-2026

Traces to D-125's step-1 audit. §4 item 7's reminders fired exactly once: `scheduleHoldingReminder` used a
one-shot DATE trigger set only at create/update, so a monthly EMI reminded once and then went silent until the
holding was next edited, and a credit card whose recorded due date had passed never reminded at all. Replaced
with a MONTHLY repeating trigger keyed on day-of-month, which both fields already are (`emi_due_day` outright;
a card's `payment_due_date` via its day). Due days past the 28th clamp to 28 so no month is skipped — early is
harmless, skipped is not. Pure day arithmetic extracted to `reminderSchedule.ts` (no Expo imports) so it is
testable under `node --test`. Verified: 7 new frontend tests (30 total), TypeScript.

---

## BQ-083 — Codemap and status-doc staleness (D-125 audit F-8…F-11) — DONE 12-Aug-2026

Mechanical documentation correction, no behavior change. architecture.md claimed the progression ledger had no
emitters and no readers (BQ-070/071 shipped both) and listed 1 of 9 hidden nav routes; backend.md named
`claude-3-5-sonnet` for a service now on `claude-sonnet-5`, and described tax_saving_room as "80C/NPS" when no
NPS/80CCD handling exists; DECISIONS_FOR_YOU.md claimed nothing was blocked and called an archived BQ-069 the
top queue item. frontend.md updated for the reminder split.

---

## BQ-082 — Automated coverage for uncovered financial services (D-125 audit F-7) — DONE 12-Aug-2026

Seven services carrying user-facing money figures had zero tests while newer features were well covered.
Added 183 tests across loan_vs_invest, esop_exercise_cost, tax_saving_room, budget, consolidated, surfacing and
streaks. Disclosed limitations from KNOWN_LIMITATIONS.md are pinned as intended behavior so a future change is
caught deliberately. No file under `backend/app/` was modified — suspected defects were reported for owner
escalation, not fixed, per the money-logic hard stop. Backend suite 122 → 311 tests.

---

## BQ-081 — Backend test invocation (D-125 audit F-2) — DONE 12-Aug-2026

Smaller than scoped: the suite needs no pytest at all — every test is stdlib `unittest`, so
`./.venv/bin/python -m unittest discover -s tests -t .` runs all 311. The apparent breakage was bare `python3`
resolving to anaconda's SQLAlchemy 1.4.39 against the required 2.0.35. No dependency added; invocation
documented instead. Also fixed a genuine intermittent failure this exposed — see the session log's
privacy-masking note.

---

## BQ-080 — Align Emergency Runway and add Emergency Coverage — DONE 12-Aug-2026

Corrected S-05 and added C-14 on one shared D-130 liquidity-narrow contract: manual cash/bank, editable FD
principal, optional user-known accessible amount, and editable outgoings; PPF/EPF is never automatic and RD is
excluded. Independent Budget/holdings fetches fail open, touched fields resist late prefills, and applied late
prefills invalidate stale results. Both surfaces share formula, disclosures and accessibility while emitting
their own render-confirmed completion once per committed input signature. Staff-review P1 findings were fixed.
Verified: 23 frontend tests, 122 backend tests, TypeScript, iOS production bundle, and clean diff check.

---

## BQ-079 — Add Credit-card Payoff calculator — DONE 12-Aug-2026

Added a pure fixed-payment Credit-card Payoff calculator: monthly interest then month-end payment, zero-rate
and partial-final handling, explicit non-clearing result, disclosed 1,200-month cap, and no recommended/default
payment. Owned cards are optional editable starting points with zero/many/error/manual paths. Only a rendered
paid-off result emits progression. Staff review fixed cross-user financial-state clearing and stale outcomes
after edits; record attribution clears when recorded balance/rate is changed. Verified: 14 combined formula
tests, 122 backend tests, TypeScript, iOS production bundle, and clean diff check.

---

## BQ-078 — Add Compound Growth calculator — DONE 12-Aug-2026

Added a pure Compound Growth calculator with user-owned lump sum, monthly contribution, rate, and horizon;
D-129 monthly compounding/month-end contributions; zero-rate handling; ending amount, total contributed and
neutral arithmetic difference; no default rate or forecast framing. Typed validation distinguishes ordinary
input errors, sub-month rounded horizons, and unsafe combined overflow. Shared calculator inputs/buttons/results
now have screen-reader labels, state, announcements and result focus. Staff-review findings were fixed.
Verified: 8 focused formula tests, 122 backend tests, TypeScript, iOS production bundle, and clean diff check.

---

## BQ-077 — Implement user-confirmed holding reconciliation — DONE 12-Aug-2026

Conversational holding capture now supports transient new/update/conflict proposals with deterministic local
identity, neutral ambiguity choice, authoritative field diffs, explicit confirmation, owned row-locked apply,
stale reconfirmation, and merge-only updates. D-133's single random-nonce privacy envelope masks the complete
question/baseline/prior context across every Sonnet/Haiku path and exact-token restores user-visible names;
unsafe names/identifiers, collisions, injected/unknown tokens, and masking failures fail closed before provider
calls. Provider logs use controlled metadata. Multiple staff/privacy review rounds fixed identity, validation,
cross-user async, accessibility, tokenization, open-world and error-boundary defects. Final review passed.
Verified: 40 focused tests, 122 full backend tests, TypeScript, iOS production bundle, and clean diff check.

---

## BQ-076 — Complete the optional onboarding first-action handoff — DONE 12-Aug-2026

After the five-axis orientation, users now choose among five existing destinations: Arya, something they
manage, a goal, calculators/scenarios, or Home without financial disclosure. A defensive normalized-intent
mapping adds only a modest suggestion label without hiding/reordering choices. A synchronous one-shot guard
prevents destination races; backend completion remains authoritative and cache failure cannot trap entry.
Legacy voluntary assessment remains intact. Staff-review findings were fixed. Verified: 96 backend tests,
TypeScript, iOS production bundle, and clean diff check.

---

## BQ-075 — Surface the approved loan-versus-invest scenario from Tools — DONE 12-Aug-2026

Tools now exposes the existing S-02 comparison without duplicating or changing money logic. Zero eligible
loans gets an explanatory Loans route; one opens directly; multiple get a neutral unsorted chooser. Shared
eligibility prevents drift with Holding Detail, request invalidation prevents stale cross-user results, and
loading/error/result transitions are announced accessibly. Staff-review accessibility finding was fixed.
Verified: 96 backend tests, TypeScript, iOS production bundle, and clean diff check.

---

## BQ-074 — Complete goal-to-holding funding flow — DONE 12-Aug-2026

Completed D-038's approved goal funding model end to end. Both goal-creation paths can optionally link owned
holdings and earmarked amounts; existing links can be edited or cleared; progress recomputes from persisted
links. Ownership, duplicate, finite/positive and Numeric(14,2) validation return controlled errors. Optional
holding-load failure does not break Budgeting, and the selector has labelled 44px checkbox targets and
holding-specific input labels. Staff review findings were fixed. Verified: 96 backend tests including real
API/SQLite persistence and cross-user cases, clean TypeScript, iOS production bundle, and diff check.

---

## BQ-073 — Correct reversed holding reconciliation status — DONE 12-Aug-2026

Traces to D-125 and the standing living-baseline contract in PROJECT_SPEC §2. Corrected the bounded defect:
`create_holding()` now reports `new`, while `update_holding()` reports `updated`. Added focused service
regressions without changing contradiction detection, matching, merge behavior, persistence, or broader
reconciliation semantics. Independent review passed; targeted tests 2/2 and full backend suite 87/87 pass.

---

## BQ-070 — Approved learning-progression surfaces — DONE 12-Aug-2026

Built D-123's compact Home summary and hidden Progress detail screen while retaining five visible tabs.
The backend now supplies authoritative stage bounds and awarded-only attribution; the UI shows named stage,
continuous progress, point/breadth/return gates, content-free recent actions, and factual Expanding
milestones. Staff review fixed monotonic-stage gate consistency, cross-user stale-response races, range
copy, and progress-bar accessibility. Verified: 85 backend tests, compileall, one Alembic head, and clean
TypeScript. Browser QA was attempted but Expo did not bind the local preview port in offline mode.

## BQ-071 — Progression emitters — DONE 12-Aug-2026

Shipped every valid v1 emitter with IST idempotency, qualifying-event/capability coupling, and
render-confirmed calculator/scenario completion. D-123 deliberately defers teaching and recap emitters
because no meaningful non-gating interaction exists; they are not incomplete implementation. Verified as
part of the 85-test progression suite and frontend type-check.


## BQ-069 — Progression event ledger and rebuildable summary — DONE 12-Aug-2026

Built the backend data layer approved by D-121: an append-only `progression_events` ledger, a
`progression_daily_rollups` per-user-day aggregate, and a single `progression_summaries` row per user,
plus the deterministic replay engine. Points, dimensions, repeat limits, caps, and stage floors live in
`progression_ruleset.py` as versioned constants and are applied at computation time — no event row ever
stores a point value, which is what keeps pre-launch retuning possible.

Replay never reads the wall clock: every window computes from the event's materialized Asia/Kolkata
`local_date`. Dedup is a database unique constraint on `(user_id, idempotency_key)`. `meaningful_return_day`
is derived during replay rather than accepted from a caller, so it cannot be minted. The summary carries
`displayed_points_floor` and `stage_floor_index`, making "progress never decreases" hold through a
downward retune. `prune_raw_events()` folds days past 400 into their rollups and marks them frozen, so
return-day counts, dimension breadth, and consumed once-ever awards survive the retention window.

Four endpoints shipped: `GET /progression`, `GET /progression/history`, `POST /progression/event`,
`DELETE /progression`. `occurred_at` is deliberately not accepted from clients — a caller could otherwise
backdate across the day boundary for a fresh 60-point cap. 63 backend tests pass, covering day boundaries,
every repeat limit, cap behaviour, replay idempotence, the monotonicity floors, pruning, and deletion.

Scope was backend-only by explicit owner choice: no existing service emits events yet, and no screen reads
them. Wiring the emitters and building the surfaces are separate items (BQ-070 and its own follow-on).

## BQ-068 — Onboarding v2 legacy compatibility and voluntary reassessment — DONE 12-Aug-2026

Added a presence-only compatibility endpoint so any legacy onboarding row—complete or incomplete—grants
backend-authoritative access on a second device or after reinstall without translating or mutating its old
track. The original device flag remains an outage and pre-row dismissal fallback; v2 state stays separate.

Grandfathered users receive one locally dismissible Home invitation to “Personalize how Arya explains
things.” Opting in opens the existing five-question flow as a hidden voluntary route, supports cancellation
before eligibility acknowledgement, resumes an interrupted server-side assessment, and removes the invite
once v2 exists. No progression credit was added while BQ-069 remains blocked. Automated coverage verifies
legacy presence/non-inference and existing clear-context behavior; mobile browser QA covers invitation,
voluntary entry/cancel, and remembered dismissal.

## BQ-067 — Onboarding v2 frontend flow and eligibility acknowledgement — DONE 12-Aug-2026

Replaced the four-track chat onboarding for new users with the approved deterministic five-question flow.
The screen now includes the 18+ acknowledgement, normalized single- and multi-select answers, mutually
exclusive exposure sentinels, per-question skip, global exit, visible progress, retry-safe error states,
and a Discovering-stage closing explanation. Immediate intent produces only a clearly attributed,
non-financial handoff to Home, Portfolio, Tools, or Arya.

`RootNavigator` now reads backend assessment state before routing, resumes the authoritative current
question across devices, and caches only an already-observed handled state for temporary backend outages.
The assessment client calls only the dedicated normalized BQ-066 routes; no raw dialogue or chat pipeline
is involved. A development-only preview switch was added for onboarding QA. Legacy grandfathering and
voluntary reassessment remain isolated in BQ-068.

## BQ-066 — Onboarding v2 API and minimum-context Arya integration — DONE 12-Aug-2026

Added dedicated normalized assessment endpoints for read/start, answer, per-question skip, global handle,
post-handle context correction, and clear. API responses omit user ID, eligibility timestamps, DB IDs, and
raw/internal objects. Eligibility requires a strict boolean; validation, stale/conflicting state, and
missing-state errors have stable 422/409/404 responses without echoing submitted values.

Assessment routes never enter baseline assembly, Arya, deepen, holding capture, legacy onboarding, or
financial calculations. Ordinary chat may receive only a derived explanation style and one positive
prior-exposure boolean for a taxonomy-validated caller topic hint. It never receives immediate intent,
earning/responsibility context, timestamps, eligibility, unknown/cleared context, or the full assessment.
Legacy onboarding is explicitly excluded from the new context contract. Added a runtime prompt addendum
that makes the signal presentation-only, never competence, health, suitability, or advice permission.

Expanded the built-in suite to 20 passing service/API tests, including full pipeline isolation, minimal
response shape, strict eligibility parsing, stable errors, context clearing/editing, Arya payload
minimization, and legacy-context suppression. The known caller-supplied `user_id` auth gap remains a
pre-existing external-deployment blocker documented in `KNOWN_LIMITATIONS.md`.

## BQ-065 — Onboarding v2 persisted assessment foundation — DONE 12-Aug-2026

Implemented D-118/D-119 as a separate `onboarding_assessments` model and additive Alembic migration,
leaving the populated legacy `onboarding_states` table untouched. The versioned row stores only approved
normalized codes plus structural status/question and eligibility/handled/clear timestamps—no raw answer or
dialogue field. PostgreSQL constraints enforce scalar vocabularies, lifecycle consistency, non-empty
allowed exposure arrays, and sentinel exclusivity.

Added a backend state service for idempotent start/resume, ordered answers, per-question skip, global
handle, context clearing without forced redisclosure, deterministic exposure ordering, row locking, and
PostgreSQL conflict-safe concurrent starts. Twelve built-in-unittest cases cover eligibility, versioning,
ordered transitions, retries, skips, validation, clearing, and legacy isolation. The migration was applied
to the configured Supabase development database and verified at Alembic head `b8f25a9d4c31`.

## BQ-062 — Align strict 80C cadence handling and add six-month conversion — DONE 12-Aug-2026

Implemented D-112 in `healthScore.ts`, `budget.py`, and `tax_saving_room.py`. Both 80C calculations now
exclude a premium whose cadence is blank or unrecognised. Eight clear six-month variants annualise as
two payments per year in frontend tax utilisation, backend tax room, and the backend monthly budget.
Verified with a shared 10-case behavior matrix (monthly, quarterly, six-month, annual, weekly, blank,
unknown, and null), all eight six-month aliases, TypeScript, Python compile, and Expo web export.

## BQ-063 — Primary navigation iconography and mobile-width correction — DONE 12-Aug-2026

Implements D-113. Added a five-glyph code-native line-icon set (Home, Portfolio, Goals, Tools, Chat),
active-state tutor-soft treatment, and balanced tab-bar spacing. Hidden destinations now use
`tabBarItemStyle: { display: 'none' }`, preserving route navigation without reserving width or truncating
the five visible labels. No dependency added. Verified by TypeScript, Expo web export, a 390×844 visual
check, and tapping all five tabs to confirm selected state.

## BQ-060 — Home screen restructure — DONE 12-Aug-2026

Decision D-104’s eight-section Home layout, with the final Health-card interaction and user-facing name
resolved by owner-confirmed D-111. Rebuilt `ConsolidatedScreen.tsx` as: greeting, financial picture,
Portfolio Health, Arya, calculator carousel, scenario carousel, Learn, and streak/reward.

Portfolio Health shows the overall score and a 2×2 grid of all four sub-scores. Each cell deep-links to
the Portfolio Health screen with its mechanism row expanded. The route carries only a focus key; formulas
and data remain in the D-110 shared snapshot. “Health Score” was renamed to “Portfolio Health” across
visible Home, Portfolio, Goals, and detail-screen copy.

Calculator and scenario Home cards launch the already-built Tools flows. They do not fabricate last-run
results or timestamps because no result persistence exists. Learn cards open Arya with mechanism-only
questions. All figures remain neutral ink; the streak is still the only behaviour-coloured number.

Verified with `npx tsc --noEmit`, Expo web export, `git diff --check`, and in-app mobile QA at 390×844.
All eight sections rendered, carousels scrolled horizontally, and an Insurance-grid tap opened the correct
expanded Portfolio Health lever. The only console warning was Expo Notifications’ existing web limitation.
The repository-recorded gstack skills were unavailable, so plan and review were performed manually.

## BQ-058 — Portfolio screen restructure — DONE 12-Aug-2026

Decision D-106, with the store mechanism resolved by owner-confirmed D-110. Added a detailed Portfolio
surface with a holding-family allocation donut, the four Health Score sub-scores, the existing category-
concentration indicator, family navigation, and a portfolio-trend mechanism panel.

Allocation is explicitly by holding-record count, not rupee value: the holdings schema does not provide
one comparable current-value field across every family, and inventing one would make the chart false.
The trend panel likewise does not draw a performance line because the app stores no historical snapshots;
it teaches why a trend needs repeated measurements instead.

Added `app/lib/healthScoreSnapshot.ts`, a lightweight module-level snapshot keyed by user ID. Portfolio
refreshes it on focus, HealthScoreScreen reuses it, active requests are deduplicated, and local answers
recompute the shared value immediately. No dependency, provider, backend, or schema change.

Verified with `npx tsc --noEmit` and `git diff --check`. The required gstack plan/review skills were not
installed at the repository-recorded path on this machine, so the architecture and diff reviews were run
manually.

## BQ-061 — Portfolio overlap indicator (Option A — category concentration) — DONE 12-Aug-2026

Decision D-106 Decision 4. New: `app/lib/concentration.ts` (pure `computeCategoryConcentration`).
Modified: `app/screens/PortfolioScreen.tsx` — adds the card plus the screen's first data fetch, and
drops "portfolio overlap" from the Coming soon block (asset allocation, BQ-058, still listed).

Held to D-106's constraints exactly: counts only, no rupee figure, no scheme names, no external API.
The by-value version was not built — a concentration percentage by value reads as a portfolio-weighting
verdict, which is the advice line. Deliberately labelled "Category concentration", never "overlap", and
the D-091 block states that true stock-level overlap needs scheme data the app does not have.

**Taxonomy note:** D-106 names the categories "equity/debt/hybrid", but D-013's taxonomy has no hybrid
fund type — only `equity_mutual_fund` and `debt_mutual_fund`. Only the two that exist are counted;
`FUND_CATEGORIES` in `concentration.ts` is the one place to add a third if a hybrid type is ever created.

Five render branches, all verified in the web preview against a seeded synthetic dev user:
multi-category ("3 of 4 funds you hold are equity funds"), single-category (copy switches to "every fund
you hold is in the same category"), single fund ("1 of 1", singular unit, copy saying the number starts
meaning something above one), no funds (D-089 teaching surface + Open Investments link), and holdings
unavailable (distinct wording, and the D-091 block correctly omitted since no number is shown).
`tsc --noEmit` clean. Seeded test holdings were deleted afterwards; the dev user is back to zero.

**Note for BQ-058:** this adds the first `useFocusEffect` holdings fetch to PortfolioScreen. It is safe
today because PortfolioScreen and HealthScoreScreen are never focused together, but it does NOT settle
the TODOS.md shared-store question, which is about health sub-scores diverging between two surfaces.

## BQ-059 — Goals screen restructure — DONE 12-Aug-2026

Decision D-106 (Goals tab in the 5-tab nav). Replaced the placeholder `GoalsScreen` with four sections:
existing goal progress rows, four goal-type cards (Higher education / Secure retirement / Dream house /
Perfect wedding) with an inline create form, an insurance coverage summary, and an emergency readiness
card. Only `app/screens/GoalsScreen.tsx` changed — no new routes, no new lib files, no backend work.

Illustration call (delegated to build time by the queue entry): the four goal marks are drawn from plain
`View`s — a rotated square + rule for the mortarboard, ascending bars, a CSS-triangle roof over bordered
walls, two overlapping rings. `react-native-svg` is NOT a dependency and adding one would be a hard stop,
so no vector library was introduced. The drawn-from-rules look also sits closer to D-086's warm-ledger
register than clip-art would.

Goal creation reuses the existing `createGoal` endpoint (D-038) with `category` taken from the card the
user tapped, so the form asks only for amount and date. Goals are created unfunded; linking holdings to a
goal remains BudgetingScreen's job, unchanged. Insurance summary reads `sum_assured` off term and
endowment/ULIP holdings; health cover is the yes/no already stored at `hs_has_health_ins`. Emergency
readiness reads `hs_emergency_months` — the same key HealthScoreScreen writes, so the user is never asked
twice.

Verified end-to-end with both the backend and the Expo web preview running (`.claude/launch.json`):
created a real goal through the form and watched it appear with a 0% ink progress track, confirmed
validation rejects an empty save, and confirmed the emergency card picks up a figure entered on the
Health Score screen after a tab re-focus. `tsc --noEmit` clean.

P10 held throughout: progress is an ink fill on a `lineSoft` track, all figures in `colors.ink`.
`colors.danger` is used only for a rejected save, which is a genuine failure state per tokens.ts.

## BQ-056 — Scenario modelling ("What if…" — batch 1) — DONE 12-Aug-2026

Decision D-106 (batch 1 scenarios + S-01 user-set target; S-04 parked). Build conventions logged as
D-108. New: `app/lib/scenarios.ts` (pure `derivePrefills` + five compute functions),
`app/screens/ScenarioScreen.tsx` (hidden tab, same `{type, label}` pattern as CalculatorScreen).
Modified: `navigation/types.ts` (`ScenarioType` + `Scenario` route), `navigation/MainTabs.tsx` (hidden
screen registration), `screens/ToolsScreen.tsx` ("What if…" section below Calculators),
`docs/CODEMAPS/frontend.md`.

Shipped: S-05 emergency runway, S-03 SIP increase, S-06 debt cost, S-07 idle cash, S-01 corpus target.
Every rate is a user input; every prefill from budget/holdings is editable and labelled (D-108). Each
scenario carries a D-091 "what we won't say" block. Figures render in `font.mono`/`colors.ink` (P10).

S-04 (rent vs buy) remains parked — needs schema fields. S-02 (prepay vs invest) not duplicated; it is
LoanVsInvestModal (D-014). C-16/C-23 calculators are batch 2, unrelated to this item.

Verified in the Expo web preview (`.claude/launch.json`, D-095 dev-user bypass): all five screens render,
`tsc --noEmit` clean, debt-cost and corpus-target outputs hand-checked against the formulas. Backend was
down during verification, which exercised the null-prefill path — screens degrade to blank editable
fields with no errors. Two bugs found and fixed during the pass: silent no-op when a compute function
returned null (now shows a Notice saying which input is missing), and the back control landing on Home
because bottom-tab `goBack()` defaults to `backBehavior: 'firstRoute'`.

**gstack gate not run:** `/plan-eng-review` and `/review` (D-107) are not installed on this machine —
`~/.claude/skills/` is empty. Substituted an inline plan and a manual diff review. Flagged to the owner.

## BQ-054 — Financial Health Score (0-100 score + 4 sub-scores) — DONE 11-Aug-2026

Decisions D-105 (display format), D-106 (formula). Built with /office-hours design session + /plan-eng-review
(11 issues found, 0 critical, all resolved). New: `app/lib/healthScore.ts` (pure `computeSubScores()` +
`computeOverall()`), `app/screens/HealthScoreScreen.tsx` (hidden tab with inline expanders for the 2
user-input rows: emergency months + health insurance). Modified: `navigation/types.ts` (added HealthScore
route), `navigation/MainTabs.tsx` (hidden tab), `PortfolioScreen.tsx` (replaced "coming soon" with Analysis
section + FamilyRow → HealthScore). Band label: "N of 4 areas measured" (D-010/P10 compliant; valence
labels from BUILD_QUEUE spec rejected during review). TODOS.md created with 2 items: jest-expo infra +
BQ-058 store decision. Unblocks BQ-058 and BQ-060.

---

## BQ-057 — Calculator suite: batch 1 (C-04, C-10, C-17, C-22, C-24) — DONE 11-Aug-2026

Decisions D-105/D-106. Built 5 calculator screens (SIP Goal Planner, Home Loan EMI, Inflation
Impact, Step-up SIP, CAGR Backward) in `app/screens/CalculatorScreen.tsx`. All pure frontend math,
no backend calls; outputs in `font.mono` / `colors.ink` (P10). Created `app/screens/ToolsScreen.tsx`
as the Tools tab entry point (calculator list grid). Updated `app/navigation/MainTabs.tsx` to the
confirmed 5-tab structure: Home · Portfolio · Goals · Tools · Chat. CalculatorScreen is a hidden tab
(navigated to from ToolsScreen via `{ type, label }` params).

## BQ-055 — Named tutor persona "Arya" — Chat screen header — DONE 11-Aug-2026

Decision D-105. Added `AryaHeader` component to `app/components/ChatThread.tsx`: circle avatar
(40px, `colors.tutor` fill) with "A" monogram in `colors.canvas`, "Arya" label, "Your financial
tutor" subtitle. Rendered above messages when `!onboarding` (onboarding flow has its own context
framing). BQ-060 (Home screen) will add the full persona card in Section 4 later.

## BQ-053 — Delete Mascot (Ankur/sapling) from ChatThread — DONE 11-Aug-2026

Decision D-104. Deleted `app/components/Mascot.tsx` (43 lines). In `app/components/ChatThread.tsx`:
removed Mascot import, MascotMood type, CELEBRATION_DURATION_MS constant, mood state, celebrationTimer
ref, cleanup useEffect, mood-setting in sendText, and `<Mascot mood={mood} />` render. Removed
`useRef` and `useEffect` from React imports (no longer used). Updated `StreakBadge.tsx` comment to
remove "and Mascot" reference.

## BQ-052 — ESOP "what we won't say" offer half (D-103) — DONE 11-Aug-2026

Owner chose Option A in conversation (D-103). Single copy edit in `app/components/EsopExerciseCostModal.tsx`:
the `TeachingBlock` body gains a second sentence — "What this screen does give you: the cash cost and the
spread — the two numbers that bound your decision regardless of the valuation call." — completing D-091's
three-part requirement. No code or data change; the two named figures (exercise_cost, spread) are already
computed and rendered by the existing modal.

## BQ-049 + BQ-050 — Empty-section walkthrough wired (D-096, Option D) — DONE 10-Aug-2026

Owner decision D-096: static full-screen mechanism walkthrough followed by optional Chat handoff.
Added static per-family walkthrough steps for Investments, Loans, and Insurance in `app/lib/walkthroughSteps.ts`;
wired each family screen's empty-state CTA to the existing P9-guarded `TeachingWalkthrough` component.
Revised empty-state copy so it no longer promises personal numbers; the walkthrough's final step directs to Chat.
BQ-050 (step-content source) resolved by D-096's static-steps decision — no backend shape needed.

## BQ-051 — ConsolidatedTotalsCard zero-vs-absent resolved (D-097) — DONE 10-Aug-2026

Owner decision D-097: backend `/consolidated` now returns explicit per-family valuation metadata
(holding_count, valued_count, excluded_count, status). `ConsolidatedTotalsCard` reads these flags directly
rather than inferring meaning from a numeric zero — empty, unvalued, excluded, and valued states all
render distinct copy without the shortcut `total === 0 ? '—'` that would hide a real zero.

## BQ-053 — Goal progress bar: kept — DONE 10-Aug-2026

Owner decision: keep the monochrome fill bar. No code change — the existing 4px ink fill on a `lineSoft`
track in `BudgetingScreen.tsx` stands as shipped. The fraction (`progress / target_amount`) renders above
it; no colour or valence encoding touches either element, satisfying P10. Flagged-as-borderline concern
(form asserting progress-direction) noted and accepted by owner.

## BQ-054 — Insurance empty-state copy and button noun — DONE 10-Aug-2026

Two changes in `app/screens/InsuranceScreen.tsx`:
1. **TeachingBlock body expanded** — from 2 illustrative sentences (lifted from D-089's example) to a
   full paragraph matching the depth of the Investments and Loans siblings: names the two mechanisms
   (term cover / endowment+ULIP), explains each mechanism's shape and cost structure, and lands on the
   same "knowing which is which is most of the literacy" close.
2. **Button noun made consistent** — populated-list add button changed from "+ Add insurance" to
   "+ Add a policy", matching the empty-state's existing "+ Add a policy manually" and the siblings'
   own noun-consistent pattern (investment/investment, loan/loan, policy/policy).

---

## BQ-043..BQ-048 — Mockups v1 reskin fleet (D-086..D-093) — DONE 10-Aug-2026

Shipped as ONE authorised fleet under D-093 (which unparked D-014's execution subagents by satisfying its
condition, not overriding it), not six independent sessions. 5 Sonnet build agents on disjoint file sets,
3 Opus reviewers (engineering / design / compliance), 1 Sonnet coherence pass. Commits `fafe7ce`,
`f099a35`, `8a6f2b0` on `design/mockups-v1-reskin`.

- **BQ-043 — `app/design/tokens.ts` rewritten to the D-086 warm-ledger set.** DONE. `success: '#116611'`
  **renamed** to `tutor` (#1D5C46), not merely recoloured — a token called `success` carries exactly the
  valence P10 strips out. First `fontFamily` tokens in the app (platform system serif/sans/mono per D-088);
  `figure` scale (hero 32 / subHero 22) added in the coherence pass.
- **BQ-044 — Hardcoded colours migrated onto tokens.** DONE. Zero hex literals remain in `app/screens`,
  `app/components`, `app/navigation`. `HoldingEditModal` had had no token usage at all.
- **BQ-045 — P10 applied.** DONE, and it held across a five-way parallel build with zero lapses — no
  valence colour, no trend glyph, no threshold emphasis, verified by an independent Opus audit of every
  surface rendering a real figure.
- **BQ-046 — P11 applied.** DONE on platform system faces. Newsreader/IBM Plex were NOT adopted: they need
  `expo-font` + `@expo-google-fonts/*`, a hard-stop dependency decision that remains the owner's. P11 is
  satisfied by the distinction, not by any particular typeface.
- **BQ-047 — Empty-state content for the three family sections.** DONE (D-089). Mechanisms and categories
  only, never products. Follow-ups BQ-049 (the CTA's false caption) and BQ-054 (Insurance copy length and
  noun) are BLOCKED in the live queue.
- **BQ-048 — Full-screen teaching walkthrough container.** DONE as specified — container only; wiring was
  explicitly out of scope and is now BQ-049/BQ-050. The four-part P9 guard is enforced through API *shape*,
  not convention: there is no `onComplete` prop at all, so reaching the last step is behaviourally
  identical to abandoning on the first, and a negative-space comment records which props were deliberately
  omitted so a future editor cannot add a gate without noticing.

Also in this fleet, from the reviewers' findings: `components/TeachingBlock.tsx` extracted (the "what we
won't say" block had been drawn two different ways by two agents from the same decision record);
`components/HoldingsList.tsx` deleted as orphaned; `ConsolidatedTotalsCard` moved to `useFocusEffect`
(totals had gone stale after every add/edit/delete); the "+ Add" affordance and a retry restored to the
three error branches; `FlatList` virtualisation restored. Compliance fixes: one genuine advice-line breach
in agent-written copy (unprompted prioritisation, D-025/D-028), an agent-authored ESOP sentence reverted
for claiming a tax computation the service does not perform, a real bank/product name removed from a
placeholder (pre-existing on `main`), and two wrong mechanism claims about Indian home loans and credit
cards corrected.

**Not visually verified** — Expo web needs `react-native-web` + `react-dom`, which D-093 forbids adding.
Static verification only: `tsc` exit 0, greps for hex/clay/`package.json` drift.

---

## DONE

### BQ-042 — Build the onboarding structured conversation flow — done 10-Aug-2026
Per `docs/features/onboarding/PRD.md`, confirmed D-084. Backend: `OnboardingState` model + Alembic
migration (`onboarding_states` — `id`, `user_id` loose-ref, `track`, `stage`, `turns_in_stage`, modeled on
`StreakState`), registered in `app/models/__init__.py`. New `app/services/onboarding.py`: `start_or_resume`
resolves an unset `track` on the first turn — deterministically from a chip-tap hint (mirrors D-071's
`deepen_alias` UI-signal pattern) or, for free-typed messages, a narrow Haiku classifier (mirrors D-072's
`classify_deepen`), always degrading to `unclassified` on any failure. `record_turn` (called after the
teaching engine replies) advances the stage via a second Haiku classifier judging whether the stage's goal
was met, with a hard turn-budget backstop (4 turns per stage; 1 for `unclassified`'s `intro`, per the PRD's
"don't sit in classification limbo" rule) that force-completes the stage regardless of classifier output —
verified directly against a real (non-mocked) SQLite-backed session: the 4-turn budget fires exactly on
schedule and `unclassified.intro` resolves after one turn as specified.

`/chat`: `ChatRequest` gains `onboarding: bool = False` and `onboarding_track_hint: str | None` — every
non-onboarding caller (general Chat tab, HoldingDetailScreen) leaves both unset and is completely
untouched, per the PRD's confirmed "onboarding only" scope. When `onboarding` is set, the baseline gets a
new `onboarding` field (`{track, stage, guidance, closing_instruction?}`) — same instruction-field pattern
as `deepen` — and the response carries back `onboarding_state: {track, stage}`. `docs/prompts/
SYSTEM_PROMPT_v0_8_runnable.md` §4 documents the new field, explicit that it's a position marker never a
transcript (D-083's own distinction preserved) and that `closing_instruction`'s presence means the reply
must explicitly tell the user they can continue to the app now. The `fresh_starter` → `sequencing` stage's
guidance text carries BRIEF-011's compliance note verbatim in spirit: present the buffer/protection/growth
relationship as "how these needs typically relate," never a fixed order or recommendation.

Frontend: `OnboardingScreen`'s four chips each now name their track (`fresh_starter` / `reactive_dabbler` /
`habit_former` / `unclassified`, matching the PRD's own chip-to-track mapping exactly) and pass it through
`ChatThread`'s extended `send(text, deepenAlias?, onboardingTrackHint?)` handle. `ChatThread` takes a new
`onboarding` prop (true only for `OnboardingScreen`'s usage) and, when set, threads the hint through `app/
lib/chat.ts`'s extended `askQuestion(..., onboarding?: { trackHint? })`. A returning user with an
already-set `track`/`stage` just continues where they left off on their next call — resolves the PRD's
"resuming a skipped conversation" open question for free, nothing extra built for it.

**Verification, and its limit:** Python syntax/imports clean; `tsc --noEmit` clean across the whole app;
the onboarding service's persistence and turn-budget logic exercised directly against a real SQLite session
(not mocked) with both the deterministic-hint and free-text-classifier paths. **Not live-verified against a
real Postgres DB or the live Anthropic API in this session** — this cloud environment still has no
`DATABASE_URL`/`ANTHROPIC_API_KEY` (same standing gap BQ-023/BQ-004/BQ-039 carried before BQ-041 closed it
against a live API; the DB half of that gap is still open here). An HTTP-level TestClient run hit an
unrelated pre-existing SQLite-vs-Postgres `UUID` type incompatibility shared by every model in this schema
(`StreakState` included) — not a bug introduced by this item, just this environment's known DB limitation.
Real end-to-end verification (real DB, real API key, real device/browser) is the owner's local-session job,
same pattern as every prior DB-touching build item here.

### BQ-041 — Live-verify the teaching engine and both Haiku classifiers against the real Anthropic API — done 05-Aug-2026
Traces to D-080 (live API access confirmed working in this environment) + BQ-040 (the httpx fix that made
a real call possible at all). Closes the "not verified end-to-end against a live Anthropic API" disclaimer
carried by BQ-023 (`ask_teaching_engine`), BQ-004 (`classify_deepen`), and BQ-039 (`classify_holding_
capture`) — every one of those was previously only unit-tested against a mocked client. No code changed;
this is a verification pass, not a build item, logged here because it closes a standing disclaimer rather
than because anything was built.

Ran all three real functions directly (bypassing the DB layer, which still has no `DATABASE_URL` in this
environment — that half of the standing disclaimer remains open):
- `ask_teaching_engine`, live, against `FIXTURE_user_01.json` + "How does term insurance actually work?" —
  clean Q2-shaped response (opens on the situation, teaches the mechanism, no advice drift, 258 words).
- `classify_deepen`, live, against a specific vs. a general question — correctly resolved to `Loan-1` on
  the specific one, correctly returned `None` on the general one.
- `classify_holding_capture`, live, across four cases: a genuinely new personal loan (correctly extracted
  `product_type`/`characteristics`), a general question (correctly `None`), a question referencing an
  already-tracked holding (correctly `None`, not proposed as new), and a second holding of an
  already-held `product_type` (correctly still proposed — D-078's explicit no-dedup scoping confirmed to
  behave as documented, not just as written).

No bugs found beyond the one BQ-040 already fixed. Real device/simulator testing and a live
Postgres/`DATABASE_URL` round-trip remain the one standing gap this pass does not close.

### BQ-040 — Fix live-breaking `anthropic`/`httpx` version incompatibility — done 05-Aug-2026
Traces to D-080, caught while running Phase-1 Run 7 live (the first session able to make real Anthropic API
calls from inside Cowork itself — see D-080). `backend/requirements.txt` pinned `anthropic==0.39.0`, whose
base HTTP client passes a `proxies` kwarg that `httpx>=0.28.0` removed; instantiating `anthropic.Anthropic`
crashed immediately (`TypeError: Client.__init__() got an unexpected keyword argument 'proxies'`). Never
caught before because `deepen_classifier`, `holding_capture_classifier`, and `teaching.py` were all only
ever unit-tested against a mocked client — this means **the backend as pinned would have crashed on its
first real `/chat`, `deepen`, or holding-capture call**, not a hypothetical. Fixed by adding `httpx<0.28` to
`requirements.txt` alongside the existing `anthropic` pin — a dependency-version fix, not a new library.
Verified: reproduced the crash in a fresh venv install before the fix, confirmed a real live Sonnet/Haiku
call succeeds after pinning `httpx==0.27.2`; `python -m py_compile` and route registration still clean.

### BQ-039 — AI-surfaced holding capture: narrow Haiku extraction + confirm-card UI — done 05-Aug-2026
Traces to D-078 (both forks confirmed live, session 2026-08-05a's follow-on discussion). This is D-012's
first real primary-path build — everything shipped before this (BQ-036) was the manual/secondary path.

Backend: `backend/app/services/holding_capture_classifier.py` (`classify_holding_capture`) — the first
real use of D-002's "Haiku for reconciliation" half, same narrow-non-teaching-call shape as
`deepen_classifier.py` (D-072). Reads the user's own `/chat` message plus their existing holdings
(alias + product_type only, D-010) and asks Haiku one narrow question: does this describe a new,
not-yet-tracked holding, and if so which D-013/D-066 `product_type` + which characteristic fields can be
confidently extracted. The taxonomy/field list is hard-coded in this module (no shared schema file with
`app/lib/characteristicsSchema.ts` exists — same mirror-by-comment convention `budget.py`/`surfacing.py`/
`taxonomy.ts` already use independently). Degrades to `None` on every failure mode — no key, API error,
non-JSON/non-NONE reply, unrecognized `product_type` — same discipline as D-072; a valid response with one
hallucinated extra characteristic key has that key dropped rather than the whole proposal rejected.
`POST /chat`'s response in `main.py` gains an optional `holding_proposal: {product_type, characteristics}
| None` field, computed after the teaching call, independent of and unaffected by whether `deepen` fired
this turn.

Frontend: `app/lib/chat.ts`'s `askQuestion` now returns `{response, holdingProposal}` instead of a bare
string (its one caller, `ChatThread`, updated in the same change — no other call sites existed). New
`app/components/HoldingProposalCard.tsx` — a read-only preview (humanized product type + each extracted
field via `CHARACTERISTICS_SCHEMA`'s labels) with Save/Not now. `ChatThread.tsx`'s `Message` type gains an
optional `holdingProposal`/`proposalResolved` pair; the card renders under the assistant bubble it
belongs to and disappears (without ever writing anything) the instant either button is tapped. Save calls
the existing `createHolding` (D-074/BQ-036 — alias auto-generated, same as the manual-add flow); nothing
is written to the database from the classifier alone (D-078 Fork 2). **Explicitly scoped out, not
silently dropped (both named in D-078):** no dedup check against the user's existing same-`product_type`
holdings — a user can legitimately hold two loans, and the confirm step already lets them decline a real
duplicate; no in-card field editing — corrections happen via the existing edit UI (BQ-028) after saving.

Verified: backend — `python -m py_compile` clean, `/chat` route registers with the new response shape;
`classify_holding_capture` unit-tested against a mocked Anthropic client across 8 cases (no key configured,
NONE reply, confident match, unrecognized `product_type`, a hallucinated extra characteristic key correctly
dropped, malformed/non-JSON reply, a response whose only characteristics all get dropped correctly returns
`None` rather than an empty dict, and a raised `anthropic.APIError`) — all degraded or resolved correctly,
script discarded after (matches this repo's established pattern). Frontend — `npx tsc --noEmit` clean,
`npx expo export --platform android` bundled cleanly (935 modules, no errors). An incidental
`package-lock.json` diff from a different local npm version normalizing the file (same `libc`-field noise
BQ-033 hit) was discarded, not committed. Not verified end-to-end against a live database/Anthropic
API/real device — same standing limitation as every other BQ item this session; this sandbox has neither.

### BQ-038 — Two disclosed LOW findings from `KNOWN_LIMITATIONS.md` closed — done 04-Aug-2026
Picked up independently (no owner decision needed — both were purely mechanical, already-disclosed fixes
flagged "whenever someone's next touching those files anyway"). (1) `backend/app/services/consolidated.py`'s
ESOP-exclusion comment was stale (blamed D-055's undesigned schema; D-066 resolved that same day) — updated
to state the real reason (no decided net-worth valuation formula for a vested ESOP grant), zero behavior
change. (2) `app/lib/chat.ts`'s `askQuestion` leaked raw HTTP/fetch errors ("Backend responded 503") straight
to the Chat UI — now wraps both non-OK responses and network-level fetch failures in one on-brand message
("Couldn't reach the teaching engine — try again in a moment."), matching the backend's own no-raw-exception
posture. Both entries removed from `docs/KNOWN_LIMITATIONS.md` per that file's own resolution rule. Verified:
`python -m py_compile` clean; `npx tsc --noEmit` clean; `npx expo export --platform android` bundled cleanly
(934 modules, no errors).

### BQ-037 — Discretionary-spending-category CRUD — done 04-Aug-2026
Traces to the MEDIUM item found in the 04-Aug-2026 live-verification pass. No new decision needed — D-038
already fully specified the `DiscretionaryCategory` shape (`label`, `planned_amount`); this was the same
kind of already-decided CRUD gap BQ-016/BQ-017 closed for Income/Goals, not a design question. Backend:
`backend/app/services/discretionary_categories.py` (`list_discretionary_categories`/
`create_discretionary_category`) and `GET`/`POST /discretionary-categories` in `main.py`. `compute_budget()`
is untouched — it already read this table correctly, it just had nothing to read. Frontend:
`app/lib/discretionaryCategories.ts` + a new "Discretionary spending" section on `BudgetingScreen.tsx`
(list + an inline "+ Add discretionary category" form), matching the existing Income/Goals sections'
pattern exactly. No PUT/DELETE — same minimal GET-list/POST-create scope BQ-017 used for Goals, not
silently dropped. Verified: `python -m py_compile` clean, both routes register; the service unit-tested
against a mocked DB session (list + create, confirming `Decimal`→`float` conversion and the returned shape)
— passed. `npx tsc --noEmit` clean, `npx expo export --platform android` bundled cleanly (934 modules, no
errors). Verified via type-check + bundle + unit test only, not the full live-Postgres/browser rig the
CRITICAL item above got — proportionate to this being genuinely mechanical CRUD for an already-decided
shape, same rigor BQ-016/BQ-017 originally received. Not verified end-to-end against a live database or a
real device.

### BQ-036 — Manual add-holding UI, auto-generated alias, family-scoped picker — done 04-Aug-2026
Traces to BRIEF-018 → **D-074** (Path A confirmed). Closes the CRITICAL gap found in the 04-Aug-2026
live-verification pass: there was no way to add a new holding anywhere in the app. Backend:
`backend/app/services/holdings.py` gains `_generate_alias`/`_humanize_product_type`; `create_holding`'s
`alias` parameter is now optional — when omitted, the next unused `"{Humanized Product Type}-{n}"` label
is generated scoped to that exact `product_type` for the user (e.g. `"Home Loan-1"`, not the broader
family). `main.py`'s `HoldingCreate.alias` is now `str | None`. Frontend: `app/lib/holdings.ts` gains
`createHolding`; `HoldingEditModal.tsx` is extended (not duplicated) with a `holding: Holding | null`
create mode — no alias field, no delete button, `POST` instead of `PATCH`, title "Add holding," and a new
`familyTypes` prop that scopes the product-type picker to the current tab (edit mode keeps the existing
unconstrained `ALL_PRODUCT_TYPES` picker, BQ-027/D-059 untouched); `HoldingsList.tsx` gains the actual
"+ Add {family}" button (shown in both empty and populated states) that opens the modal and reloads on
save. AI-surfaced creation (`/chat` creating a holding from conversation) remains separate, untouched,
much larger work — D-012's primary path, not addressed here.

**Verified live, not just type-checked** — same real local Postgres + real running backend + real
Chromium/Playwright session as the original verification pass that found this gap, specifically to close
the loop on the most critical finding: tapped "+ Add loan" on the empty Loans tab, confirmed the
product-type picker showed only Home Loan/Personal Loan/Credit Card Debt (not the full taxonomy), filled
in a display name and characteristics with **no alias field present anywhere in the form**, saved, and
confirmed via a direct backend query that the holding was created with `alias: "Personal Loan-1"`,
auto-generated exactly as designed. Separately confirmed editing an existing holding still shows the Alias
field and the unconstrained product-type picker, unaffected by this change. Also: `npx tsc --noEmit`
clean, `npx expo export --platform android` bundled cleanly (933 modules). Local Postgres, backend server,
temporary web-testing dependency, and test credentials were all cleaned up afterward, same as the original
pass.

### BQ-035 — Variable-income budgeting via declared floor + typical range (Path B2) — done 04-Aug-2026
Traces to BRIEF-011 (escalated hard-stop) → BRIEF-017 (three paths modeled) → **D-073** (Path B2
confirmed). Backend: `IncomeSource` Pydantic model in `main.py` gains optional `amount_high` — no
migration, `Income.sources` is already JSONB. `budget.py`'s `compute_budget()` is untouched: `amount`
keeps meaning the floor/conservative figure, `amount_high` is never read by the math, confirmed by a
unit test (a source with `amount=40000, amount_high=90000` produces `income_total=40000`, not an
average). Frontend: `IncomeSource` interface in `lib/income.ts` matches; `BudgetingScreen.tsx`'s income
list shows both figures per source (floor as the primary value, "typical ~₹X" as a muted second line
when present), `AddIncomeForm` gains an optional second input ("Typical amount, if it varies"), and the
Budget card shows a one-line caption when any income source has `amount_high` set, clarifying the budget
uses the conservative figure, not the typical one. Verified: backend — `python -m py_compile` clean,
`/income` route registers, the floor-only budget-math unit test passed. Frontend — `npx tsc --noEmit`
clean, `npx expo export --platform android` bundled cleanly (933 modules, no errors). Not verified
end-to-end against a live database or a real device — same standing limitation as every other item this
session. Path A (rolling-window average) remains deferred per D-073, unparks on real evidence a
declared floor+typical pair isn't enough.

### BQ-004 — Backend `deepen` selection logic for the general Chat-tab case — done 04-Aug-2026
Traces to D-028 (deferred), D-049/BRIEF-006 (Path A/B/C modeled), D-071 (Path B shipped for the UI-signal
case), **D-072** (Path A confirmed and shipped for everything else — this entry). Added
`backend/app/services/deepen_classifier.py` (`classify_deepen`) — a narrow, non-teaching Haiku call
(`claude-haiku-4-5-20251001`, first real use of D-002's Haiku half) that reads the question plus the
user's holdings (alias + product_type only, `display_name` never sent — reuses the exact list
`assemble_baseline` already builds, so D-010 holds by construction) and returns a single confident alias
or nothing. Wired into `POST /chat` in `main.py`: runs only when D-071's deterministic UI-signal path
didn't already set `deepen`; on a match, sets `deepen` with a fixed backend-authored reason (never a
model-invented one, per the system prompt's own rule); any ambiguity, a reply that isn't a recognized
alias, an API error, or a missing key all degrade cleanly to D-028's existing safe "deepen nothing"
default — never worse than today's behavior, only sometimes less deep than an ideal classification would
be. This closes BQ-004 and BRIEF-006 entirely; every `/chat` entry point now has a decided mechanism.
Verified: `python -m py_compile` clean, `/chat` route registers; `classify_deepen` unit-tested against a
mocked Anthropic client across six cases (no key configured, empty holdings list, confident match,
explicit "NONE" reply, hallucinated/unrecognized alias, and a raised `anthropic.APIError`) — all degraded
or resolved correctly, script discarded after (no persistent test files exist in this repo yet). Not
verified end-to-end against a live database or live Anthropic API — this sandbox has neither.

### BQ-034 — Wire `deepen` for the "Ask about this" entry point only — done 04-Aug-2026
Traces to D-071 (BRIEF-006 narrowed and confirmed). Backend: `/chat`'s `ChatRequest` gained an optional
`deepen_alias` field; `assemble_baseline(db, user_id, deepen_alias)` sets `deepen = {alias, reason: "the
user asked directly about this holding"}` only when the alias resolves to one of the calling user's own
holdings — an unrecognized or stale value degrades silently to D-028's existing "deepen nothing" default
rather than being trusted. No model call anywhere in the selection path. Frontend: `HoldingDetailScreen`'s
"Ask about this" button now passes `deepenAlias: holding.alias` alongside its existing `prefillQuestion`
through the `Chat` tab's nav params; `ChatScreen` forwards both to `ChatThread`'s imperative `send(text,
deepenAlias)` (extended from `send(text)`), which passes it through to `askQuestion`. **Scope discipline
verified, not just asserted:** the plain `Send` button in `ChatThread` still calls `sendText(input)` with
no second argument, and `OnboardingScreen`'s chip starters still call `send(chip.message)` — neither path
can accidentally acquire a `deepenAlias`, so every `/chat` entry point besides "Ask about this" is
unchanged. Verified: backend — `python -m py_compile` clean, `/chat` route registers with the new field;
`assemble_baseline`'s deepen logic unit-tested against a mocked DB session across three cases (no alias
given → absent, alias matches a holding → set correctly, alias doesn't match any holding → degrades to
absent, not trusted) — all passed, script discarded after (matches this repo's established pattern, no
persistent test files exist yet). Frontend — `npx tsc --noEmit` clean, `npx expo export --platform
android` bundled cleanly (933 modules, no errors). Not verified end-to-end against a live device/backend,
same standing limitation as every other frontend/backend item this session. BQ-004 (the general Chat-tab
case) remains BLOCKED — untouched by this item.

### BQ-033 — Mascot mood reacting to a completed teaching moment — done 04-Aug-2026
Traces to BQ-032 (D-061/P7). `ChatThread` (shared by `ChatScreen`/BQ-024 and `OnboardingScreen`/BQ-025, so
both surfaces get the reaction for free) now owns mascot mood state: renders `<Mascot mood={mood} />` above
the message list, starts `'neutral'`, flips to `'celebrating'` right after a successful `/chat` response
completes, and reverts to `'neutral'` after 2.5s via a cleared-on-unmount timeout — a brief reaction to the
completed-exchange event itself, never to the response's content or any financial figure (P7's boundary,
same as BQ-031's streak wiring already holds). No new backend signal needed, matching the item's own scope
note. `Mascot.tsx`'s comment updated — the "teaching moment wiring isn't built yet" note is no longer true.
Verified: `npx tsc --noEmit` clean (after `npm install`, `node_modules` wasn't present in this session),
`npx expo export --platform android` bundled cleanly (933 modules, no errors). An incidental
`package-lock.json` diff from a different local npm version normalizing the file (dropping `libc` fields on
optional deps) was discarded, not committed — unrelated to this change. Not verified end-to-end against a
live device/backend, same standing limitation as every other frontend BQ item this session.

### BQ-026 — CLOSED, all three sub-cases done end to end — done 04-Aug-2026
Traces to BRIEF-013 (comparison-view shape) + D-067 (user-triggered detection). All three sub-cases now
shipped: loan-vs-invest (D-068), ESOP-timing (D-069), and tax-saving (D-070, this entry) — see each
sub-entry below for full build detail. This closes BQ-026 entirely; nothing about the comparison-view item
remains open.

### BQ-026 (tax-saving half) — 80C room UI + computation, end to end — done 04-Aug-2026
Traces to D-067 (user-triggered detection) + D-070 (BRIEF-016, unused-80C-room only, never a rupee
tax-savings figure). Backend: `backend/app/services/tax_saving_room.py` (`compute_tax_saving_room`) + `GET
/tax-saving-room`. Tax regime is a required query param, never stored — new regime returns
`{applicable: false}` with an honest "not relevant for you" note and no number; old regime sums
`ppf_epf`'s `annual_contribution` + `term_insurance`/`endowment_ulip`'s `premium` (annualized via
`budget.py`'s existing `_to_monthly` helper, reused rather than re-implemented) and returns
`max(0, 150000 − known_contributions)`. Equity mutual funds are never counted (ELSS ambiguity, disclosed
via the response's `note` field, not solved). Frontend: `app/lib/taxSavingRoom.ts` +
`app/components/TaxSavingRoomModal.tsx` — a regime-choice screen first, then the result (or the
new-regime "not relevant" message) — and a "Check my 80C room" button on `BudgetingScreen`, not tied to
any single holding (unlike the other two comparisons — this one relates to income/existing 80C holdings
generally, per BRIEF-016's own placement proposal). Verified: `python -m py_compile` clean, route
registers, `/tax-saving-room` correctly 500s without a configured database; the formula unit-tested across
five cases (new regime → not applicable, old regime with no contributions → full room, old regime with
PPF+insurance contributions → correctly reduced room *and* confirmed an equity-fund holding is correctly
ignored, contributions exceeding the cap → room floors at 0 not negative, invalid regime value rejected)
— all passed. `npx tsc --noEmit` clean, `npx expo export --platform android` bundled cleanly (933 modules,
no errors). Not verified end-to-end against a live device/backend.

### BQ-026 (ESOP-timing half) — cost-of-exercising-today UI + computation, end to end — done 04-Aug-2026
Traces to D-067 (user-triggered detection) + D-069 (BRIEF-015, cost-of-exercising-today only, options-only
scope). Backend: `backend/app/services/esop_exercise_cost.py` (`compute_esop_exercise_cost`) + `GET
/esop-exercise-cost`. New logic not designed before this item — D-066 explicitly left vesting computation
undesigned — cliff-gated linear vesting derived from `grant_date`/`vesting_cliff_months`/
`vesting_period_months`, no fractional units. Exercise cost is deterministic (`vested_units × strike_price`).
Taxable spread shown only when `current_fmv` is populated, framed as mechanism only (never a final tax
figure, staying clear of the tax-regime gap blocking tax-saving modeling). **A real bug caught and fixed
during testing, not shipped:** the initial implementation showed the "options underwater" message when
nothing had vested yet (spread = 0 by coincidence, not because the options were actually underwater) —
fixed by giving "nothing vested yet" its own message with priority over both the underwater and
no-valuation cases. Frontend: `app/lib/esopExerciseCost.ts` + `app/components/EsopExerciseCostModal.tsx`
(three cards: vested units, exercise cost, taxable spread — no input needed, computed entirely from the
grant's own stored terms and today's date) and a "Cost of exercising today" button on
`HoldingDetailScreen`, shown only for `esop` holdings with `grant_type: "options"` (RSUs don't get this
affordance — D-069's scope). Verified: `python -m py_compile` clean, route registers, `/esop-exercise-cost`
correctly 500s without a configured database; the formula unit-tested across six cases (mid-vesting,
pre-cliff, fully vested, missing `current_fmv`, underwater, and the pre-cliff+no-`current_fmv` combination
that surfaced the priority bug) plus four error-handling cases (wrong product type, RSU rejected, missing
required fields, holding not found) — all passed after the fix. `npx tsc --noEmit` clean, `npx expo export
--platform android` bundled cleanly (931 modules, no errors). Not verified end-to-end against a live
device/backend. Tax-saving modeling is now BQ-026's one remaining open sub-case.

### BQ-026 (loan-vs-invest half) — Compare-paths UI + hurdle-rate computation, end to end — done 04-Aug-2026
Traces to D-067 (user-triggered detection) + D-068 (hurdle-rate-only math, BRIEF-014). Backend:
`backend/app/services/loan_vs_invest.py` + `GET /loan-vs-invest` (see D-068 for full verification detail).
Frontend, built same session once D-068 confirmed: `app/lib/loanVsInvest.ts` (fetch wrapper) and
`app/components/LoanVsInvestModal.tsx` — a prepay-amount input, a "number to watch" hurdle-rate card, and
both prepayment-mode results shown in **input order, not by which saves more** (BRIEF-013's no-ranking-
in-layout requirement — "if you keep the same EMI" then "if you keep the same tenure," a natural
description order, not a favorability order), plus the prepayment-charge caveat. Entry point: a "Compare:
prepay vs. invest" button on `HoldingDetailScreen`, shown only for `home_loan`/`personal_loan` holdings
(matching the backend's own scope), sitting alongside the existing "Ask about this" and "Edit" buttons —
this is D-067's user-triggered affordance, not an auto-detected one. Verified: `npx tsc --noEmit` clean,
`npx expo export --platform android` bundled cleanly (929 modules, no errors). Not verified end-to-end
against a live device/backend. Tax-saving modeling and ESOP-timing remain open under BQ-026 (see NOT YET
READY above).

### D-066 — ESOP characteristics field schema (design pass) — done 04-Aug-2026
Not a BQ item — the queue previously listed this as unqueued design work ("needs its own design pass...
before it's a buildable BQ item"). Applied D-013's split-vs-merge test directly: ESOP stays one type
(matching D-055's scope — splitting into two types would be a further scope increase, not authorized
here), with `grant_type` (`options`/`rsu`) as the distinguishing field, same resolution D-013 used for
FD/RD. Eight fields — `grant_type`, `grant_date`, `total_units_granted`, `vesting_cliff_months`,
`vesting_period_months`, `strike_price`, `current_fmv` (nullable), `exercise_window_months` — landed in
`app/lib/characteristicsSchema.ts`, closing the "not designed yet" gap BQ-028 shipped with earlier this
session. No stored `vested_units` — derivable from the other fields, not designed here (D-038's
reference-vs-store test). Logged as **D-066** (Tier 2, REVIEW-FLAGGED — acted on immediately per the
protocol's own design, not gated on advance confirmation; full lens table in the write-up). Verified: `npx
tsc --noEmit` clean, `npx expo export --platform android` bundled cleanly (927 modules).
**`PROJECT_SPEC.md` §6's ESOP note is now stale** (still says the field list is deferred) — a proposed
edit, not applied silently; flagged to the owner below per §8's own edit rule.

### BQ-022 — Holding-detail view, as a home for teaching content — done 04-Aug-2026
Traces to BRIEF-013, unblocked by BQ-015. **Real navigation-shape call made while building, not escalated
— reasoned through below, not a hard-stop:** BQ-027 had already claimed the row tap for the edit modal, so
BQ-022's "reachable by tapping a holding" needed reconciling with that. Resolved by making each family tab
(Investments/Loans/Insurance) its own small `createNativeStackNavigator` (`HoldingsStackParamList`: `List`
→ `Detail`) — tapping a row now navigates to the new read-only `HoldingDetailScreen`, which has its own
"Edit" button opening the same `HoldingEditModal` as before (full BQ-027/D-059 authority preserved, one
tap deeper, not removed). `HoldingsList` no longer owns modal state; it reloads via `useFocusEffect` when
regaining focus (covers returning from Detail after an edit/delete) instead of a callback threaded through
params. `HoldingDetailScreen` shows the holding's filled-in characteristics (reusing BQ-028's
`CHARACTERISTICS_SCHEMA` for labels) and an "Ask about this" button that cross-navigates to the `Chat` tab
(`navigation.getParent()`) with a pre-filled question.

**Compliance-adjacent catch made and fixed before it shipped:** the pre-filled question is built from the
holding's **alias only, never `display_name`** — `/chat`'s `question` field is sent to the LLM verbatim
(`teaching.py`), so an app-generated message containing a real product/institution name would have been a
genuine D-010 violation (the architectural guarantee is that the LLM never sees real names) — not a
user-typed exception §3 rule 2 already handles, but the app manufacturing the leak itself. Caught during
design, not after; the comment is left in the code (`HoldingDetailScreen.tsx`) so a future edit doesn't
casually swap in `display_name`. Added `{ prefillQuestion?: string }` to `MainTabsParamList`'s `Chat`
entry; `ChatScreen` sends it once via `ChatThread`'s existing imperative `send()` (already built for
BQ-025's chips) and clears the param so navigating back later doesn't resend it.

Verified: `npx tsc --noEmit` clean, `npx expo export --platform android` bundled cleanly (927 modules, no
errors). Not verified end-to-end against a live device/backend — the cross-tab navigation and focus-reload
behavior in particular would benefit from the owner's own hands-on check when a real device/simulator is
available.

### BQ-028 — Holdings characteristics (field-level) editing UI — done 04-Aug-2026
Traces to D-059 (Decision 2, Path C), unblocked (BQ-027 already had the alias/display_name/product_type
half). Added `app/lib/characteristicsSchema.ts` — D-013's per-type field lists transcribed for form
rendering (`{key, label, kind: 'text'|'number'|'date'|'enum', options?}`), covering all 8 original D-013
types (`fd_rd`/`ppf_epf` merges reuse their single field set; loan and fund types share their common
shapes since D-013 gave them identical field lists). **`esop` is deliberately absent** — D-055 added it to
the taxonomy but left its characteristics schema undesigned; the UI shows an explicit "not designed yet"
message rather than a guessed field list. Extended `HoldingEditModal.tsx` with a dynamic "Characteristics"
section below the product-type picker: enum fields (`investment_mode`, `deposit_mode`,
`retirement_fund_type`) render as the same chip-toggle pattern already used for product type; everything
else is a plain `TextInput` (numeric keyboard for number fields, no date-picker dependency — dates stay
`YYYY-MM-DD` text, matching BQ-020's goal-date convention). Recategorizing (changing `product_type` in the
same modal) resets the characteristics section, since a different type's fields aren't meaningful carried
over. A blank field is omitted from the save payload rather than sent as an empty string. Verified: `npx
tsc --noEmit` clean, `npx expo export --platform android` bundled cleanly (926 modules, no errors). Not
verified end-to-end against a live device/backend.

### BQ-020 — Budgeting/Goals tab (frontend, new tab) — done 04-Aug-2026
Traces to BRIEF-013, unblocked by BQ-010/BQ-016/BQ-017. Added `app/lib/budget.ts`, `income.ts`, `goals.ts`
(thin fetch wrappers, same convention as `holdings.ts`/`consolidated.ts`) and
`app/screens/BudgetingScreen.tsx` — a new `Budgeting` tab in `MainTabs`. Shows the live `GET /budget`
summary (income/outflows/discretionary/net), the income sources list with an inline "+ Add income source"
form (appends to the user's first `Income` row via `PUT`, or creates one via `POST` if none exists yet —
keeps it to one row per user in practice even though the backend allows more), and the goals list with
each goal's live `progress` (BQ-017) against its `target_amount`, plus an inline "+ Add goal" form.
Extracted `formatRupees` into `app/lib/format.ts` (was duplicated as a local helper in
`ConsolidatedTotalsCard`; now shared, refactored that file to use it too).

**Scoped out, not silently dropped:** no `funded_by` picker in the goal-creation form — a goal is created
unfunded (empty `funded_by: []`) and can be linked to holdings later; matches the same first-pass scoping
`characteristics`-editing got in BQ-027 (BQ-028 covers that follow-on). Target date is a plain
`YYYY-MM-DD` text field, validated with a regex — no date-picker dependency added (would be a new library
decision). Verified: `npx tsc --noEmit` clean, `npx expo export --platform android` bundled cleanly (925
modules, no errors). Not verified end-to-end against a live device/backend.

### BQ-025 — Onboarding flow (D-058: chip-guided, no structured field, default landing screen, skippable) — done 04-Aug-2026
Traces to D-058, unblocked by BQ-023/BQ-024. Extracted the message-thread UI out of `ChatScreen` into a
shared `app/components/ChatThread.tsx` (message list, input, send logic — exposes an imperative `send()`
via ref so a parent can trigger a message from outside the input, e.g. a chip tap) and slimmed
`ChatScreen` down to a thin wrapper around it. Added `app/screens/OnboardingScreen.tsx`: four tappable
chip starters (no structured field anywhere, per D-058), reusing `ChatThread` for the actual
conversation — tapping a chip sends it as a real message through the same `/chat` endpoint BQ-023 built.
"Skip for now" is always visible in the header; becomes "Done — go to app" once a message has been sent
(chip or typed) — same action either way, just dismisses. Added `app/lib/onboarding.ts`
(`hasSeenOnboarding`/`markOnboardingSeen`, `@react-native-async-storage/async-storage` — already an
existing dependency via `lib/supabase.ts`, not a new one) to persist per-user "seen" state locally, since
D-058 explicitly left exact resume-UI to build-time as a low-stakes detail. Wired into
`RootNavigator.tsx`: a new `AuthenticatedApp` wrapper checks the flag once per session and renders
`OnboardingScreen` (not a hard gate — dismissible any time) or `MainTabs`.

**Design call, not a re-litigation of BQ-024's flagged note:** the persistent `Chat` tab (BQ-024) is kept,
not removed or replaced — it serves as the "resume a skipped/finished conversation later" surface D-058
asks for, so no separate resume UI was needed. BQ-024's DONE entry speculated this tab would "very likely"
get replaced; in practice it turned out complementary instead, so this entry corrects that expectation
rather than silently diverging from it. Verified: `npx tsc --noEmit` clean, `npx expo export --platform
android` bundled cleanly (920 modules, no errors). Not verified end-to-end against a live device/backend.

### BQ-024 — Chat/conversational UI screen (frontend) — done 04-Aug-2026
Traces to BRIEF-013, unblocked by BQ-023. Added `app/lib/chat.ts` (`askQuestion`) and
`app/screens/ChatScreen.tsx` (message-bubble list + text input, local-only message history — D-022: the
model never receives prior turns, only the current question; the UI list is display state, not
conversation memory). Wired in as a new `Chat` tab in `MainTabs`/`navigation/types.ts` — **navigation
placement was a judgment call, not a decided spec item:** BRIEF-013 named the conversational surface as
the central missing piece without specifying where it lives, so a persistent tab was chosen as the
lowest-risk, easily-revised placement, consistent with D-031's always-accessible sections. Flagged
explicitly for BQ-025 (D-058's onboarding flow), which will very likely replace this placement with the
default-landing-screen shape D-058 actually decided — that's BQ-025's job, not redone here. Verified:
`npx tsc --noEmit` clean, `npx expo export --platform android` bundled cleanly (917 modules, no errors).
Not verified end-to-end (no `DATABASE_URL`/live `ANTHROPIC_API_KEY` in this remote session). Unblocks
BQ-025 and BQ-026, both moved to READY.

### BQ-023 — Core teaching/chat backend endpoint — done 04-Aug-2026
Traces to the product core (D-001, D-002, D-010, D-028, system prompt v0.8). Added
`backend/app/services/baseline.py` (`assemble_baseline` — builds the exact JSON profile slice
`SYSTEM_PROMPT_v0_8_runnable.md` §4 documents: `baseline` (income/outgoings via `compute_budget`),
`goals` (D-038's `funded_by` list translated from `holding_id` to `alias`, `target_date` converted to
`horizon_years`), `holdings` (alias + characteristics only — **`display_name` is never included**, D-010's
guarantee held by construction, not just convention), `known_gaps` (reuses `compute_surfacing_candidates`,
BQ-013). `deepen` is omitted — D-028's decided default (absent means deepen nothing); BQ-004's selection
rule is still blocked and out of scope here. Added `backend/app/services/teaching.py`
(`ask_teaching_engine` — loads the v0.8 prompt file, calls the Anthropic Messages API via the official
SDK, model `claude-sonnet-5`/`max_tokens=4096` matching `scripts/run_phase1_test.py`'s established,
Phase-1-validated call shape exactly) and `POST /chat` in `main.py` (503 if `ANTHROPIC_API_KEY` unset, 502
— non-leaking detail — on an Anthropic API error). Added `anthropic==0.39.0` to `requirements.txt` —
already-decided architecture (§6), not a new library decision.

**One real gap surfaced and left open, not silently patched:** the system prompt's `baseline.dependents`
and `baseline.emergency_fund_months` fields (present in `FIXTURE_user_01.json`) have no backing field
anywhere in the current schema — omitted from the assembled JSON rather than guessed. Adding them would be
a schema change (`CLAUDE.md` hard-stop), not this item's call.

Verified: `python -m py_compile` clean, all routes register in a fresh venv, `/chat` correctly 500s
without a configured database (assembling the baseline hits the DB first, same as every other DB-backed
route). `assemble_baseline` unit-tested against a mocked session with a real holding/income/goal/gap
combination — confirmed `display_name` never appears anywhere in the assembled JSON, funding correctly
maps `holding_id` → `alias`. `ask_teaching_engine` unit-tested with the Anthropic client mocked — confirmed
`TeachingEngineNotConfigured` raises cleanly when the key is unset, and with a fake key confirmed the exact
message shape sent (system prompt attached, baseline JSON + question in the user message, correct
model/max_tokens). **No live API call made** — this sandbox blocks authenticated calls to
`api.anthropic.com` on purpose (same restriction `scripts/run_phase1_test.py`'s own docstring names), so a
real end-to-end teaching response is not claimed; the owner would need to verify that against a live
`DATABASE_URL` + `ANTHROPIC_API_KEY` locally. Unblocks BQ-024 (chat UI), moved to READY.

### BQ-021 — Consolidated screen wired to real aggregation — done 04-Aug-2026
Traces to BRIEF-013, unblocked by BQ-018. Added `app/lib/consolidated.ts` (`fetchConsolidated`) and
`app/components/ConsolidatedTotalsCard.tsx` — three rows (Investments / Loans / Insurance cash-value),
`₹`-formatted via `toLocaleString('en-IN')`, matching D-065's per-family-totals shape (no signed net-worth
figure). Loading/error/signed-out states follow `HoldingsList.tsx`'s existing convention. Replaces
`ConsolidatedScreen`'s placeholder body text. Verified: `npx tsc --noEmit` clean, `npx expo export
--platform android` bundled cleanly (915 modules, no errors). Not verified end-to-end against a live
device/backend (no `DATABASE_URL` in this remote session).

### BQ-031 — Streak + reward UI (frontend) — done 04-Aug-2026
Traces to D-060, D-061, P7. Added `app/lib/streaks.ts` (`fetchStreak`, `recordAppOpen` — same
fetch-wrapper convention as `lib/holdings.ts`) and `app/components/StreakBadge.tsx` (a text badge, "🔥
N-day streak", reading only the streak count — no financial figure, per P7). Wired into
`ConsolidatedScreen`: a mount-time `useEffect` calls `recordAppOpen(userId)` once (the app-open event,
D-060/BQ-029/BQ-030), and `Mascot`'s mood switches to `'celebrating'` when the response's `reward_fired`
is true, `'neutral'` otherwise — the mascot reacting to the app-open/reward event itself, never to a
holding or balance (P7's boundary). A failed streak call is swallowed, not surfaced as an error — this is
a nice-to-have layer, not core functionality, so it must not block or break the rest of the screen.
**Haptic feedback scoped out, not silently dropped:** the item's text mentions "visual/haptic," but
`expo-haptics` isn't an existing dependency — adding a new library is its own decision per `CLAUDE.md`'s
hard-stop list, not bundled into this item; shipped the visual half only. Verified: `npx tsc --noEmit`
clean, `npx expo export --platform android` bundled cleanly (913 modules, no errors). Not verified
end-to-end against a live device/backend (no `DATABASE_URL` in this remote session, same limitation
BQ-014/BQ-019 hit) — code-level and bundle verification only.

### BQ-030 — Variable reward trigger logic (backend) — done 04-Aug-2026
Traces to D-060, P7. Added `backend/app/services/rewards.py` (`evaluate_reward(is_new_day)`) — a
variable-ratio probability roll (constant `_REWARD_PROBABILITY = 0.3`, documented as a plain tunable
game-design number, not requiring a new decision to adjust — P7's app-behavior-only half). Only rolled on
a genuinely new streak day (never on a same-day repeat open), so a client can't force extra rolls by
refreshing — the gate is `POST /streak/open` comparing the pre-call `last_active_date` to today, computed
in `main.py` before calling `record_app_open`, keeping `streaks.py` (BQ-029) untouched. `POST
/streak/open` now returns `reward_fired`/`reward_type` alongside the streak fields in one response.
Scoped to app-open only, per the item's own text — no reaction to a completed teaching moment yet (needs
BQ-023/024 first). Reward type is a single generic `"celebration"` string, matching `Mascot.tsx`'s
`'celebrating'` mood (BQ-032) — concrete reward assets/animation are BQ-031's job, not invented here.
Verified: `python -m py_compile` clean, routes register, `/streak/open` correctly 500s without a
configured database, and `evaluate_reward` unit-tested with `random.random` mocked across all three cases
(same-day never fires regardless of RNG, below-threshold fires, above-threshold doesn't) — all passed.
Unblocks BQ-031, moved to READY.

### BQ-029 — Engagement/streak state model + API (backend) — done 04-Aug-2026
Traces to D-060, P7. Added `backend/app/models/streak_state.py` (`StreakState`: `current_streak`,
`longest_streak`, `last_active_date`, unique on `user_id`, one row per user) and
`backend/app/services/streaks.py` (`get_streak` — read-only, returns zeroed defaults if no row exists
yet; `record_app_open` — increments on a new calendar day's first open (server date), resets to 1 on a
missed day, no-ops if today was already recorded, so a client can safely call it on every foreground;
`longest_streak` is a monotonic high-water mark, never resets down). Two routes in `main.py`: `GET
/streak`, `POST /streak/open`. Hand-wrote the Alembic migration
(`974126e6d41f_add_streak_states_table_bq_029_d_060.py`) rather than autogenerating — no `DATABASE_URL`
in this remote session to reflect against, same limitation every migration since BQ-011 has hit — but
matched column-for-column against the exact `sa.UUID()`/`sa.Date()`/`sa.Integer()` conventions the three
prior migrations already established (verified by grep across all `alembic/versions/*.py`), not applied
against the live Supabase DB yet (owner's local credentials needed, same as BQ-011 on). Verified:
`alembic history` resolves the new revision as head with the correct chain; `python -m py_compile`
clean; app imports and both routes register in a fresh venv; the streak increment/reset/no-op logic unit-
tested against a mocked DB session across four cases (first open, same-day repeat, consecutive day,
missed-day reset with `longest_streak` preserved) — all passed. Unblocks BQ-030 (now has
`POST /streak/open` as its reactive event), moved to READY.

### BQ-018 — Consolidated net-worth aggregation endpoint — done 04-Aug-2026
Traces to BRIEF-013 + **D-065** (escalated mid-build: no formula was already decided, unlike BQ-010/
BQ-017 where D-038 spelled the math out). Owner resolved two questions: FD/RD holdings use
`principal_or_monthly_amount` as-is (no accrual formula invented); the endpoint returns separate
`investments_total`/`loans_total`/`insurance_total`, not one signed net-worth figure. Added
`backend/app/services/consolidated.py` (`compute_consolidated`) and `GET /consolidated` in `main.py`.
Per-type mapping: Equity/Debt MF + Stocks → `current_value`; FD/RD → `principal_or_monthly_amount`;
PPF/EPF → `current_balance`; Home/Personal Loan + Credit Card Debt → `outstanding_balance`;
Endowment/ULIP → `current_fund_value`; Term Insurance contributes 0 (no fund value); ESOP deliberately
excluded (D-055 left its characteristics schema undesigned — no field to sum). Verified: `python -m
py_compile` clean, route registers, `/consolidated` correctly 500s without a configured database (no
`DATABASE_URL` in this remote session), and the aggregation formula itself unit-tested against a mocked
DB session (8 holdings across all families, confirmed correct per-family sums, ESOP excluded, Term
Insurance contributes 0). Unblocks BQ-021 (Consolidated screen), moved to READY.

### BQ-017 — Goals CRUD API (GET list, POST create) — done 04-Aug-2026
Traces to D-038, Goal/GoalFunding models (BQ-009/BQ-012). Added `backend/app/services/goals.py`
(`list_goals`/`create_goal`) and two routes in `main.py`: `GET /goals`, `POST /goals` (201, `GoalCreate`
Pydantic body — `target_amount`/`target_date`/`category`/`funded_by`, the last a list of
`{holding_id, earmarked_amount}` creating `GoalFunding` child rows in the same call; 400 if a
`holding_id` doesn't exist, via the FK constraint's `IntegrityError`). Per D-038's explicit text
("progress is always computed live as the sum of earmarked holdings' current values — never
duplicated"), each returned goal carries a `progress` field computed as the live sum of its
`funded_by[].earmarked_amount` entries at read time — never stored on the `Goal` row itself; no new
formula invented beyond what D-038 already specifies. No PUT/DELETE — outside the item's stated
"GET list, POST create" scope. Verified: `python -m py_compile` clean, app imports and all routes
register in a fresh venv, `/health` returns 200, `/goals` correctly 500s without a configured database
(no `DATABASE_URL` in this remote session — same limitation prior BQ items hit). Unblocks BQ-020
(Budgeting/Goals tab) and BQ-023 (core teaching engine) together with BQ-016 — both moved to READY.

### BQ-016 — Income CRUD API (GET, POST/PUT) — done 04-Aug-2026
Traces to D-038, Income model (BQ-009). Added `backend/app/services/income.py` (`list_income`/
`create_income`/`update_income`, same dict-returning convention as `holdings.py`/`budget.py`) and three
routes in `main.py`: `GET /income`, `POST /income` (201, `IncomeCreate` Pydantic body — a list of
`{label, amount, frequency}` sources, `frequency` defaulting to `"monthly"`), `PUT /income/{income_id}`
(full replace of `sources`, matching PATCH-vs-PUT convention — Holdings' partial-update uses PATCH,
this is a full-array replace so PUT, per the item's own "GET, POST/PUT" scope). A user can have more
than one Income row, matching `compute_budget()`'s existing `db.query(Income).filter(...).all()` — this
item doesn't change that shape, just makes it writable. No DELETE — out of the item's stated scope, not
silently dropped. Verified: `python -m py_compile` clean, app imports and builds all routes correctly in
a fresh venv, `/health` returns 200, `/income` correctly 500s without a configured database (no
`DATABASE_URL` in this remote session — same limitation BQ-011/BQ-015 hit; full live-DB round-trip
verification needs the owner's local Supabase credentials, not claimed here).

### BQ-032 — Mascot character (concept + component) — done 04-Aug-2026
Traces to D-061, P7. Creative concept resolved owner-directly (no `DECISION_LOG` trigger fires — reversible,
no compliance/scope/principle impact, filling in an already-decided vehicle rather than adding new scope):
**Ankur**, a sprout/plant character — calm, patient, encouraging tone, matching the "teach, don't hype"
register. Explicitly not an owl, to avoid a direct visual clash with Duolingo's mascot on top of already
borrowing its engagement-mechanics playbook (D-060). Added `app/components/Mascot.tsx` — a reusable
component taking a `mood: 'neutral' | 'celebrating' | 'encouraging'` prop, placeholder emoji visual (no
real character art yet, no new asset/library dependency), using the new `app/design/tokens.ts` for color/
spacing. Given a real home on `ConsolidatedScreen` in `neutral` mood. **Not yet wired to real trigger
events** — mood changes on streak continuation need BQ-029/030/031 (not built); mood changes on a
completed teaching moment need BQ-023/024 (blocked) — this ships the reusable display piece those will
call into later, not live reactions yet. Verified: `tsc --noEmit` clean, `npx expo export --platform
android` bundled cleanly (911 modules, no errors).

### BQ-027 — Holdings edit/delete/recategorize (API + UI) — done 04-Aug-2026
Traces to D-059 (Decision 2, Path C). Backend: `update_holding`/`delete_holding` added to
`backend/app/services/holdings.py` (partial-update semantics — only non-None fields change; 409 on
alias collision via the existing `(user_id, alias)` unique constraint, same pattern as `create_holding`);
`PATCH /holdings/{holding_id}` and `DELETE /holdings/{holding_id}` (204) added to `main.py`. Frontend:
`app/lib/holdings.ts` gained `updateHolding`/`deleteHolding`; new `app/components/HoldingEditModal.tsx`
(display_name/alias text fields, product_type recategorize via a chip picker over
`taxonomy.ts`'s `ALL_PRODUCT_TYPES` — UI-constrained to the known taxonomy though the backend itself
stays unconstrained per D-044 — plus a destructive delete button behind an `Alert.alert` confirm).
`HoldingsList.tsx` rows are now tappable, opening the modal and reloading the list on save/delete.
**Scoped out of this pass, not silently dropped:** editing `characteristics` (the per-type field blob —
expense_ratio, interest_rate, tenure, etc.) isn't in the UI yet; the backend PATCH already accepts it, so
this is a pure UI follow-on, not a further Decision-2-shaped question. Verified: `tsc --noEmit` clean,
`python -m py_compile` clean on the backend, `python -c "from app.main import app"` confirmed all five
`/holdings*` routes register (GET list, POST, GET one, PATCH, DELETE), `npx expo export --platform
android` bundled cleanly (909 modules, no errors). Not verified against live data (no `DATABASE_URL` in
this remote session, same limitation prior BQ items hit).

### BQ-019 — Wire Investments/Loans/Insurance screens to real Holdings API — done 04-Aug-2026
Traces to BRIEF-013. Unblocked by BQ-015. Replaced BQ-014's three placeholder screens with a shared
`app/components/HoldingsList.tsx` read-only list view, reused by `InvestmentsScreen`/`LoansScreen`/
`InsuranceScreen` with a per-family `product_type` filter list. Added `app/lib/holdings.ts`
(`fetchHoldings`, calls `GET /holdings?user_id=`), `app/lib/taxonomy.ts` (the three family groupings —
D-013's 8 original types + ESOP/D-055 — mirroring the string literals already used in
`backend/app/services/budget.py`/`surfacing.py` — plus a `humanizeProductType` display helper), and
`app/lib/AuthContext.tsx` (a minimal React context carrying the signed-in Supabase `user.id` down to
the tab screens, since `MainTabs` had no way to reach it before; wired in from `RootNavigator`, which
already owned the session). Loading/error/empty/signed-out states handled; no create/edit/delete —
explicitly out of scope, that's Decision 2 (per-item management depth), still open. Verified: `tsc
--noEmit` clean, `npx expo export --platform android` bundled cleanly (908 modules, no errors). Not
verified against live data end-to-end (no `DATABASE_URL` in this remote session, same limitation
BQ-011/BQ-015 hit) — the owner still needs to confirm on a real device/simulator with actual holdings
in the DB.

### BQ-015 — Holdings CRUD API (GET list, GET one, POST create) — done 04-Aug-2026
Traces to D-013/D-055 taxonomy, D-010/D-011 aliasing, Holding model (BQ-012). Added
`backend/app/services/holdings.py` (`list_holdings`/`get_holding`/`create_holding`, returning plain
dicts, same convention as `budget.py`/`surfacing.py`) and three routes in `main.py`: `GET /holdings`,
`GET /holdings/{holding_id}` (404 if not found/not owned), `POST /holdings` (201, `HoldingCreate`
Pydantic body — `product_type`/`alias`/`display_name`/`characteristics`; 409 on a duplicate
`(user_id, alias)` via `IntegrityError`, matching the existing unique constraint from BQ-012).
`product_type` stays an unconstrained string per D-044 — this layer doesn't validate against the
taxonomy, deliberately, same reasoning as the Holding model itself. Verified: `python -m py_compile`
clean, app imports and builds all routes correctly in a fresh venv, `/health` returns 200, `/holdings`
correctly 500s without a configured database (no DATABASE_URL in this remote session — same limitation
BQ-011 hit; full live-DB round-trip verification, like BQ-012/BQ-013 did, needs the owner's local
Supabase credentials and is not claimed here). Unblocks BQ-018, BQ-019, BQ-022 (now moved to READY) and
half of BQ-023's dependency.

### BQ-014 — Bootstrap Expo app skeleton (React Navigation, Supabase auth) — done 04-Aug-2026
Traces to D-052. First code ever in `app/`. Expo + TypeScript project (`create-expo-app`,
blank-typescript template) — stripped its auto-generated `AGENTS.md`/`CLAUDE.md`/`.claude/`/`LICENSE`
boilerplate immediately, since a second, different operating-rules pair nested in `app/` would have
directly recreated the exact drift risk D-045 eliminated at the repo root. React Navigation (manual
setup, owner's call over Expo Router): `AuthStack` (Login/Register, Supabase-backed) shown with no
session; `MainTabs` (bottom tabs) shown once authenticated, with placeholder screens for
Investments/Loans/Insurance/Consolidated per D-031. `app/lib/supabase.ts` degrades to a null client
with a clear `NotConfiguredScreen` (mirrors `backend/app/db/session.py`'s missing-`DATABASE_URL`
pattern) rather than crashing when `EXPO_PUBLIC_SUPABASE_URL`/`_ANON_KEY` are absent. `app/lib/backend.ts`
pings `/health`, surfaced on the Consolidated screen. Verified: `tsc --noEmit` clean, Metro bundled
cleanly (1069 modules, no errors/warnings). **Also fixed:** root `.gitignore`'s `.env.*` rule was
unintentionally catching `app/.env.example` (a safe template, no secrets) — added a `!.env.example`
negation.

**Update, same day:** owner navigated the Supabase dashboard (Settings → API Keys) with me watching
via the Browser pane; found the project URL (`https://ojdyrmkyallorfmbsxbo.supabase.co`) and the
Publishable key (Supabase's own current term for the client-safe key — explicitly labeled "safe to
share publicly," not the Secret/service_role key). Owner confirmed writing both into `app/.env`.
Re-verified headlessly: started the dev server, confirmed the log shows `EXPO_PUBLIC_SUPABASE_URL`/
`_ANON_KEY` loaded, and confirmed both values are correctly inlined in the served JS bundle — so
`isSupabaseConfigured` now evaluates `true` and the app should show Login/Register, not
`NotConfiguredScreen`. D-052's dependency flag is resolved.
**Still open:** the iOS Simulator panel tool crash-looped both times it was tried and its own error
said retrying would not help — visual/interactive confirmation (actually seeing the login screen,
testing register/login against the real Supabase project) is still pending the panel recovering;
not claimed as verified beyond what the headless bundle check can show.

### BQ-013 — Surfacing candidate selection (WHICH half of D-012's trigger logic) — done 03-Aug-2026
Traces to D-051 (BRIEF-007 resolved, Path A staged). Added `backend/app/services/surfacing.py`'s
`compute_surfacing_candidates()` — a fixed pairing-rule table run against stored Holdings only, no
model judgment anywhere. v1 table: `home_loan`/`personal_loan` present + no `term_insurance` held →
candidate `term_insurance`, regardless of `endowment_ulip` (owner-confirmed the gap stands either
way — D-013 split Term from Endowment/ULIP because the teaching moment differs). Rule order is the
fixed precedence a future WHEN-stage tie-break would use; v1's single rule never exercises it.
Exposed via `GET /surfacing-candidates?user_id=`. **WHEN stays gated per D-051** — nothing here
decides to surface anything to a user; that requires D-032's on-topic constraint re-verified via
Phase-1 fixture testing first. Verified end-to-end against the live Supabase DB across four
scenarios (loan + no insurance → candidate; loan + Endowment/ULIP but no Term → candidate, correctly
not suppressed; loan + Term already held → no candidate; no loans → no candidate); test rows deleted
after verification.

### BQ-010 — Implement live budget computation (no stored Budget object) — done 03-Aug-2026
Traces to D-038. Added `backend/app/models/discretionary_category.py` (new `discretionary_categories`
table — owner chose this over a JSONB field on Income, logged as **D-048**) and
`backend/app/services/budget.py`'s `compute_budget()`, exposed via `GET /budget?user_id=`. Nothing
stored: income total (from Income, frequency-normalized to monthly) minus recurring outflows read
live off `Holding.characteristics` (EMI for home_loan/personal_loan, SIP investment amount for
equity/debt mutual funds only when `investment_mode == "SIP"`, insurance premium for
term_insurance/endowment_ulip, frequency-normalized) minus discretionary categories, summed as-is.
Alembic migration `ce8262c241ff` applied against the live Supabase DB. Verified end-to-end: inserted
a test user's Income/holdings/discretionary rows, confirmed `/budget` matches the hand-computed
total exactly (including correctly excluding a lumpsum-mode fund from recurring outflows), test rows
deleted after verification.

### BQ-012 — Build the real Holdings model — done 03-Aug-2026
Owner-directed mid-session, as the direct follow-up to BQ-009's flagged gap (no Holdings table existed to
back `Goal.funded_by.holding_id`). Traces to already-decided design: D-010 (architectural aliasing), D-011
(alias/characteristics/re-humanizing framework), D-013 (8-type taxonomy). Added
`backend/app/models/holding.py`: single `holdings` table (`id`, `user_id` — loose UUID, no FK, same as
Income/Goal — `product_type`, `alias`, `display_name`, `characteristics` JSONB), unique on
`(user_id, alias)`. Two implementation choices owner-confirmed before writing code, logged as **D-044**:
(1) JSONB characteristics over one child table per D-013 type — matches the flat shape already used in
`docs/fixtures/FIXTURE_user_01.json`; (2) `product_type` left as a plain string, not a DB enum/CHECK
constraint, so as not to silently resolve `PROJECT_SPEC.md` §8's still-open `savings_balance` taxonomy
question. Also wired `GoalFunding.holding_id` to a real FK (`holdings.id`, `ON DELETE CASCADE`) — the exact
item D-043 deferred until Holdings existed. Alembic migration `a6cd8d30a707` generated, reviewed (fixed an
autogenerate bug: the downgrade's `drop_constraint` was passed `None` instead of the FK's name, which would
have failed if ever run — named it explicitly), and applied against the live Supabase DB. Verified: FK
cascade delete confirmed against the real DB (deleting a Holding removes its GoalFunding rows), round-trip
insert/read confirmed, `/health` and `/health/db` both 200 with all four models loaded.

### BQ-009 — Add Income and Goal objects to the backend baseline schema — done 03-Aug-2026
Added `backend/app/models/income.py` (`Income`: `id`, `user_id`, `sources` JSONB list of
`{label, amount, frequency}`) and `backend/app/models/goal.py` (`Goal`: `id`, `user_id`, `target_amount`,
`target_date`, `category`, plus a `GoalFunding` child table for `funded_by` — `goal_id` FK cascade-delete,
`holding_id`, `earmarked_amount`). No progress/current_amount field stored on Goal — computed live from
`funded_by`, per D-038. **Gap surfaced and resolved with owner before writing code:** no Holdings table
exists anywhere yet (models/ was empty going into this session), so `funded_by.holding_id` has nothing to
reference. Owner chose: store `holding_id` as a loose UUID column, no FK constraint, until Holdings gets
built in a future BQ item — applied the same resolution to `user_id` on both new models (no Users table
either; Supabase Auth owns that). Alembic migration `069bc85fc512` generated via autogenerate, reviewed,
and applied against the real Supabase DB. Verified end-to-end: insert/read/cascade-delete round-trip on
both models against the live database, plus `/health` and `/health/db` both still 200 with the new models
loaded.

### BQ-011 — Bootstrap FastAPI backend skeleton (SQLAlchemy + Alembic) — done 03-Aug-2026
`backend/` now has a real FastAPI app: `app/main.py` (FastAPI instance + `/health` and `/health/db`),
`app/core/config.py` (pydantic-settings, reads `DATABASE_URL`/`ANTHROPIC_API_KEY` from the repo-root
`.env`), `app/db/session.py` (SQLAlchemy engine/session, `Base` for future models — gracefully `None` if
`DATABASE_URL` isn't set rather than crashing at import), `app/models/` (empty, for BQ-009), and Alembic
migration tooling (`alembic.ini`, `alembic/env.py`, `alembic/script.py.mako`, `alembic/versions/`) wired to
pull the connection string from the same settings object. `requirements.txt` added; a `backend/.venv`
virtualenv was created and dependencies installed and verified locally (gitignored, not committed).
Verified end-to-end: app imports cleanly, dev server starts, `GET /health` → `200 {"status":"ok"}`,
`GET /health/db` → `503` with a clear "DATABASE_URL is not set" message (correct behavior — no credential
exists yet). **Still open:** the owner needs to add `DATABASE_URL` (Supabase Postgres connection string) to
`.env` directly before `/health/db` can return 200 and before BQ-009/BQ-010 can be verified against a real
database. See D-041.

### BQ-008 — Re-run the Q1 repeat series (n=5) against v0.8 — done 02-Aug-2026
Run by the owner locally via `scripts/run_phase1_test.py` (first attempt returned 3/5 valid + 2/5 empty with
no error — root-caused to the script's `max_tokens=1024` being too low for a thinking-enabled model, which
spent its entire budget on internal reasoning and left nothing for the visible answer; fixed by raising the
default to 4096, a test-tooling fix, not a prompt/compliance issue). Clean re-run: 5/5. Results in
`docs/PHASE1_RUN6_RESULTS.md`. **FINDING 9: 5/5 (100%) — fixed.** Card-1 named unprompted in every run, not
substituted with a vaguer consideration. **FINDING 10: still 0/5 — fix holds.** **FINDING 11: 0/5 violations
under D-036's clarified test** (no ordering/comparative word attached to a "worth" clause). All 5 runs within
the 320-word ceiling. D-037's fix verified — no escalation needed.

### BQ-007 — Re-run the Q1 repeat series (n=5) against v0.7 — done 02-Aug-2026
Run by the owner locally via `scripts/run_phase1_test.py` (first run using live API calls instead of Console
Workbench — the build sandbox blocks authenticated calls to `api.anthropic.com`, so this now runs on the
owner's machine and Claude reads the saved outputs). Results in `docs/PHASE1_RUN5_RESULTS.md`. **FINDING 10
does not reproduce, 0/5** — D-035's fix holds. **FINDING 9: 1/5 (20%), down from 2/5 baseline** — did not
get worse, which was BQ-007's specific escalate-if condition; n too small to call it an improvement.
**FINDING 11 (new, not in scope for BQ-007): "worth [X]" framing on Card-1 mentions in 4/5 runs, with the
exact banned phrase "worth having in view" reproduced verbatim in 2/5.** Touches §3 rule 5 directly.
**Flagged for thinking-home, not resolved in build-home.**

### BQ-003 — Run Q1 against both fixtures and compare — done 01-Aug-2026
Run manually by owner on Console Workbench, against `SYSTEM_PROMPT_v0_6_runnable.md` (queued against v0.5,
but v0.6 superseded it by the time this ran — executed against v0.6 per explicit owner instruction this
session; that's a stronger, not weaker, test since v0.6 postdates the D-028 fix FINDING 4 traces to).
Results in `docs/PHASE1_RUN4_RESULTS.md`. **FINDING 4 does not reproduce in either fixture** — D-028's
deepen-absent guarantee holds under both the dominant-number (user_01) and no-dominant-number (user_02)
condition, including the harder ambiguous-magnitude case user_02 was built to test. **New finding (FINDING
9, not FINDING 4):** the user_01 run drops Card-1 (42%) entirely — a different failure shape (omission, not
over-attention) than what BQ-003 was scoped to test. Doesn't match the escalate-if clause (not a `deepen`
field behavior issue). **Flagged for thinking-home, not resolved in build-home.**

### BQ-006 — Regenerate system prompt to v0.6 (open-door, on-topic only) — done 01-Aug-2026
Regenerated `docs/prompts/SYSTEM_PROMPT_v0_6_runnable.md` from TEACHING_SYSTEM_PROMPT.md (D-032). Diffed
against v0.5 before writing: only the header changelog comment and one new §2 rule 3 paragraph ("the open
door leads to the room the user is already in — never a new one") changed. §1, §3, §4 (stub, still
mechanical from D-013 + D-028), and §5 are byte-identical to v0.5 — D-032 doesn't touch them.

### BQ-002 — Build second fixture with no dominant number — done 01-Aug-2026
Added `docs/fixtures/FIXTURE_user_02.json`. Same schema and per-holding key sets as user_01 (verified
programmatically), 5 of 8 D-013 types exercised, same `known_gaps` shape. Swapped user_01's
`credit_card_debt` (42%) for a `personal_loan` (13.5%): the two debt rates (8.8%/13.5%) sit at a 1.53x
ratio vs. user_01's 4.67x jump (9%/42%) — no landslide "worst" number. No new field/type added.

### BQ-001 — Run Q7 and Q8 against prompt v0.5 — done 01-Aug-2026
Both run manually by owner on Console Workbench (v0.5 prompt + FIXTURE_user_01, fresh conversation each),
outputs scored against TEST_PROTOCOL.md. Results in `docs/PHASE1_RUN3_RESULTS.md`. Q8 clean pass. Q7 passes
its own checklist but produced **FINDING 8** (new): unprompted, ranking-language surfacing of the term-insurance
gap on a question with no financial content — touches §3 rule 5 and D-012's Trigger A/B scope narrowing.
**Flagged for thinking-home per the escalate-if clause — not resolved in build-home.**

### BQ-005 — Regenerate system prompt to v0.5 (provenance rule) — done 01-Aug-2026
Regenerated `docs/prompts/SYSTEM_PROMPT_v0_5_runnable.md` from TEACHING_SYSTEM_PROMPT.md (D-029): §2 gains
rule 5 (provenance — profile numbers vs. typical-range numbers never share a register), §5 gains the
typical-figure phrasing example. Same assembly pattern as v0.4; owner-facing annotations and the P5
design-note comment stripped. No conflicts found with existing §2/§5 rules.
