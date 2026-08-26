# Account entry journey and state matrix

**Traces:** D-152 / D-148 / D-137 / D-142 / D-133 / D-119 / D-052. Existing code is reconciled as observed
fact below and is **not modified** by this package.

## Reconciliation with existing screens and navigation (observed fact)

| Concern | Where it lives today | Observed behaviour |
|---|---|---|
| Config gate | `app/navigation/RootNavigator.tsx`; `app/lib/supabase.ts` (`isSupabaseConfigured`) | If Supabase env vars are absent, `NotConfiguredScreen` renders instead of any auth flow. |
| Not-configured copy | `app/screens/NotConfiguredScreen.tsx` | Static instruction to add `EXPO_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` to `app/.env` and restart. No crash. |
| Session restore | `RootNavigator.tsx` | On mount, `supabase.auth.getSession()` sets the session; `loading` is true until it resolves and render returns `null` while loading. |
| Auth state changes | `RootNavigator.tsx` | `supabase.auth.onAuthStateChange` updates the session; sign-in/sign-out flip the tree between `AuthStack` and `AuthenticatedApp`. |
| Unauthenticated stack | `app/navigation/AuthStack.tsx` → `LoginScreen`, `RegisterScreen` | Native stack, headers hidden, Login is the initial route; Login ⇄ Register via in-screen links. |
| Login | `app/screens/LoginScreen.tsx` | Email+password → `signInWithPassword`; `submitting` disables the button; on error, raw `signInError.message` is shown; success is handled by the RootNavigator listener. Privacy Policy link present. |
| Register | `app/screens/RegisterScreen.tsx` | Email+password → `signUp`; on error shows raw `signUpError.message`; on success shows "Check your email to confirm your account, then log in." Privacy Policy link present. |
| Ownership after entry | backend (D-137/D-142) | Every protected request carries the access token; the backend derives the user from the verified token subject; app tables are FastAPI-only. |
| Post-session gate | `AuthenticatedApp` in `RootNavigator.tsx` (D-119) | After a verified session, assessment state is resolved (backend-authoritative, device-cache fallback) before Onboarding vs. MainTabs; state resets on `userId` change. |
| Dev bypass (non-product) | `RootNavigator.tsx` (`EXPO_PUBLIC_DEV_USER_ID`) | Dev-only verification aid that skips the login gate; inert when the env var is absent. Observed, not a designed entry point; production removal is D-095 (deferred). |

## Primary journey (discovery → entry → exit)

1. **Discover.** The user opens the app. If the build is not configured, they land on the not-configured
   state and go no further. Otherwise the app checks for an existing session.
2. **Restore.** While the stored session is being restored, the app shows a neutral loading gate and commits
   to neither the auth screens nor the app (avoids a flash of the wrong surface).
3. **Branch.** No session → the login screen. Valid restored session → straight into the authenticated app
   (post-session assessment gate, then Onboarding or Home).
4. **Enter — returning user.** User submits email + password. Input locks for the in-flight request. On
   success the app transitions to the authenticated surface via the auth-state listener; on failure it stays
   on login with a recoverable error.
5. **Enter — new user.** User switches to register, submits email + password, and is told to confirm via
   email, then log in. (No session is created until confirmation + login, per the observed flow.)
6. **Land.** A verified session hands off to the post-session assessment gate (D-119), which routes to
   Onboarding or Home. Account entry's responsibility ends at a verified, correctly-attributed session.
7. **Return.** On a later launch, a persisted session skips the auth screens (step 3) unless it has expired.
8. **Exit / switch.** The user logs out (returning to login with no prior-account residue) or a different
   account signs in on the same device (a clean switch, no bleed-through).

## Alternate paths

- **Not configured.** Config gate fails → not-configured state; the only recovery is a build/config fix, not
  a user action. No auth surface is reachable.
- **Invalid credentials.** Wrong password / unknown email → stay on login, show recoverable copy, allow
  edit-and-retry. *(Exact copy is OPEN — O-B.)*
- **Duplicate registration.** Registering an already-registered email → recoverable copy that does not
  confirm the email exists. *(Exact copy is OPEN — O-B.)*
- **Unconfirmed email.** User registered but has not confirmed, then tries to log in → copy that points back
  to the confirmation step without dead-ending.
- **Expired session (mid-use).** A token expires while the user is in the app → recovery path. *(Silent
  re-auth vs. banner vs. forced logout is OPEN — O-A.)*
