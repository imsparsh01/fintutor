# D-066 — ESOP characteristics field schema resolved (single type, `grant_type`-distinguished), applying D-013's split-vs-merge test

- **Tier:** 2 — no §2.1 hard trigger fires. Not money movement or a calculation (this is a field list to
  *store*, no formula computed here — same posture D-013's original fields had); not legal/regulatory/tax
  shape itself (it stores facts the user already knows about their own grant, doesn't compute tax owed);
  doesn't reinterpret a standing principle; reversible — no ESOP holdings exist yet (touched-data test,
  §2.2); doesn't grow MVP scope — D-055 already put ESOP in the taxonomy, this only fills in *how* its data
  is structured, the same follow-on shape D-013's field lists were for the original 8 types. Classifies as
  product/technical, same category D-013 itself sat in. REVIEW-FLAGGED per Tier 2's design (§2.4) — acted
  on immediately, not gated on the owner's confirmation first.
- **Context:** BQ-028 (holdings characteristics editing UI) shipped this session with ESOP's field list
  explicitly absent — D-055 settled taxonomy *membership* only, leaving the field list itself as "its own
  design pass (a split-vs-merge test, same method as D-013's original)," per that decision's own text and
  `PROJECT_SPEC.md` §6's note ("grant date, vesting schedule, strike price, FMV, exercise mechanics, etc.
  is deferred"). This decision does that design pass.
- **Decision:** ESOP stays a **single product type** (not split into separate "stock options" and "RSU"
  types), matching D-055's scope — D-055 decided taxonomy membership as one type, and splitting it now
  would itself be a further scope increase (a second new type) that D-055 didn't authorize and this
  decision does not attempt. Internal variation is handled the same way D-013 handled FD/RD (merged, with
  `deposit_mode` as the distinguishing field) — a `grant_type` field (`"options"` | `"rsu"`) carries the
  distinction, since RSUs have no strike price/exercise decision while options do, but both share the same
  grant/vesting shape.

  **Fields:**
  - `grant_type` — `"options"` or `"rsu"`.
  - `grant_date` — when the grant was made.
  - `total_units_granted` — total options/RSUs in the grant.
  - `vesting_cliff_months` — e.g. 12 (standard 1-year cliff).
  - `vesting_period_months` — total vesting duration, e.g. 48.
  - `strike_price` — exercise price per unit; `null`/0 for RSUs.
  - `current_fmv` — nullable; current fair market value per unit, often unknown for private companies
    until a valuation event — stored as an optional fact, not a live-computed figure.
  - `exercise_window_months` — post-termination exercise window (e.g. 90 days) — BRIEF-010 named this
    specifically as a startup/gig-profile pain point ("what happens if I leave").

  **Deliberately NOT included, matching D-011's "resist over-modeling":** a stored `vested_units` field.
  How many units are currently vested is derivable from `grant_date` + `vesting_cliff_months` +
  `vesting_period_months` at teaching-moment time — the reference-vs-store test (D-038) says a number
  derivable from stored facts is computed live, not duplicated. **This decision does not design that
  computation** — same posture D-013 had toward the original 8 types' budget/progress math, which BQ-010
  and BQ-017 built later against D-038's separate decision. If/when a teaching moment needs vesting-status
  math, that's its own build item against this field list, not decided here.
- **Why:** The split-vs-merge test (D-013's reusable rule: *does the teaching mechanism or tax behavior
  actually differ?*) does show real daylight between options and RSUs (options carry an exercise decision
  with real economics; RSUs don't) — enough that a *field-level* distinction is warranted. But it does not
  justify a *type-level* split, because D-055 already fixed ESOP's taxonomy membership at one type, and
  reopening that boundary is a different, larger question (net scope growth) than this decision's job of
  filling in an already-anticipated field list. The `grant_type` field is the same resolution D-013 used
  for FD/RD's narrower case (deposit_mode) — mechanism differs by a field, not by a type boundary, when the
  overall family and most fields are shared.
- **Lenses:**
  ```
  Compliance      PASS      Stores facts the user already knows about their own grant (D-010's masking
                            applies the same as every other holding type — alias + characteristics only
                            ever reach the LLM). No new advisory-line or naming surface.
  Product         PASS      Directly answers BRIEF-010's named pain point (vesting/strike/exercise
                            confusion) with the minimum field set a teaching moment on any of those three
                            needs. current_fmv nullable rather than required, since it's honestly often
                            unknown for private companies — doesn't force a number the user doesn't have.
  Technical       PASS      Same JSONB/`characteristics`, unconstrained `product_type` string (D-044) —
                            no schema/migration change, purely a frontend form-schema addition
                            (`app/lib/characteristicsSchema.ts`), reversible by editing that file.
  Cost-and-Scope  PASS      Eight fields, same order of magnitude as the other D-013 types (5-7 fields
                            each). No new maintenance surface beyond what every other type already has.
  ```
- **Reversibility:** High — no ESOP holdings exist yet (touched-data test), and the change lands only in
  the frontend form schema, not the backend model (`Holding.characteristics` stays unconstrained JSONB per
  D-044). Adding/renaming a field later doesn't require a migration.
- **Rule extraction:** none new — this is a direct application of D-013's existing split-vs-merge test and
  D-011's resist-over-modeling rule to a case those rules already anticipated, not a new pattern.
- **Feeds:** `app/lib/characteristicsSchema.ts` (BQ-028's ESOP gap closed in the same session), unblocking
  real ESOP field editing in `HoldingEditModal`/`HoldingDetailScreen`.
- **Date:** 04-Aug-2026
