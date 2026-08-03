# D-056 — Introduce jest-expo as the app unit-test framework; test app/lib, wire up CI

- **Tier:** Documenting a decision the owner made in conversation (CLAUDE.md's append-only lane) — same
  pattern as D-053/D-055. The owner asked to "pick up from where we left off" after the CEO dashboard's
  "What's next" list (from the prior session block) named app/ test coverage as the direct sequel to the
  backend suite (D-053/BQ-015). `jest-expo` is technically a new library/service per CLAUDE.md's
  hard-stop list, so it's logged here rather than added silently.
- **Decision:**
  1. **`jest-expo@57.0.3`** adopted (SDK-matched to `expo@57.0.9`) — the standard, Expo-recommended test
     framework for an Expo/React Native project, same reasoning as choosing `pytest` for FastAPI (D-053):
     the de facto tool for the stack, not a judgment call between alternatives.
  2. **10 tests added**, colocated with source: `app/lib/backend.test.ts` (all four branches of
     `pingBackendHealth()` — 200 OK, a body with no `status` field, a non-2xx HTTP status, and both an
     `Error` and non-`Error` fetch rejection) and `app/lib/supabase.test.ts` (`isSupabaseConfigured`'s
     four presence/absence combinations of the two env vars, including the "one present, one empty
     string" edge case, via `jest.isolateModules` since the module computes its exports once at import
     time from `process.env`).
  3. **CI added**: `.github/workflows/app-tests.yml` — `npm ci`, `tsc --noEmit`, `jest --ci` on push/PR
     touching `app/**`, mirroring `backend-tests.yml`'s shape (D-055). No secrets needed.
- **What this does NOT cover:** component/screen rendering tests (Login/Register/the tab screens) — only
  the two pure-logic files in `app/lib/` have tests so far, matching the backend session's same
  "business logic first" scoping. `app/lib/supabase.ts`'s Supabase/AsyncStorage/URL-polyfill imports are
  mocked out rather than exercised, since this suite is about our own derived-config logic, not
  `@supabase/supabase-js`'s or AsyncStorage's internals.
- **Verified:** `npx tsc --noEmit` clean; `npx jest --ci` → 10/10 passed, both suites.
- **Reversibility:** High — test-only files plus one CI workflow; no production code touched.
- **Date:** 04-Aug-2026
