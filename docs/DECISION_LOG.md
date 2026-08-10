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

### D-079 — `savings_balance` is not a missing 9th D-013 type — it's an instance of the already-deferred Cash & bank family
- **Tier:** 2, owner-confirmed. Interprets D-031 (REVIEW-FLAGGED per D-020). The open 25-Jul-2026 question
  is resolved: a savings-account balance is an instance of D-031's "Cash & bank" family, already DECIDED
  DIRECTION deferred to post-Phase-1 — not a gap inside D-013's three-MVP-family taxonomy. No new type, no
  new build work, no fixture change. Full write-up:
  `docs/decisions/D-079-savings-balance-not-a-9th-type.md`.
- **Date:** 05-Aug-2026

### D-080 — D-051's WHEN-stage verification satisfied (Phase-1 Run 7); network-access assumption and a live dependency bug corrected
- **Tier:** 1. Ran Q7 (n=5, live) against the current prompt (v0.8) and `FIXTURE_user_01.json` —
  FINDING 8 does not reproduce, 0/5, satisfying D-051's precondition for treating `known_gaps` surfacing as
  verified rather than provisional. Also corrects two standing facts: this specific remote environment CAN
  make live, authenticated Anthropic API calls (contrary to the assumption baked into
  `scripts/run_phase1_test.py` and several prior `BUILD_QUEUE.md` entries — verified directly, not assumed),
  and a real, previously-undetected `anthropic`/`httpx` version incompatibility in
  `backend/requirements.txt` would have crashed the backend's first live `/chat` call — fixed by pinning
  `httpx<0.28`. Full write-up: `docs/decisions/D-080-when-stage-surfacing-verified.md`.
- **Date:** 05-Aug-2026

### D-081 — Governance-file restructuring for token efficiency: rolling-window archives + protocol cheat sheet
- Owner-authorized directly in conversation. `DECISION_LOG.md` fully normalized to the D-046 pattern
  retroactively (D-001–D-044 + 4 BRIEFs extracted to `docs/decisions/`, content verified byte-identical),
  then given a rolling window (~20 live, rest in `docs/DECISION_LOG_ARCHIVE.md`). `BUILD_QUEUE.md`'s DONE
  section (44 entries) moved wholesale to `docs/BUILD_QUEUE_ARCHIVE.md`. New
  `docs/DECISION_PROTOCOL_CHEATSHEET.md` companion (full protocol untouched, authoritative for anything
  ambiguous). `PROJECT_SPEC.md` §10 given the same rolling window. `CLAUDE.md` updated to point at all of
  it and make archiving a standing session-close habit. Measured ~58K mandatory-read tokens per session
  down to ~9–10K. Full write-up: `docs/decisions/D-081-governance-file-token-optimization.md`.
- **Date:** 05-Aug-2026

### D-082 — Onboarding reopened for a structured conversation flow (not structured fields); new per-feature subfolder convention adopted, piloted on onboarding
- Owner-decided directly in conversation, narrowing D-058: "the objection is to conversation flow shape,
  not to structured fields" — D-058's no-form-field rule holds, but onboarding's single reused general-
  teaching-engine turn is replaced by a structured, model-driven multi-stage flow, scoped to onboarding
  only for now. Fail-safe requirement: a user must never reach a turn with no way forward. New convention:
  `docs/features/<slug>/` holds a feature's PRD/design docs + its own `decisions/`, piloted here, without
  forking `BUILD_QUEUE.md`'s single global queue. **Leaves one question open, not resolved by this entry:**
  a structured flow needs some cross-turn state, and conversation memory is standing-PARKED under D-022
  pending the still-unwritten D-010 privacy policy — the PRD opens on this fork before any design proceeds.
  Full write-up: `docs/decisions/D-082-onboarding-structured-flow-scope.md`.
- **Date:** 05-Aug-2026

### D-083 — D-082's open fork resolved: a narrow stage-indicator, not conversation memory
- Owner-decided directly in conversation. Path A adopted: onboarding tracks progress via a small structured
  `onboarding_stage`-shaped indicator, not a stored transcript or dialogue history — never sent to the
  model as conversation memory. Does not reopen D-022 (full conversation memory stays parked pending
  D-010); a stage pointer is structurally the same category as the already-persisted `hasSeenOnboarding`
  state, not a new class of data. Doesn't decide the stage taxonomy or fail-safe mechanics — that's the
  PRD's next section — and doesn't queue a build item yet. Full write-up:
  `docs/features/onboarding/decisions/D-083-stage-indicator-resolved.md`.
- **Date:** 05-Aug-2026

### D-084 — Onboarding structured-flow PRD confirmed as proposed, build item queued
- Owner-confirmed, no changes requested. Confirms `docs/features/onboarding/PRD.md`'s draft stage/path map
  (four tracks, each ending in `complete`), the `onboarding_states` persisted-state shape (modeled on the
  existing `StreakState` pattern), and the 4-turn fail-safe budget as build-ready. The BRIEF-011 compliance
  note on the `fresh_starter` → `sequencing` stage's fixed-order risk stays attached, not cleared by this
  confirmation. Build item added to `docs/BUILD_QUEUE.md` READY. Full write-up:
  `docs/features/onboarding/decisions/D-084-prd-confirmed.md`.
- **Date:** 10-Aug-2026

### D-085 — Limited memory for the onboarding exchange: exactly one prior AI message, never persisted
- Owner-decided directly in conversation, triggered by a live-verification finding: a short/referential
  reply ("no, that's the only one") broke the model's next turn because D-022 sends zero prior-turn
  content, ever. Narrowly forwards the AI's own single immediately-preceding message, onboarding calls
  only, never persisted server-side (the frontend already holds it as local display state — this changes
  only "never sent back," for onboarding). Does not reopen D-022's general case: no new stored data means
  nothing for the still-unwritten D-010 policy to need to cover; full dialogue recall/history stays exactly
  as parked. Full write-up:
  `docs/features/onboarding/decisions/D-085-limited-onboarding-exchange-memory.md`.
- **Date:** 10-Aug-2026

### D-086 — Aesthetic layer adopted: the warm-ledger visual register (1a) and its token set
- **Tier:** 2, owner-confirmed. Closes `PROJECT_SPEC.md` §8's long-parked aesthetic-layer item — the
  mockups are the "real screen decisions force it" condition it was waiting for. Fork `1a` chosen: warm
  off-white screen, near-black ink, hairline rules, forest-green teaching accent, clay quarantined to
  engagement. `success: '#116611'` is **renamed to `tutor`, not recoloured** — "leaving a token called
  `success` in place while giving it a valence-free colour would preserve exactly the semantic this
  decision removes." Clay's reservation makes P7 checkable by eye. Full write-up:
  `docs/decisions/D-086-aesthetic-layer-warm-ledger.md`.
- **Date:** 10-Aug-2026

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
