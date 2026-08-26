# D-153 — Session-expiry / network-loss recovery UX is a non-blocking banner + manual retry

- **Tier:** 2, **owner-ruled 26-Aug-2026** (owner ruled the BQ-113 open fork O-A directly, taking the
  orchestrator's recommendation). Reversible definition-stage UX fork; no production code depends on it yet.
- **Date:** 26-Aug-2026
- **Traces / builds on:** D-152 (account-entry workstream) / D-137 (JWT-derived backend ownership) / D-133
  (no provider-internal leakage in user-facing copy) / D-149 · BQ-112 (baseline lifecycle & load-time
  account-switch suppression) / the "living baseline per user" standing principle. Resolves the **O-A** open
  fork surfaced in `docs/features/account-entry/JOURNEY_AND_STATES.md` and `CONTRACTS.md`.

## Decision

When an access token **expires mid-session** or the **backend is unreachable / the network is lost**
mid-session, the recovery UX is a **non-blocking banner + manual retry**:

- A non-blocking banner surfaces the failure in place ("session expired, please sign in again" for expiry;
  "couldn't connect — retry" for network/backend loss), stating what happened and the next safe action in
  the app's calm, neutral voice.
- The user **manually retries** (re-authenticate for an expired session; retry the request for a transient
  connection loss). The app does **not** silently discard the user's place on a transient blip.
- The app does **not force an immediate logout** back to the login screen on a transient failure, and does
  **not silently re-authenticate** in the background.

This governs the **Expired-session (mid-use)** and **Offline / network-loss** rows of the state matrix,
replacing their PENDING-O-A interim behaviour. The existing invariants still hold: no stale-authenticated
illusion (an expired subject is treated as lost — no subject data is rendered behind the banner), input is
preserved, retry is always explicit, and copy carries no provider internals (D-133).

## Why

- **Clarity over seamlessness.** Silent re-auth hides from the user whether they are still signed in, which
  directly violates the package's core desired outcome — that a user can always correctly answer "am I
  actually signed in?" A forced logout is the opposite failure: it destroys the user's place over what may be
  a one-second network blip, punishing a transient condition as if it were a real sign-out.
- **Banner + manual retry is the middle path** the owner selected: it names the failure honestly, keeps the
  user in control of recovery, and degrades a transient blip gracefully instead of ejecting the user.
- **Consistent with the standing invariants.** It never presents stale data as live (the expired subject is
  lost until re-established, per `CONTRACTS.md` failure semantics), and never silently resends a request
  without the user acting.

## Boundaries

- No `app/`/`backend/` code, schema, migration, endpoint, or new library is introduced by this decision —
  it fixes the intended behaviour for the fixture prototype (BQ-116) and eventual owner validation (BQ-117).
  A production build contract follows only after a BQ-117 PASS.
- No new library or architectural pattern (e.g. a global toast/banner framework) is decided here; the
  prototype expresses the banner with existing design tokens. Selecting any production mechanism remains a
  later bounded task, not a HARD-STOP resolved here.

## Reversibility

High. Touched-data test: no populated data and no committed production code depend on this; it resolves a
definition-stage UX fork consumed only by the downstream fixture/validation tasks. Fully reversible by an
owner re-rule before any production build.

## Disposition

Recorded in `docs/DECISION_DELIVERY_TRACKER.md`. Feeds the BQ-115 `ACCEPTANCE_MATRIX.md` (Expired-session and
Offline criteria) and the BQ-116 prototype; owner-validated at BQ-117.
