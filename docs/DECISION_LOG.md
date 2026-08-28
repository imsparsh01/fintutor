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

### D-151 — Goal progress converts holding values to paise with round-half-up
- **Tier:** 3, owner-decided money logic. “Before D-150 allocates a recognized live holding value across goals,
  convert that value to two decimal places using Decimal `ROUND_HALF_UP`.” Allocation then uses integer paise;
  unknown and unsupported contributions remain partial, never zero. Full write-up:
  `docs/features/baseline/decisions/D-151-goal-progress-currency-rounding.md`.
- **Date:** 24-Aug-2026

### D-152 — Account entry and access is the next product-definition workstream; BQ-113..117 approved
- **Tier:** 3, owner-decided sequencing. “The owner approved 'Account entry and access' — rank 3 (score 81)
  … as the next product-definition deep dive under the D-148 programme,” plus the five-item bounded plan
  BQ-113..BQ-117; both HARD-STOPs (frontend test harness; production CORS/hosting/leaked-password) stay
  DEFERRED. Full write-up: `docs/decisions/D-152-account-entry-next-workstream.md`.
- **Date:** 26-Aug-2026

### D-153 — Session-expiry / network-loss recovery UX is a non-blocking banner + manual retry
- **Tier:** 2, owner-ruled (resolves account-entry open fork O-A). “The recovery UX is a **non-blocking
  banner + manual retry**.” No forced logout and no silent re-auth on a transient blip; the expired subject is
  treated as lost (no stale data behind the banner) and the user manually re-authenticates/retries. Full
  write-up: `docs/decisions/D-153-account-entry-expiry-network-loss-banner-retry.md`.
- **Date:** 26-Aug-2026

### D-154 — Duplicate-registration / wrong-password copy is neutral and enumeration-safe
- **Tier:** 2, owner-ruled (resolves account-entry open fork O-B; privacy angle). “Uniform wording that
  **never reveals whether an email has an account**.” Wrong-password and unknown-email are indistinguishable;
  duplicate registration does not confirm the email exists; this overrides Supabase's specific default
  messages. Ratifies the enumeration-safety constraint already in `CONTRACTS.md`. Full write-up:
  `docs/decisions/D-154-account-entry-neutral-enumeration-safe-auth-copy.md`.
- **Date:** 26-Aug-2026

### D-155 — Logout / account-switch actively clears device-local state
- **Tier:** 2, owner-ruled (resolves account-entry open fork O-C). “On logout and account-switch, device-local
  state is **actively cleared** — the strongest anti-bleed option.” Actively tears down cached UI/query/
  AsyncStorage subject-scoped state, extending the BQ-112/D-149 load-time suppression. Full write-up:
  `docs/decisions/D-155-account-entry-active-clear-device-local-state-on-logout.md`.
- **Date:** 26-Aug-2026

### D-156 — Home and consolidated experience is the next product-definition workstream
- **Tier:** 3, owner-decided sequencing. “The owner approved **Home and consolidated experience**, rank 4
  (score 80) in the D-148 portfolio audit, as the next product-definition deep dive.” Full write-up:
  `docs/decisions/D-156-home-is-next-product-definition-workstream.md`.
- **Date:** 28-Aug-2026

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
