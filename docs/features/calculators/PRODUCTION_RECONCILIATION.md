# Calculator Production Reconciliation Plan

**Status:** BQ-150 complete  
**Frozen definition:** D-174/D-175, prototype commit `4f83dfb`  
**Production baseline audited:** `app/screens/CalculatorScreen.tsx`, `app/components/EmergencyCoverageTool.tsx`, calculator `app/lib/` engines/tests, progression and shared Scenario handoff

## 1. Executive finding

Production already exposes the approved nine-tool catalogue and has strong pure engines for Compound Growth, Credit-card Payoff, Emergency Coverage and Goal contribution gap. The remaining parity gap is concentrated in four older embedded engines plus Step-up SIP, inconsistent result lifecycle/content across the shared screen, and the missing confirmed Calculator-to-Arya teaching handoff.

No backend route, schema, persistence or new dependency is required. Emergency Coverage remains the only recorded-candidate Calculator. Progression's existing type-only backend contract remains authoritative.

## 2. Gap disposition

| Frozen contract area | Current production | Disposition |
|---|---|---|
| Nine equal Tools entries | PASS | Preserve and contract-test |
| Strict whole-string grammar | FAIL on SIP/EMI/Inflation/Step-up/CAGR; mixed `Number()` elsewhere | BQ-151 shared parser integration and exact engine fixtures |
| SIP zero branch/domains | FAIL; positive-rate `parseFloat` only | BQ-151 pure approved engine |
| EMI zero branch/1..600 months | FAIL; positive-rate years path only | BQ-151 pure approved engine |
| Inflation -100%..1,000%/fractional years | FAIL; zero rejected, guards absent | BQ-151 pure approved engine |
| Step-up zero return/strict integer years/safe caps | FAIL/PARTIAL; engine rejects zero return and lacks ceilings | BQ-151 reconcile existing pure engine/tests |
| CAGR signed/fractional/safety fixtures | PARTIAL; formula works for loss but guards/caps absent | BQ-151 pure approved engine |
| Compound Growth/Card/Goal exact engines | PASS with parser/UI integration gap | Preserve engine; BQ-152 integrates strict raw input/lifecycle |
| Emergency Coverage mechanism | PASS/PARTIAL | Preserve pure formula; BQ-152 aligns candidate exclusion/authorship, strict raw input, reset/reopen/result content |
| Immediate invalidation | FAIL on older five and Compound Growth; PASS on Goal/Card/Emergency | BQ-152 shared edit/current-result contract |
| Reset/clean reopen/errors | Mixed | BQ-152 shared lifecycle and accessible error model |
| Frozen inputs/formula/rounding/omissions | Mixed prose; older results incomplete | BQ-152 standardized result evidence without changing arithmetic |
| Candidate scope | Emergency only in definition; current Card fetches holdings candidates | FAIL boundary | BQ-152 remove Card recorded-candidate path; keep manual fields only |
| Confirmed Arya handoff | FAIL across all Calculators | BQ-153 reuse pure safe payload builder/modal pattern with calculator-specific boundaries |
| Participation-only progression | PASS/PARTIAL; render emitter exists | BQ-153 exact type-only/nonqualifying/failure/cap contracts |
| Responsive/accessibility/all-state production evidence | PARTIAL | BQ-154 exhaustive 55-AC/51-state production parity gate |

## 3. Bounded build sequence

### BQ-151 — Exact Calculator engine and numeric-domain reconciliation

Extract or reconcile pure engines for SIP Goal, Home Loan EMI, Inflation Impact, Step-up SIP and CAGR. Use the approved strict whole-string parser at the UI boundary and exact D-174 domains/zero/fraction branches. Add normal, exact-edge, just-outside, zero/equality/loss and overflow fixtures. Do not touch layout, candidate sources, Arya, progression, schema or backend.

### BQ-152 — Calculator UI lifecycle, evidence and candidate-boundary reconciliation

Wire all nine screens to current-result invalidation, reset/clean reopen, associated typed errors, frozen input authorship, formula/timing, rounding/caps/omissions and native-safe result focus. Remove Credit-card recorded-candidate fetching so it is manual-only. Reconcile Emergency candidates to explicit source-labelled inclusion/authorship without changing backend data or its division formula. No Arya/progression rule change.

### BQ-153 — Calculator Arya and progression integration

Add exact confirmed privacy-minimised handoff to every eligible current result using calculator type, normalized finite inputs, formula boundary and omissions only. Cancel sends nothing. Ensure stable type-only completion after valid render, no events from invalid/changed/capped/handoff paths, and cap/failure isolation. Reuse existing Chat recovery and shared modal architecture; no model/backend/schema/persistence change.

### BQ-154 — Production Calculator exhaustive verification and parity gate

Prove the configured production frontend/backend against all 55 AC IDs and 51 canonical states. Include formula fixtures, API/privacy/isolation where Emergency candidates apply, offline/manual behavior, keyboard/accessibility, 320/390/1440/200%, themes/high contrast/reduced motion, native best-effort and console/DOM evidence. Prototype evidence is prohibited as production evidence. Owner disposition follows.

## 4. Dependencies and stop conditions

- BQ-151 → BQ-152 → BQ-153 → BQ-154 in order.
- If implementation requires a formula reinterpretation, changed ceiling, additional candidate source, backend route/schema, dependency, persistence or new calculator, stop for owner decision.
- Tax/HRA remains BQ-098 deferred. No adjacent catalogue work is absorbed.
- The exposed local legacy service-role key is unrelated and must not be used; Calculator work requires no service-role operation.

## 5. Verification gates

- Every implementation item: pre-build scope/architecture/edge/test lock; TypeScript; focused and complete frontend tests; production web export; diff correctness/security/privacy/scope review; best-effort rendered UI QA; codemap update when module/component ownership changes.
- Final gate: machine-complete production evidence ledger with exactly 55 AC IDs and 51 states, no prototype substitution, configured authenticated walkthrough where candidate ownership matters, and owner PASS / REVISE / PARK / ESCALATE.

## 6. No new decision found

All identified gaps map directly to D-174's approved O-CA-1..O-CA-9 package. BQ-150 found no new money, data, privacy, architecture, dependency or scope fork.
