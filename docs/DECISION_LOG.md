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

### D-142 — Public financial tables are accessible only through FastAPI
- **Tier:** 3, owner-decided. “FastAPI remains the sole application-data gateway.” RLS is enabled without
  client policies and direct `anon`/`authenticated` table privileges are revoked. Full write-up:
  `docs/decisions/D-142-fastapi-only-financial-table-access.md`.
- **Date:** 14-Aug-2026

### D-143 — Production FastAPI hosting is deferred until external access is required
- **Tier:** 3, owner-decided. “FinTutor will keep FastAPI local during internal MVP completion and owner
  validation.” Supabase remains the Postgres/Auth host; a Python backend host is selected only before a
  workflow needs external reachability. Full write-up:
  `docs/decisions/D-143-production-fastapi-hosting-deferred-until-required.md`.
- **Date:** 14-Aug-2026

### D-144 — Users receive a reauthenticated self-service JSON data export
- **Tier:** 3, owner-decided. “A fresh password reauthentication is required before the verified JWT
  subject's active data is assembled into one documented, dated JSON file.” Web downloads directly; native
  uses temporary cache plus the share/save sheet. Full write-up:
  `docs/decisions/D-144-reauthenticated-self-service-json-data-export.md`.
- **Date:** 14-Aug-2026

### D-145 — The remaining MVP backlog has explicit build contracts
- **Tier:** 3, owner-decided. “Implementation may be split into bounded build-queue items without reopening
  routine mechanics.” Ten formerly blocked items are READY; tax/HRA remains deliberately deferred. Full
  write-up: `docs/decisions/D-145-consolidated-mvp-backlog-contracts.md`.
- **Date:** 14-Aug-2026

### D-146 — Imperative accessibility focus stays native-only
- **Tier:** 1, bounded conformance repair. “Web keeps the existing accessible result announcements and
  semantic headings, but does not call the native-only focus API.” Full write-up:
  `docs/decisions/D-146-web-accessibility-focus-stays-native-only.md`.
- **Date:** 14-Aug-2026

### D-147 — Python 3.14 / Windows compatibility fixes in requirements.txt
- **Tier:** 1, bounded conformance repair. “Pure compatibility shims with no effect on product
  behaviour, data schema, money calculations, or API contracts.” Upgrades psycopg2-binary, SQLAlchemy,
  and Alembic floor versions; adds tzdata for Windows zoneinfo. Full write-up:
  `docs/decisions/D-147-python314-windows-compatibility-fixes.md`.
- **Date:** 20-Aug-2026

### D-148 — Ten-workstream product definition precedes further production engineering
- **Tier:** 3, owner-decided. “Implementation breadth is not the current constraint.” Ten major workstreams
  receive a comparable audit, decision-complete package, fixture prototype and owner validation before new
  production engineering. Full write-up:
  `docs/decisions/D-148-ten-workstream-product-definition-programme.md`.
- **Date:** 23-Aug-2026

### D-149 — Baseline lifecycle and integrity directions approved
- **Tier:** 3, owner-decided. “The baseline is a user-correctable source of truth reused throughout FinTutor.”
  Full edit/delete extends to income, discretionary categories and goals; direct edits use durable stale
  comparison; committed holding saves remain authoritative across reminder failure; goal progress moves toward
  live available value but its exact money rule remains blocked. Full write-up:
  `docs/features/baseline/decisions/D-149-baseline-lifecycle-and-integrity-directions.md`.
- **Date:** 23-Aug-2026

### D-150 — Goal progress uses shared proportional live holding value
- **Tier:** 3, owner-decided money logic. “For each recognized linked holding, goal progress uses at most that
  holding's live recorded value once across all goals.” Over-allocation scales by earmark proportion; unknown
  valuation remains unmeasured; exact currency totals and provenance are preserved. Full write-up:
  `docs/features/baseline/decisions/D-150-shared-proportional-live-goal-progress.md`.
- **Date:** 23-Aug-2026

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
