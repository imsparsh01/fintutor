# D-012 — Zero-friction data capture: AI-surfaced, not menu-driven; product-type taxonomy is a backend schema, not a UI category list
- **Decision:** The product-type list (loan sub-types, investment sub-types, insurance sub-types, etc.) is
  an internal backend taxonomy used by the teaching engine and the alias/characteristics schema (D-010,
  D-011, D-013) — it is NOT a set of "Add X" buttons the user chooses from. The primary way a holding enters
  the user's baseline is: a teaching moment (triggered by whatever the user is already doing — a loan
  conversation, a reminder, the portfolio view) surfaces a *relevant* product type organically (e.g. a
  loan-related teaching moment surfaces term insurance as a concept; if the user shows interest, a short
  guided micro-capture follows in that same flow, not a redirect to a form). This applies to ALL product
  types for MVP, not just one type as a pilot — it is core UX, not a later-phase add-on. A manual "corner"
  path (a plain add path, not AI-triggered) also exists in MVP as a fallback/escape hatch for users who want
  to log a holding the AI hasn't organically surfaced yet — both paths are MVP.
- **Why:** The stated philosophy is "learn on the go, triggered by the user's real actions" (spec section 2).
  A menu of "Add Investment / Add Insurance / Add Loan" buttons the user has to seek out contradicts that
  philosophy for every type, not just insurance. The generalization (raised by user, 23-Jul-2026): the app
  minimizes explicit user input everywhere — the AI proactively identifies relevant product categories and
  moments, and only asks for structured details once the user has shown organic interest. A manual fallback
  is kept because a user with an existing holding shouldn't be blocked from recording it while waiting for
  the AI to surface it.
- **Consequences / new work this creates (not yet designed):**
  1. **Trigger logic** — a mechanism (rule-based and/or model-proposed) deciding when a conversation is a
     good moment to surface a product type the user doesn't yet have. Undesigned.
  2. **Micro-capture flow** — when the user shows interest, a lightweight, *progressive* way to capture just
     enough fields to teach now, without demanding the full characteristic schema up front. Undesigned.
  3. **Onboarding re-think** — section 4's onboarding step ("capture income, loans, investments, goals") was
     written as an implicit form-fill. If AI-surfacing is core UX, onboarding is the FIRST instance of this
     pattern, not an exception. Needs its own design pass. Flagged, not resolved.
  4. **Manual fallback UI** — still needs a real, minimal design even though it's secondary to the AI path.
- **Reversibility:** Medium. The backend taxonomy/schema (D-011, D-013) is unaffected — this decision changes
  only *how* the taxonomy gets populated (trigger + capture UX), not *what* is captured. Falling back to a
  manual-only MVP wouldn't touch the data model, but it would reverse a philosophy commitment — treat as a
  considered reversal, not a quick toggle.
- **Still open:** all four consequences above are undesigned. This entry captures the decision and its scope,
  not the mechanism.
- **Date:** 23-Jul-2026
