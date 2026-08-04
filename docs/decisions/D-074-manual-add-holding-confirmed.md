# D-074 — BRIEF-018 confirmed: manual add-holding UI, auto-generated alias, family-scoped picker

- **Tier:** 2, owner-confirmed. BRIEF-018's own trigger checklist found no hard trigger fires (data
  capture, not a calculation; executes D-012's already-decided manual-fallback commitment rather than
  reinterpreting it; no schema change; completes already-committed scope, doesn't grow it). This entry
  records the owner's sign-off on BRIEF-018's Path A after a real exchange (owner asked for a lean before
  confirming), not a rubber stamp.
- **Decision:** Path A adopted, plus its two follow-on implementation calls:
  1. **The create form never has an alias field.** `POST /holdings`'s `alias` becomes optional; when
     omitted, the backend generates the next unused `"{Humanized Product Type}-{n}"` label scoped to that
     exact `product_type` for that user (e.g., `"Home Loan-1"`, `"Home Loan-2"`) — not the broader family,
     for a more specific fallback label. Existing `(user_id, alias)` uniqueness + 409 handling is the
     safety net if generation ever collides; no new error path needed.
  2. **The product-type picker in the create flow is scoped to the current family tab** (`familyTypes`,
     already threaded through `HoldingsList`) rather than `HoldingEditModal`'s existing unconstrained
     `ALL_PRODUCT_TYPES` list, which stays unconstrained for recategorizing an *existing* holding
     (BQ-027/D-059 unaffected).
  3. **`HoldingEditModal` is extended, not duplicated** — a null `holding` prop signals create mode: no
     alias field, no delete button, `POST` instead of `PATCH`, title "Add holding." Reuses BQ-028's
     already-built progressive-capture behavior (a blank characteristics field is omitted, not required)
     for free.
- **Why A over B, restated from the brief:** aliases were always meant to be backend-internal (D-010/D-011)
  — surfacing the concept to a brand-new user at their highest-friction touchpoint contradicts that intent,
  and Path B's duplicate-alias collision (two loans, both instinctively named "Loan 1") is a real,
  foreseeable first-time-user failure, not hypothetical. Path A's cost is small and one-directional (new
  generation logic only, no schema change).
- **What this does NOT cover:** the AI-surfaced creation path (`/chat` has no tool-calling to create a
  holding from conversation) remains entirely separate, larger, untouched work — D-012's primary path, not
  addressed here. BRIEF-018 scoped this explicitly; restated so it isn't assumed solved by this entry.
- **Reversibility:** High — additive backend field (optional `alias`), new frontend form mode reusing an
  existing component. No migration, no change to existing edit/delete/recategorize behavior.
- **Feeds:** `backend/app/services/holdings.py` (`create_holding` + alias generation),
  `backend/app/main.py` (`HoldingCreate.alias` optional), `app/lib/holdings.ts` (`createHolding`),
  `app/components/HoldingEditModal.tsx` (create mode), `app/components/HoldingsList.tsx` (the "+ Add"
  entry point).
- **Date:** 04-Aug-2026
