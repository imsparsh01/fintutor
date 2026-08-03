# D-048 — Discretionary categories stored as their own table, sibling to Income/Goal (owner-confirmed)

- **Tier:** 1 — bounded technical implementation detail surfaced executing BQ-010, contained
  entirely within this session, no money-logic or teach-not-advise line touched, no MVP scope
  change, fully reversible (no discretionary-category data existed before this session). Asked the
  owner directly rather than silently picking, since two live candidates existed (new table vs. a
  JSONB field bolted onto Income) — same pattern as D-043/D-044.
- **Decision:** D-038 named discretionary categories (`{label, planned_amount}`) as stored (they
  have no holding to live on) but didn't say where. Owner chose a new table,
  `discretionary_categories` (`id`, `user_id` — loose UUID, no FK, same as Income/Goal/Holding,
  `label`, `planned_amount`), rather than a JSONB column on `Income`. Added
  `backend/app/models/discretionary_category.py`. Alembic migration `ce8262c241ff` generated
  (autogenerate produced a clean create-table + index, no manual fixes needed this time) and
  applied against the live Supabase DB.
- **Why:** matches the pattern Income and Goal already use (their own table each), and keeps "what
  a user earns" (Income) separate in scope from "what they plan to spend" (discretionary
  categories) rather than blurring Income's purpose.
- **Also built this session (BQ-010, not a separate decision — executes D-038's already-decided
  design):** `backend/app/services/budget.py`'s `compute_budget()` and a new `GET /budget?user_id=`
  endpoint. Recurring outflows are read live off `Holding.characteristics` for exactly the three
  fields D-038 names — EMI (home_loan/personal_loan), SIP investment amount
  (equity_mutual_fund/debt_mutual_fund, only when `investment_mode == "SIP"`, lumpsum excluded),
  and insurance premium (term_insurance/endowment_ulip). Income sources and insurance premiums are
  frequency-normalized to a monthly figure (annual/quarterly/weekly → monthly) since Income.sources
  and premium_frequency can each carry a non-monthly frequency and a budget is a monthly view by
  convention — no prior fixture or decision fixed this convention explicitly, so it's noted here
  rather than left silent. Verified end-to-end against the live DB: inserted a test user's Income
  (monthly + annual sources), four holdings (EMI loan, SIP fund, lumpsum fund, annual-premium
  insurance), and two discretionary categories; `/budget` returned the hand-computed total exactly
  (₹110,000 income / ₹31,000 recurring / ₹21,000 discretionary / ₹58,000 net), correctly excluding
  the lumpsum fund from recurring outflows; test rows deleted after verification.
- **product_type slugs used by `compute_budget()`:** `home_loan`, `personal_loan`,
  `equity_mutual_fund`, `debt_mutual_fund`, `term_insurance`, `endowment_ulip` — snake_case slugs
  for D-013's taxonomy names, first time any code keys off specific `product_type` string values
  (no Holding rows existed before this session). Not a formal enum (D-044 already declined to
  constrain the column); if real product_type values end up spelled differently, `compute_budget()`
  needs a matching update.
- **Reversibility:** High — no discretionary-category data existed before this session; the
  monthly-normalization convention and product_type slugs are pure code, changeable without a
  migration.
- **Date:** 03-Aug-2026
