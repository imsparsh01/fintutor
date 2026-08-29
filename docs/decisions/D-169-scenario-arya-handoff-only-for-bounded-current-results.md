# D-169 — Scenario Arya handoff appears only for bounded current-result teaching

- **Tier:** 2.
- **Decision:** Show the secondary action “Explore the mechanism with Arya” only on a current result whose
  approved teaching handoff has a bounded mechanism prompt. Do not show it for invalid, changed/stale, capped,
  permission-loss, tax-gated or unavailable results. It opens the exact-payload confirmation required by the
  Scenario privacy contract and never asks “what should I do?”
- **Lenses:** Compliance PASS — explicit confirmation and mechanism-only prompt preserve D-009/privacy masking;
  Product PASS — Arya deepens learning rather than turning every result into a chat funnel; Technical PASS —
  existing confirmed handoff contract supports conditional display; Cost-and-scope PASS — no new model capability.
- **Why:** A simple arithmetic result does not always benefit from chat. Applicability should follow existence
  of an approved teaching mechanism, never financial magnitude or outcome.
- **Reversibility:** Conditional UI/copy only; no persistence, API, model or calculation change.
- **Date:** 29-Aug-2026
