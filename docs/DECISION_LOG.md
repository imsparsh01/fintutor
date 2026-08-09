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

### D-071 — BRIEF-006 narrowed and confirmed: deepen selection wired for the "Ask about this" entry point only
- **Tier:** 3, owner-confirmed. **Interprets D-049** (narrows its blocker to what's actually now true).
  Ships BRIEF-006's Path B UI-signal variant, scoped to exactly one entry point: `HoldingDetailScreen`'s
  existing "Ask about this" flow (BQ-022) threads its already-known holding alias through to `/chat`, and
  the backend sets `deepen` deterministically — no model judgment anywhere in the selection path, the
  property BRIEF-006 named as what would make Path B actually deliver D-028's promise. Every other `/chat`
  entry point (general Chat tab, onboarding) is unchanged — `deepen` stays absent there, D-028's existing
  fallback still governs. Path A's classifier question and the general free-text case remain exactly as
  open as D-049 left them — not decided by this entry. Full write-up:
  `docs/decisions/D-071-deepen-ui-signal-confirmed.md`.
- **Date:** 04-Aug-2026

### D-072 — BRIEF-006 fully resolved: Path A (narrow Haiku classifier) confirmed for the general Chat-tab deepen case
- **Tier:** 3, owner-confirmed. Closes BRIEF-006 entirely — the last piece D-049/D-071 left open. A narrow,
  non-teaching Haiku call reads the question + holdings (alias/product_type only, never `display_name`) and
  returns a single holding alias or none; the backend sets `deepen` with a fixed, backend-authored reason
  only on a confident single match, runs only when D-071's UI-signal case didn't already set `deepen`, and
  degrades to D-028's existing safe default on any ambiguity, error, or missing config. First real use of
  D-002's Haiku half. Full write-up: `docs/decisions/D-072-deepen-classifier-confirmed.md`.
- **Date:** 04-Aug-2026

### D-073 — BRIEF-017 confirmed: variable-income budgeting via declared floor + typical range (Path B2)
- **Tier:** 3, owner-confirmed. Resolves BRIEF-011's escalated hard-stop. `Income.sources` items gain an
  optional `amount_high` (no migration — `sources` is already JSONB); `amount` keeps its existing meaning
  and role in `compute_budget()`'s math unchanged (the floor the budget is checked against); `amount_high`
  is purely informational, shown alongside the floor, never fed into the math. Chosen over Path A (rolling
  window — real new scope + a cold-start gap, deferred on evidence per D-067's precedent) and Path C
  (defer entirely — in tension with D-054). Full write-up:
  `docs/decisions/D-073-variable-income-b2-confirmed.md`.
- **Date:** 04-Aug-2026

### D-074 — BRIEF-018 confirmed: manual add-holding UI, auto-generated alias, family-scoped picker
- **Tier:** 2, owner-confirmed. Path A adopted: the create form never has an alias field —
  `POST /holdings`'s `alias` becomes optional, and the backend generates the next unused
  `"{Humanized Product Type}-{n}"` label when omitted. Product-type picker in the create flow is scoped to
  the current family tab, unlike the existing unconstrained recategorize picker. `HoldingEditModal` is
  extended (null `holding` = create mode), not duplicated. AI-surfaced creation remains separate, untouched
  work. Full write-up: `docs/decisions/D-074-manual-add-holding-confirmed.md`.
- **Date:** 04-Aug-2026

### D-075 — P1's "Traced to" note patched to reflect D-031's narrowing of D-012
- **Tier:** 1. P1's test/scope unchanged; its provenance note in `PRODUCT_PRINCIPLES.md` now records that
  D-031 permits a manual/browse secondary path into the same sections — P1 governs which path is primary,
  not whether a fallback may exist. Item 1 of 3 in the live UX-principles-section discussion (session
  2026-08-05a); owner confirmed the exact wording. Items 2 (persistent sections) and 3 (no comprehension
  gates) remain open. Full write-up: `docs/decisions/D-075-p1-traced-to-patch.md`.
- **Date:** 05-Aug-2026

### D-076 — P8 added: a holding family's section is always reachable, never gated behind having data in it
- **Tier:** 1. Extracts a checkable principle from D-031's persistent-sections decision. Empty sections are
  shown, not hidden — resolving the flagged tension from session 2026-08-05a's checkpoint. Scoped to
  reachability only, not empty-state screen design. Item 2 of 3 in the live UX-principles-section
  discussion; item 3 (no comprehension gates) remains open. Full write-up:
  `docs/decisions/D-076-p8-persistent-sections.md`.
- **Date:** 05-Aug-2026

### D-077 — P9 added: no comprehension gates — teaching content is never locked behind a quiz or a prior lesson
- **Tier:** 1. Extracts a checkable principle from `PROJECT_SPEC.md` §2/§4's "learn on the go, no
  curriculum" language. Names its relationship to P7 explicitly (P7 reacts to app usage only, never gates
  content access) so a future gamified feature can't be waved through as engagement design. No
  light-touch-check exception carved — owner confirmed the framing as-is. Item 3 of 3, closing the live
  UX-principles-section discussion opened in session 2026-08-05a (D-075, D-076). Full write-up:
  `docs/decisions/D-077-p9-no-comprehension-gates.md`.
- **Date:** 05-Aug-2026

### D-078 — AI-surfaced holding-capture mechanism confirmed: narrow Haiku reconciliation call + explicit confirm UI
- **Tier:** 3, owner-confirmed. Builds D-002's never-implemented "Haiku for reconciliation" half and
  D-012's still-missing primary capture path. Fork 1 (extraction): a second narrow Haiku call, same shape
  as D-072's `deepen_classifier` — not a new architectural pattern. Fork 2 (write gate): proposals never
  auto-write; an explicit confirm card in the chat UI, Save routes through the existing D-074/BQ-036
  create-holding path. Both forks Path A, both owner-confirmed. Full write-up:
  `docs/decisions/D-078-holding-capture-mechanism.md`.
- **Date:** 05-Aug-2026

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
