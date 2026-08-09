# FinTutor — CEO Dashboard (source data)

> **This file is the source of truth for the visual dashboard.** When asked for a "CEO summary,"
> "status dashboard," or similar, Claude should: (1) check this file's "Last synced" line against the
> tail of `docs/DECISION_LOG.md`, `docs/BUILD_QUEUE.md`, and `PROJECT_SPEC.md`'s change log; (2) update
> this file if anything material changed since; (3) render it as a visual HTML artifact (stats, timeline,
> phase roadmap, risks) rather than dumping this markdown as text.
>
> Refresh this file **on demand only** — when the owner asks for a status summary, the CEO dashboard, or
> "something visual" — not automatically at the end of every session (D-042, superseding D-040 on this
> point only). When you do refresh it, numbers must be re-derived from the source files above, never
> hand-adjusted, and `docs/CEO_DASHBOARD.html` (the local double-clickable visual snapshot) should be
> regenerated to match.
>
> **Pending Approval Queue upkeep (D-050):** on each refresh, list every `docs/BRIEF-*.md` that has no
> resolving decision yet in `docs/DECISION_LOG.md` (a brief counts as resolved once a later entry
> references it — see D-049 resolving BRIEF-006 as the pattern). One row per open brief, paths condensed
> to a single clause each. This section only, single-operator repo — no concurrent-writer conflict to
> design around.

**Last synced:** 05-Aug-2026, against `DECISION_LOG.md` + `DECISION_LOG_ARCHIVE.md` through D-082,
`BUILD_QUEUE.md` (READY/BLOCKED both still empty, `BUILD_QUEUE_ARCHIVE.md` at 44 DONE items, unchanged
today — no build-queue item was worked this session), `PROJECT_SPEC.md` (unchanged today, still §10 within
its rolling window).

---

## Snapshot

- **Mission:** Mobile app that teaches personal finance from first principles, applied to the user's own
  money — never advises.
- **Kickoff:** 22-Jul-2026 → **Day 15** as of 05-Aug-2026.
- **Current phase:** Phase 1 (teaching engine) VALIDATED, plus one more live-verification run since last
  sync (Run 7, D-080). Phase 2 (app/backend build): the build queue has been empty since 04-Aug, and
  **the gap that was Phase 2's #1 risk last sync — AI-surfaced holding creation — is now built** (D-078).
  Two real gaps remain: a true native device/simulator pass, and the data privacy policy. See Key risks.
- **Decisions logged:** **80** dated entries (D-001–D-082; D-021/D-022 still lack dedicated entries — same
  pre-existing gap, not touched again), up from 72 last sync — **8 new decisions** since 04-Aug.
- **Owner-level escalations (BRIEFs):** 18 raised, 18 resolved (100%) — unchanged; no new BRIEF this
  session. (D-082, today's biggest decision, was owner-decided directly in conversation, not a formal
  BRIEF escalation.)
- **Findings from live testing:** 11 raised across 6 test runs, 11 resolved (100%) — unchanged in count,
  but **a 7th live-verification run happened since (D-080, 05-Aug)**, reconfirming FINDING 8 does not
  reproduce (0/5) against the live API and current prompt — moving `known_gaps` surfacing from provisional
  to verified.
- **System prompt version:** v0.8, unchanged — last full-suite verified 5/5 clean (BQ-008, 02-Aug-2026);
  Run 7 (05-Aug) added a targeted, clean reverification on top of that.
- **Backend code:** 29 Python files.
- **Mobile app (`app/`):** 46 TypeScript/TSX files.
- **Build queue:** READY empty, BLOCKED empty, 44 items in `BUILD_QUEUE_ARCHIVE.md` — unchanged since
  04-Aug (no build-queue item worked this session; this session's real work was two Tier-3 decisions plus
  external-facing docs, not mechanical build).

## Pending Approval Queue

**Empty — every raised brief is resolved.** Unchanged since 04-Aug. (D-082 is a live, *undocumented-as-
BRIEF* open decision — see "Needs the owner's input right now," not this queue, since it was never raised
as a formal BRIEF escalation.)

## Needs the owner's input right now

