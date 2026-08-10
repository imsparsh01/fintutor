# FinTutor — Decision Log

> One entry per meaningful decision. Format: what / why / reversibility / date.
> Rule: a decision isn't real until it's here. Don't reopen a logged decision without new information.
>
> **Format (all entries, D-081 onward — D-046 started this for new decisions, D-081 applied it
> retroactively to every entry):** each entry is a short index — title, one teaser line quoted from the
> decision's own text (not paraphrased), a pointer to the full write-up in `docs/decisions/D-0NN-slug.md`,
> and the date. Full reasoning, lens tables, and paths-modeled detail live in that file, not here.
>
> **Rolling window (D-081):** this file holds only the most recent ~20 decisions. Once a session's new
> entries push the count past that, move the OLDEST entries (down to ~15) into
> `docs/DECISION_LOG_ARCHIVE.md` verbatim, in the same condensed form — pure relocation, never a rewrite.
> This is a per-session-close habit now (see `CLAUDE.md`'s checklist), not a one-time cleanup. To look up
> an older decision by ID, grep `docs/DECISION_LOG_ARCHIVE.md` or `docs/decisions/` directly rather than
> reading either file wholesale.

---

### D-087 — P10 added: a real financial figure is never styled by valence
- **Tier:** 2, owner-confirmed. New principle. Test: "does this styling choice tell the user something is
  *true*, or something is *good*? ... the second is a verdict delivered by typography and is forbidden."
  Extends P2's does-not-says test into the visual channel, and covers the quiet case P7 does not: ordinary
  non-game styling that still encodes a judgement. A goal at 27% "is not failing; it is at 27%." Full
  write-up: `docs/decisions/D-087-p10-no-valence-styling.md`.
- **Date:** 10-Aug-2026

### D-088 — P11 added: the tutor's voice has its own typeface
- **Tier:** 2, owner-confirmed. New principle. Test: can the user tell, "without reading a word of it,"
  which text is FinTutor explaining versus the app labelling? Makes D-009/D-025's teaching boundary
  visible without a per-bubble disclaimer. **Scoped to platform system faces** (serif/sans/mono) — the
  drawn typefaces (Newsreader, IBM Plex) need `expo-font` + Google Fonts packages, a hard-stop dependency
  decision deliberately split out so the principle isn't blocked on it. Full write-up:
  `docs/decisions/D-088-p11-tutor-voice-typeface.md`.
- **Date:** 10-Aug-2026

### D-089 — Empty sections are teaching surfaces: what an empty family section shows
- **Tier:** 2, owner-confirmed. **Interprets D-076/P8**, REVIEW-FLAGGED per D-020. Fills the empty-state
  question P8 explicitly declined to design: an empty section shows what lives there as *mechanisms and
  categories, never products*, plus a declinable walk-through offer and a visibly-secondary manual add.
  "A section with nothing in it is the single highest-intent teaching moment in the app." Full write-up:
  `docs/decisions/D-089-empty-sections-are-teaching-surfaces.md`.
- **Date:** 10-Aug-2026

### D-090 — Teaching moments render as a full-screen walkthrough (fork 1f), with a mandatory P9 guard
- **Tier:** 2, **REVIEW-FLAGGED**. Owner chose `1f` over the handoff doc's recommended `1e`, deliberately.
  Adoptable only with a four-part binding P9 guard: skip live on *every* step, nothing unlocks at the end,
  no comprehension check anywhere, steps freely navigable. "An implementation missing any of these four is
  not a permitted variant of `1f` — it is the lesson tree P9 forbids." Riskiest fork because its failure
  mode is drift, not a single bad call. Full write-up:
  `docs/decisions/D-090-teaching-moment-fullscreen-walkthrough.md`.
- **Date:** 10-Aug-2026

### D-091 — The "what we won't say" block is adopted as a standing UI pattern
- **Tier:** 3, owner-decided. Adopted **as drawn**, rewording-per-context explicitly rejected — "a block
  that reads the same way every time is recognisable as a standing property of the product rather than a
  caveat attached to one awkward answer." Answers BRIEF-010's "neutrality reads as evasive" risk: converts
  silence into a stated, bounded position. Must name the specific verdict declined, state what the app
  will do instead, and never apologise. Full write-up: `docs/decisions/D-091-what-we-wont-say-block.md`.
- **Date:** 10-Aug-2026

### D-092 — The refusal-before-result meta-statement is dropped; the parallel structure carries neutrality on its own
- **Tier:** 3, owner-decided. Drops the comparison flow's upfront "I'm not going to tell you which one to
  do"; retains every structural device (parallel columns, order note, the deciding rate in largest type,
  "what would make each true," the named third path). Extracted test, reusable: "state the refusal where
  the neutrality is otherwise invisible; let the structure speak where it is already visible" — which is
  what reconciles this with D-091 rather than contradicting it. Full write-up:
  `docs/decisions/D-092-refusal-meta-statement-dropped.md`.
