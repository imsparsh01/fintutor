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

### D-157 — Home uses seven-level hierarchy and representative tool previews
- **Tier:** 2, owner-ruled; interprets D-104. “This is interface hierarchy, not a ranking of the user's
  financial problems.” All eight Home areas remain reachable; Home shows one calculator and one scenario
  preview plus View all tools. Full write-up:
  `docs/decisions/D-157-home-hierarchy-and-tool-previews-approved.md`.
- **Date:** 28-Aug-2026

### D-158 — Onboarding and first-action handoff is the next product-definition workstream
- **Tier:** 3, owner-decided sequencing. “The owner approved **Onboarding and first-action handoff**, rank 5
  (score 78) in the D-148 portfolio audit, as the next product-definition deep dive after Home received
  PASS.” The bounded plan is BQ-120..BQ-124. Full write-up:
  `docs/decisions/D-158-onboarding-is-next-product-definition-workstream.md`.
- **Date:** 28-Aug-2026

### D-159 — Pending local eligibility acknowledgement opens a limited offline Home
- **Tier:** 3, owner-decided. “When a genuinely new verified user explicitly acknowledges that they are 18 or
  older but the backend cannot persist the acknowledgement, FinTutor may retain a subject-scoped **pending
  local acknowledgement** and open a clearly limited offline Home.” Full write-up:
  `docs/decisions/D-159-pending-local-eligibility-opens-limited-offline-home.md`.
- **Date:** 29-Aug-2026

### D-160 — Initial Onboarding earns only the handled milestone
- **Tier:** 3, owner-decided. “Initial Onboarding v2 emits only the once-per-version `onboarding_handled`
  milestone, whether the user answers, individually skips, mixes the two, or chooses global exit.” Full
  write-up: `docs/decisions/D-160-initial-onboarding-earns-only-handled-milestone.md`.
- **Date:** 29-Aug-2026

### D-161 — Portfolio and Portfolio Health is the next product-definition workstream
- **Tier:** 3, owner-decided sequencing under D-148. “The owner approved **Portfolio and Portfolio Health**,
  rank 6 (score 78), as the next product-definition workstream and set the goal to design, build and test its
  prototype completely end to end.” The bounded plan is BQ-125..BQ-129. Full write-up:
  `docs/decisions/D-161-portfolio-is-next-product-definition-workstream.md`.
- **Date:** 29-Aug-2026

### D-162 — Portfolio Health presents insurance as transparent components
- **Tier:** 3, owner-decided financial presentation. “Portfolio Health shows separate factual insurance
  components rather than combining them into an insurance score.” Full write-up:
  `docs/decisions/D-162-portfolio-health-insurance-is-transparent-components.md`.
- **Date:** 29-Aug-2026

### D-163 — Portfolio Health has no composite score
- **Tier:** 3, owner-decided financial presentation. “Portfolio Health shows its individual recorded-data
  mechanisms and measured/unknown states but no overall 0–100 number at any completeness level.” Full
  write-up: `docs/decisions/D-163-portfolio-health-has-no-composite-score.md`.
- **Date:** 29-Aug-2026

### D-164 — Health-insurance context is account-owned
- **Tier:** 3, owner-decided financial-data ownership. “Optional health-insurance presence belongs in the
  authenticated account-owned financial-context record.” Full write-up:
  `docs/decisions/D-164-health-insurance-context-is-account-owned.md`.
- **Date:** 29-Aug-2026

### D-165 — Portfolio Health uses no score bands
- **Tier:** 3, owner-decided financial presentation. “Portfolio Health uses no categorical score bands and
  no headline grade.” Full write-up:
  `docs/decisions/D-165-portfolio-health-uses-no-score-bands.md`.
- **Date:** 29-Aug-2026

### D-166 — Complete the four remaining workstreams; Scenarios is next
- **Tier:** 3, owner-decided sequencing under D-148. “The owner approved completing the four remaining D-148
  product-definition workstreams and their later, separately bounded production reconciliation” in the
  recommended order, with Scenario and focused explorers next under BQ-130..BQ-134. Full write-up:
  `docs/decisions/D-166-remaining-workstreams-and-scenarios-next.md`.
- **Date:** 29-Aug-2026

### D-167 — Scenario taxonomy stays two-level; focused explorers remain contextual
- **Tier:** 2 — REVIEW-FLAGGED. “Tools uses the user-facing category ‘Scenarios’ for the five dedicated
  scenarios.” Focused explorers remain deliberate actions from eligible context rather than duplicated
  context-free Tools cards. Full write-up: `docs/decisions/D-167-scenario-taxonomy-and-contextual-discovery.md`.
- **Date:** 29-Aug-2026

### D-168 — A changed Scenario input immediately removes the prior result
- **Tier:** 2. “Editing any dependent input immediately removes the prior numeric/component result.” A neutral
  rerun state replaces it; stale output cannot be announced, handed off or rewarded. Full write-up:
  `docs/decisions/D-168-scenario-changed-input-removes-result.md`.
- **Date:** 29-Aug-2026

### D-169 — Scenario Arya handoff appears only for bounded current-result teaching
- **Tier:** 2. “Show the secondary action ‘Explore the mechanism with Arya’ only on a current result whose
  approved teaching handoff has a bounded mechanism prompt.” Full write-up:
  `docs/decisions/D-169-scenario-arya-handoff-only-for-bounded-current-results.md`.
- **Date:** 29-Aug-2026

### D-170 — Scenario safety, eligibility, provenance and release package approved
- **Tier:** 3, owner-decided. “The owner approved the complete recommended Scenario package presented after
  the BQ-132 team audit.” All recommended paths are binding; O-SC-4's exact numerical ceilings remain the sole
  unstated detail. Full write-up:
  `docs/decisions/D-170-scenario-safety-eligibility-provenance-package-approved.md`.
- **Date:** 29-Aug-2026

### D-171 — Exact Scenario numeric domains approved
- **Tier:** 3, owner-decided money logic. “The owner approved the exact O-SC-4 table proposed after D-170.”
  Formula-specific amount/rate/period/output ceilings are now binding. Full write-up:
  `docs/decisions/D-171-scenario-exact-numeric-domains-approved.md`.
- **Date:** 29-Aug-2026

### D-172 — Scenario and focused-explorer package receives owner PASS
- **Tier:** 3, owner-decided validation. “The owner gave every Scenario owner-validation task a PASS after
  the controlled prototype and exhaustive QA package was presented.” The package is frozen at `e3b8543`;
  production reconciliation remains separately bounded. Full write-up:
  `docs/decisions/D-172-scenario-owner-validation-pass.md`.
- **Date:** 29-Aug-2026

### D-173 — Calculator suite is the next complete workstream
- **Tier:** 3, owner-decided sequencing under D-148/D-166. “The owner directed FinTutor to move to the
  **Calculator suite** and complete the workstream end to end after Scenario production parity received
  PASS.” The bounded definition/validation plan is BQ-145..BQ-149. Full write-up:
  `docs/decisions/D-173-calculators-next-workstream.md`.
- **Date:** 30-Aug-2026
