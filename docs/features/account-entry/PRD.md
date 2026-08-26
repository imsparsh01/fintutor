# Account entry and access PRD

**Status:** Candidate contract for owner validation (BQ-113 definition; forks ruled at BQ-115)
**Traces:** D-152 (workstream approval) / D-148 (programme) / D-137 (JWT-derived ownership) / D-142
(FastAPI-only table access) / D-133 (masking/privacy) / D-119 (assessment-authoritative access) / D-052
(Supabase-config dependency flag) / the "living baseline per user" standing principle.

## Bottom line

Account entry is the boundary that decides *whose* private financial baseline is on screen. The desired
outcome is not a rich account-management surface — it is that a user reliably reaches their own account,
understands every access failure without being misled, and leaves (or switches accounts) without another
account's data or device-local state bleeding through. The security architecture is already decided
(D-137/D-142); the gap this package closes is the **user-facing UX and state contract** for entry, failure
and exit, plus owner-validated comprehension of access failures.

## Target user and job

FinTutor's standing target user (`PROJECT_SPEC.md` §3): Indian adults roughly 18–32, beginning or actively
building financial understanding, "financially unmanaged but willing." At this surface they are not thinking
about finance yet — they are trying to get in, get back in after a break, or get out. The job is narrow:
*prove I am me, land in my own account, and never wonder whose numbers these are.* A returning user needs to
resume without re-proving identity every time; a user on a shared or reused device needs a clean switch with
no residue from the previous account.

## Problem

Registration, login and the not-configured path exist and work (see reconciled screens below), but the
contract for the failure and transition states around them is not consolidated or owner-validated:

- What the user sees and can do when a **session expires or the backend is unreachable mid-session**.
- What copy a **duplicate registration or wrong password** shows — neutral enough not to confirm whether an
  email is registered (account-enumeration), yet still recoverable.
- Whether **logout / account switch** must actively clear device-local UI, query and cached state, or whether
  the existing load-time suppression is sufficient.
- How **permission-denied / not-configured / recovery** paths read to a non-technical user.

## Desired outcome (observable)

A user can register, confirm and log in; stay logged in across app restarts; understand and recover from an
expired session, a wrong password, a duplicate registration, offline/backend loss, and a not-configured
build; log out or switch accounts with zero prior-account residue; and at every step correctly answer "whose
account am I in, and am I actually signed in?" without coaching.

## Ties to standing principles

- **Living baseline per user.** The account boundary is what keeps one user's reconciled baseline from
  contaminating another's. Every entry/exit/switch state in this package exists to protect that boundary —
  it extends, at the access layer, the account-switch load-time suppression shipped in the baseline lifecycle
  work (BQ-112).
- **Privacy by design (D-133/D-137/D-142).** Ownership is derived from the verified Supabase JWT subject, not
  a caller-supplied id; application tables are reachable only through FastAPI. This surface must never present
  a state that implies data is loaded for anyone but the verified subject, and failure copy must not leak
  provider internals or, per the enumeration fork, whether an email exists.
- **Teach, never advise.** Not directly engaged here (no financial content), but the same neutral, non-alarming
  voice applies to error and recovery copy: state what happened and the next safe action, nothing more.

## Scope

### Included
- The not-configured path (Supabase env vars absent) as a clear state, not a crash.
- Registration (email/password) including the email-confirmation handoff.
- Login (email/password) and its submitting/error states.
- Session persistence across app restart, and the initial session-restore loading gate.
- Session-expiry and mid-session backend-loss behaviour (contract to be decided at BQ-115).
- Invalid-credentials, duplicate-registration and permission-denied handling and copy.
- Logout and account-switch device-local state handling.
- Recovery affordances (retry, re-authenticate, edit input) for every failure state.
- Reconciliation of the above with the existing screens/navigation as observed fact.

### Excluded
- Any `app/` or `backend/` code, schema, migration, API or new library in this package (definition/prototype
  only per `PROGRAMME.md`; a build contract follows only after a BQ-117 PASS).
- Password reset / forgot-password, social/OAuth, MFA, and biometric unlock — not in the current build and
  not being introduced here (flag as future scope, do not design).
- The dev-only `EXPO_PUBLIC_DEV_USER_ID` bypass in `RootNavigator` — documented as an observed non-product
  path, not a designed entry point; its production removal is D-095's deferred concern, not this workstream.
- Onboarding and first-action handoff (a separate ranked workstream); this package hands off at the point of
  a verified session.
- Production CORS/dev-bypass cleanup (D-095), backend hosting (BQ-092) and Supabase leaked-password
  protection — DEFERRED HARD-STOPs, explicitly out of scope.
- Deciding the three open UX forks (§ "Open forks"): they are surfaced for the owner and ruled at BQ-115.

## Success criteria

### Prototype gate (owner, at BQ-117)
- Owner completes every critical task (register, log in, restart-resume, wrong password, duplicate
  registration, expired session, offline, logout, account switch, not-configured) without coaching.
- At every state the owner can correctly say whether they are signed in and whose account is shown.
- Every failure state has a safe, non-dead-end recovery, and no copy misleads about account existence.
- No unresolved product-intent disagreement remains after the decision register is ruled.

### Later integrated evidence
- D-124 remains the authoritative post-internal-validation activation test; this package is owner-validated,
  not a separate target-user study.

## Dependencies
- Supabase Auth (email/password sign-up, sign-in, session, `onAuthStateChange`) via `app/lib/supabase.ts`.
- D-137 JWT-derived backend ownership and D-142 FastAPI-only table access (referenced, not restated).
- The `isSupabaseConfigured` dependency flag (D-052) driving the not-configured path.
- The assessment-authoritative access gate (D-119) that runs immediately after a verified session.
- The existing design token set (`app/design/tokens.ts`) for the eventual prototype.

## Evidence ledger

| Type | Evidence | Confidence |
|---|---|---|
| Observed | `LoginScreen`/`RegisterScreen` perform Supabase email/password auth; success is picked up by `RootNavigator`'s `onAuthStateChange` listener, which swaps to the authenticated app. | High |
| Observed | `RootNavigator` restores the session on mount, gates render on a `loading` flag, and shows `NotConfiguredScreen` when `isSupabaseConfigured` is false. | High |
| Observed | `AuthenticatedApp` resets onboarding/assessment/destination state on `userId` change (load-time account-switch suppression). | High |
| Observed | Backend ownership is the verified JWT subject; a caller-supplied `user_id` cannot select ownership (D-137). | High |
| Observed risk | Login/Register surface raw `signInError.message`/`signUpError.message` — no neutral-copy or enumeration layer exists yet. | High |
| Observed risk | There is no explicit mid-session expiry/offline handling in the entry screens; behaviour on token expiry or backend loss is undefined at the UX layer. | High |
| Observed risk | Logout is not exercised by these screens; whether device-local cached UI/query state is actively cleared on sign-out (beyond load-time suppression) is unspecified. | Medium-high |
| Assumption | Users understand persistent thread continuity vs. being signed in, and read "check your email to confirm" as a required step. | Low until owner validation. |
| Unknown | Desired recovery UX for expired session / network loss (silent re-auth vs. banner vs. forced logout). | Open — BQ-115. |
| Unknown | Neutral duplicate-registration / wrong-password copy that avoids account-enumeration. | Open — BQ-115. |
| Unknown | Whether logout must actively clear device-local state or load-time suppression suffices. | Open — BQ-115. |
