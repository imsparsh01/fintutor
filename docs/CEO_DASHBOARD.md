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

**Last synced:** 04-Aug-2026 (full refresh), against DECISION_LOG.md through D-055, BUILD_QUEUE.md
(BQ-016 done, BQ-004 still the only BLOCKED item), PROJECT_SPEC.md v2.8.

---

## Snapshot

- **Mission:** Mobile app that teaches personal finance from first principles, applied to the user's own
  money — never advises.
- **Kickoff:** 22-Jul-2026 → **Day 13** as of 04-Aug-2026.
- **Current phase:** Phase 2 (App & Backend Build) IN PROGRESS. Within it: sub-phases 2a–2e (backend
  scaffold, schema, business logic, tests+CI, app skeleton) are all DONE; sub-phase 2f (the real
  capture/conversation UI) is next and not yet started — see "Phase roadmap" below.
- **Decisions logged:** 55 (D-001–D-055), plus 7 owner-level escalations (BRIEFs), **all 7 resolved**.
- **Findings from live testing:** 10 raised across 6 test runs, **10 resolved (100%)**.
- **System prompt version:** v0.8, last verified 5/5 clean (BQ-008, 02/03-Aug-2026) — **Q1 only**, see
  "Compliance pulse" for the regression-coverage caveat found this session.
- **Backend code:** 19 Python files (14 app + 5 tests), FastAPI + SQLAlchemy + Alembic + pytest, **35/35
  tests passing, CI green** (GitHub Actions, verified live this session).
- **Mobile app (`app/`):** 15 files — Expo/React Navigation skeleton + Supabase auth, no real feature
  screens yet, **0 tests**.
