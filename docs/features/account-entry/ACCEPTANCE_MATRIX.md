# Account entry acceptance matrix

**Status:** Acceptance layer for owner validation (BQ-115). The three open UX forks are now **ruled**
(D-153/D-154/D-155, owner-ruled 26-Aug-2026) and are incorporated below; no interim/PENDING behaviour
remains. This is the layer the BQ-116 prototype is built to satisfy and the BQ-117 owner walkthrough checks
against.
**Traces:** D-152 (workstream) / D-148 (programme) / **D-153** (O-A: session-expiry & network-loss = banner +
manual retry) / **D-154** (O-B: neutral, enumeration-safe copy) / **D-155** (O-C: active clear on
logout/switch) / D-137 (JWT-derived ownership) / D-142 (FastAPI-only table access) / D-133 (no
provider-internal leakage) / D-119 (post-session assessment gate) / D-149 · BQ-112 (load-time account-switch
suppression) / D-052 (Supabase-config flag) / D-121 (progression records only learning). Builds directly on
`PRD.md`, `JOURNEY_AND_STATES.md`, and `CONTRACTS.md`.

## How to read this file

Every state and every transition in `JOURNEY_AND_STATES.md` has enumerated, testable **Given / When / Then**
acceptance criteria below. Each criterion has a stable ID (`AC-<AREA>-<n>`). Section A covers **states**,
Section B covers **journey transitions**, Section C covers **cross-cutting invariants** that apply across
states. The **Coverage map** (Section D) proves every matrix state and every journey step maps to at least
one criterion, and cites the governing contract/decision. Section E maps criteria to the BQ-116 prototype
tasks and the BQ-117 recording protocol.

This document adds **no product scope**: it makes testable the behaviour already fixed in
`PRD.md`/`JOURNEY_AND_STATES.md`/`CONTRACTS.md` plus the three now-ruled decisions. Account entry writes no
application data of its own; criteria are therefore about **state, copy, non-leakage, and recovery**, not
persistence.

---

## Section A — State acceptance criteria

### A1. Not-configured (`isSupabaseConfigured` false — D-052)

- **AC-NC-1** — GIVEN the Supabase env vars are absent, WHEN the app launches, THEN the not-configured state
  renders (never a crash, never a blank screen) with the concrete fix (add `EXPO_PUBLIC_SUPABASE_URL` /
  `..._ANON_KEY`, then restart).
- **AC-NC-2** — GIVEN the not-configured state, WHEN the user attempts to proceed, THEN no auth surface and no
  partial app render is reachable; the only resolution is a build/config fix.
- **AC-NC-3** — GIVEN a screen reader, WHEN the not-configured state is shown, THEN its instruction text is
  announced and legible; it does not read as an app error to a non-technical viewer (dev-facing copy, single
  exception per `CONTRACTS.md`).

### A2. Loading — session restore

- **AC-LD-1** — GIVEN a launch with configuration present, WHEN `getSession()` is still resolving, THEN a
  neutral loading gate shows and the app commits to neither the auth screens nor the authenticated app (no
  flash of the wrong surface).
- **AC-LD-2** — GIVEN the loading gate, WHEN session restore resolves, THEN the app branches exactly once: no
  stored/valid session → login; a valid restored session → the D-119 post-session gate. Nothing
  decision-bearing renders before resolution.

### A3. Unauthenticated — login

- **AC-UN-1** — GIVEN no session, WHEN the login screen is shown, THEN editable email and password fields, a
  submit control, and links to Register and the Privacy Policy are present.
- **AC-UN-2** — GIVEN the login screen, WHEN it is shown, THEN no application data appears and nothing implies
  a signed-in state.
- **AC-UN-3** — GIVEN the login screen, WHEN the user taps the Register link, THEN they reach the register
  screen, and can return to login (Login ⇄ Register), with no session created by navigation alone.

### A4. Submitting — login / register in-flight

- **AC-SB-1** — GIVEN valid-format input, WHEN the user submits, THEN an in-flight indicator shows and the
  primary control is disabled (state programmatically conveyed to assistive tech).
