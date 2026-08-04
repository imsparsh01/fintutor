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

**Last synced:** 04-Aug-2026, against DECISION_LOG.md through D-071, BUILD_QUEUE.md (BQ-034 done, 33/34
items shipped, BQ-004 the only BLOCKED item, READY empty), PROJECT_SPEC.md v3.4.

---

## Snapshot

- **Mission:** Mobile app that teaches personal finance from first principles, applied to the user's own
  money — never advises.
- **Kickoff:** 22-Jul-2026 → **Day 14** as of 04-Aug-2026.
- **Current phase:** Phase 1 (teaching engine) VALIDATED. Phase 2 (app/backend build) FAR ALONG — most of
  the MVP's surface area is built, but **nothing has been run in a real app on a real device yet**
  (see Key risks — this is the single biggest open item right now).
- **Decisions logged:** 69 dated entries, D-001–D-071 (D-021/D-022 are referenced repeatedly elsewhere in
  the log but never got their own numbered entry — a small pre-existing gap, not touched in this refresh).
- **Owner-level escalations (BRIEFs):** 16 raised, 15 resolved. 1 open item (inside BRIEF-011): the
  variable-income budgeting hard-stop — see Pending Approval Queue.
- **Findings from live testing:** 11 raised across 6 test runs, **11 resolved (100%)**.
- **System prompt version:** v0.8, last verified 5/5 clean (BQ-008, 02-Aug-2026). No newer version since.
- **Backend code:** 26 Python files (was 11 on 03-Aug) — holdings, income, goals, budget, consolidated,
  streaks/rewards, surfacing, chat/teaching, and three comparison-view calculators (loan-vs-invest, ESOP
  exercise cost, tax-saving room).
- **Mobile app (`app/`):** 44 TypeScript/TSX files (was **0** on 03-Aug) — auth, onboarding, chat,
  holdings CRUD, budgeting/goals, consolidated view, streaks, mascot, all three comparison-view modals.
- **Build queue:** READY is empty. 33 of 34 items DONE. 1 BLOCKED (BQ-004, narrowed scope — see below).

## Pending Approval Queue

| Brief | Question | Status | Paths (condensed) |
|---|---|---|---|
| BRIEF-011 (one item inside it) | Should variable-income budgeting be built for the startup/gig founding profile, and how? | **Awaiting owner decision** | Escalated as a hard-stop (money-calculation logic) — not scoped into any path yet; genuinely waiting on the owner before anyone even drafts options |

## Needs the owner's input right now

1. **A real hands-on pass on a device or simulator.** This is the standing gap across nearly every
   frontend item shipped since BQ-014 (03-Aug) — every single one has been verified by `tsc`/bundle-export
   only, never by actually opening the app. The iOS Simulator panel tool has crash-looped every time it's
   been tried in this environment (first noted 03-Aug, still true as of today) and its own error says
   retrying won't help. Until the owner opens the real app once, nothing shipped this week has been
   confirmed to actually work for a user — only that it compiles.
2. **Decide the variable-income budgeting question** (BRIEF-011's escalated hard-stop, above) — nothing
   can be scoped for the startup/gig profile until this lands.
3. **Data privacy policy (D-010 open item)** — what's masked before reaching the LLM (beyond product
   names) vs. what's just encrypted at rest, plus a retention/deletion policy. Fully undesigned, and the
   DB now holds real-shaped holdings/income/goals data structures, even if not yet real users.
4. **Legal review of the compliance stance (D-009)** — still not scheduled. Not blocking MVP dev, but the
   MVP is close enough to feature-complete now that "before it's late" is closer than it was.

## Phase roadmap (phase-gated, no calendar dates committed)

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Governance & Spec | DONE | 22–23 Jul. Stack, compliance stance, decision protocol. |
| 1 | Teaching Engine Validation | DONE | 23 Jul – 03 Aug. 6 test runs, prompt v0.3 → v0.8, 11/11 findings closed. |
| 2 | App & Backend Build | **IN PROGRESS — far along** | 26 backend files, 44 app files. Nearly every MVP screen/endpoint from BRIEF-013 is built: auth, onboarding, chat/teaching, holdings CRUD, budgeting/goals, consolidated view, streaks + mascot, all 3 comparison views. Open: the general Chat-tab `deepen` case (BQ-004), variable-income budgeting (awaiting owner), data privacy policy, and — critically — zero real-device verification yet. |
| 3 | Private structured testing (real users) | NOT STARTED | Can't meaningfully start before phase 2's live-verification gap closes. |
| 4 | Legal review + public launch | NOT STARTED | Blocked on India securities/fintech lawyer review of D-009. |

## Activity timeline — cumulative decisions logged, by date

| Date | New decisions | Cumulative | Note |
|---|---|---|---|
| 22-Jul-2026 | 7 | 7 | Spec created, stack locked. |
| 23-Jul-2026 | 19 | 26 | Densest single day: compliance stance, aliasing, taxonomy, teaching method, the whole decision protocol, Phase 1 Run 1, BRIEF-001. |
| 24-Jul-2026 | 0 | 26 | — |
| 25-Jul-2026 | 3 | 29 | Phase 1 Run 2, MVP scope expansion, product principles. |
| 26–31 Jul-2026 | 0 | 29 | Build-home laptop out of service (Apple repair) — work paused. |
| 01-Aug-2026 | 1 | 30 | FINDING 8 resolved. |
| 02-Aug-2026 | 5 | 35 | Single-home merge, autonomy grant, 3 BRIEF/finding resolutions. |
| 03-Aug-2026 | 20 | 55 | Densest day since 23-Jul: dashboard tooling, backend build begins and lands (BQ-011–020), founding segment fully resolved (D-053/054/055), onboarding shape, comparison-view detection. |
| 04-Aug-2026 | 14 | 69 | Comparison-view math shipped end to end (loan-vs-invest, ESOP, tax-saving — closes BQ-026), mascot wired to streaks and now to chat, deepen-selection narrowed and wired for one entry point (D-071/BQ-034). |

