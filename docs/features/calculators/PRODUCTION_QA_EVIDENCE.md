# BQ-154 Production Calculator QA Evidence

Date: 2026-08-31  
Outcome: **TECHNICAL GATE IN PROGRESS — configured live walkthrough and owner disposition pending**

This ledger verifies the production `app/` and `backend/` implementation. The controlled prototype and its BQ-148 evidence are not used as production evidence. `PASS-AUTO` means the cited production source/test directly exercises the criterion. `PENDING-LIVE` means automated evidence is green but the binding configured rendered interaction is not yet recorded.

## Acceptance ledger — exactly 55 unique IDs

| ID | Status | Production evidence |
|---|---|---|
| AC-A01 | PASS-AUTO | `ToolsScreen.tsx` inventory plus production contract scan: nine approved Calculator routes; deferred Tax/HRA absent. |
| AC-A02 | PASS-AUTO | Home and Onboarding route contracts navigate to Tools/a chosen route without inserting assumptions. |
| AC-A03 | PASS-AUTO | `CalculatorScreen` focus-session keys remount all nine drafts; explicit Tools return; account/type changes rotate the key. |
| AC-A04 | PASS-AUTO | Eight manual calculators have no source/storage/model client; only type-only progression after render and confirmed Chat navigation. |
| AC-P01 | PASS-AUTO | Emergency exposes loading, ready/evidence, empty, retryable and permission states from authenticated Scenario candidates. |
| AC-P02 | PASS-AUTO | Emergency candidate cards show source label/fields/version/freshness/retrieval/value status and start excluded. |
| AC-P03 | PASS-AUTO | Include is explicit; edits clear recorded authorship; frozen result names recorded vs entered provenance; no write client exists. |
| AC-P04 | PASS-AUTO | Explicit refresh/retry preserves manual values, removes recorded inclusion/result, and never silently replays. |
| AC-P05 | PASS-AUTO | User generation synchronously clears draft/candidates/result/modal; generation guards discard late responses. |
| AC-N01 | PASS-AUTO | `scenarioNumbers.test.ts` plus Calculator lifecycle contracts cover whole-string grammar and no blank/malformed coercion. |
| AC-N02 | PASS-AUTO | Pure engine suites cover exact approved minima/maxima and just-outside rejection. |
| AC-N03 | PASS-AUTO | Engine/payoff/growth/goal/Emergency suites cover finite bounded intermediates and outputs. |
| AC-N04 | PASS-AUTO | Alerts are associated in accessible labels; malformed/domain submit focuses the first relevant field; no result/event. |
| AC-R01 | PASS-AUTO | Calculation is synchronous pure arithmetic over one parsed snapshot; repeated same-value state is idempotent. |
| AC-R02 | PASS-AUTO | Every result renders unit, frozen inputs/authorship, formula/timing and rounding/caps/omissions. |
| AC-R03 | PASS-AUTO | Every dependent edit removes result/handoff and shows the exact approved rerun notice. |
| AC-R04 | PASS-AUTO | Reset clears draft/error/result; focus-session remount proves clean reopen; Emergency candidates remain separate offers. |
| AC-R05 | PASS-AUTO | Engine fixtures cover zero, equality, signed loss/difference and crossing with neutral copy. |
| AC-R06 | PASS-AUTO | Overflow/cap fixtures return typed no-result states; render contracts prohibit NaN/Infinity/event. |
| AC-SIP01 | PASS-AUTO | `calculatorEngines.test.ts`: positive-rate inverse month-end annuity fixture. |
| AC-SIP02 | PASS-AUTO | `calculatorEngines.test.ts`: exact zero-rate target/month branch. |
| AC-SIP03 | PASS-AUTO | `calculatorEngines.test.ts`: rounded 1..2,400 months and amount/rate bounds. |
| AC-EMI01 | PASS-AUTO | `calculatorEngines.test.ts`: fixed amortisation EMI and total interest. |
| AC-EMI02 | PASS-AUTO | `calculatorEngines.test.ts`: zero-rate principal/month branch. |
| AC-EMI03 | PASS-AUTO | `calculatorEngines.test.ts`: rounded 1..600 months and approved ceilings. |
| AC-INF01 | PASS-AUTO | `calculatorEngines.test.ts`: positive and zero annual power fixtures. |
| AC-INF02 | PASS-AUTO | `calculatorEngines.test.ts`: negative-rate, −100% and fractional-horizon guards. |
| AC-INF03 | PASS-AUTO | Inflation engine amount/rate/horizon and finite-output boundary fixtures. |
| AC-STEP01 | PASS-AUTO | `stepUpSip.test.ts`: month-end timing and first contribution of each 12-month block. |
| AC-STEP02 | PASS-AUTO | `stepUpSip.test.ts`: explicit 0% return and 0% step branches. |
| AC-STEP03 | PASS-AUTO | `stepUpSip.test.ts`: positive whole 1..200 years and safe iterative intermediates. |
| AC-CAGR01 | PASS-AUTO | `calculatorEngines.test.ts`: gain/equality/loss signed annualised fixtures. |
| AC-CAGR02 | PASS-AUTO | CAGR positive-value/fractional-year/root/output boundary fixtures. |
| AC-CG01 | PASS-AUTO | `compoundGrowth.test.ts`: zero rate, month-end timing and rounded modeled months. |
| AC-CG02 | PASS-AUTO | Compound Growth amount/rate/200-year/overflow guard fixtures. |
| AC-CC01 | PASS-AUTO | `creditCardPayoff.test.ts`: monthly interest then payment and clamped final payment. |
| AC-CC02 | PASS-AUTO | Payoff suite: non-clearing and explicit 1,200-month capped no-result. |
| AC-CC03 | PASS-AUTO | Payoff zero-rate/safety fixtures; production integration proves manual-only. |
| AC-EC01 | PASS-AUTO | `emergencyCoverage.test.ts`: included sum ÷ outgoings and real zero-month result. |
| AC-EC02 | PASS-AUTO | Authenticated component evidence, excluded/include/edit states and frozen provenance; candidate helper fixtures. |
| AC-EC03 | PASS-AUTO | Typed empty/malformed/retry/permission/generation states; manual path never fabricates a candidate. |
| AC-GG01 | PASS-AUTO | `goalAffordability.test.ts`: month-end modeled requirement and signed difference. |
| AC-GG02 | PASS-AUTO | Goal fixtures: current≥target zero requirement and neutral equality/above/below output. |
| AC-GG03 | PASS-AUTO | Goal domain/overflow fixtures and manual-only production contract. |
| AC-X01 | PASS-AUTO | One stable type-only `calculator_completed` emitter runs from valid committed result effects; backend 401-test suite covers caps/failure. |
| AC-X02 | PENDING-LIVE | Builder/modal tests prove exact finite payload and zero-send Cancel; configured rendered inspection remains. |
| AC-X03 | PASS-AUTO | Invalid/changed/capped states do not mount a ResultCard/handoff and contain no progression call. |
| AC-X04 | PASS-AUTO | Static privacy scan: no input/result persistence, logging, analytics or progression fields; Emergency record metadata excluded from handoff. |
| AC-F01 | PENDING-LIVE | Pure manual arithmetic and no queue/replay code are proven; configured offline/reconnect observation remains. |
| AC-F02 | PASS-AUTO | API response + failure mapper distinguish 401/403 permission, absence groups and retryable 5xx/network without disclosure. |
| AC-C01 | PASS-AUTO | One header, labelled units/controls, alerts/status and live result regions in production components. |
| AC-C02 | PENDING-LIVE | One announcement, native focus and guarded web focus are wired; rendered focus observation remains. |
| AC-C03 | PENDING-LIVE | ≥44px controls, Modal isolation/onRequestClose and exact opener restoration are wired; keyboard/Escape observation remains. |
| AC-C04 | PENDING-LIVE | 720px bounded one-column layout and web export pass; 320/390/1440/200% rendered measurements remain. |
| AC-C05 | PENDING-LIVE | Token-only meaning, no motion-dependent behavior and static DOM scan pass; theme/high-contrast/console observation remains. |