- **Offline / backend loss.** No network or backend unreachable during entry or mid-session → never present
  emptiness as success; preserve safe input; explicit retry. *(Mid-session policy tied to O-A.)*
- **Permission denied.** A request is rejected as unauthorized (e.g. token no longer valid) → no data
  rendered; route to re-authenticate; never show another account's data or a partial signed-in illusion.
- **Logout / account switch.** Sign-out returns to login; a new sign-in loads only the new subject. *(Whether
  device-local cached UI/query state must be actively cleared is OPEN — O-C.)*

## State matrix

| State | Required presentation | User action | Recovery / invariant |
|---|---|---|---|
| Not-configured | Clear "Supabase not configured" state with the fix; never a crash | None (build/config fix) | No auth surface reachable; no partial app render |
| Loading (session restore) | Neutral loading gate; commit to neither auth nor app | Wait | No flash of login or app before the session resolves |
| Unauthenticated (login) | Login form, editable email/password, Register + Privacy links | Submit or go to Register | No app data on screen; nothing implies a signed-in state |
| Submitting (login/register) | In-flight indicator; primary control disabled | Wait | Duplicate submits suppressed; input preserved on failure |
| Valid (authenticated) | Transition to the post-session gate for the verified subject | Continue into app | Only the verified JWT subject's context is ever loaded (D-137) |
| Invalid-credentials | Recoverable error; email/password retained | Edit and retry | Copy must not confirm whether the email exists (O-B) |
| Duplicate-registration | Recoverable state on register | Return to login or edit | Copy must not confirm the email is already registered (O-B) |
| Unconfirmed-email | Points back to email confirmation | Confirm then log in | No session granted before confirmation + login; not a dead end |
| Expired-session | Recovery for a token that expired mid-use | Re-authenticate / continue | No stale-authenticated illusion; **recovery UX is OPEN — O-A** |
| Permission-denied | No data rendered; route to re-auth | Reauthenticate or leave | Never render another account's or a partial signed-in surface |
| Offline / network-loss | Never show empty as success; preserve input | Explicit retry | No silent failure; mid-session policy tied to O-A |
| Account-transition / switch | Load only the new subject; no prior-account residue | Begin under new account | Extends BQ-112 load-time suppression; **active-clear extent is OPEN — O-C** |
| Recovery | Every failure exposes a safe next action | Retry / re-auth / edit | No dead ends; no raw provider internals in copy (D-133 posture) |
| Logout | Return to login cleanly | Log back in or leave | In-flight prior-account results discarded; **clearing scope is OPEN — O-C** |

*(Empty-state and stale-input variants fold into Unauthenticated and Offline respectively; there is no
list-data "empty"/"partial" surface at this layer, unlike the baseline package.)*

## OPEN DECISIONS for the owner (surfaced here, ruled at BQ-115 — not decided in this task)

These are the UX forks the journey/state work exposes. They are listed only; BQ-113 does **not** choose a
path. Each becomes a routed row in `DECISION_REGISTER.md` at BQ-115, and the owner rules on them there. All
three are provisionally Tier 2 (reversible definition-stage forks); O-B additionally carries a privacy angle
(protocol trigger 2) and may route to Tier 3 on that basis at BQ-115.

- **O-A — Session-expiry & network-loss recovery UX.** When an access token expires or the backend is
  unreachable mid-session: silent re-authentication, an in-place banner with manual retry, or a forced logout
  back to the login screen? Trades seamlessness against clarity about being signed out. *(Observed gap: entry
  screens define no mid-session expiry/offline behaviour.)*
- **O-B — Duplicate-registration / wrong-password copy & account-enumeration.** What neutral wording do
  invalid-credentials and duplicate-registration show so a user can recover without the copy confirming
  whether an email is registered? Privacy angle (enumeration). *(Observed gap: screens surface raw Supabase
  error messages today.)*
- **O-C — Logout & account-switch device-local state.** Must logout (and account switch) actively clear
  cached UI/query/device-local state, or does the existing load-time account-switch suppression (BQ-112)
  suffice? Determines residue risk across a switch on a shared/reused device. *(Observed: `AuthenticatedApp`
  resets state on `userId` change at load time; active-clear-on-logout is unspecified.)*

## HARD-STOPs (out of scope, remain DEFERRED — not forks for BQ-115)

- A frontend screen/navigation **test harness** (new library/architecture) — owner-only, affects only a later
  production build.
- Production **CORS/dev-bypass cleanup (D-095)**, **backend hosting (BQ-092)**, and **Supabase
  leaked-password protection** — deferred production gates, not internal-prototype concerns.