- **Date:** 10-Aug-2026

### D-095 — Local web-preview infrastructure to verify the D-094 rebuild (CORS + dev bypass)
- **Tier:** mixed. The CORS backend change was explicitly owner-approved in conversation; the frontend dev
  aids are Tier-1 dev-infrastructure, env-gated and inert in a real build. Added FastAPI `CORSMiddleware`
  (localhost origins only) so the browser preview can reach the backend; fixed `EXPO_PUBLIC_BACKEND_URL`
  (blank → `http://localhost:8000`, the cause of the "Unexpected token '<'" errors — empty string defeated
  the `??` fallback); added an env-gated dev auth bypass (`EXPO_PUBLIC_DEV_USER_ID`) + `displayName` so the
  preview renders inner screens without a password. **Cleanup owed before any non-dev deploy:** tighten CORS
  to real origins, leave the dev env vars unset (real login flow is unchanged and default). Full write-up:
  `docs/decisions/D-095-local-preview-infrastructure.md`.
- **Date:** 10-Aug-2026

### D-094 — Full mockup-match rebuild authorised: scope expanded beyond D-093's reskin-only grant
- **Tier:** 3, owner-decided directly in conversation. **Extends D-093.** Authorises bringing the running
  app into line with the v1 mockups across visual style AND workflow — not just the reskin of existing
  screens D-093 permitted. Owner now owns the boundary crossings D-093 reserved: new dependencies
  (`expo-font` + the drawn Google Fonts, `react-native-reanimated`), new screens/flows (onboarding chip
  conversation, wired teaching walkthrough, engagement surfaces), and workflow changes to match Flows
  01–07. **Still NOT authorised, flagged not absorbed:** backend/schema changes (hard stop, unchanged); the
  reconciliation UI (no mockup drawn — cannot build what isn't designed); BQ-052's Tier-3 ESOP-block
  wording (owner still owes it, agents leave existing wording untouched). Concern recorded: authorised off
  a desktop RN-Web preview that is not the real mobile target, with drawn fonts not yet installed — owner
  chose full rebuild over diagnosing first, knowingly. Full write-up:
  `docs/decisions/D-094-full-mockup-match-rebuild-authorised.md`.
- **Date:** 10-Aug-2026

### D-106 — Feature expansion sub-decisions round 2: 5-tab nav, Health Score formula, scenario priority, portfolio overlap approach
- **Tier:** Mixed. Nav = 5 tabs (Home · Portfolio · Goals · Tools · Chat) — existing Invest/Loans/Insure/Budget tabs become stack screens accessible from Portfolio tab. Health Score formula approved: 4 sub-scores averaged (Investment rate, Insurance, Emergency buffer, Tax utilisation) with coverage-breadth framing. Scenario batch 1 = S-05/03/06/07; S-01 uses user-set corpus target; S-04 parked (schema change). Portfolio overlap = Category concentration indicator (no scheme data, no external API). Full write-up: `docs/decisions/D-106-feature-expansion-sub-decisions-round2.md`.
- **Date:** 11-Aug-2026

### D-105 — Feature expansion sub-decisions round 1: Arya persona, calculator batch 1, tax approval, Health Score display
- **Tier:** Mixed (3 for persona/P2 ruling; 1 for calculator priority; hard stop resolved for C-16/C-23). Persona = "Arya" (replaces Ankur). Calculator batch 1: SIP goal planner, Home loan EMI, Inflation impact, Step-up SIP, CAGR backward (C-04/10/17/22/24). C-16 income tax + C-23 HRA both approved as mechanism comparisons with D-091 "what we won't say" framing. Health Score display = single 0-100 (NW-style); "scoring formula still TBD in next decision." Full write-up: `docs/decisions/D-105-feature-expansion-sub-decisions-round1.md`.
- **Date:** 11-Aug-2026

### D-104 — Competitive feature expansion: scope confirmed from Richify + Novelty Wealth analysis
- **Tier:** 3, owner-decided directly in conversation. Eight MVP feature areas confirmed (Financial Health Score, named persona, scenarios, 21 new calculators, portfolio overlap, Portfolio screen restructure, Goals screen restructure, Home restructure). Account Aggregator explicitly post-MVP. Mascot/Ankur removal confirmed → BQ-053 READY. "Nothing builds until each area's blocking sub-decision is logged — see BUILD_QUEUE BLOCKED." Full write-up: `docs/decisions/D-104-competitive-scope-confirmed.md`.
- **Date:** 11-Aug-2026

### D-103 — ESOP "what we won't say" block: offer half added (resolves BQ-052)
- **Tier:** 3, owner-decided directly in conversation. Adds the missing offer half to the ESOP
  exercise-cost modal's block: "What this screen does give you: the cash cost and the spread — the
  two numbers that bound your decision regardless of the valuation call." Full write-up:
  `docs/decisions/D-103-esop-wont-say-offer-half.md`.
- **Date:** 11-Aug-2026

### D-102 — Token-lean codemaps added; session-start protocol updated to use them
- **Tier:** 1. Generates `docs/CODEMAPS/{architecture,backend,frontend,data}.md` covering all 48
  source files in ~2K tokens total; `CLAUDE.md` step 2c now reads `architecture.md` always plus the
  relevant layer maps per task, replacing cold source-file reads for orientation. Full write-up:
  `docs/decisions/D-102-codemaps-session-orientation.md`.
- **Date:** 11-Aug-2026

### D-093 — D-014 unparked: execution subagents authorised, scoped to the D-086..D-092 reskin
- **Tier:** 3, owner-decided. **Interprets D-014** by satisfying its unpark condition, not overriding it:
  Phase 1 is validated (D-080) and the design decisions now exist (D-086..D-092), honouring D-014's own
  "user decides; agents execute." Authorises presentation-layer work only. Explicitly NOT authorised for
  any agent: backend/schema changes (verified unnecessary — every drawn data shape already has a service),
  new dependencies (`react-native-reanimated`, `expo-font`, `@expo-google-fonts/*`), new screens beyond
  the reskin, or deliberate-only files. Records the model-tiering pattern (Haiku/Sonnet/Opus by nature of
  work). D-014's broader standing-capability ambition stays parked. Full write-up:
  `docs/decisions/D-093-d014-unparked-execution-subagents.md`.
- **Date:** 10-Aug-2026

### D-107 — gstack sprint methodology adopted for all FinTutor build sessions
- **Tier:** 3, owner-decided directly in conversation. "Plan and Review were the structural gaps — ad-hoc
  rather than mandatory. D-107 closes both." garrytan/gstack cloned to `~/.claude/skills/gstack/`; text-based
  skills (planning, review, retro) are live. Browser skills (/qa, /browse) pending `bun` install. Adapted
  sprint: Plan (`/plan-eng-review`) mandatory before non-trivial code; Review (`/review`) mandatory before
  committing; Test (`/qa`) best-effort for UI changes; Ship stays D-056 direct-merge (no PR). GBrain and
  gstack team mode not adopted. Full write-up: `docs/decisions/D-107-gstack-sprint-methodology.md`.
- **Date:** 11-Aug-2026
