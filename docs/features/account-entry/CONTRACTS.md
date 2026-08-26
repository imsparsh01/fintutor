# Account entry functional, content and privacy/accessibility contracts

**Status:** Candidate contract for owner validation (BQ-114 definition; the three UX forks are ruled at
BQ-115). Definition only — no `app/`/`backend/` code, schema, API or new library is introduced or modified
here.
**Traces:** D-152 (workstream) / D-137 (JWT-derived ownership) / D-142 (FastAPI-only table access) / D-133
(masking & user-facing re-humanisation) / D-052 (Supabase-config flag) / D-119 (post-session assessment
gate) / D-149 (baseline lifecycle & account-switch suppression) / D-124 (activation test) / the "living
baseline per user" principle. Builds directly on BQ-113's `PRD.md` and `JOURNEY_AND_STATES.md`.

## How to read this file

Account entry writes **no application data of its own**. Its "inputs" are credentials handed to Supabase
Auth; its "output" is a verified session (or a recoverable failure). The contract below is therefore mostly
a **state, copy, and non-leakage** contract, not a persistence contract. Every state named in
`JOURNEY_AND_STATES.md`'s matrix has a row in the per-state contract, and the three open forks (O-A/O-B/O-C)
are referenced with clearly-labelled **PENDING** interim behaviour — this task does not choose them.

## Inputs, outputs and persistence

| Concern | Contract |
|---|---|
| Credential inputs | Email + password only. Held in editable component state; never persisted by this surface, never logged, never sent anywhere except Supabase Auth's `signInWithPassword` / `signUp`. |
| Session output | On success, a Supabase-issued session (access + refresh token) owned by Supabase Auth's client storage. This surface reads it via `getSession()` / `onAuthStateChange`; it does not mint, copy, or persist tokens itself. |
| Ownership | Never derived or asserted at this layer. The verified JWT subject is authoritative for all downstream data (D-137); a caller-supplied `user_id` grants nothing. Application tables are reachable only through FastAPI (D-142). This surface must never present a state implying data is loaded for anyone but the verified subject. |
| Device-local state | Any cached UI/query/onboarding/assessment state is installation-local and subject-scoped. On `userId` change it is reset at load time today (D-149 / BQ-112 suppression). Whether logout/switch must *actively* clear it beyond that is **OPEN — O-C**. |
| Config input | `isSupabaseConfigured` (D-052) gates the whole surface: false → not-configured state, no auth surface reachable. |
| No new data model | This package adds no table, column, migration, endpoint, or characteristic. Password reset, OAuth, MFA and biometric unlock are out of scope and are not designed here (future scope only). |

## Per-state functional contract

Each state below corresponds to a row in `JOURNEY_AND_STATES.md`'s state matrix.