## Canonical-state ledger — exactly 51 unique states

| State | Status | Direct production evidence |
|---|---|---|
| CA-01 | PASS-AUTO | Tools loading contract retains stable screen shell. |
| CA-02 | PASS-AUTO | Tools production inventory exposes exactly nine equal Calculator cards. |
| CA-03 | PASS-AUTO | Home preview routes to chosen Calculator/View all Tools without assumptions. |
| CA-04 | PASS-AUTO | Onboarding Tools handoff opens catalogue without inferred Calculator. |
| CA-05 | PASS-AUTO | Focus-session mount shows heading, authorship scope, blank manual fields and no result. |
| CA-06 | PASS-AUTO | Manual screens contain no candidate/source client and use user-entered assumptions. |
| CA-07 | PASS-AUTO | Emergency loading status leaves manual fields usable. |
| CA-08 | PASS-AUTO | Ready cards show component evidence and excluded checkbox state. |
| CA-09 | PASS-AUTO | Component value status retains good evidence and names malformed/unavailable components. |
| CA-10 | PASS-AUTO | Retryable failure is not empty and exposes manual entry plus explicit Retry. |
| CA-11 | PASS-AUTO | Empty groups say no candidate is available and explicitly deny a zero inference. |
| CA-12 | PASS-AUTO | Version/retrieval/freshness-unavailable evidence is rendered without invented currency. |
| CA-13 | PASS-AUTO | Include copies the exact available component total and freezes provenance. |
| CA-14 | PASS-AUTO | Excluded state remains visible and contributes nothing. |
| CA-15 | PASS-AUTO | Editing clears recorded inclusion/authorship and has no write-back client. |
| CA-16 | PASS-AUTO | Required blank disables action or blocks without zero coercion. |
| CA-17 | PASS-AUTO | Partial grammar focuses associated field, alerts and renders no result/event. |
| CA-18 | PASS-AUTO | Non-finite/unsafe values receive bounded errors; no NaN/Infinity render. |
| CA-19 | PASS-AUTO | Exact formula-domain edges compute in pure engine fixtures. |
| CA-20 | PASS-AUTO | Just-outside edges reject without output. |
| CA-21 | PASS-AUTO | Cross-field invalid payoff/domain states focus relevant input and alert. |
| CA-22 | PASS-AUTO | Complete visible inputs enable explicit Calculate. |
| CA-23 | PASS-AUTO | Pure synchronous snapshot makes repeated activation idempotent. |
| CA-24 | PASS-AUTO | Single result includes current unit, frozen inputs and conventions. |
| CA-25 | PASS-AUTO | EMI/Step-up/Growth/Card/Goal secondary figures share one snapshot. |
| CA-26 | PASS-AUTO | SIP/EMI/Step-up/Growth/Card zero-rate fixtures pass. |
| CA-27 | PASS-AUTO | Emergency zero, CAGR loss/equality and Goal signed/equal outputs stay factual. |
| CA-28 | PASS-AUTO | Card cap shows exact no-result and no ResultCard/event. |
| CA-29 | PASS-AUTO | Overflow is rejected before render/event. |
| CA-30 | PASS-AUTO | Edit removes result/handoff and emits exact rerun notice. |
| CA-31 | PASS-AUTO | Rerun replaces prior snapshot with one result from current values. |
| CA-32 | PASS-AUTO | Reset clears draft/error/result; Emergency candidates remain separately offered. |
| CA-33 | PASS-AUTO | Focus-session key remounts a fresh component on reopen. |
| CA-34 | PASS-AUTO | Valid committed result emits stable type/day participation event. |
| CA-35 | PASS-AUTO | Idempotency/cap/failure is swallowed and cannot alter the result. |
| CA-36 | PENDING-LIVE | Exact bounded payload is code/test proven; configured modal inspection remains. |
| CA-37 | PENDING-LIVE | Cancel has no navigation/model call and restores opener; rendered observation remains. |
| CA-38 | PASS-AUTO | Existing Chat explicit-retry contract is unchanged; Calculator result is not persisted/modified. |
| CA-39 | PENDING-LIVE | Pure local manual calculation/no replay is code proven; configured offline observation remains. |
| CA-40 | PENDING-LIVE | Emergency failure retains manual path/no stale claim; configured offline observation remains. |
| CA-41 | PENDING-LIVE | No auto retry/replay exists; explicit refresh is wired; reconnect observation remains. |
| CA-42 | PASS-AUTO | 401/403 clears draft/result/source/modal and presents reauthentication copy. |
| CA-43 | PASS-AUTO | User/type focus-session key exposes destination shell only. |
| CA-44 | PASS-AUTO | Generation guard discards late source response with zero state/event mutation. |
| CA-45 | PENDING-LIVE | Loading live-region semantics are wired; rendered stable-geometry observation remains. |
| CA-46 | PASS-AUTO | Alert plus associated accessible label and first-invalid focus are wired/tested. |
| CA-47 | PENDING-LIVE | Result region/announcement/native-web guarded focus are wired; observation remains. |
| CA-48 | PENDING-LIVE | Logical source order, ≥44px targets, modal isolation/back and opener restoration are wired; keyboard observation remains. |
| CA-49 | PENDING-LIVE | Bounded responsive styles/export pass; four required rendered measurements remain. |
| CA-50 | PENDING-LIVE | Semantic/token/static checks pass; theme/high-contrast/reduced-motion/console observation remains. |
| CA-51 | PASS-AUTO | Explicit Tools return restores caller and focus-session teardown keeps result transient. |

## Automated test record

- Frontend TypeScript: PASS.
- Frontend production library/contract tests: 137/137 PASS at this checkpoint.
- Backend unit/API suite: 401/401 PASS.
- Production web export: PASS after the current parity fixes.
- Prototype evidence used: **none**.

## Remaining binding gate

Complete one configured authenticated production walkthrough covering the `PENDING-LIVE` rows, record console/DOM and 320/390/1440/200% evidence, record native as best-effort if no device/simulator exists, then obtain owner **PASS / REVISE / PARK / ESCALATE**. This file must not be changed to PASS before those observations exist.
