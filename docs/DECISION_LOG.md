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


### D-126 — Onboarding ends with an optional, user-chosen first action
- **Tier:** 3, owner-decided. “The user needs direction after orientation but does not owe FinTutor a
  financial census before receiving value.” Preserves D-118/D-119's five-axis orientation, then offers
  Arya, an existing item, a goal, Tools, or Home without forced disclosure. Full write-up:
  `docs/decisions/D-126-optional-guided-onboarding-handoff.md`.
- **Date:** 12-Aug-2026

### D-127 — Conversational holding reconciliation uses a user-confirmed field diff
- **Tier:** 3, owner-decided. “The AI extracts and compares; the user retains authority over the
  financial-data write.” New, updated, and conflicting holding information shows its target and exact diff;
  ambiguity requires user selection and nothing writes without confirmation. Full write-up:
  `docs/decisions/D-127-user-confirmed-holding-reconciliation.md`.
- **Date:** 12-Aug-2026

### D-128 — MVP adds a focused five-calculator second batch
- **Tier:** 3, owner-decided. “The focused batch covers debt, resilience, growth, goals, and protection
  without turning FinTutor into an unbounded calculator catalogue.” Adds credit-card payoff, emergency-fund
  coverage, compound growth, goal affordability, and term-insurance coverage; tax/HRA stay blocked. Full
  write-up: `docs/decisions/D-128-focused-second-calculator-batch.md`.
- **Date:** 12-Aug-2026

### D-129 — Users own consequential calculator assumptions; recurring contributions use month-end timing
- **Tier:** 3, owner-decided. “The user should control the uncertain financial inputs; the app should own
  only transparent arithmetic.” No typical/default assumptions; disclosed conditional conventions only;
  monthly contributions use consistent end-of-month timing. Full write-up:
  `docs/decisions/D-129-user-owned-assumptions-and-end-month-convention.md`.
- **Date:** 12-Aug-2026

### D-130 — Emergency runway counts accessible amounts, not total recorded wealth
- **Tier:** 3, owner-decided. “Emergency runway measures accessible funding time, not ownership or net
  worth.” Counts entered cash, editable fixed-deposit principal, and only additional amounts the user says
  are accessible; full PPF/EPF is no longer automatic. Full write-up:
  `docs/decisions/D-130-emergency-runway-counts-accessible-amounts.md`.
- **Date:** 12-Aug-2026

### D-131 — Term insurance uses a full-picture needs exploration, not a simple income multiple
- **Tier:** 3, owner-decided. “Term-insurance need is a household resilience question, not merely an income
  multiplication.” Approves the full-picture educational direction; exact output, formula, sensitive inputs,
  and inclusion rules remain decision-gated. Full write-up:
  `docs/decisions/D-131-full-picture-term-insurance-needs-exploration-direction.md`.
- **Date:** 12-Aug-2026

### D-132 — Term-insurance exploration uses user-controlled household-support scenarios
- **Tier:** 3, owner-decided. “The baseline contains financial facts, but facts alone do not determine which
  future household obligations should be insured.” Users explicitly choose every inclusion, horizon, rate,
  and offset; FinTutor shows transparent scenarios without a suitability verdict. Full write-up:
  `docs/decisions/D-132-user-controlled-household-support-scenarios.md`.
- **Date:** 12-Aug-2026

### D-133 — Sensitive names and identifiers are masked locally before every model call and re-humanized for users
- **Tier:** 3, owner-decided. “Users may see recognisable names, while external models never do.” Stored and
  newly typed names plus high-confidence identifiers are locally aliased for every Sonnet/Haiku request, then
  exact-token re-humanized for the app; unsafe masking fails closed. Full write-up:
  `docs/decisions/D-133-local-pre-model-masking-and-user-facing-rehumanization.md`.
- **Date:** 12-Aug-2026

### D-134 — Household resilience context lives in a dedicated minimal financial-context record
- **Tier:** 3, owner-decided. “Durable personal-finance context with no natural home in an existing
  first-class object belongs in a dedicated, user-controlled context record.” The first fields are an
  explicitly confirmed dependant count and self-reported emergency-fund months; onboarding never infers
  them. Full write-up: `docs/decisions/D-134-dedicated-minimal-financial-context-record.md`.
- **Date:** 14-Aug-2026

### D-135 — Every decision requires an explicit delivery disposition
- **Tier:** 3, owner-decided. “Decided and delivered are separate states.” Every new decision must be
  recorded in `docs/DECISION_DELIVERY_TRACKER.md` as NO_BUILD, READY, BLOCKED, DEFERRED, SHIPPED, or
  SUPERSEDED before the session closes. Full write-up:
  `docs/decisions/D-135-mandatory-decision-delivery-disposition.md`.
- **Date:** 14-Aug-2026

### D-136 — Historical delivery audits remain exception-only and token-lean
- **Tier:** 3, owner-confirmed. “Coverage is established by searchable traces plus explicit exceptions; it
  does not require duplicating closed history into the live context window.” Audits index first, inspect
  only suspicious traces, and persist only open exceptions. Full write-up:
  `docs/decisions/D-136-token-lean-historical-delivery-audit.md`.
- **Date:** 14-Aug-2026

### D-137 — Backend ownership is derived from a verified Supabase JWT
- **Tier:** 3, owner-decided. “For every user-owned backend resource, identity comes from verified
  authentication context, never from a caller-selected user identifier.” The backend verifies each
  protected request's Supabase token and uses its subject as the sole ownership identity; multiple test
  accounts remain supported. Full write-up:
  `docs/decisions/D-137-supabase-jwt-derived-backend-ownership.md`.
- **Date:** 14-Aug-2026

### D-138 — MVP uses Supabase-managed at-rest protection with strict access controls
- **Tier:** 3, owner-decided. “FinTutor will not introduce its own field-encryption keys for the MVP.”
  Supabase-managed database/backup encryption is paired with JWT ownership, TLS, production SSL enforcement,
  network restrictions once hosting is known, secret isolation, and security tests. Full write-up:
  `docs/decisions/D-138-supabase-managed-at-rest-protection-for-mvp.md`.
- **Date:** 14-Aug-2026

### D-139 — Deleted account data may remain only in encrypted recovery backups for seven days
- **Tier:** 3, owner-decided. “Deletion removes active data immediately.” Recovery-only encrypted copies
  expire within seven days, cannot be used normally, and a restore must reapply later deletions before the
  system serves users. Full write-up:
  `docs/decisions/D-139-seven-day-backup-retention-after-deletion.md`.
- **Date:** 14-Aug-2026

### D-140 — Whole-account deletion requires re-authentication and is retry-safe
- **Tier:** 3, owner-decided. “Repeated requests must converge on the same fully deleted state.” A fresh
  login and separate confirmation precede data-first erasure, backend-only Auth deletion, and success only
  after both stages complete. Full write-up:
  `docs/decisions/D-140-reauthenticated-retry-safe-whole-account-deletion.md`.
- **Date:** 14-Aug-2026

### D-141 — Detailed sensitive-context disclosure lives in the privacy policy
- **Tier:** 3, owner-decided. “The detailed explanation of how FinTutor collects, uses, protects, retains,
  and deletes the dedicated financial-context values approved by D-134 will live in the privacy policy.”
  Field labels remain clear, optional, explicitly entered, and user-controlled. Full write-up:
  `docs/decisions/D-141-sensitive-context-disclosure-in-privacy-policy.md`.
- **Date:** 14-Aug-2026
