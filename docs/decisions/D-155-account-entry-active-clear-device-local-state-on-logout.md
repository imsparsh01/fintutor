# D-155 — Logout / account-switch actively clears device-local state

- **Tier:** 2, **owner-ruled 26-Aug-2026** (owner ruled the BQ-113 open fork O-C directly, taking the
  orchestrator's recommendation). Reversible definition-stage UX fork; no production code depends on it yet.
- **Date:** 26-Aug-2026
- **Traces / builds on:** D-152 (account-entry workstream) / D-149 · BQ-112 (baseline lifecycle &
  **load-time** account-switch suppression, which this extends) / D-137 · D-142 (verified-subject ownership;
  app tables FastAPI-only) / D-133 (no cross-subject data residue) / the "living baseline per user" standing
  principle. Resolves the **O-C** open fork surfaced in
  `docs/features/account-entry/JOURNEY_AND_STATES.md` and `CONTRACTS.md`.

## Decision

On **logout and account-switch**, device-local state is **actively cleared** — the strongest anti-bleed
option. On sign-out (and when a different account signs in on the same device), the app actively clears
cached UI state, query/data caches, and device-local `AsyncStorage`-backed subject-scoped state, rather than
relying only on the existing **load-time** account-switch suppression.

This **extends** the BQ-112 / D-149 behaviour (which resets onboarding/assessment/destination state on
`userId` change at load time): active-clear-on-logout adds an explicit teardown at the moment of
logout/switch, closing the window in which prior-account UI/query/cached state could persist on a
shared or reused device between accounts. In-flight prior-account results are discarded so a late response
cannot paint the new (or logged-out) surface with the old subject's data.

This governs the **Logout** and **Account-transition / switch** rows of the state matrix, replacing their
PENDING-O-C interim ("rely on load-time suppression, flagged as possibly insufficient"). The invariant is
strengthened to: after logout or switch, **no** prior subject's UI, cached, or device-local state remains
visible, partially visible, or recoverable.

## Why

- **Residue risk on shared / reused devices.** The target user (PROJECT_SPEC §3) includes people on shared or
  reused devices. Load-time suppression only guarantees a clean slate on the *next* load keyed by `userId`
  change; it does not guarantee that nothing from the prior account lingers in caches or device-local storage
  in the interim. Active clear-on-logout removes that residue window entirely.
- **Protects the account boundary — the whole point of this surface.** The account boundary is what keeps one
  user's reconciled living baseline from contaminating another's. The strongest anti-bleed option is the one
  most faithful to that standing principle, and the owner chose it deliberately over the weaker
  suppression-only path.
- **Consistent with D-137/D-142/D-133.** Ownership is the verified JWT subject and app tables are
  FastAPI-only; actively clearing device-local state on exit keeps the client side aligned with that
  server-side guarantee — no state may render or imply another subject's data.

## Boundaries

- No `app/`/`backend/` code, schema, migration, endpoint, or new library is introduced. This fixes the
  intended teardown behaviour for the BQ-116 fixture and BQ-117 validation; a production build contract
  follows only after a BQ-117 PASS. (The eventual implementation reuses existing storage/query mechanisms;
  no new persistence or cache library is decided here.)
- Not a money-logic, legal, or teach-vs-advise change; no MVP scope growth (account entry is already MVP).

## Reversibility

High. Touched-data test: no populated data and no committed production code depend on this; it resolves a
definition-stage UX fork consumed only by the downstream fixture/validation tasks. Reversible by an owner
re-rule, subject to the standing no-cross-subject-residue posture.

## Disposition

Recorded in `docs/DECISION_DELIVERY_TRACKER.md`. Feeds the BQ-115 `ACCEPTANCE_MATRIX.md` (Logout,
Account-transition/switch criteria) and the BQ-116 prototype; owner-validated at BQ-117.
