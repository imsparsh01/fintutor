# BRIEF-012 — MVP-fit prioritization of BRIEF-011's mapped solutions

> Findings and a prioritization judgment, not a Tier-3 decision — none of this fires a hard-stop trigger
> (no scope increase beyond what's already committed, no money-calculation, no compliance-line question
> beyond what BRIEF-011's Compliance-lens pass already cleared). Applied directly by the deciding agent,
> per `DECISION_PROTOCOL.md`'s own design for its evaluation lenses (Product, Technical, Cost-and-Scope
> here; Compliance already run in BRIEF-011). Two items flagged rather than defaulted — not decided here.
> **Date raised:** 03-Aug-2026, same session as D-053 through D-057.

---

## Must-have — required for all three founding profiles to get real MVP coverage

| Solution | Serves | Technical note |
|---|---|---|
| EPF employer-match mechanism explainer | Shared | Pure calc on stated salary + static content. No new architecture. |
| Consolidated-view completeness nudge | Shared | This *is* D-012's core AI-surfacing mechanism — foundational, not optional. |
| EMI/premium reminders | Shared | Already locked in `PROJECT_SPEC.md` §4 item 7 — not new scope. |
| Inline jargon tap-to-explain | Shared | Low complexity; static-definition V1 is a viable cheaper fallback if timeline pressure hits (see Cost-and-Scope below). |
| Fresh-starters sequencing explainer | Fresh starters | Carries BRIEF-011's compliance CONCERN — must-have, but build-constrained on copy discipline. |
| Reactive-dabblers reflective-question flow | Reactive dabblers | Fits the existing stateless-per-call architecture (D-001) — a single-response pattern, not session memory (D-022 stays parked). No new architecture needed. |
| Habit-formers category-gap surfacing | Habit-formers | Same shape as D-037's fix — names the gap concretely, doesn't prescribe the fill. |
| Loan-vs-invest multi-path modeling + breakeven calculator | Shared, esp. settled early-career | Named in `PROJECT_SPEC.md` §2 itself as the flagship compliant pattern — core, not optional. Calc complexity is comparable to `compute_budget()` (BQ-010) — low technical risk. |
| Tax-saving instrument multi-path modeling | Settled early-career | **Checked against the real backend, not assumed:** `Holding.characteristics` is JSONB with no fixed schema (D-044) — tagging an instrument as tax-relevant is a content-design question, not a database migration. No technical blocker. |
| "Number to watch" closing device | Shared, all decision-shaped moments | A content-generation pattern inside the existing teaching-engine output — low technical complexity. |

## Deferred — already known to be blocked, not re-litigated here

- **ESOP exercise-timing modeling** — blocked on ESOP's characteristics schema, which D-055 explicitly
  left undesigned. Queued as its own follow-on task, not this session's to pick up silently.
- **Variable-income budgeting (startup/gig)** — blocked on the owner's pending hard-stop decision
  (BRIEF-011). Not designed further until that's resolved.

## Carried forward as a design requirement, not a standalone build item

- **Onboarding value-ratchet pattern** (each onboarding step produces a saved, visible output) — this is
  an input requirement for the still-undesigned onboarding mechanism (`PROJECT_SPEC.md` §4 item 2:
  "exact onboarding mechanism still to be designed"), not a separate feature to build now. Recorded here
  so it isn't lost by the time that design task starts.

---

## Flagged, not decided — two items that could be scope questions

**"Your numbers changed" reminder nudges** (Business lens, BRIEF-011). `PROJECT_SPEC.md` §4 item 7 locks
reminders to "EMI dates, credit-card payment dates" specifically — a broader "any numeric change" trigger
type is arguably a new capability beyond that literal scope, which is exactly the shape of thing
`CLAUDE.md`'s hard-stop list means by "no de-minimis exception" on scope increases. Not defaulted to
must-have or cut — flagged for the owner if/when this comes up for real build.

**Multi-path side-by-side comparison UI.** Already flagged as a fork in BRIEF-011 — every decision-shaped
solution above depends on this screen pattern existing, but it hasn't been designed. Not a blocker to
finishing solution-mapping/prioritization work, but it means loan-vs-invest, tax-saving, and (eventually)
ESOP-timing modeling can't actually ship until the screens/PRD stage designs it. Noted so it isn't
assumed solved by the time that stage starts.

---

## Cost-and-Scope lens (§3, narrow definition — owner attention and maintenance burden, not "does this add
scope," which trigger 5 already governs)

Ten distinct must-have teaching-content types across three profiles is real build surface for a solo-owner
project — `CEO_DASHBOARD.md` already names "solo-owner bottleneck" as a standing risk. Nothing above was
cut on this basis (D-054 committed to serving all three profiles, and un-committing from that isn't this
brief's call to make), but worth naming plainly: if build velocity becomes a real constraint later, the
jargon-explainer's static-definition fallback and the sequencing-explainer's copy-review overhead are the
two cheapest levers to simplify first, without touching profile coverage itself.

---

## Not yet decided

This is prioritization, not a PRD. Next sequenced piece is turning the must-have list into an actual PRD
+ screen/navigation shape — which is where the comparison-UI fork gets resolved for real. The two flagged
scope questions above and the two deferred items stay open until the owner weighs in.
