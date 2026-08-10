# D-095 — Local web-preview infrastructure to verify the D-094 rebuild

- **Tier:** mixed. The CORS backend change is a hard-stop-category item (backend edit) that was **explicitly
  owner-approved in conversation** ("Add CORS to the backend"). The frontend dev aids are Tier-1
  dev-infrastructure, env-gated and inert in a real build, added by the orchestrator as verification tooling
  under D-094's execution approach ("establish a real rendered ground-truth").
- **Date:** 10-Aug-2026

## Context

D-094 authorised the full mockup-match rebuild and its execution approach step 2 was "establish a real
rendered ground-truth so agents build against evidence." The app is React Native built for native; verifying
it in a desktop browser (React-Native-Web) surfaced two blockers that this decision resolves, plus one aid.

## What changed

1. **Backend CORS (owner-approved).** `backend/app/main.py` gained FastAPI's built-in `CORSMiddleware` with
   `allow_origin_regex=r"http://localhost:\d+"`. Native RN needs no CORS; the browser preview
   (`localhost:8081` → `localhost:8000`) is cross-origin and was blocked. No new dependency (ships with
   FastAPI/Starlette). **Scoped to localhost dev origins — remove or tighten before any non-dev deploy.**
2. **`EXPO_PUBLIC_BACKEND_URL` fixed.** `app/.env` had it blank; the code's `?? 'http://localhost:8000'`
   fallback only triggers on null/undefined, so an empty string routed every API call to the Expo server and
   returned HTML (the "Unexpected token '<'" errors). Set explicitly to `http://localhost:8000`.
3. **Dev auth bypass (verification aid).** `app/navigation/RootNavigator.tsx` renders the authenticated tabs
   directly when `EXPO_PUBLIC_DEV_USER_ID` is set, skipping the Supabase login gate, so the preview (and the
   orchestrator's DOM inspection) can reach inner screens without a password. Inert when the env var is
   absent. `AuthContext` gained an optional `displayName` for the Home greeting, sourced from
   `EXPO_PUBLIC_DEV_USER_NAME` in dev or Supabase user metadata in the real flow. **These env vars live only
   in the gitignored `app/.env`, never in `.env.example` or committed code.**

## Boundaries / cleanup

- The dev bypass and dev env vars must be removed (or left unset) for any real build — the real login flow is
  unchanged and still the default when the env vars are absent.
- CORS should be revisited (tightened to real origins) before a non-dev deployment.
- Seed data for the demo user was created via the API, and the user's `term_insurance` holding was deleted so
  the Home tutor card's "loan without cover" surfacing would fire for the demo — a demo-data choice, easily
  reverted, not a product change.

## Reversibility

High. CORS and the dev bypass are additive and self-contained; removing them restores the exact prior
behaviour. No schema or data-model change.