- **AC-SB-2** — GIVEN a submit is in flight, WHEN the user taps submit again, THEN the duplicate submit is
  suppressed (no double request).
- **AC-SB-3** — GIVEN a submit that fails, WHEN the failure returns, THEN the screen returns to its prior
  state with the entered input **intact** — the form is never cleared.

### A5. Valid — authenticated handoff

- **AC-VA-1** — GIVEN correct credentials, WHEN sign-in succeeds, THEN the app transitions (via the auth-state
  listener) to the D-119 post-session assessment gate for the verified subject, routing to Onboarding or Home.
- **AC-VA-2** — GIVEN a verified session, WHEN downstream data loads, THEN **only** the verified JWT subject's
  context is ever loaded (D-137); no caller-supplied id can select ownership, and app tables are reached only
  through FastAPI (D-142). Account entry's responsibility ends at a verified, correctly-attributed session.

### A6. Invalid-credentials — wrong password / unknown email (D-154)

- **AC-IC-1** — GIVEN a login attempt with a wrong password OR an unknown/unregistered email, WHEN it fails,
  THEN the user stays on login, email and password are retained, and edit-and-retry is available.
- **AC-IC-2** — GIVEN either failure cause, WHEN the error copy is shown, THEN it is a **single neutral shape**
  ("those credentials didn't match") that is **indistinguishable** between wrong-password and unknown-email:
  identical message, identical field flagging, no timing-visible or copy-visible signal of which cause
  occurred (D-154). A user or attacker cannot tell a registered email from an unregistered one.
- **AC-IC-3** — GIVEN a login failure, WHEN copy is rendered, THEN it never echoes `signInError.message` or
  any Supabase/Postgres/HTTP internal (D-133); it overrides the provider default message.

### A7. Duplicate-registration (D-154)

- **AC-DR-1** — GIVEN a registration with an already-registered email, WHEN it is submitted, THEN the register
  screen stays recoverable, offering return-to-login or edit, with input retained.
- **AC-DR-2** — GIVEN the duplicate-registration outcome, WHEN copy is shown, THEN it does **not** confirm the
  email already exists — a neutral shape (e.g. "if you already have an account, log in or check your email")
  that reads **identically** whether or not the address was previously used (D-154).
- **AC-DR-3** — GIVEN the duplicate-registration outcome, WHEN copy is rendered, THEN it carries no provider
  internals (D-133) and overrides the provider default `signUpError.message`.

### A8. Unconfirmed-email

- **AC-UE-1** — GIVEN a registered-but-unconfirmed account, WHEN the user tries to log in, THEN copy points
  back to the email-confirmation step without dead-ending, and no session is granted before confirmation +
  login.
- **AC-UE-2** — GIVEN a party who merely guessed an address, WHEN unconfirmed-email copy is shown, THEN it is
  generic and does not assert to that party that an account exists (D-154 enumeration-safety).

### A9. Expired-session — token expires mid-use (D-153)

- **AC-EX-1** — GIVEN an active session, WHEN the access token expires mid-session, THEN a **non-blocking
  banner** surfaces the expiry in the app's calm, neutral voice ("session expired, please sign in again") —
  not a forced immediate logout, not a silent background re-authentication (D-153).
- **AC-EX-2** — GIVEN the expired session, WHEN the banner is shown, THEN **no subject data is rendered**
  behind it (the expired subject is treated as lost — no stale-authenticated illusion), and the user
  **manually re-authenticates** to recover.
- **AC-EX-3** — GIVEN the manual re-authentication succeeds, WHEN the session is re-established, THEN the app
  loads only the verified subject's context (D-137) and the banner clears.

### A10. Permission-denied — 401 / unauthorized

- **AC-PD-1** — GIVEN a protected request rejected as unauthorized, WHEN it returns, THEN no data is rendered
  and the user is routed to re-authenticate; another account's data or a partial signed-in surface is never
  shown.
