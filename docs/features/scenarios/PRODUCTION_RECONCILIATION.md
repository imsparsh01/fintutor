# Scenario production reconciliation plan

**Gate:** BQ-135  
**Date:** 29-Aug-2026  
**Authority:** D-166..D-172, frozen contract at prototype commit `e3b8543`  
**Production parity:** NOT YET ACHIEVED

## Outcome

The existing app contains useful Scenario implementations, but it materially contradicts the owner-approved
package. This is an implementation plan, not authority to reinterpret money logic or expand scope. No new
library, schema, service pattern or timestamp field is required by the plan. Any implementation that discovers
otherwise stops at the applicable owner checkpoint.

## Highest-risk contradictions

| Priority | Frozen requirement | Current production evidence | Required disposition |
|---|---|---|---|
| P0 | EX-80C is internal/fixture-only until FY/source/reviewer/staleness/counsel gates exist | Live launcher and live endpoint expose an unversioned ₹1.5L rule | Remove production reachability first; external re-release remains parked |
| P0 | D-171 exact domains; all raw/intermediate/output values finite and bounded | `app/lib/scenarios.ts` lacks upper/finite/output guards; S-06 rounds fractional months; S-01 can accept overflow as reached | Shared strict parser and exact table-driven formula guards |
| P0 | S-02 uses an authenticated POST body | Holding ID and prepayment amount are sent in a GET query | Replace GET completely with POST; add route/privacy tests |
| P0 | ESOP uses India date, rejects future grants, labels recorded FMV honestly, and returns authoritative provenance | Host `date.today()`, future-date clamp, current/today claims and no version/retrieval evidence | Backend/client correction using existing holding version; no migration |
| P1 | Recorded candidates begin offered but excluded | Dedicated prefills auto-apply; TERM debts/goals begin included | Shared candidate selection/authorship state; no arithmetic until inclusion |
| P1 | Editing any dependency immediately removes the result with approved rerun copy | Four dedicated scenarios retain old results after edits | Shared result lifecycle and regression tests |
| P1 | Account/permission/type transitions clear synchronously and discard late work | `ScenarioScreen` has no generation guard and collapses failures to null | Subject/surface generation state plus typed recovery |
| P1 | Approved name is “Idle cash over time”; five dedicated entries live under “Scenarios” | “Inaction tax” and “What if…” remain; S-02 is duplicated in Tools | Reconcile discovery/copy and retain focused explorers contextually |
| P1 | All nine finite current results follow the same participation and optional Arya rules | Only dedicated scenarios emit; confirmed Arya handoff is absent | Privacy-minimised shared handoff/progression integration |
| P2 | Production evidence covers all 96 AC IDs and 50 states | Existing tests are isolated; production has no family-wide accessibility/recovery matrix | Exhaustive automated/browser/native evidence before parity claim |

## Acceptance-family map

| Family | Current status | Production build evidence required |
|---|---|---|
| AC-A01..A08 | FAIL | Exactly five dedicated Scenario entries; contextual focused explorers; neutral zero/one/many eligibility; exact origin restoration |
| AC-P01..P10 | FAIL | Independent loading/partial/empty/failure/malformed states; component IDs/versions/retrieval evidence; excluded-by-default; touched refresh conflict and source-local retry |
| AC-R01..R10 | FAIL | Strict validation, busy/idempotent run, frozen input summary, current result only, immediate invalidation, reset and clean reopen |
| AC-S05-01..04 | PARTIAL | Preserve zero-runway formula; add strict grammar, safe sum/output, candidate authorship and provenance |
| AC-S03-01..05 | FAIL | D-171 boundaries, zero-rate branch, exact ordinary-annuity fixtures and no stale result/event |
| AC-S06-01..04 | FAIL | Home/personal only, integer 1..600 months, zero-rate branch, all finite/output guards |
| AC-S07-01..04 | FAIL | Approved name, no default assumptions, symmetric input-order paths, equality/negative and all caps |
| AC-S01-01..05 | PARTIAL | Preserve 720-month mechanism; reject unsafe iteration/output before reached; provenance/authorship |
| AC-E02-01..05 | FAIL | POST body, exact D-171 guards, authoritative loan provenance, contextual chooser/recovery and neutral current result |
| AC-ESOP-01..03 | FAIL | India date, future-date rejection, finite guards, recorded-FMV language, record/version/retrieval evidence |
| AC-80C-01..04 | FAIL release gate | Production-unreachable assertion now; arithmetic/provenance work remains parked with external dependencies |
| AC-TERM-01..05 | FAIL | Every component/cover excluded initially; explicit no-change versus entered-change choice; provenance, lifecycle and signed neutral result |
| AC-X01..X10 | FAIL | Endpoint ownership/privacy, zero persistence/writes, confirmed masked Arya payload, participation-only progression for all eligible entries |
| AC-F01..F08 | FAIL | Typed 401/403/404/5xx/offline recovery, local-only behavior, explicit reconnect retry, lost-response and account-generation isolation |
| AC-C01..C11 | PARTIAL | Associated validation, one result announcement/focus, modal trap/Escape/restore, 44px targets, 320/390/1440, 200%, themes/high contrast/reduced motion, clean console |

## Bounded production sequence

### BQ-136 — Contain EX-80C production reachability

Remove the production launcher and disable the non-fixture route using existing code structure. Preserve the
service/tests as parked internal evidence. Add assertions that ordinary production UI/API cannot return a tax
number. Do not introduce a feature-flag framework. Re-release remains blocked on a named financial year,
official primary sources, verification owner/date, stale shutdown and qualified India review.

### BQ-137 — Strict numeric parser and bounded local formula engine

