# FinTutor — Build Queue

**This is the build worklist. Claude reads this file to find its build task.**

Rules for this file:
- Nothing enters this queue until the decision behind it has an ID in `docs/DECISION_LOG.md`.
- Items here are **already decided** — Claude executes them, it does not re-open them.
- If executing an item requires a new decision (new library, schema change, anything on
  the `CLAUDE.md` hard-stop list), **STOP and escalate to the owner**. Do not decide it here.
- One item per session. Move it to DONE with a date when complete.
- This file is build-task-tracking only (single home as of D-033 — see `docs/DECISION_LOG.md`).
- Before picking up an item, check `docs/KNOWN_LIMITATIONS.md` — a disclosed gap from a shipped feature
  may already flag exactly the edge case the new item is about to hit.

---

## READY — pick one of these

(nothing queued right now)

---

## BLOCKED — do not start

### BQ-004 — Backend `deepen` selection logic for the general Chat-tab case
**Traces to:** D-028 (explicitly deferred), re-scoped by D-049 (BRIEF-006), narrowed by D-071 — the
UI-signal sub-case D-071 covers is BQ-034, not this item; this item is what's left over.
**Blocked because:** for a freely-typed question with no holding context (the general Chat tab), there
is still no deterministic signal for which holding (if any) to deepen. BRIEF-006's Path A (a narrow
classifier model call) still carries its open regulatory question — does a smaller model's judgment
satisfy "auditable in code," or only relocate the same compliance question — and D-071 does not touch
that question at all.
**Unblocks when:** a decision resolves BRIEF-006's Path A question, or a different deterministic signal
for the general-question case is found. Not urgent — D-028's "deepen nothing" fallback is the current
safe default and stays in effect for every entry point BQ-034 doesn't cover.

---

### Variable-income budgeting (startup/gig profile) — not queued
Traces to BRIEF-011's escalated hard-stop (money-calculation logic). Not added to READY or BLOCKED —
waiting on the owner's decision before any BQ item is even scoped for it.

---

## NOT IN THIS QUEUE — thinking-home only

These are open items that are **not build tasks** (Claude Code should not mistake them for work):
- Decision 3 — budgeting/goals data model (foundational; thinking-home, before build).
- Decision 2 — per-item management depth (thinking-home, designed after Decision 3).
- UX principles section in PRODUCT_PRINCIPLES.md (thinking-home, after Decisions 2 & 3).
- FINDING 7 provenance — RESOLVED (D-029); execution was BQ-005 (see DONE).
- Conversation memory (PARKED — D-022). Subagents (PARKED — D-014). Legal review of D-009.

---

## DONE

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