- **AC-PD-2** — GIVEN a permission-denied outcome, WHEN copy is shown, THEN it carries no provider internals
  (D-133) and offers a real, focusable recovery control (re-authenticate or leave).

### A11. Offline / network-loss (D-153)

- **AC-OF-1** — GIVEN no network or an unreachable backend during entry or mid-session, WHEN a request fails,
  THEN emptiness is **never** presented as success; a non-alarming connection-failure state shows with the
  input preserved.
- **AC-OF-2** — GIVEN a mid-session connection loss, WHEN it is detected, THEN a **non-blocking banner**
  ("couldn't connect — retry") surfaces it and the user **manually retries**; the app does not silently
  resend and does not force a logout on a transient blip (D-153).
- **AC-OF-3** — GIVEN the retry, WHEN connectivity returns and the retry succeeds, THEN the banner clears and
  no duplicate side effect occurred from the failed attempt.

### A12. Account-transition / switch (D-155)

- **AC-SW-1** — GIVEN account A is signed in on a device, WHEN account B signs in on the same device, THEN
  only account B's verified subject is loaded and **no** prior-account UI, cached, query, or device-local
  state remains visible or recoverable (D-155 active clear, extending D-149/BQ-112 load-time suppression).
- **AC-SW-2** — GIVEN a switch in progress, WHEN an in-flight request from account A returns late, THEN its
  result is discarded and cannot paint account B's surface with A's data.
- **AC-SW-3** — GIVEN a shared / reused device, WHEN account B inspects any surface after the switch, THEN no
  residue window exposes account A's cached or device-local state at any point (not only on the next load).

### A13. Recovery (cross-cutting)

- **AC-RC-1** — GIVEN any failure state (invalid-credentials, duplicate-registration, unconfirmed-email,
  expired-session, permission-denied, offline), WHEN it is shown, THEN it exposes a safe next action (retry /
  re-authenticate / edit input / return to login) — no dead ends.
- **AC-RC-2** — GIVEN any recovery copy, WHEN rendered, THEN it states what happened and the next safe action
  only, with no raw provider internals (D-133) and no alarm/blame/jargon.

### A14. Logout (D-155)

- **AC-LO-1** — GIVEN a signed-in user, WHEN they log out, THEN they return to the login screen cleanly and
  device-local state is **actively cleared** — cached UI, query/data caches, and subject-scoped
  `AsyncStorage`-backed state (D-155), not merely reset at the next load.
- **AC-LO-2** — GIVEN logout, WHEN an in-flight prior-account request returns after sign-out, THEN its result
  is discarded and never rendered.
- **AC-LO-3** — GIVEN the post-logout login screen, WHEN it is shown, THEN no prior-account data is visible or
  recoverable and nothing implies a still-signed-in state.

### A15. Register success / email-confirmation handoff

- **AC-RS-1** — GIVEN a successful `signUp`, WHEN the result returns, THEN the screen states the required next
  step ("check your email to confirm, then log in") and the obvious path back to login is present.
- **AC-RS-2** — GIVEN register success, WHEN the handoff copy is shown, THEN it does **not** imply an active
  session exists before confirmation + login.

---

## Section B — Journey transition acceptance criteria

Covers each numbered step of the `JOURNEY_AND_STATES.md` primary journey and its alternate paths.

- **AC-T-DISCOVER** — GIVEN the app opens (journey step 1), WHEN configuration is evaluated, THEN a
  not-configured build lands on the not-configured state and goes no further (→ AC-NC-1); otherwise the app
  proceeds to session restore.
- **AC-T-RESTORE** — GIVEN configuration present (step 2), WHEN the stored session is being restored, THEN the
  neutral loading gate holds until resolution (→ AC-LD-1).
- **AC-T-BRANCH** — GIVEN restore resolves (step 3), WHEN there is no session, THEN the login screen shows;
  WHEN there is a valid restored session, THEN control passes straight to the D-119 post-session gate
  (→ AC-LD-2).