Add one dependency-free whole-string parser for plain, valid Indian-grouped and valid international-grouped
numbers plus normalized display. Enforce D-171 for S-01/S-03/S-06/S-07, S-05 safe sum/output, S-06 product/
integer eligibility and reject-before-render. Add exact normal, zero, equal, negative, limit, just-outside,
NaN/Infinity and overflow tests. No UI redesign or backend change.

### BQ-138 — S-02 authenticated POST and authoritative guardrails

Replace the GET route/client completely with an authenticated POST body. Backend refetches the owned record
and enforces every D-171 stored/input/intermediate/output limit. Return existing ID/version plus source fields
and retrieval evidence. Add route tests for URL privacy, spoof resistance, foreign/deleted/ineligible records,
400/404, serialization and exact formula boundaries. No schema change.

### BQ-139 — ESOP date, safety and provenance reconciliation

Use the existing Asia/Kolkata stdlib convention, reject future grant dates and invalid/non-finite grant terms,
guard outputs, describe FMV as recorded, and return backend-authoritative ID/version/source fields/retrieval
time with “Freshness unavailable.” Treat exercise-window months as a recorded term, never a countdown without
termination data. Replace contradictory tests and add India-boundary/provenance coverage. No schema/dependency.

### BQ-140 — Backend-authoritative Scenario candidate provenance

Using existing service/serializer patterns, enumerate owned components for budget outgoings, MF SIPs, corpus
holdings and FD principal with source kind/ID/label/field/version/original value/retrieval/status. Preserve
malformed/unavailable evidence instead of converting it to zero. Do not add timestamp schema or claim freshness.
Add deterministic ownership/component tests. If implementation requires a novel architecture, stop.

### BQ-141 — Dedicated Scenario discovery, candidates and result lifecycle

Rename the section to Scenarios, remove context-free S-02, adopt “Idle cash over time,” and implement a shared
in-memory candidate/source state with excluded-by-default inclusion, provenance, typed recovery, touched refresh
choices and account/type generation guards. Add shared run/current-result/input-summary/reset/reopen behavior,
immediate D-168 invalidation, accessibility focus/announcement, and exact Tools return. Integrate BQ-137/BQ-140
without changing formulas.

### BQ-142 — Focused explorer UI/lifecycle reconciliation

For S-02 and ESOP, add contextual provenance, typed recovery, clean close/reopen and shared current-result rules.
For TERM, start every recorded component and cover excluded, require an explicit no-annual-change versus entered-
change choice, preserve consent/blank paths, and add provenance and result lifecycle. Keep EX-80C unavailable.
No counsel-gated external TERM release claim.

### BQ-143 — Scenario Arya and progression integration

Add the bounded optional Arya action only to eligible current results, show exact privacy-minimised payload,
and require confirmation; cancel/recovery sends nothing. Emit at most one `scenario_completed` event per stable
type/day and at most two awards/day for every qualifying dedicated/focused result, never values/records/outcomes.
Event failure/cap cannot affect results. Use existing Chat masking/progression architecture only.

### BQ-144 — Production Scenario exhaustive verification and parity gate

Map all 96 AC IDs and 50 canonical states to production evidence. Run configured frontend/backend suites,
endpoint security/privacy tests, lifecycle/account/offline spies, accessibility keyboard/modal checks, 320/390/
1440 and 200% visual QA, light/dark/high-contrast/reduced-motion, native best-effort checks, and console/DOM audit.
No Scenario production parity claim until every row passes or is explicitly owner-dispositioned.

## Dependencies and owner checkpoints

| Dependency | Status | Effect |
|---|---|---|
| D-167..D-172 decisions | Approved | Authorize the bounded reconciliation above |
| Existing holding IDs/versions and FastAPI service patterns | Available | O-SC-9A/B/C require no migration or new dependency |
| Configured backend test runtime | Required | System Python lacks FastAPI/SQLAlchemy; backend evidence must run in project runtime |
| EX-80C official FY/source/reviewer/stale-shutdown/counsel package | Missing, external | Blocks re-release only; does not block immediate containment |
| EX-TERM qualified external-release review | Missing, external | Internal reconciliation may proceed; external release remains gated |
| New schema/library/feature-flag/service architecture | Not authorized or needed | If discovered, stop and escalate before implementation |

## Verification gates

1. Formula safety: exact domain/just-outside/finite/intermediate/output fixtures for all nine entries.
2. API privacy/ownership: POST body, no financial URL/log exposure, verified subject, foreign-ID non-disclosure.
3. Provenance: deterministic component ledger and honest version/retrieval/freshness-unavailable language.
4. Lifecycle: current-input/result invariant, newest-only async, reset/reopen, zero stale announcement/event/handoff.
5. Recovery/isolation: typed failures, offline boundary, explicit retry, synchronous clear, late-response zero effects.
6. Privacy/model/persistence: no scenario writes/storage/offline queue; confirmed masked Arya payload and cancel zero-call.
7. Progression: stable type-only event, daily caps/dedup, nonqualifying zero-event, failure never changes result.
8. Accessibility/visual: all nine entries across keyboard/modal/focus/announcement/targets/layout/zoom/theme/motion.
9. Release gates: 80C unreachable; TERM external caveat preserved.
10. Evidence closure: 96/96 AC and 50/50 state rows against production—not inherited from the prototype.

## Audit evidence

- Frontend targeted tests executed during BQ-135: 20/20 passed (Emergency Coverage, request generation and
  TERM pure tests). These prove narrow legacy islands only.
- Backend source and test coverage was inspected. System Python could not start the backend suite because
  FastAPI/SQLAlchemy were unavailable; BQ-138/BQ-139/BQ-140/BQ-144 must use the configured runtime.
- Three independent audits agreed on the P0 defects and sequencing. No files in `app/` or `backend/` changed.
