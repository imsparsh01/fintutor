# D-152 — Account entry and access is the next product-definition workstream; BQ-113..117 approved

- **Tier:** 3, owner-decided (sequencing/PM within the D-148 programme; the owner selected the next
  workstream and approved its bounded plan).
- **Date:** 26-Aug-2026
- **Traces / builds on:** D-148 (ten-workstream product-definition programme), D-137/D-142 (backend
  ownership and table access), D-133 (masking/privacy), the "living baseline per user" principle,
  BQ-112/D-149 (baseline lifecycle, incl. account-switch load-time suppression).

## Decision

The owner approved **"Account entry and access"** — rank 3 (score 81) in the owner-approved
`docs/features/product-definition/PORTFOLIO_AUDIT.md` ranking, with ranks 1 (Arya) and 2 (Baseline) already
frozen PASS — as the next product-definition deep dive under the D-148 programme. The owner also approved the
five-item bounded plan **BQ-113..BQ-117** (definition package → contracts → acceptance/decision register →
interactive fixture prototype → owner validation), one task per session, matching the common deep-dive
package in `PROGRAMME.md`.

## Why

The programme runs the ranked list one workstream at a time; ranks 1 and 2 are complete, so account entry is
next by the owner-approved order (`docs/features/baseline/VALIDATION_RESULT.md`,
`docs/features/arya/VALIDATION_RESULT.md`). No `docs/features/account-entry/` folder exists yet. Account entry
is the boundary that keeps one user's living baseline from bleeding into another's, so its user-facing UX and
state contract for access failures is a real, un-consolidated product-definition gap even though the security
architecture (D-137/D-142) is already decided. This is not new scope: account entry is already MVP
(`PROJECT_SPEC.md` §4.1).

## Boundaries (both HARD-STOPs stay DEFERRED, ruled explicitly here)

1. **No frontend screen/navigation test harness.** None exists; introducing one is a new
   library/architectural decision and stays owner-only and DEFERRED. It affects only a later production build,
   not the fixture prototype.
2. **No production hosting / security-gate work pulled forward.** Production CORS and dev-bypass cleanup
   (D-095), backend hosting selection (BQ-092), and Supabase leaked-password protection remain DEFERRED and
   out of this internal-prototype workstream.

All five tasks are definition/prototype only — no `app/`/`backend/` code, no schema change, no new library,
no money logic, no reinterpretation of the teach-never-advise line. Production build items would be
separately bounded only after a BQ-117 PASS, per `PROGRAMME.md`.

## Open forks deferred to BQ-115 (surfaced, not decided here)

The BQ-113 journey/state work surfaces these as OPEN DECISIONs for the owner to rule on at BQ-115; this
decision does not pre-empt them:

- **O-A — Session-expiry & network-loss recovery UX** (silent re-auth vs. banner vs. forced logout when a
  token expires or the backend is unreachable mid-session).
- **O-B — Duplicate-registration / wrong-password copy** (neutral wording that does not enable
  account-enumeration; privacy angle).
- **O-C — Logout & account-switch device-local state** (whether logout must actively clear cached UI/query
  state, extending the baseline account-switch load-time suppression from BQ-112).

## Reversibility

High. Touched-data test: no populated data, no committed production code depends on this; it selects the next
definition workstream and appends five queue items and one decision file. Fully reversible by re-ranking.

## Disposition

READY → BQ-113 (working now); BQ-114..117 READY/queued behind it. Recorded in
`docs/DECISION_DELIVERY_TRACKER.md`.
