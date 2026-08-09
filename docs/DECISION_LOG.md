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

### D-066 — ESOP characteristics field schema resolved: single type, `grant_type`-distinguished
- **Tier:** 2, REVIEW-FLAGGED — no hard trigger fires; applies D-013's already-decided split-vs-merge test
  to a case `PROJECT_SPEC.md` §6 already anticipated (D-055 deferred the field list, not the test). Stays a
  single ESOP type per D-055's scope (splitting into two types would itself be a further scope increase,
  not attempted here); `grant_type` (`options`/`rsu`) carries the internal distinction, same resolution
  D-013 used for FD/RD. Eight fields: `grant_type`, `grant_date`, `total_units_granted`,
  `vesting_cliff_months`, `vesting_period_months`, `strike_price`, `current_fmv` (nullable),
  `exercise_window_months`. No stored `vested_units` — derivable from the other fields at teaching-moment
  time (D-038's reference-vs-store test); computing it is not designed here. Full write-up:
  `docs/decisions/D-066-esop-characteristics-schema.md`.
- **Date:** 04-Aug-2026

### D-067 — BQ-026 detection mechanism resolved: user-triggered for v1, auto-detection deferred to real usage evidence
- **Tier:** owner-decided directly in conversation — no hard trigger fires. Of four candidate detection
  paths for the comparison-view modal (keyword matching, a Haiku classifier, the teaching model
  self-signaling, user-triggered), **user-triggered (Path D)** is adopted for v1. Keyword matching ruled
  out on direct precedent (D-049 found the same shape "does little useful work" for `deepen`); model
  self-signaling ruled out (failure mode risks corrupting the visible answer, worse than not triggering).
  The Haiku-classifier path is deferred, not rejected — architecturally the strongest long-term option, but
  to be built from real usage evidence off the user-triggered path, not guessed patterns now, matching this
  project's own evidence-before-generalizing discipline (D-006, BQ-002/BQ-003). Compliance note: the modal
  doesn't carry the "never pick a winner" guarantee itself — the chat engine's text answer already must
  satisfy that independently — so detection reliability here is a product risk, not a compliance one. Full
  write-up: `docs/decisions/D-067-comparison-detection-user-triggered.md`.
- **Still open:** BQ-026's second half — the actual comparison math (loan-vs-invest breakeven, tax-saving
  modeling) — is not resolved by this entry.
- **Date:** 04-Aug-2026

### D-068 — BRIEF-014 confirmed: loan-vs-invest hurdle-rate comparison built as proposed
- **Tier:** 3, owner-confirmed. Hurdle-rate figure only (never a projected investment outcome, §3 rule 4);
  both prepayment modes always shown (no silently-picked default); prepayment/foreclosure charges assumed
  zero with a disclosed UI note (no new schema field). Built: `backend/app/services/loan_vs_invest.py`,
  `GET /loan-vs-invest`. Verified against the system prompt's own worked example and four edge cases
  (non-loan type, prepay ≥ balance, missing holding, EMI too small to cover interest). Rule extraction
  confirmed as standing: for any comparison, only a hurdle/breakeven framing is available whenever the
  figure would otherwise require assuming what the market does — applies directly to the still-open
  tax-saving and ESOP-timing halves of BQ-026. Full write-up:
  `docs/decisions/D-068-loan-vs-invest-hurdle-rate-confirmed.md`.
- **Date:** 04-Aug-2026

### D-069 — BRIEF-015 confirmed: ESOP "cost of exercising today" built as proposed
- **Tier:** 3, owner-confirmed. Scope: options only, not RSU. New vesting logic (cliff-gated linear,
  D-066 left this undesigned): 0 before cliff, full past `vesting_period_months`, otherwise
  `floor(total_units_granted × elapsed_months / vesting_period_months)`. Exercise cost = vested units ×
  strike price (deterministic). Taxable spread shown only when `current_fmv` is populated, framed as
  mechanism (adds to taxable income at slab rate) — never a final tax-rupee figure, staying one step short
  of the tax-regime gap blocking tax-saving modeling. Underwater options and missing `current_fmv` both
  get honest framing, not a raw/omitted number. D-068's rule extraction ("assumes the future, or only
  today?") reconfirmed a second time. Full write-up:
  `docs/decisions/D-069-esop-exercise-cost-confirmed.md`.
- **Date:** 04-Aug-2026

### D-070 — BRIEF-016 confirmed: tax-saving narrowed to "unused 80C room," built as proposed
- **Tier:** 3, owner-confirmed. Preceded by a real question, not a rubber stamp: checked
  `BRIEF-012_mvp_fit_prioritization.md` and confirmed tax-saving modeling is committed MVP scope (must-have
  for all three founding profiles, D-054), so deferring it wasn't a casual default — and the concrete
  downsides of the narrowed version were named explicitly (doesn't deliver literal multi-path modeling,
  ELSS blind spot, regime-question risk, implicit-nudge framing, weaker close than the other two, ₹1.5L cap
  staleness) before confirming anyway. No rupee tax-savings figure — stops at unused 80C room, avoiding a
  maintained slab table. Regime asked as a one-off in-tool question, never stored. Formula: known
  contributions from PPF/EPF `annual_contribution` + Term/Endowment `premium` (annualized); room =
  `max(0, 150000 − known)`. ELSS ambiguity disclosed in copy, not solved. D-068's rule extraction
  ("computable today, or route around it") reconfirmed a third time, now adopted as the standing test.
  Self-reported-tax-bracket alternative tracked in `docs/KNOWN_LIMITATIONS.md`, not chosen for v1. Full
  write-up: `docs/decisions/D-070-tax-saving-80c-room-confirmed.md`.
- **Date:** 04-Aug-2026

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
