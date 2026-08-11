# FinTutor — Known Limitations & Deferred Follow-ons

**This is the forward-looking counterpart to `docs/BUILD_QUEUE.md`.** BUILD_QUEUE tracks what to build
next; this tracks what's already shipped *deliberately incomplete* — a disclosed gap, a scoped-out field, a
deferred design choice — so it doesn't only survive as prose buried inside a DONE entry nobody re-reads.

Each entry names: what's missing, why it wasn't solved when it was found, what traces to it, and — the
part that actually makes this useful — **what would justify picking it up.** Not "someday," a real trigger
condition. Entries are removed once resolved (moved to a normal DECISION_LOG/BUILD_QUEUE entry), not left
here stale.

---

## Disclosed limitations on shipped features

### No prepayment/foreclosure charge modeled (loan-vs-invest)
**Traces to:** BRIEF-014/D-068, `backend/app/services/loan_vs_invest.py`. Assumes zero, disclosed via
`prepayment_charge_note`. Overstates prepaying's benefit for any loan that does charge one (personal loans,
some fixed-rate products — RBI bars this on floating-rate home loans to individuals).
**Revisit if:** real usage shows users hitting loans where this materially changes the picture. Adding a
`prepayment_charge_percent` field is small, deliberately not done on spec.

### No "units already exercised" tracked (ESOP)
**Traces to:** BRIEF-015/D-069, `backend/app/services/esop_exercise_cost.py`. "Vested units" means
cumulative-since-grant, not net of exercises already done — disclosed via
`exercised_units_assumption_note`. Overstates what's actually available if the user has partially
exercised.
**Revisit if:** real usage surfaces users for whom this makes the figure wrong, not just imprecise.

### ELSS vs. regular equity fund not distinguishable (tax-saving)
**Traces to:** BRIEF-016/D-070, `backend/app/services/tax_saving_room.py`. No `is_80c_eligible` flag
exists — deliberately, since D-009 forbids product-identifying data. `unused_80c_room` will overstate
itself for anyone holding an ELSS fund we can't identify as such — plausibly common in this feature's own
target segment.
**Revisit if:** usage shows this is a frequent, meaningfully-wrong case, or a non-product-naming way to
self-flag "this is a tax-saving fund" is found.

### The app's two 80C figures can disagree for a premium with no stated cadence
**Traces to:** D-109, `app/lib/healthScore.ts` (`annualisePremium`) vs
`backend/app/services/tax_saving_room.py:43`. The Health Score's "Tax utilisation" row applies
`budget.py`'s strict Option C — a premium counts only when `premium_frequency` is an explicitly
recognised cadence. `tax_saving_room.py` calls `_to_monthly` bare, so it reads an unrecognised or
missing cadence as monthly. For a holding with a premium but no cadence recorded, the Health Score
excludes it and "Check my 80C room" counts it at 12x its actual annual value. Both surfaces are
reachable in one session, so a user can see two different 80C totals for the same holdings.
D-109 accepted this rather than solve it: aligning them means changing a backend calculation, which is
its own hard stop and well outside a frontend defect fix.
**Revisit if:** the two surfaces are ever shown together (a Health Score card on Home per BQ-060 would
do it), or real holdings show blank `premium_frequency` is common rather than rare. The fix is small —
apply Option C in `tax_saving_room.py` too — but it changes a shipped user-facing figure, so it needs a
real decision, not a drive-by.

### Half-yearly premiums are recognised for display but not for any calculation
**Traces to:** D-109. `HoldingDetailScreen.tsx:111` renders "half-yearly" as a premium adjective, so a
user can enter that cadence and see it reflected back. No calculation recognises it:
`budget.py`'s `_RECURRING_FREQUENCIES` has no half-yearly entry, so the premium is dropped from the
monthly budget view, and `healthScore.ts` mirrors that set deliberately and drops it from 80C too. The
user sees their cadence acknowledged in one place and silently ignored in two others.
**Revisit if:** anyone is actually entering it. The fix is one divisor in `_to_monthly` plus the
matching frontend entry — but adding it on only one side would create a *second* divergence of the
kind above, so it has to be done in both or neither.