- **AC-T-ENTER-RETURNING** — GIVEN a returning user submits credentials (step 4), WHEN sign-in succeeds, THEN
  the app transitions to the authenticated surface via the auth-state listener (→ AC-VA-1); WHEN it fails, THEN
  it stays on login with a recoverable, enumeration-safe error and retained input (→ AC-IC-1/AC-IC-2).
- **AC-T-ENTER-NEW** — GIVEN a new user registers (step 5), WHEN `signUp` succeeds, THEN they are told to
  confirm via email then log in, with **no** session created until confirmation + login (→ AC-RS-1/AC-RS-2);
  WHEN the email is already registered, THEN enumeration-safe duplicate copy shows (→ AC-DR-2).
- **AC-T-LAND** — GIVEN a verified session (step 6), WHEN handoff occurs, THEN the D-119 post-session
  assessment gate routes to Onboarding or Home for the verified subject only (→ AC-VA-2); account entry's
  responsibility ends here.
- **AC-T-RETURN** — GIVEN a later launch with a persisted session (step 7), WHEN it is still valid, THEN the
  auth screens are skipped (→ AC-T-BRANCH); WHEN it has expired mid-use, THEN the banner + manual-retry
  recovery applies (→ AC-EX-1).
- **AC-T-EXIT-LOGOUT** — GIVEN a signed-in user (step 8), WHEN they log out, THEN they return to login with
  device-local state actively cleared and zero prior-account residue (→ AC-LO-1/AC-LO-3).
- **AC-T-EXIT-SWITCH** — GIVEN a different account signs in on the same device (step 8), WHEN the switch
  completes, THEN only the new subject is loaded with no bleed-through at any point (→ AC-SW-1/AC-SW-3).
- **AC-T-ALT-UNCONFIRMED** — GIVEN a registered-but-unconfirmed user tries to log in (alternate path), WHEN it
  is blocked, THEN copy points back to confirmation without dead-ending (→ AC-UE-1).
- **AC-T-ALT-PERMDENIED** — GIVEN a request is rejected as unauthorized mid-use (alternate path), WHEN it
  returns, THEN no data renders and the user is routed to re-authenticate (→ AC-PD-1).

---

## Section C — Cross-cutting invariants (must hold in every applicable state)

- **AC-INV-OWNERSHIP** — At no point is any state rendered that implies data is loaded for anyone but the
  verified JWT subject; ownership is never derived or asserted at this layer (D-137/D-142). (Applies to
  A5, A9, A10, A12, A14 and all transitions.)
- **AC-INV-ENUMERATION** — No message, field-flagging, timing-visible copy, or analytics signal ever reveals
  whether a given email is registered (D-154). (Applies to A6, A7, A8.)
- **AC-INV-NO-LEAK** — No user-facing copy or log echoes credentials, tokens, email addresses, raw provider
  bodies, or Supabase/Postgres/HTTP internals (D-133). Credentials/tokens are never logged, never placed in
  analytics, never written to app-owned storage. (Applies to all states.)
- **AC-INV-NO-RESIDUE** — After permission-denied, expiry, logout, or switch, no prior subject's data remains
  visible, partially visible, or recoverable (D-155 for logout/switch; the invariant itself for expiry/perm).
- **AC-INV-INPUT-PRESERVED** — Any failed sign-in/sign-up keeps entered input and offers explicit retry; a
  network failure never silently resends. (Applies to A4, A6, A7, A11.)
- **AC-INV-NO-PROGRESSION** — Registering, logging in, or logging out emits no progression/learning event and
  earns no reward (D-121 boundary). (Applies to A3–A15 as relevant.)
- **AC-INV-A11Y** — Inputs have persistent accessible names and programmatic error association; loading,
  submitting, error and recovery states are announced to assistive tech; a new error is announced without
  stealing focus on web (native imperative focus only on native); all controls (submit, links, retry,
  re-authenticate) are keyboard/screen-reader operable with ≥44px targets; no state relies on colour alone;
  reduced-motion is respected; error/focus states meet WCAG AA. (Applies to all states, including the banner
  in A9/A11.)

