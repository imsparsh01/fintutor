# BQ-144 Production Scenario QA Evidence

Date: 2026-08-30  
Outcome: **TECHNICAL PASS — owner disposition pending**

This ledger verifies the production `app/` and `backend/` implementation. The controlled prototype and its BQ-133 evidence were not used as production evidence.

## Exhaustive traceability

- Contract source: `ACCEPTANCE_MATRIX.md`, containing exactly **96 unique acceptance IDs** and **50 unique canonical states**.
- AC-A01..A08 and AC-P01..P10: production discovery, typed candidate, source-state, provenance, exclusion, refresh and account-generation contracts in `scenarioProductionContract.test.ts`, `scenarioCandidatesContract.test.ts`, `scenarioSession.test.ts`, `test_scenario_candidates.py` and `test_scenario_candidates_api.py`.
- AC-R01..R10; AC-S01-01..05; AC-S03-01..05; AC-S05-01..04; AC-S06-01..04; AC-S07-01..04: strict parser, lifecycle and exact formula boundary coverage in `scenarioNumbers.test.ts`, `scenarios.test.ts`, `scenarioProductionContract.test.ts` and `scenarioSession.test.ts`.
- AC-E02-01..05 and AC-ESOP-01..03: authenticated POST ownership, privacy, provenance, date and finite-domain coverage in the loan/ESOP frontend contracts and backend API/unit suites.
- AC-80C-01..04: production-unreachable containment asserted by production route/static tests; no tax result is exposed. This is containment evidence, not parked prototype arithmetic evidence.
- AC-TERM-01..05: excluded-by-default candidates, explicit growth choice, consent, signed neutral result and transient lifecycle in `termInsurance.test.ts` and `scenarioIntegrationContract.test.ts`.
- AC-X01..X10 and AC-F01..F08: ownership, zero scenario persistence, masked confirmed handoff, capped/failure-isolated progression, typed failure/offline/retry and late-response isolation across frontend contracts and the backend auth/privacy/progression/API suites.
- AC-C01..C11: neutral presentation, semantic roles, current-result focus/announcement, modal semantics, keyboard/static DOM contracts, responsive geometry and theme/motion tokens. Authenticated browser evidence showed no horizontal overflow at 320, 390 or 1440 CSS pixels. The production React Native tree was also exported for web without error; native-device execution remains best-effort because no simulator/device is configured.
- SC-01..SC-50: every canonical state remains mapped to its governing AC IDs by the canonical-state table in `ACCEPTANCE_MATRIX.md`; the production suites above exercise the associated loading/ready/partial/failure, validation/result/edit/reset, isolation, handoff/progression and accessibility/responsive mechanisms. The evidence integrity test fails if either exact count changes or this ledger substitutes prototype evidence.

## Configured authenticated walkthrough

The restored configured Supabase database returned healthy. A disposable real Auth identity completed the production onboarding API and opened the production Tools surface. All five approved dedicated Scenario names were present. `Idle cash over time` was run with ₹500,000, 4%, 10% and 5 years; production returned Path A ₹608,326, Path B ₹805,255 and the signed difference ₹196,929 with frozen inputs, formula boundary and omissions.

The optional Arya action displayed the exact privacy-minimised payload and sent nothing on cancel. Editing the Path B rate removed the current result and handoff immediately and displayed the neutral rerun state. The page had no horizontal overflow at 320, 390 or 1440 CSS pixels. The disposable account's active application data and Auth identity were then permanently deleted.

## Test record

- Frontend TypeScript: PASS.
- Frontend library/contract tests: 116/116 PASS before this ledger test was added.
- Backend unit/API suite: 401/401 PASS.
- Production web export: PASS.
- Configured API `/health` and `/health/db`: PASS after the Supabase project was restored.
- Security/privacy/scope review: PASS; no formula, schema, dependency, persistence, release-boundary or advice-line change.

## Residual boundary

EX-80C remains production-unreachable and TERM retains its approved internal/specialist-review release boundary. A physical native device/simulator was unavailable, so native behavior is recorded as best-effort static/React-Native evidence rather than falsely claimed device evidence.