## Blockers

- **BQ-004** (backend `deepen`-selection for the *general* Chat-tab case) — narrowed by D-071. The
  deterministic UI-signal sub-case now ships (BQ-034); what's left is genuinely hard — a freely-typed
  question has no deterministic signal for which holding to deepen, and BRIEF-006's open regulatory
  question (does a narrower classifier model satisfy "auditable in code," or just relocate the same
  judgment) is untouched. Not urgent — the safe "deepen nothing" fallback still governs there.
- **Variable-income budgeting** — not even queued yet; waiting on the owner's decision (Pending Approval
  Queue, above) before any BQ item gets scoped.
- ~~Decision 2 (per-item management depth)~~ — **RESOLVED** (D-059, 04-Aug). No longer a blocker; removed
  from this list this refresh.

## Key risks

1. **Nothing has been verified in a real app yet.** Every frontend build item since BQ-014 (03-Aug) —
   which by now is most of the app — has only ever been confirmed via `tsc --noEmit` and an Expo bundle
   export, never by opening the app and using it. This is a **bigger near-term risk than the legal
   review**: it means confidence in "the app works" is currently unearned, not just unconfirmed.
2. **Legal review of the compliance stance (D-009)** by an India securities/fintech lawyer has not
   happened. Non-negotiable before public launch; getting more urgent as the MVP approaches
   feature-complete.
3. **Data privacy policy undesigned** (D-010 open item) — what's masked before reaching the LLM vs.
   encrypted at rest, and the retention/deletion policy, still need to be written. The schema now holds
   the real-shaped data this policy is supposed to govern.
4. **Compliance surface tested against only 2 fixtures**, both from Phase 1 (pre-app). All 11 findings are
   closed against those two synthetic profiles — real usage patterns from the now much larger app surface
   (comparison views, budgeting, chat) haven't stress-tested the compliance wall at all yet.
5. **Solo-owner bottleneck**, unchanged. The decision protocol recovers ~55% of decision bandwidth per its
   own D-017 audit, but Tier 2/3 decisions still need real owner attention every session — this session's
   D-071 is a fresh example of the protocol working as designed, not a sign the bottleneck has eased.

## What's next

1. **Owner:** do a real device/simulator pass — the single highest-value next step, since it's the only
   thing that converts "compiles" into "works."
2. **Owner decision:** variable-income budgeting (BRIEF-011's hard-stop) — see Pending Approval Queue.
3. **Data privacy policy** (D-010) — needs a dedicated owner session, not a side effect of a build task.
4. **UX principles section** in `PRODUCT_PRINCIPLES.md` — unblocked since 04-Aug (Decisions 2 & 3 both
   resolved) but not started.
5. **Legal review scheduling** — still not blocking, still worth getting on the calendar before the app is
   closer to real users than it is today.
6. **BQ-004's general case** — lower priority; the safe fallback already covers it, revisit only if the
   Path-A regulatory question gets a fresh angle.

## Recent decisions (last 6)

| ID | Tier | Date | What |
|---|---|---|---|
| D-071 | 3, owner-confirmed | 04-Aug | BRIEF-006 narrowed: `deepen` now wired deterministically for the "Ask about this" entry point only; general Chat-tab case stays open (BQ-004). |
| D-070 | 3, owner-confirmed | 04-Aug | BRIEF-016 confirmed: tax-saving narrowed to "unused 80C room" — no rupee tax-savings figure, avoids a maintained slab table. |
| D-069 | 3, owner-confirmed | 04-Aug | BRIEF-015 confirmed: ESOP "cost of exercising today" — cliff-gated linear vesting, deterministic exercise cost. |
| D-068 | 3, owner-confirmed | 04-Aug | BRIEF-014 confirmed: loan-vs-invest hurdle-rate comparison, both prepayment modes always shown. |
| D-067 | 3 | 04-Aug | BQ-026 detection mechanism: user-triggered for v1, auto-detection (Haiku classifier) deferred to real usage evidence. |
| D-066 | 2 (REVIEW-FLAGGED) | 04-Aug | ESOP characteristics field schema resolved — single type, `grant_type` distinguishes options/RSU. |

## Compliance pulse

- Findings raised across 6 test runs: **11**
- Findings resolved: **11 / 11 (100%)**
- Owner-level escalations (BRIEFs): **16 raised, 15 resolved, 1 open**
- Current prompt: **v0.8**, last verified clean **5/5** (BQ-008, 02-Aug-2026)

---

**This refresh is complete**, not partial — every section above was re-derived from `DECISION_LOG.md`,
`BUILD_QUEUE.md`, and a fresh file-count pass over `app/` and `backend/`, not carried forward from the
03-Aug snapshot. The one deliberate exception: D-021/D-022's missing dedicated entries are noted, not
fixed — that's a DECISION_LOG.md editing question, out of scope for a dashboard refresh.