---

## Section D — Coverage map (every state + transition → criteria → source)

| `JOURNEY_AND_STATES.md` state / step | Criteria | Governing contract / decision |
|---|---|---|
| Not-configured | AC-NC-1..3 | CONTRACTS Not-configured; D-052 |
| Loading (session restore) | AC-LD-1..2 | CONTRACTS Loading |
| Unauthenticated (login) | AC-UN-1..3 | CONTRACTS Unauthenticated |
| Submitting (login/register) | AC-SB-1..3 | CONTRACTS Submitting |
| Valid (authenticated) | AC-VA-1..2 | CONTRACTS Valid; D-137/D-142/D-119 |
| Invalid-credentials | AC-IC-1..3 | CONTRACTS Invalid-credentials; **D-154**; D-133 |
| Duplicate-registration | AC-DR-1..3 | CONTRACTS Duplicate-registration; **D-154**; D-133 |
| Unconfirmed-email | AC-UE-1..2 | CONTRACTS Unconfirmed-email; **D-154** |
| Expired-session | AC-EX-1..3 | CONTRACTS Expired-session; **D-153**; D-137 |
| Permission-denied | AC-PD-1..2 | CONTRACTS Permission-denied; D-133 |
| Offline / network-loss | AC-OF-1..3 | CONTRACTS Offline; **D-153** |
| Account-transition / switch | AC-SW-1..3 | CONTRACTS Account-transition; **D-155**; D-149/BQ-112 |
| Recovery (cross-cutting) | AC-RC-1..2, Section C | CONTRACTS Recovery; D-133 |
| Logout | AC-LO-1..3 | CONTRACTS Logout; **D-155** |
| Register success / email-confirm handoff | AC-RS-1..2 | CONTRACTS Register success |
| Journey steps 1–8 + alternates | AC-T-* (Section B) | JOURNEY primary journey + alternate paths |
| Cross-cutting invariants | AC-INV-* (Section C) | CONTRACTS privacy/security, a11y, failure, progression |

Every state row in the `JOURNEY_AND_STATES.md` matrix and every numbered journey step (plus the
unconfirmed-email and permission-denied alternate paths) maps to at least one criterion above. No new state or
behaviour is introduced.

---

## Section E — Mapping to prototype (BQ-116) and validation (BQ-117)

- **BQ-116 prototype:** every criterion above must be exercisable in the fixture-only HTML/CSS/JS journey
  without code changes — including register, log in, restart-resume, wrong password, duplicate registration,
  expired session (banner + manual retry), offline (banner + manual retry), permission-denied, logout (active
  clear), account switch (no residue), and not-configured. The prototype reuses existing design tokens and
  mutates no production schema/API.
- **BQ-117 owner walkthrough:** each critical task is recorded against a coaching / comprehension / neutrality
  / recovery result, and a PASS / REVISE / PARK / ESCALATE disposition is set per `PROGRAMME.md`. Specific
  checks the owner records:
  - **Comprehension:** at every state the owner can correctly answer "am I signed in, and whose account is
    this?" without coaching (→ AC-VA-2, AC-EX-2, AC-INV-OWNERSHIP).
  - **Neutrality/enumeration:** wrong-password and unknown-email are indistinguishable, and
    duplicate-registration does not confirm the email exists (→ AC-IC-2, AC-DR-2, AC-INV-ENUMERATION).
  - **Recovery:** every failure has a safe, non-dead-end next action, and a transient blip is not punished by
    a forced logout (→ AC-RC-1, AC-EX-1, AC-OF-2).
  - **No residue:** after logout/switch on a shared device, no prior-account state is visible (→ AC-LO-1,
    AC-SW-1, AC-INV-NO-RESIDUE).

No test harness is introduced (DEFERRED HARD-STOP; owner-only). D-124 remains the authoritative
post-internal-validation activation test; this matrix is the owner-validation acceptance layer, not a
target-user study.
