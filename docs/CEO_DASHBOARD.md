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

**Last synced:** 03-Aug-2026, against DECISION_LOG.md through D-041, BUILD_QUEUE.md (BQ-011 done,
BQ-009/BQ-010 unblocked), PROJECT_SPEC.md v2.8.

---

## Snapshot

- **Mission:** Mobile app that teaches personal finance from first principles, applied to the user's own
  money — never advises.
- **Kickoff:** 22-Jul-2026 → **Day 12** as of 03-Aug-2026.
- **Current phase:** Phase 1 (teaching engine) VALIDATED. Phase 2 (app/backend build) IN PROGRESS — first
  code has landed.
- **Decisions logged:** 41 (D-001–D-041), plus 5 owner-level escalations (BRIEFs), all 5 resolved.
- **Findings from live testing:** 10 raised across 6 test runs, **10 resolved (100%)**.
- **System prompt version:** v0.8, last verified 5/5 clean (BQ-008, 03-Aug-2026).
- **Backend code:** 11 files — FastAPI + SQLAlchemy + Alembic skeleton, verified working (BQ-011,
  03-Aug-2026). **Mobile app (`app/`): still 0 files, not started.**
- **Build queue:** 2 READY (BQ-009, BQ-010 — both now unblocked), 1 BLOCKED (BQ-004), 1 newly DONE
  (BQ-011).

## Needs the owner's input right now

- **Add `DATABASE_URL` to `.env`** — the Supabase Postgres connection string for the `fintutor-dev`
  project (Supabase dashboard → Project Settings → Database → Connection string, URI format). Add it
  directly to the `.env` file yourself rather than pasting it in chat. Without it, `/health/db` returns
  503 and BQ-009/BQ-010 can't be verified against a real database — everything else is unblocked and
  ready to go the moment this lands.

## Phase roadmap (phase-gated, no calendar dates committed)

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Governance & Spec | DONE | 22–23 Jul. Stack, compliance stance, decision protocol. |
| 1 | Teaching Engine Validation | DONE | 23 Jul – 03 Aug. 6 test runs, prompt v0.3 → v0.8, 10/10 findings closed. |
| 2 | App & Backend Build | **IN PROGRESS** | Backend skeleton live (FastAPI+SQLAlchemy+Alembic, BQ-011). Income/Goal models queued (BQ-009/010). Mobile app not started. |
| 3 | Private structured testing (real users) | NOT STARTED | — |
| 4 | Legal review + public launch | NOT STARTED | Blocked on India securities/fintech lawyer review of D-009. |

## Activity timeline — decisions logged per date

| Date | New decisions | Cumulative | Note |
|---|---|---|---|
| 22-Jul-2026 | 7 | 7 | Spec created, stack locked. |
| 23-Jul-2026 | 21 | 28 | Densest day of the project: compliance stance (D-009), architectural aliasing (D-010/011), 8-type taxonomy (D-013), teaching method (D-015/016), the entire decision protocol (D-017–020), Phase 1 Run 1, BRIEF-001 resolved. |
| 24-Jul-2026 | 0 | 28 | — |
| 25-Jul-2026 | 3 | 31 | Phase 1 Run 2, MVP scope expansion (persistent sections), product principles. |
| 26–31 Jul-2026 | 0 | 31 | Build-home laptop out of service (Apple repair) — work paused. |
| 01-Aug-2026 | 1 | 32 | FINDING 8 resolved. |
| 02-Aug-2026 | 5 | 37 | Single-home merge (D-033), autonomy grant (D-034), 3 BRIEF/finding resolutions. |
| 03-Aug-2026 | 4 | 41 | Budgeting/Goals data model (D-038); CEO dashboard tooling (D-039/D-040); backend stack decided and FastAPI/SQLAlchemy/Alembic skeleton shipped (D-041, BQ-011). |

## Blockers

- **BQ-004** (backend `deepen`-selection logic) — blocked on a rule decision that hasn't been made yet.
  Thinking-home only, not urgent.
- **Decision 2** (per-item management depth) — blocked on a real Phase 1 app section existing to react to;
  its data-model dependency (Decision 3) is satisfied by D-038.
- **BQ-009 / BQ-010** — no longer blocked on missing scaffolding (BQ-011 shipped this session), but full
  verification is blocked on the owner adding `DATABASE_URL` (see "Needs the owner's input," above).

## Key risks

1. **Legal review of the compliance stance (D-009)** by an India securities/fintech lawyer has not happened.
   Non-negotiable before public launch; not urgent for MVP dev, but easy to forget until it's late.
2. **Mobile app (`app/`) still has 0 files.** The backend skeleton landing today narrows this risk but
   doesn't close it — the user-facing product still doesn't exist yet.
3. **Data privacy policy undesigned** (D-010 open item) — what's masked before reaching the LLM vs.
   encrypted at rest, and the retention/deletion policy, still need to be written before real user data
   exists.
4. **Compliance surface tested against only 2 fixtures.** All 10 findings are closed against those, but a
   wider range of real user profiles may surface findings the prompt hasn't been hardened against yet.
5. **Solo-owner bottleneck.** The decision protocol recovers ~55% of decision bandwidth per its own D-017
   audit, but Tier 2/3 decisions still need real owner attention every session.

## What's next

1. **Owner:** add `DATABASE_URL` to `.env` — unblocks full verification of everything below.
2. **BQ-009** — Add Income and Goal objects to the backend baseline schema. READY.
3. **BQ-010** — Implement live budget computation (no stored Budget object). READY, depends on BQ-009.
4. **Decision 2** (per-item management depth) — design once a real Phase 1 section exists to react to.
5. **Legal review scheduling** — not blocking MVP dev, but should be put on the calendar before it's
   forgotten until launch is close.

## Recent decisions (last 6)

| ID | Tier | Date | What |
|---|---|---|---|
| D-041 | owner-decided | 03-Aug | Backend stack confirmed (FastAPI+SQLAlchemy+Alembic); BQ-011 skeleton shipped and verified. |
| D-040 | 1 | 03-Aug | Dashboard auto-refresh added to end-of-session checklist; local HTML snapshot introduced. |
| D-039 | 1 | 03-Aug | Created `docs/CEO_DASHBOARD.md` as the standing status-reporting source file. |
| D-038 | 2 | 03-Aug | Budgeting/Goals data model resolved — explicit thin links, computed budget, new Income object. |
| D-037 | 2 (REVIEW-FLAGGED) | 02-Aug | FINDING 9 (Card-1 omission) resolved — verified 5/5 clean (BQ-008). |
| D-036 | 3 | 02-Aug | BRIEF-005 resolved — "worth X" framing judged compliant, no fix needed. |

## Compliance pulse

- Findings raised across 6 test runs: **10**
- Findings resolved: **10 / 10 (100%)**
- Owner-level escalations (BRIEFs): **5 raised, 5 resolved**
- Current prompt: **v0.8**, last verified clean **5/5** (BQ-008, 03-Aug-2026)
