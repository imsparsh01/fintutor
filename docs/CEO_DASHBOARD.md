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

**Last synced:** 04-Aug-2026 (end of day), against DECISION_LOG.md through D-074, BUILD_QUEUE.md (37/37
items DONE, READY and BLOCKED both empty for the first time), PROJECT_SPEC.md v3.4 (unchanged today).

---

## Snapshot

- **Mission:** Mobile app that teaches personal finance from first principles, applied to the user's own
  money — never advises.
- **Kickoff:** 22-Jul-2026 → **Day 14** as of 04-Aug-2026.
- **Current phase:** Phase 1 (teaching engine) VALIDATED. Phase 2 (app/backend build) build queue is
  **empty for the first time** — nothing mechanically buildable remains — but Phase 2 is not "done": D-012's
  primary path (AI-surfaced holding creation) is still entirely unbuilt. See Key risks.
- **Decisions logged:** 72 dated entries, D-001–D-074 (D-021/D-022 still lack their own dedicated entries —
  same pre-existing gap noted in the last refresh, not touched again).
- **Owner-level escalations (BRIEFs):** 18 raised, **18 resolved (100%) — a first.** BRIEF-011's last open
  item (variable-income budgeting) closed via BRIEF-017/D-073 today; BRIEF-018 (manual add-holding UI) was
  raised and resolved same day.
- **Findings from live testing:** 11 raised across 6 test runs, 11 resolved (100%) — unchanged today, no
  new Phase 1 runs this session.
- **System prompt version:** v0.8, unchanged — last verified 5/5 clean (BQ-008, 02-Aug-2026).
- **Backend code:** 28 Python files (was 26 this morning).
- **Mobile app (`app/`):** 45 TypeScript/TSX files (was 44 this morning).
- **Build queue:** READY empty, BLOCKED empty, **37 of 37 tracked items DONE.**

## Pending Approval Queue

**Empty — every raised brief is resolved.** First time this section has had nothing in it since D-050
introduced it.

## Needs the owner's input right now

1. **AI-surfaced holding creation doesn't exist yet.** Today closed the *manual* fallback gap
   (BQ-036/D-074), but D-012's *primary* path — the AI surfacing a holding organically in conversation and
   creating it on confirmation — has no `/chat` tool-calling/function-call setup at all. This is named
   MVP scope in `PROJECT_SPEC.md` §4 item 6, not a nice-to-have. Worth a real look before this reads as
   "done" — it's the product's most differentiating mechanism and it's still 0% built.
2. **A real native device/simulator pass.** Today's live-verification pass closed most of the
   "nothing's been tested for real" risk — real Postgres, a real running backend, a real Chromium browser
   driving the actual app — but this sandbox has no Docker, no working iOS Simulator, and no Android SDK,
   so native rendering and the real Supabase auth round-trip (blocked by this sandbox's own network
   policy, confirmed via its proxy status log) remain genuinely unconfirmed. Downgraded from CRITICAL to
   WATCH this refresh — real progress was made, just not full closure.
3. **Data privacy policy (D-010)** — still undesigned, still needs a dedicated owner session.
4. **Legal review of D-009** — still not scheduled.

## Phase roadmap (phase-gated, no calendar dates committed)

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Governance & Spec | DONE | 22–23 Jul. Stack, compliance stance, decision protocol. |
| 1 | Teaching Engine Validation | DONE | 23 Jul – 03 Aug. 6 test runs, prompt v0.3 → v0.8, 11/11 findings closed. |
| 2 | App & Backend Build | **IN PROGRESS — build queue empty, one real gap remains** | 28 backend + 45 app files. Every tracked BQ item is DONE (37/37) — nothing mechanically buildable is left queued. What's *not* done: AI-surfaced holding creation (D-012's primary path), real native device confirmation, the data privacy policy. |
| 3 | Private structured testing (real users) | NOT STARTED | Closer than it's ever been — the empty build queue is a real milestone — but AI-surfaced creation and a real device pass are reasonable gates before this starts. |
| 4 | Legal review + public launch | NOT STARTED | Blocked on India securities/fintech lawyer review of D-009. |

## Activity timeline — cumulative decisions logged, by date

