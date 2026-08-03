# D-057 — Primary persona defined; flagship first flow chosen ("where does my salary go?")

- **Tier:** Product-judgment, owner-decided in conversation. Triggered by the owner directly
  challenging the project's direction: heavy build/governance activity with zero shipped product
  surface, and no formal product-definition work (personas, segmentation, prioritization) ever done —
  `PROJECT_SPEC.md` §3 had stood as a one-paragraph placeholder ("anyone earning... not defined by age;
  defined by intent") since v0.1. Ran a lightweight CIRCLES-style pass in conversation rather than
  fabricating personas from nothing.
- **Decision:**
  1. **Primary persona (v1):** a fresh graduate, 21–24, 2–3 months into their first salaried job, tier
     1/2/3 India city. Well-educated in their field, financially illiterate, actively intimidated by
     jargon/tax/compliance language. Sparse financial profile: salary account, maybe an unexplained
     employer EPF deduction, no real investments, minimal or no debt. Needs a guide that explains *why*
     without judging or overwhelming — not a portfolio optimizer. Explicitly logged as founder-intuition
     driven, not user-research-validated (owner confirmed directly: "this is generally a from-scratch
     hypothesis right now").
  2. **Flagship first flow:** "where does my salary go?" — a first-paycheck budgeting reality check
     (capture income + fixed deductions, show what's left, teach the mechanism). Chosen over the
     alternative (EPF/compounding/SIP teaching, more emotionally on-target for the persona's stated fear
     but blocked on D-012's still-undesigned AI-surfacing/capture flow) because it reuses
     `compute_budget()` (D-038/BQ-010), which is already built and tested — the fastest path from "no
     product exists" to something real and demoable.
- **Why now, and why this shape:** the owner's challenge was itself the signal — 56 decisions logged,
  a fully tested/CI'd backend, and an app skeleton, but nothing a real user could recognize as the
  product, and no persona to build toward. Doing the CIRCLES "Identify the customer" and "Cut through
  prioritization" steps in conversation (rather than either fabricating market research or silently
  picking a flow myself) surfaced the actual founder motivation and a concrete, buildable target.
- **Finding surfaced, logged separately in `PROJECT_SPEC.md` §8:** all six Phase 1 test runs (10/10
  findings resolved) validated the teaching engine against `FIXTURE_user_01` — a mid-career household
  profile (home loan, spouse, child, five holdings) — not anything resembling this persona's sparse
  profile. The compliance rules tested are likely persona-independent, but this has never actually been
  checked against a profile this thin. Not fixed here — flagged as a §8 item, not urgent, but should
  happen before/alongside building the flagship flow.
- **What this does NOT decide:** the actual UI/flow design for "where does my salary go?", the
  AI-surfacing trigger logic (D-012, still undesigned), or anything about Decision 2 (per-item
  management). This entry settles *who* and *what's first*, not *how*.
- **Reversibility:** High — this is a documented hypothesis (the entry says so explicitly), not
  irreversible product/schema work. Revisit once the flagship flow has real users.
- **Date:** 04-Aug-2026