| State | Required behaviour | Recovery / invariant |
|---|---|---|
| Not-configured | Render the clear not-configured state with the concrete fix (add `EXPO_PUBLIC_SUPABASE_URL` / `..._ANON_KEY`, restart); never a crash, never a blank screen. | Only a build/config fix resolves it; no auth surface, no partial app render is reachable. |
| Loading (session restore) | Neutral loading gate while `getSession()` resolves; commit to neither auth nor app. | No flash of login or app before the session resolves; render nothing decision-bearing until resolved. |
| Unauthenticated (login) | Editable email/password form, submit control, links to Register and Privacy Policy. | No application data on screen; nothing implies a signed-in state. |
| Submitting (login/register) | In-flight indicator; primary control disabled; inputs preserved. | Duplicate submits suppressed; a failure returns to the prior state with input intact, never a cleared form. |
| Register success / email-confirmation handoff | State the required next step: confirm via email, then log in. No session is created until confirmation + login. | Not a dead end; the path back to login is obvious; do not imply the user is already signed in. |
| Valid (authenticated) | Hand off to the D-119 post-session assessment gate for the verified subject, which routes to Onboarding or Home. | Only the verified JWT subject's context is ever loaded (D-137); account entry's responsibility ends at a verified, correctly-attributed session. |
| Invalid-credentials (wrong password / unknown email) | Stay on login; retain email/password; show a **neutral, enumeration-safe** recoverable error (see Content contract); allow edit-and-retry. | Copy must not reveal whether the email exists. Exact wording **PENDING O-B**. |
| Duplicate-registration | Stay recoverable on register; offer return-to-login or edit; show enumeration-safe copy that does not confirm the email is already registered. | Copy must not confirm registration status. Exact wording **PENDING O-B**. |
| Unconfirmed-email | Point back to the email-confirmation step without dead-ending. | No session granted before confirmation + login. |
| Expired-session (mid-use) | Detect a token that expired mid-session and enter a recovery path; never present a stale-authenticated illusion. | Recovery UX (silent re-auth vs. in-place banner + manual retry vs. forced logout) is **OPEN — O-A**. **Interim/placeholder:** treat expiry as loss of the verified subject — render no subject data and route toward re-authentication; do not silently show stale data. Final behaviour **PENDING O-A**. |
| Permission-denied (401/unauthorized) | Render no data; route to re-authenticate; never show another account's data or a partial signed-in illusion. | Reauthenticate or leave; failure copy carries no provider internals (D-133 posture). |
| Offline / network-loss | Never present emptiness as success; preserve safe input; expose explicit retry. | No silent failure. Mid-session policy is tied to **O-A**; **interim:** show a non-alarming connection-failure state with retry, input preserved. |
| Account-transition / switch | Load only the new verified subject; no prior-account residue. | Extends D-149/BQ-112 load-time suppression. Whether active-clear beyond load-time reset is required is **OPEN — O-C**; **interim:** rely on existing load-time reset, flagged as possibly insufficient on a shared/reused device. |
| Recovery (cross-cutting) | Every failure state exposes a safe next action (retry / re-authenticate / edit input). | No dead ends; no raw provider internals in copy. |
| Logout | Return to login cleanly; discard in-flight prior-account results. | Log back in or leave. Whether cached UI/query/device-local state must be actively cleared is **OPEN — O-C**; **interim:** existing load-time suppression, flagged. |

## Content, copy and neutrality contract

- **Voice.** State what happened and the next safe action, nothing more. No alarm, no blame, no jargon, no
  provider/product names. Applies the app's calm, neutral register to error and recovery copy (the
  teach-never-advise voice, though no financial content lives here).
- **No raw provider internals.** User-facing copy never echoes `signInError.message` / `signUpError.message`
  or any Supabase/Postgres/HTTP internal (D-133 posture: user-facing errors do not leak backend internals).
  This replaces the observed-risk behaviour where the two screens surface raw messages today.
- **Enumeration-safe error copy (the core content contract).** Copy must let a user *recover* without ever
  confirming whether a given email is registered. The contract the eventual copy must satisfy:
  - **Wrong password** and **unknown/unregistered email** on login must be **indistinguishable** to the user
    — a single neutral "those credentials didn't match" shape, never "no account for this email" vs. "wrong
    password". A user (or attacker) must not be able to tell a registered email from an unregistered one by
    the message, timing-visible copy, or which field is flagged.
  - **Duplicate registration** must not confirm the email already exists — it must not say "this email is
    already registered". A neutral shape (e.g. directing the user to log in or check their email if they
    already have an account) that reads identically whether or not the address was previously used.
  - **Unconfirmed email** copy points back to the confirmation step generically, without asserting an account
    exists to a party who merely guessed the address.
  - The **exact final strings and the precise neutral shape are OPEN — O-B** (privacy angle; may route to
    Tier 3 at BQ-115). This contract fixes the *constraint* (enumeration-safety + recoverability), not the
    wording. Until ruled, treat the interim copy as a placeholder that already satisfies the constraint.
- **Not-configured copy** is a developer-facing instruction (the fix + restart), the one state whose audience
  is not an end user; it still must not crash or read as an app error to a non-technical viewer.
- **Confirmation/handoff copy** states the required action ("check your email to confirm, then log in") and
  must not imply an active session before one exists.
- **Say precisely:** signed in, signed out, session expired, couldn't connect, couldn't sign you in, check
  your email. **Never** imply whose data is shown when no verified subject is present, and never say an
  operation succeeded when it did not.

