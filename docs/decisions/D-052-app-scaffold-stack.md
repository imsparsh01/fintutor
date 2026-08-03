# D-052 — App scaffold stack: Expo + TypeScript + React Navigation (manual setup); Supabase JS client for auth (owner-confirmed)

- **Tier:** owner-decided directly in conversation — escalated per CLAUDE.md's hard stop on
  introducing a new library/architectural pattern (no de-minimis exception, same shape as D-041's
  backend-stack decision). Logged as a full entry because it's a real architecture choice other
  screens will depend on, not routine mechanics.
- **Decision:** `app/` is bootstrapped now (BQ-014) as an Expo-managed React Native project,
  TypeScript. Navigation: **React Navigation, manually configured** (`@react-navigation/native` +
  `native-stack` + `bottom-tabs`) — owner's call over Expo Router's file-based convention; both are
  legitimate, owner preferred explicit, manual route control over the newer file-based default I'd
  recommended. Auth: **Supabase JS client** (`@supabase/supabase-js`), continuing Supabase as the
  identity/hosting layer already decided (D-005/D-008) — no real alternative exists once Supabase
  Auth was chosen, so this half wasn't a live fork.
- **Scope for this pass — bare skeleton only:**
  1. Auth stack (login/register screens, Supabase-backed) shown when no session exists.
  2. A bottom-tab shell shown once authenticated, with placeholder screens for Investments, Loans,
     Insurance, and a Consolidated view — matching D-031's persistent-section structure, no real
     capture/data logic wired in yet.
  3. A ping to the backend's `/health` endpoint, to confirm app→backend connectivity.
  4. Explicitly OUT of scope: onboarding mechanism, micro-capture flow, manual fallback UI (all
     D-012 consequences, still undesigned — see BRIEF-007/D-051), per-item management (Decision 2,
     blocked until this skeleton exists to react to — this session is what unblocks it, not
     something it depends on).
- **Why React Navigation over Expo Router:** no compliance/technical objection to either — genuinely
  a taste/control tradeoff. Recorded so it isn't re-litigated: Expo Router would have meant less
  boilerplate for this simple auth-stack + tab-shell structure; React Navigation was chosen for
  explicit, manual control over routing as the app grows, at the cost of more upfront wiring.
- **Dependency flag:** needs the Supabase project's URL + anon/public key (Supabase dashboard →
  Project Settings → API) added to `app/.env` (`EXPO_PUBLIC_SUPABASE_URL` /
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`) before login/register can be verified end-to-end. Without it, the
  app must degrade gracefully — a clear "Supabase not configured" state, not a crash — same pattern
  `backend/app/db/session.py` already uses for a missing `DATABASE_URL`. Claude does not have and
  should not be given these values through chat.
- **Reversibility:** Medium — cheap now (no screens or data depend on the navigation structure yet),
  costlier once more screens are built against it. Same reasoning D-041 used for the backend stack.
- **Date:** 04-Aug-2026
