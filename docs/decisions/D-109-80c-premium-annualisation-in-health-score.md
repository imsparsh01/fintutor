# D-109 — The Health Score's 80C figure excludes a premium with no stated cadence

**Tier:** 2, owner-confirmed (escalated under `CLAUDE.md`'s "calculations users rely on" hard stop)
**Date:** 12-Aug-2026
**Context:** BQ-054 defect fix in `app/lib/healthScore.ts` — the "Tax utilisation" sub-score, flagged
at the end of the 12-Aug-2026 BQ-056 session

---

## The defect this came out of

`computeSubScores`'s `taxUtil` branch returned 0 for every user whose holdings loaded successfully.
Two independent product-type/field mismatches, both shipped in BQ-054 (commit `d62f570`):

1. `TAX_80C_TYPES = ['ppf', 'epf']` — neither is a real product type. D-013's taxonomy has the single
   value `'ppf_epf'` (`app/lib/taxonomy.ts`), with PPF and EPF distinguished by the
   `retirement_fund_type` characteristic. No holding ever matched.
2. The insurance branch read `characteristics.premium_annual`, a field that exists nowhere.
   `CHARACTERISTICS_SCHEMA` defines `premium` plus a separate free-text `premium_frequency` for both
   `term_insurance` and `endowment_ulip`.

So `annual80C` stayed 0 and the row rendered `0/100` — not "we don't know", but a confident zero.

Mismatch 1 is mechanical: `'ppf_epf'` is the only value the taxonomy permits, and
`backend/app/services/tax_saving_room.py:40` already filters on exactly that. Fixed without escalation.

Mismatch 2 is what this decision is about.

## Why this needed the owner, and what the real question turned out to be

The question was **not** "invent a way to normalise free text", which is how it first looked. The repo
already has a shipped 80C annualisation: `tax_saving_room.py:43` computes the same quantity as
`_to_monthly(premium, premium_frequency) * 12`, and `_to_monthly`
(`backend/app/services/budget.py:16`) already handles the vocabulary — annual/annually/yearly/year
÷12, quarterly/quarter ÷3, weekly/week ×52/12.

The real question is narrower, and it is genuine because **the two existing precedents disagree** on
one case: a premium whose `premium_frequency` is missing or unrecognised.

- **`tax_saving_room.py` is lenient.** It calls `_to_monthly` bare, whose final fallback treats any
  unrecognised value — including absent — as already-monthly. A ₹25,000 premium actually paid
  annually, with a blank cadence, is read as ₹3,00,000/year. That alone exceeds the ₹1.5L cap and
  pins `taxUtil` at 100.
- **`compute_budget` is strict.** `budget.py:62` makes the deliberate opposite call, its "Option C":
  an amount without an explicit recognised cadence is *not* silently treated as monthly; it stays
  visible on the holding but does not enter the monthly view.

`healthScore` had to pick one, and either choice creates an inconsistency somewhere in the product.

## What was decided

**Option C / strict.** A premium counts toward the Health Score's 80C total only when
`premium_frequency` is an explicitly recognised cadence. Otherwise it is excluded — never assumed
monthly.

Three reasons, in the order that decided it:

1. **The failure modes are not symmetric.** Being strict under-counts: a real 80C contribution goes
   unrecognised and the score reads lower than the truth. Being lenient over-counts by up to 12x and
   pins the row at 100 — telling the user they have fully used a ₹1.5L allowance they may have barely
   touched. A score that is too low invites the user to look; a score that is falsely maxed tells
   them to stop looking. For a figure users rely on, the conservative reading is the one to show.
2. **It is the rule this screen already follows.** `investmentRate` reads
   `budget.recurring_outflows`, which is Option-C filtered on the backend before it ever reaches the
   frontend. Had `taxUtil` gone lenient, one Health Score screen would have applied two opposite
   cadence rules to two of its own four rows.
3. **It is the more defensible of the two under P2/D-009.** Excluding a figure the app cannot read is
   silence. Multiplying it by 12 on an assumption is an assertion about the user's tax position.

### The cost, accepted knowingly

The Health Score's 80C total and the "Check my 80C room" figure (`TaxSavingRoomModal`, D-070) can now
**disagree for the same user** — specifically, for a holding with a premium but no stated cadence.
Two surfaces in one app showing different 80C numbers is a real product flaw, not a nitpick.

It was accepted here rather than solved because the alternative — changing `tax_saving_room.py` to
match — is a backend calculation change, its own hard stop, and well beyond a frontend defect fix. It
is recorded in `docs/KNOWN_LIMITATIONS.md` with a trigger condition rather than left implicit, and
the divergence is commented at the point in `healthScore.ts` where a future reader would otherwise
"fix" it back into agreement.

### Vocabulary is mirrored, deliberately not extended

The recognised set in `healthScore.ts` is exactly `budget.py`'s `_RECURRING_FREQUENCIES`. Notably it
does **not** include half-yearly/semi-annual, even though `HoldingDetailScreen.tsx:111` renders that
phrasing as a display adjective. Adding a ÷6 the backend lacks would have created a *second* source
of divergence while fixing the first. A half-yearly premium is excluded under the same Option C rule —
also logged as a known limitation.

## Reversibility

High. The rule is one function (`annualisePremium`) in one file, with no stored data and no schema
implication — every input is read live off `characteristics` on each render. Switching to the lenient
reading, or aligning both surfaces later, is a contained edit.

## Verification

`npx tsc --noEmit` clean. 23 runtime cases exercised against the compiled function covering each
cadence and synonym, case/whitespace variance, the missing/blank/unrecognised/non-string cadence
paths, NaN and negative guards, the ₹1.5L cap, `holdings === null` vs `[]`, and the combined
PPF+premium shape. All pass. The repo has no test runner, so these were run as a throwaway script
rather than committed — a standing gap, not specific to this change.
