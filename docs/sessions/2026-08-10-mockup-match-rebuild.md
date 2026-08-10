# Session 2026-08-10 — Mockup-match rebuild (Windows/local)

## What changed
- **Local repo stood up on a Windows machine** for the first time: cloned from `origin`, created
  `app/node_modules`, a Python 3.12 backend venv (3.14 couldn't build `psycopg2-binary`), and the gitignored
  `app/.env` + repo-root `.env` (secrets supplied by the owner, never committed).
- **Two small queued items shipped** first: BQ-054 (Insurance copy + "+ Add a policy" button) and BQ-053
  (goal bar kept) — archived to `docs/BUILD_QUEUE_ARCHIVE.md`.
- **D-094 (Tier 3, owner-authorised): full mockup-match rebuild** beyond D-093's reskin-only grant — new
  deps, new screens/flows, workflow changes now in scope. Backend/schema changes, reconciliation UI, and
  BQ-052 wording remain out of scope.
- **Adopted the real drawn typefaces** (Newsreader + IBM Plex via `expo-font`/`@expo-google-fonts`),
  migrated all 21 screen/component files off `fontWeight` onto weight-specific tokens (custom faces don't
  synthesize bold — this was the main cause of the "flat/broken" look), extracted `app/design/typography.ts`.
- **Rebuilt every inner screen to the v1 mockup** via a 4-agent Sonnet fleet on disjoint files (Sections,
  Budget, Conversational, Decision modals) + the Home screen done by hand as the exemplar. Combined `tsc`
  clean; each screen render-verified via the dev bypass. Tab bar relabeled Home/Chat/Invest/Loans/Insure/Budget;
  per-type display labels fixed (FD / RD, PPF / EPF, ESOP).
- **D-095 (dev-only preview infra):** backend `CORSMiddleware` (localhost, owner-approved), fixed blank
  `EXPO_PUBLIC_BACKEND_URL` (the "Unexpected token '<'" bug), env-gated dev auth bypass so the browser
  preview renders inner screens without login.
- Committed `5ea184d` on `design/mockup-match-rebuild`, pushed to origin, then merged to `main`.

## Decision-log / spec changes (owner: skim these)
- `docs/DECISION_LOG.md` — added **D-094** and **D-095** (full write-ups in `docs/decisions/`).
- `PROJECT_SPEC.md` — unchanged this session.

## What's next
- **Owner decisions still blocking work:** BQ-049/050 (walkthrough wiring), BQ-051 (₹0-vs-absent on totals),
  BQ-052 (ESOP "what we won't say" wording, Tier 3).
- **Backend authorization needed** to finish the mockup match: Flow 07 (engagement/reminders — needs a
  reward-fact source + notifications service), Budget "from-holding" provenance rows, ESOP tax lines,
  conversational goal-setting. All were flagged, not faked.
- **Cleanup owed before any non-dev deploy (D-095):** tighten CORS to real origins, leave dev env vars unset.
- `.claude/launch.json` left locally modified (Windows paths) and intentionally **not committed** — it's
  machine-specific and would break a Mac session. Consider gitignoring it.