- **Build queue:** 0 READY, 1 BLOCKED (BQ-004), 16 DONE (BQ-016 = today's CI work).

## Pending Approval Queue

**0 open.** All 7 BRIEFs raised so far (BRIEF-001 through BRIEF-007) are resolved — BRIEF-007 was the
last, resolved by D-051 (03-Aug-2026), staged: the mechanical "WHICH" half shipped as BQ-013, the "WHEN"
half stays gated behind fresh Phase-1-style verification before it reaches any live path.

## Needs the owner's attention (not urgent — nothing is currently blocking active build work)

- **Legal review of D-009** (compliance stance) by an India securities/fintech lawyer — not blocking MVP
  dev, but non-negotiable before public launch and easy to forget until it's late.
- **AI-surfacing trigger logic + micro-capture flow design** (D-012's undesigned pieces) — this is the
  actual design decision the next sub-phase (2f, the real capture/conversation UI) needs before it can be
  built; nothing else is stopping it from starting except this not being designed yet.
- **Phase 1 regression battery (Q2–Q8)** — needs to be re-run against prompt v0.8. Can only be run by the
  owner locally (`scripts/run_phase1_test.py`); this sandbox is deliberately blocked from calling
  `api.anthropic.com`.

## Phase roadmap (phase-gated, no calendar dates committed)

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Governance & Spec | DONE | 22–23 Jul. Stack, compliance stance, decision protocol. |
| 1 | Teaching Engine Validation | DONE | 23 Jul – 03 Aug. 6 test runs, prompt v0.3 → v0.8, 10/10 findings closed. |
| 2 | App & Backend Build | **IN PROGRESS** | See sub-phase table below. |
| 3 | Private structured testing (real users) | NOT STARTED | — |
| 4 | Legal review + public launch | NOT STARTED | Blocked on India securities/fintech lawyer review of D-009. |

### Phase 2 sub-phases (where we are right now)

| Sub-phase | What | Status |
|---|---|---|
| 2a | Backend scaffold (FastAPI + SQLAlchemy + Alembic) | DONE (BQ-011) |
| 2b | Core schema (Income, Goal, Holding, DiscretionaryCategory) | DONE (BQ-009, BQ-012, BQ-048) |
| 2c | Business logic (live budget computation, surfacing candidate selection) | DONE (BQ-010, BQ-013) |
| 2d | Backend unit-test suite + CI | DONE (BQ-015, BQ-016 — both this session) |
| 2e | App skeleton (nav shell + Supabase auth) | DONE (BQ-014) |
| **2f** | **Real capture/conversation UI** | **NEXT — not started** |
| 2g | App test coverage | NOT STARTED |

## Blockers

- **BQ-004** (backend `deepen`-selection logic) — blocked on a real conversation interface existing to
  design the selection rule against (sub-phase 2f), plus a selection-rule decision that hasn't been made.
- **Decision 2** (per-item management depth) — blocked on the same missing interface (2f) to react to.
- **D-051's "WHEN" half** (surfacing timing) — gated behind re-verifying D-032's on-topic constraint via
  fresh Phase-1 fixture testing before it ships to any live path.

## Key risks

1. **Legal review of the compliance stance (D-009)** by an India securities/fintech lawyer has not
   happened. Non-negotiable before public launch; not urgent for MVP dev, but easy to forget until late.
2. **`app/` still has no real product.** 15 skeleton files (nav + auth), zero feature screens, zero
   tests. The backend build being ahead of the app narrows this risk but doesn't close it.
3. **Phase 1 regression coverage has narrowed to Q1 only.** Found this session: across the last four
   prompt versions (v0.5 → v0.8), only Q1 has been re-verified; Q2–Q8 haven't been re-checked since
   ~Run 2/3, despite several shared-rule changes landing since (D-032, D-035, D-036, D-037). Real,
   currently-unmeasured silent-regression risk on the other seven questions.
4. **Data privacy policy undesigned** (D-010 open item) — what's masked before reaching the LLM vs.
   encrypted at rest, and the retention/deletion policy, still need to be written before real user data
   exists.
5. **Compliance surface tested against only 2 fixtures.** All 10 findings are closed against those, but a
   wider range of real user profiles may surface findings the prompt hasn't been hardened against yet.
6. **Solo-owner bottleneck.** The decision protocol recovers ~55% of decision bandwidth per its own D-017
   audit, but Tier 2/3 decisions still need real owner attention every session.

## What's next

1. **Design & build the real capture/conversation UI in `app/`** (sub-phase 2f) — the single biggest
   unblock: opens BQ-004, D-051's WHEN half, and Decision 2 all at once.
2. **Add `app/` test coverage** — the same gap the backend just closed (D-053/BQ-015), still open on the
   mobile side.
3. **Decide a real-database/integration-test strategy** — for model/migration/FK-cascade tests; today's
   backend suite deliberately avoided needing one.
4. **Owner: re-run the Phase 1 regression battery (Q2–Q8)** against prompt v0.8, locally.
5. **Write the data privacy policy** (D-010).
6. **Schedule the legal review** of D-009 — not blocking, but shouldn't be forgotten until launch is close.

## Recent decisions (last 6)

| ID | Tier | Date | What |
|---|---|---|---|
| D-055 | owner-confirmed | 04-Aug | CI: GitHub Actions runs the backend pytest suite on push/PR. |
| D-054 | owner-confirmed | 04-Aug | Fixed `compute_budget()` SIP outflow field — was reading cumulative `invested_amount` instead of `monthly_sip_amount`. |
| D-053 | owner-confirmed | 04-Aug | Introduced pytest; 35 unit tests added for `compute_budget`/`compute_surfacing_candidates`. |
| D-052 | owner-confirmed | 04-Aug | App scaffold stack: Expo + TypeScript + React Navigation; Supabase JS client for auth. |
| D-051 | 3 | 03-Aug | BRIEF-007 resolved — surfacing candidate selection (WHICH) built now; WHEN stays gated. |
| D-050 | 1 | 03-Aug | Pending Approval Queue section added to this dashboard. |

## Activity timeline — decisions logged per date

| Date | New decisions | Cumulative | Note |
|---|---|---|---|
| 22-Jul-2026 | 7 | 7 | Spec created, stack locked. |
| 23-Jul-2026 | 21 | 28 | Densest single day until 03-Aug: compliance stance (D-009), architectural aliasing (D-010/011), 8-type taxonomy (D-013), teaching method (D-015/016), the entire decision protocol (D-017–020), Phase 1 Run 1, BRIEF-001 resolved. |
| 24-Jul-2026 | 0 | 28 | — |
| 25-Jul-2026 | 3 | 31 | Phase 1 Run 2, MVP scope expansion (persistent sections), product principles. |
| 26–31 Jul-2026 | 0 | 31 | Build-home laptop out of service (Apple repair) — work paused. |
| 01-Aug-2026 | 1 | 32 | FINDING 8 resolved. |
| 02-Aug-2026 | 5 | 37 | Single-home merge (D-033), autonomy grant (D-034), 3 BRIEF/finding resolutions. |
| 03-Aug-2026 | 14 | 51 | **Densest day on record.** Budgeting/Goals data model (D-038); dashboard tooling; backend stack decided + FastAPI/SQLAlchemy/Alembic skeleton shipped; Income/Goal/Holding schema; live budget computation; discretionary categories; surfacing candidate selection (D-041–D-051). |
| 04-Aug-2026 | 4 | 55 | App wired to real Supabase project (D-052); backend unit-test suite stood up (D-053); live SIP budget-calculation bug found and fixed (D-054); CI wired up and verified green (D-055). |

## Compliance pulse

- Findings raised across 6 test runs: **10**
- Findings resolved: **10 / 10 (100%)**
- Owner-level escalations (BRIEFs): **7 raised, 7 resolved**
- Current prompt: **v0.8**, last verified clean **5/5** (BQ-008, 02/03-Aug-2026)
- **Watch item (new, found this session):** that clean 5/5 is Q1-only. Q2–Q8 haven't been re-verified
  since around Run 2/3 (early prompt versions), despite four rule changes landing on shared prompt
  sections since then. Recommend folding into item 4 of "What's next."