1. **D-082's open fork — how onboarding gets its cross-turn state.** Today's live-testing pass on the real
   onboarding chat found it reusing the general teaching engine wholesale (a ~300+ word answer to the first
   message) — traced to D-058's original "no structure at all" choice, now reopened on the *flow* axis only
   (D-058's "no structured field" still holds). Designing the actual fix stalled immediately on a real
   blocker: a structured flow needs *some* memory of what stage a user is in, and conversation memory is
   **already formally parked under D-022**, gated on the still-unwritten D-010 privacy policy. Two paths
   are laid out and ready in `docs/features/onboarding/PRD.md` — a narrow stage-indicator that may not
   count as "real" memory, or writing D-010 first rather than arguing around it. Nothing proceeds on the
   onboarding redesign until this is picked.
2. **Data privacy policy (D-010)** — still undesigned, and as of today it's not just a standing gap, it's
   an **active blocker on a feature the owner just asked to build.** This raises its own priority
   independent of anything else on this list.
3. **A real native device/simulator pass.** Substantially de-risked across the last two sessions — real
   Postgres, a real running backend, a real Supabase login, and a real browser all confirmed working
   end-to-end on **web**. What's still genuinely unconfirmed: native rendering on an actual iOS/Android
   simulator and the native auth flow. (Tooling for this is now available in-session if the owner wants it
   picked up.)
4. **Legal review of D-009** — still not scheduled, growing more urgent as build surface grows.
5. **`docs/marketing/BRAND_PRD.md`'s three open fields** — waitlist incentive (no pricing/monetization
   decision exists yet), visual identity (current UI is an acknowledged placeholder, real blank canvas for
   a designer), and whether to feature "Powered by Claude/Anthropic" prominently. Lower stakes than 1–4,
   not blocking any build work, but needs the owner's or a designer's input to move the landing page forward.