### LOW — Backend has no CORS middleware; browser-based testing needs a workaround
**Traces to:** the 04-Aug-2026(j) live-verification pass (device/simulator session — see
`docs/sessions/2026-08-04j.md`). `backend/app/main.py` configures no `CORSMiddleware`, so a browser calling
the backend from a different origin (Expo's web dev server on `:19006` calling the backend on `:8000`) gets
blocked by the browser's own CORS policy — every screen showed "Failed to fetch" until worked around.
Doesn't affect the real product target: native iOS/Android `fetch()` isn't subject to CORS at all, so this
was invisible to every prior BQ item's `npx expo export` verification. Worked around for this testing
session only (never in shipped code) by launching the test Chromium with `--disable-web-security` — a
browser flag, not a backend change.
**Revisit if:** a web deployment target is ever decided for real (would need a real, scoped `allow_origins`
list, not a wildcard) — that would be its own new decision, not implied by this note. Also relevant to any
*future* browser-based verification pass — same workaround applies, documented here so it isn't
re-discovered from scratch.

---

## Structural gaps — need a design pass, not just a field

### `baseline.dependents` / `baseline.emergency_fund_months` missing from the teaching engine
**Traces to:** BQ-023, `backend/app/services/baseline.py`. `SYSTEM_PROMPT_v0_8_runnable.md` §4 documents
both fields as part of `baseline`; neither has a backing field anywhere in the schema, so both are omitted
from every `/chat` call. The teaching engine is running on a baseline structurally thinner than what it was
written to expect.
**Revisit:** needs its own schema decision (new fields on `Income`? A new small profile object?) — not
something to add on spec, same hard-stop-4 territory D-065/D-066 were escalated under.

---

## Deferred by design — a real evidence-based unpark condition already exists

### Auto-detection for the comparison-view trigger (Haiku classifier)
**Traces to:** D-067. User-triggered ("Compare paths") shipped for v1; the Haiku-classifier path (most
architecturally "right" of the four candidates considered) was deferred, not rejected.
**Revisit if:** real usage shows a genuine pattern of users asking decision-shaped questions in Chat
without using the explicit trigger — not elapsed time, not a hunch. (D-067's own unpark condition,
restated here so it's findable without opening the decision file.)

### Self-reported tax bracket for a fuller tax-saving figure
**Traces to:** the BRIEF-016 design conversation (04-Aug-2026 session). Considered as a way to produce an
actual rupee tax-savings estimate without maintaining a slab table — rejected as the *first* version
because it relies on a user-supplied number we can't sanity-check, for a segment plausibly less likely to
know their own bracket precisely. Not ruled out permanently.
**Revisit if:** real usage shows the room-only figure isn't satisfying what users actually came for.

---

## Product-philosophy items — not a technical gap, worth a deliberate look later

### Engagement/streak/reward layer (D-060/D-061) — fit, not just compliance
**Traces to:** D-060, D-061, BQ-029/030/031. The compliance boundary (never react to real financial data)
has held in every review this session. That's not the same question as whether the mechanic itself is
serving the product's own "teach, don't hype" register once real users are on it — a deliberate,
evidence-open choice made with real tradeoffs named at the time (D-060's own write-up is explicit about
this), not something to silently re-litigate, but worth a real look once usage data exists.
**Revisit when:** real users exist — is app-open driven by curiosity about their finances or by streak
pressure? Neither this file nor the original decision can answer that without live data.

---

## How to use this file
- **Before starting a new BQ item that touches one of these areas, check here first** — a "disclosed
  limitation" might already flag exactly the edge case you're about to hit.
- **When a revisit condition is met, don't edit this file in place** — open the real decision/build
  process (a new BRIEF/decision if it's Tier 2/3, straight to BUILD_QUEUE if it's mechanical), then remove
  the entry here once it's actually resolved.
- **New "disclosed, not solved" items from future sessions belong here too** — same discipline, not just
  left as a sentence inside a DONE entry.
