# D-154 — Duplicate-registration / wrong-password copy is neutral and enumeration-safe

- **Tier:** 2, **owner-ruled 26-Aug-2026** (owner ruled the BQ-113 open fork O-B directly, taking the
  orchestrator's recommendation). O-B carries a **privacy angle** (account-enumeration; DECISION_PROTOCOL
  trigger 2), which is why it was surfaced for an explicit owner ruling rather than auto-decided; the ruling
  itself is a reversible copy/behaviour contract. No production code depends on it yet.
- **Date:** 26-Aug-2026
- **Traces / builds on:** D-152 (account-entry workstream) / D-133 (user-facing copy leaks no backend/provider
  internals) / D-137 · D-142 (verified-subject ownership; app tables FastAPI-only) / the privacy-by-design
  posture in `docs/features/account-entry/PRD.md` and the enumeration-safety **constraint already fixed in
  `CONTRACTS.md`**. Resolves the **O-B** open fork.

## Decision

Invalid-credentials and duplicate-registration copy is **neutral and enumeration-safe**: uniform wording that
**never reveals whether an email has an account**.

- **Login failure (wrong password OR unknown/unregistered email)** shows a single neutral message of the
  "those credentials didn't match" shape. Wrong-password and unknown-email are **indistinguishable** to the
  user — the message, which field is flagged, and the visible copy are identical in both cases. A user (or
  attacker) cannot tell a registered email from an unregistered one from the response.
- **Duplicate registration** (registering an already-registered email) shows a neutral shape that does **not**
  confirm the email already exists — e.g. directing the user to log in or check their email if they already
  have an account — reading identically whether or not the address was previously used.
- **Unconfirmed-email** copy points back to the confirmation step generically, without asserting to a mere
  address-guesser that an account exists.

This **overrides Supabase Auth's default messages**, which currently leak specifics (the two screens surface
raw `signInError.message` / `signUpError.message` today — the observed risk in the PRD). User-facing copy
never echoes any Supabase/Postgres/HTTP internal (D-133). Every failure remains recoverable: input is
retained, edit-and-retry is available, and no state dead-ends.

The eventual **exact strings** are an implementation-copy detail bounded by this constraint; this decision
fixes the neutral, enumeration-safe **shape and behaviour**, consistent with the constraint `CONTRACTS.md`
already treats as definitional.

## Why

- **Account-enumeration is a real privacy leak.** Distinct "no account for this email" vs. "wrong password"
  messages let anyone probe which email addresses are registered with a personal-finance app — sensitive by
  association. The owner chose to close that channel at the copy layer, overriding the provider defaults.
- **Recoverability is preserved.** Neutral copy still tells the user the next safe action (retry credentials,
  or go log in / check email), so enumeration-safety does not create a dead end — the two goals are met
  together, per the `CONTRACTS.md` content contract.
- **Consistent with D-133 and the existing constraint.** It is the same posture (no raw provider internals in
  user-facing errors) applied specifically to auth-failure copy, and it ratifies the enumeration-safety
  constraint BQ-114 had already fixed as a requirement — this ruling supplies the owner decision that
  constraint was PENDING on.

## Boundaries

- No `app/`/`backend/` code, schema, endpoint, or new library is introduced. This defines intended copy
  behaviour for the BQ-116 fixture and BQ-117 validation; a production build contract follows only after a
  BQ-117 PASS.
- Not a money-logic, legal, or teach-vs-advise change; no MVP scope growth (account entry is already MVP).

## Reversibility

High. Touched-data test: no populated data and no committed production code depend on this; it resolves a
definition-stage copy/behaviour fork. Reversible by an owner re-rule, subject to the standing privacy posture
(any future revision must still not regress enumeration-safety without an explicit owner decision).

## Disposition

Recorded in `docs/DECISION_DELIVERY_TRACKER.md`. Feeds the BQ-115 `ACCEPTANCE_MATRIX.md` (Invalid-credentials,
Duplicate-registration, Unconfirmed-email criteria) and the BQ-116 prototype; owner-validated at BQ-117.