| Date | New decisions | Cumulative | Note |
|---|---|---|---|
| 22-Jul-2026 | 7 | 7 | Spec created, stack locked. |
| 23-Jul-2026 | 19 | 26 | Densest single day until today: compliance stance, aliasing, taxonomy, teaching method, the whole decision protocol, Phase 1 Run 1, BRIEF-001. |
| 24-Jul-2026 | 0 | 26 | — |
| 25-Jul-2026 | 3 | 29 | Phase 1 Run 2, MVP scope expansion, product principles. |
| 26–31 Jul-2026 | 0 | 29 | Build-home laptop out of service (Apple repair) — work paused. |
| 01-Aug-2026 | 1 | 30 | FINDING 8 resolved. |
| 02-Aug-2026 | 5 | 35 | Single-home merge, autonomy grant, 3 BRIEF/finding resolutions. |
| 03-Aug-2026 | 20 | 55 | Dashboard tooling, backend build begins and lands, founding segment fully resolved, onboarding shape, comparison-view detection. |
| 04-Aug-2026 | **17** | **72** | **New densest day of the project.** Comparison-view math shipped (closes BQ-026), mascot wired to chat, deepen fully resolved (D-071/D-072), variable-income budgeting resolved (D-073), a first-ever comprehensive live-verification pass, and same-day fixes for both findings it surfaced (D-074 + BQ-037). |

## Blockers

**None.** `docs/BUILD_QUEUE.md`'s READY and BLOCKED sections are both empty — the first time in this
project's history. Everything genuinely outstanding now lives in "Needs the owner's input," above, because
it needs a decision or a resource this session doesn't have, not because it's queued and stuck.

## Key risks

1. **AI-surfaced holding creation is still entirely unbuilt.** Promoted to the top risk this refresh —
   with the build queue empty, this is now the single largest gap between what's shipped and what the
   product's own core pitch (D-012) requires. Not urgent in the sense of blocking anything queued; urgent
   in the sense that it's easy to lose track of once the queue *looks* done.
2. **Real native device/simulator confirmation still pending**, though substantially de-risked today —
   real Postgres, a real backend, and a real browser all confirmed the app's logic and API layer work
   correctly end to end. What's left unconfirmed is native rendering itself and the real Supabase auth
   round-trip (structurally blocked in this sandbox, not a sign of a real problem).
3. **Legal review of the compliance stance (D-009)** by an India securities/fintech lawyer still hasn't
   happened. Getting more urgent as the MVP nears feature-complete.
4. **Data privacy policy undesigned** (D-010 open item) — the schema now holds real-shaped data across
   holdings, income, goals, and discretionary categories; this policy is supposed to govern all of it.
5. **Compliance surface tested against only 2 fixtures**, both pre-dating the app. Unchanged risk, not
   worsened or improved this session.

## What's next

1. **Talk through AI-surfaced holding creation** — the biggest real gap left, and worth its own design
   pass given how much conversation-design and tool-calling work it implies.
2. **Data privacy policy** (D-010) — needs a dedicated owner session.
3. **Legal review scheduling** — still not blocking, still worth getting on the calendar.
4. **UX principles section** in `PRODUCT_PRINCIPLES.md` — unblocked since 04-Aug, not started.
5. **Two LOW housekeeping items** sitting in `KNOWN_LIMITATIONS.md` (a stale comment in
   `consolidated.py`, Chat's raw error message) — pick up whenever next touching those files.

## Recent decisions (last 6)

| ID | Tier | Date | What |
|---|---|---|---|
| D-074 | 2, owner-confirmed | 04-Aug | Manual add-holding UI confirmed: auto-generated alias, family-scoped product-type picker. Closed same day (BQ-036). |
| D-073 | 3, owner-confirmed | 04-Aug | Variable-income budgeting resolved: declared floor + typical range, budget math unchanged. |
| D-072 | 3, owner-confirmed | 04-Aug | BRIEF-006 fully resolved: narrow Haiku classifier for the general Chat-tab deepen case. |
| D-071 | 3, owner-confirmed | 04-Aug | BRIEF-006 narrowed: deepen wired deterministically for the "Ask about this" entry point. |
| D-070 | 3, owner-confirmed | 04-Aug | Tax-saving narrowed to "unused 80C room" — no rupee figure, avoids a maintained slab table. |
| D-069 | 3, owner-confirmed | 04-Aug | ESOP "cost of exercising today" confirmed — cliff-gated linear vesting. |

## Compliance pulse

- Findings raised across 6 test runs: **11**
- Findings resolved: **11 / 11 (100%)**
- Owner-level escalations (BRIEFs): **18 raised, 18 resolved (100%)**
- Current prompt: **v0.8**, last verified clean **5/5** (BQ-008, 02-Aug-2026)

---

**This refresh is complete**, not partial — every section re-derived fresh from `DECISION_LOG.md`,
`BUILD_QUEUE.md`, and a fresh file-count pass over `app/` and `backend/`. The one deliberate carry-forward:
D-021/D-022's missing dedicated entries, unresolved from the last refresh — a `DECISION_LOG.md` editing
question, out of scope for a dashboard refresh.
