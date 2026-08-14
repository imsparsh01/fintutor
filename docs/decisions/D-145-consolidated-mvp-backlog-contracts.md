# D-145 — Consolidated MVP backlog contracts

- **Date:** 14-Aug-2026
- **Tier:** 3 — owner-decided
- **Status:** Approved

## Decision

The owner approved the remaining MVP backlog as one coherent package. The contracts below are binding;
implementation may be split into bounded build-queue items without reopening routine mechanics.

### Engineering gates (BQ-091)

D-107's sprint discipline remains mandatory, but its named third-party commands are no longer a shipping
dependency. Every non-trivial build requires a recorded pre-build review of scope, architecture, edge cases
and tests, plus a recorded pre-commit review of correctness, security, privacy, scope and test evidence.
Use `/plan-eng-review` and `/review` when compatible; otherwise perform and record equivalent manual gates.
UI QA remains best-effort. This decision authorises the corresponding deliberate edit to `CLAUDE.md`.

### In-context teaching (BQ-093)

Use a bounded deterministic comparison-pair table, rendered only under D-080's on-topic WHEN rule. Show at
most one absent-type candidate, describe only mechanism differences, and never call it needed, missing,
better, safer or suitable. Never cold-surface it. Interest opens teaching; no holding is created without
D-078 confirmation. Safe MVP pairings are: loan → term insurance; endowment/ULIP ↔ term insurance; ESOP →
stocks; stocks → equity mutual fund; equity mutual fund → debt mutual fund; debt mutual fund → FD/RD; and
FD/RD ↔ PPF/EPF. Do not invent borrowing or refinancing pairings.

### Ethical Hook Loop trigger (BQ-095)

After the first meaningful learning interaction, offer an optional daily local learning reminder. The user
chooses the time; schedule nothing without permission and opt-in. Allow change, pause and disable. Limit it
to one per day with generic behavior-only copy: no balances, holdings, product names, urgency, guilt, streak-
loss pressure, financial outcomes, comparison candidates or variable rewards. A tap opens Home/Arya.

### Consolidated valuation semantics (BQ-096)

A recognised holding with a missing, malformed or non-finite value remains counted in its family but is
excluded from arithmetic, never coerced to zero and never allowed to fail the whole response. Expose neutral
`unvalued`/`mixed` metadata and invalid-value counts. Unknown product types increment a top-level unclassified
count; they are neither guessed into a family nor allowed to make a non-empty portfolio appear empty.

### Reminder recurrence (BQ-097)

Preserve the selected due day 1–31. Each occurrence uses the selected day or that month's final day when the
day does not exist, then returns to the selected day in later longer months. Never permanently rewrite it to
28. A rolling set of local one-shot notifications may implement this contract.

### Tax and HRA calculators (BQ-098)

Defer both calculators. Unpark only when one supported financial year is named, every rule links to an
official primary source, an owner and pre-year verification date exist, stale or unverified rules disable
calculation, and qualified India tax/fintech counsel approves the external wording and flow.

### Interactive own-numbers walkthrough (BQ-102)

Replace the generic-only experience with an optional interactive educational walkthrough. It may use
already supplied relevant information with clear provenance and consent, show which values it used, and ask
only for missing information. Every step is skippable; unknown values are never fabricated or silently
treated as zero; no new data is saved without confirmation. It teaches the mechanism and hands control back
to the user without advice, gating, quizzes or rewards.

### Conformance corrections (BQ-103)

- Blank or unrecognised income cadence is visibly flagged and excluded from monthly income/net, never
  guessed as monthly. Recognised cadence handling remains symmetric with outflows.
- Reject new negative or non-finite 80C inputs; defensively exclude legacy-invalid entries with a warning.
  `unused_room` is clamped to ₹0–₹1.5 lakh.
- Equal ESOP FMV and strike reports zero spread and equality/no current paper gain.
- A zero-unit grant says the record grants no units, not that nothing vested.
- A future streak `last_active_date` is a logged no-op that cannot rewind or inflate state.
- ESOP elapsed months use a clamped anniversary: the same day-of-month, or that month's last day when the
  grant day does not exist. Disclose that this is an estimate and the actual grant schedule controls.

### Goal Affordability (BQ-085)

Use a neutral goal-gap model with user-entered target, current earmarked amount, planned monthly
contribution, annual assumed return and horizon. Use D-129 month-end timing. Show modeled ending value,
required monthly contribution, and the signed contribution gap in useful language such as “₹X more per
month closes the modeled gap” or “your plan is ₹X above the modeled requirement.” Provide adjustable
scenarios, but never label the goal affordable, unaffordable or on track. Do not assume tax, fees, inflation
or returns; validate finite non-negative inputs and disclose the model limitations.

For `n` months and monthly rate `r = annual_rate / 1200`, modeled ending value is
`current × (1+r)^n + monthly × ((1+r)^n−1)/r`; required monthly is
`max(0, (target−current×(1+r)^n) × r / ((1+r)^n−1))`. At zero rate, use
`current + monthly×n` and `max(0, (target−current)/n)`. The displayed gap is planned monthly minus required
monthly. Apply the existing calculator amount/rate/horizon and overflow guards.

### Context-first term-insurance exploration (BQ-086)

With explicit consent, pre-fill relevant confirmed context from dependants, household support, debts, goals,
assets, survivor income and existing cover. Show every source and let the user include, exclude or edit it;
ask only for critical missing values and do not calculate while they remain unknown. Model the selected
support stream and components transparently, show existing cover separately, and present only the numerical
difference. Scenarios are transient and unknowns are never defaults.

The modeled amount is `max(0, household-support stream + selected debts + selected goal amounts − selected
available-asset offsets − selected survivor-income stream)`. Each stream uses a user-entered annual amount
and integer years; optional user-entered annual growth/inflation `g` produces
`annual × Σ(1+g)^y` for years `y=0…n−1`. No rate or component is inferred. Years must be 1–100, entered
amounts finite and non-negative, and growth 0–100% when supplied. Existing individual, group and other cover
is reported separately; the signed comparison is entered cover minus modeled amount.

FinTutor must not tell the user to buy insurance, call cover adequate/required, or improve Portfolio Health
because insurance was purchased. It may reward learning or assessment completion, never purchase or a
financial outcome. Qualified India insurance/fintech counsel must review the flow before external launch.

### Privacy policy and dedicated context (BQ-087)

Create an operative internal-MVP Privacy Policy v1, accessible before registration and from authenticated
Settings. It must plainly cover collected data, limited purposes, Supabase and Anthropic processing,
masking/minimisation, optional context, account-lifetime and 400-day progression retention, seven-day
recovery backups, security controls, JSON export, view/change/clear controls, deletion, 18+ scope, contact,
version/effective date and change notice. Do not claim absolute security or unverified provider retention.
Name a future FastAPI host only after selection.

Once that artifact and link exist, build D-134's optional per-user context record and make it authoritative
for Arya and Portfolio Health. Prevent cross-account device leakage; migrate safely or clear legacy global
values. Update export/deletion coverage and tests. No external real-user collection or public launch may
occur until qualified India counsel reviews the final policy and required changes are applied.

## Delivery effect

BQ-091, BQ-093, BQ-095, BQ-096, BQ-097, BQ-102, BQ-103, BQ-085, BQ-086 and BQ-087 become READY. BQ-098
becomes explicitly DEFERRED under its rule-contract gate. Production hosting, scheduled pruning and the
customer-outcome exit-gate programme retain their existing deferred transitions.