## Privacy and security contract

- Ownership is the verified Supabase JWT subject; a caller-supplied `user_id` is non-authoritative (D-137).
  This surface asserts no identity of its own and never selects ownership.
- Application tables remain FastAPI-only with RLS and no client-role privileges (D-142). This surface uses
  Supabase directly for **Auth only**; it reads no application table.
- No state may render, cache, or imply another subject's data. On permission-denied, expiry, logout, or
  switch, the prior subject's data must not remain visible or partially visible.
- Credentials and tokens are never logged, never placed in analytics, never written to app-owned storage.
  Failure logs (where any exist) carry controlled reasons only — no credentials, no raw provider body, no
  session tokens (D-133 posture).
- The dev-only `EXPO_PUBLIC_DEV_USER_ID` bypass is an observed non-product path, not a designed entry point;
  its production removal is D-095's deferred concern, out of scope here.

## Accessibility contract

- Email and password inputs each have a persistent accessible name, a hint where useful, programmatic
  error association, and a programmatically conveyed disabled state during submit.
- Loading, submitting, error, and recovery states are announced to assistive technology; a new error is
  announced without stealing focus on web, matching the app's established web/native focus discipline.
- The not-configured, expired-session, and permission-denied states are reachable and legible by screen
  reader, and their recovery action is a real, focusable control.
- All controls (submit, links, retry, re-authenticate) are fully keyboard and screen-reader operable, with
  at least 44px touch targets.
- Focus moves predictably at meaningful state boundaries (e.g. into the error, or to the primary control on
  a transition) and is platform-guarded (native imperative focus only on native).
- No state relies on colour alone; reduced-motion preference is respected; error/focus states meet WCAG AA.

## Failure semantics

- A failed sign-in/sign-up keeps the entered input and gives explicit retry; it never implies success and
  never clears the form.
- Network/backend loss is never presented as an empty or successful state; retry is always explicit and
  never silently resends without the user acting (input preserved).
- Session expiry mid-use is a first-class failure, not a silent stale-authenticated view; the verified
  subject is considered lost until re-established. **Recovery flow PENDING O-A.**
- Permission-denied renders no data and routes to re-authentication; it never falls back to another
  account or a partial signed-in surface.
- Account switch / logout discards in-flight prior-account results so a late response cannot paint the new
  session with the old subject's data. **Active-clear extent PENDING O-C.**
- Every failure has a safe, non-dead-end recovery (retry / re-authenticate / edit / return to login).

## Progression and events contract

- Account entry, exit, and switch are **not** learning achievements or financial-outcome rewards and emit
  no progression event (consistent with the D-121 boundary that progression records only learning
  participation). Registering, logging in, or logging out earns nothing.
- No analytics on this surface may carry credentials, tokens, email addresses, or any signal that would let
  a recipient infer whether an email is registered.

## Testing note (definition only)

No test is written or run here, and no frontend screen/navigation **test harness** is introduced — that
remains a DEFERRED HARD-STOP (owner-only, new library/architecture). Each state contract above maps to an
owner-observable prototype task authored at BQ-115 (`ACCEPTANCE_AND_VALIDATION.md`) and exercised in the
BQ-116 fixture; D-124 remains the authoritative later activation test. This contract is the source these
downstream tasks trace to.

## Open forks referenced by this contract (ruled at BQ-115, not here)

- **O-A** — session-expiry & network-loss recovery UX (silent re-auth vs. banner + manual retry vs. forced
  logout). Governs the Expired-session and Offline mid-session rows; interim behaviour marked PENDING above.
- **O-B** — duplicate-registration / wrong-password copy & account-enumeration (privacy angle). Governs the
  exact enumeration-safe strings; the constraint is fixed here, the wording is PENDING.
- **O-C** — logout & account-switch device-local state (active clear vs. existing load-time suppression).
  Governs the Logout and Account-transition rows; interim relies on D-149/BQ-112 suppression, flagged.

No new open decision is surfaced by this contract beyond O-A/O-B/O-C; the enumeration-safety *constraint* is
treated as a definitional requirement of O-B, not a separate fork.