## Phase roadmap (phase-gated, no calendar dates committed)

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Governance & Spec | DONE | 22–23 Jul. Stack, compliance stance, decision protocol. |
| 1 | Teaching Engine Validation | DONE | 23 Jul – 05 Aug. 7 live test runs now (Run 7 added 05-Aug), prompt v0.3 → v0.8, all 11 findings closed and reconfirmed live. |
| 2 | App & Backend Build | **IN PROGRESS — two real gaps remain, down from three** | 29 backend + 46 app files. AI-surfaced holding creation (D-012's primary path) is now **built** (D-078) — closes what was the top risk last sync. Real backend + Supabase auth confirmed live end-to-end on web (2026-08-05d). What's *not* done: a true native device/simulator pass, and the data privacy policy — the latter now also blocking the onboarding redesign directly. |
| 3 | Private structured testing (real users) | NOT STARTED | Closer than ever — the two biggest build gaps from last sync (AI-surfaced creation, live-data confirmation) are both closed — but a native device pass and the privacy policy are still reasonable gates before this starts. |
| 4 | Legal review + public launch | NOT STARTED | Blocked on India securities/fintech lawyer review of D-009. |

## Activity timeline — cumulative decisions logged, by date

| Date | New decisions | Cumulative | Note |
|---|---|---|---|
| 22-Jul-2026 | 7 | 7 | Spec created, stack locked. |
| 23-Jul-2026 | 19 | 26 | Compliance stance, aliasing, taxonomy, teaching method, the whole decision protocol, Phase 1 Run 1, BRIEF-001. |
| 24-Jul-2026 | 0 | 26 | — |
| 25-Jul-2026 | 3 | 29 | Phase 1 Run 2, MVP scope expansion, product principles. |
| 26–31 Jul-2026 | 0 | 29 | Build-home laptop out of service (Apple repair) — work paused. |
| 01-Aug-2026 | 1 | 30 | FINDING 8 resolved. |
| 02-Aug-2026 | 5 | 35 | Single-home merge, autonomy grant, 3 BRIEF/finding resolutions. |
| 03-Aug-2026 | 20 | 55 | Dashboard tooling, backend build begins and lands, founding segment fully resolved, onboarding shape, comparison-view detection. |
| 04-Aug-2026 | 17 | 72 | Comparison-view math shipped, mascot wired to chat, deepen fully resolved, variable-income budgeting resolved, first comprehensive live-verification pass. |
| 05-Aug-2026 | **8** | **80** | UX principles closed out (P8/P9), AI-surfaced holding capture **built** (D-078), savings-balance question resolved, Phase-1 Run 7 live-reverifies FINDING 8 stays closed, governance restructuring cuts mandatory-reading tokens ~80% (D-081), **onboarding reopened for a structured flow (D-082)** — today's biggest open thread. |

## Blockers

**None in the formal build-queue sense** — `docs/BUILD_QUEUE.md`'s READY and BLOCKED sections are both
still empty. D-082's open fork functions as a *soft* blocker on `docs/features/onboarding/PRD.md`
specifically (it was never queued as a build item to begin with, since the design isn't finished) — see
"Needs the owner's input right now," not this section.

## Key risks

1. **Onboarding's real UX doesn't match the product's core promise yet — new top risk, replacing last
   sync's.** First-ever live test of the real onboarding chat produced a wall-of-text answer instead of a
   guided first moment. The fix is scoped (D-082) but stalled on a real architectural dependency (see
   below) — not a code problem, a decision problem.
2. **Data privacy policy undesigned — same open item, meaningfully higher stakes today.** It was already a
   standing gap; as of today it directly blocks a feature the owner asked to build, not just a
   theoretical future one.
3. **Real native device/simulator confirmation still pending**, though substantially de-risked across the
   last two sessions — real Postgres, a real backend, real Supabase auth, and a real browser all now
   confirmed working correctly end-to-end on web.
4. **Legal review of the compliance stance (D-009)** by an India securities/fintech lawyer still hasn't
   happened. Getting more urgent as the MVP nears feature-complete.
5. **Compliance surface tested against only 2 fixtures**, both pre-dating the app. Unchanged risk — Run 7
   re-ran an existing fixture, didn't add a new one.

**Resolved since last sync (04-Aug), worth naming explicitly:**
- ~~AI-surfaced holding creation unbuilt~~ — **built** (D-078): a narrow Haiku reconciliation call plus an
  explicit confirm-card UI in chat. Was the #1 critical risk last sync.
- ~~Nothing verified against real infrastructure~~ — **closed on web**: real Postgres, a real running
  backend, and a real authenticated Supabase session all confirmed end-to-end (2026-08-05d).

## What's next

1. **Owner decides D-082's open fork** — stage-indicator vs. resolving D-010 first. Directly unblocks
   `docs/features/onboarding/PRD.md`'s next section (the actual stage/path design).
2. **Data privacy policy (D-010)** — now doing double duty; needs a dedicated owner session more than ever.
3. **Legal review scheduling** — still not blocking, still worth getting on the calendar.
4. **A real native device/simulator pass**, if the owner wants it picked up — tooling for this is now
   available in-session.
5. **`BRAND_PRD.md`'s three open items** — waitlist incentive, visual identity commissioning, AI-vendor
   disclosure stance — whenever the owner is ready to move on the landing page.

## Recent decisions (last 6)

| ID | Tier | Date | What |
|---|---|---|---|
| D-082 | 3, owner-decided in conversation | 05-Aug | Onboarding reopened for a structured *conversation flow* (not fields) — narrows D-058, scoped to onboarding only; new `docs/features/<slug>/` convention adopted. |
| D-081 | Owner-authorized in conversation | 05-Aug | Governance-file restructuring: rolling-window archives + protocol cheat sheet — cut mandatory-reading tokens ~80%. |
| D-080 | 1 | 05-Aug | Phase-1 Run 7 live-reverifies FINDING 8 stays closed (0/5) — `known_gaps` surfacing moves from provisional to verified; also fixed a real `httpx`/`anthropic` version pin bug. |
| D-079 | 2, owner-confirmed | 05-Aug | `savings_balance` clarified as an instance of the already-deferred Cash & bank family, not a missing 9th taxonomy type. |
| D-078 | 3, owner-confirmed | 05-Aug | AI-surfaced holding-capture mechanism confirmed and **built** — narrow Haiku reconciliation call + explicit confirm UI in chat. |
| D-077 | 1 | 05-Aug | P9 added to `PRODUCT_PRINCIPLES.md` — teaching content is never gated behind a quiz or prior lesson. |

## Compliance pulse

- Findings raised across 6 original test runs: **11**
- Findings resolved: **11 / 11 (100%)** — reconfirmed live via a 7th run today (D-080)
- Owner-level escalations (BRIEFs): **18 raised, 18 resolved (100%)**
- Current prompt: **v0.8**, last full-suite verified clean **5/5** (BQ-008, 02-Aug-2026); targeted Run 7
  (05-Aug) also clean

---

**This refresh is complete**, not partial — every section re-derived fresh from `DECISION_LOG.md` +
`DECISION_LOG_ARCHIVE.md`, `BUILD_QUEUE.md` + `BUILD_QUEUE_ARCHIVE.md`, and a fresh file-count pass over
`app/` and `backend/`. The one deliberate carry-forward: D-021/D-022's missing dedicated entries,
unresolved since the last refresh — a `DECISION_LOG.md`-editing question, out of scope for a dashboard
refresh.
