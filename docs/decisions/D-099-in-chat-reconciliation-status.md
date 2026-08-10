# D-099 — In-chat reconciliation status after explicit holding confirmation

- **Tier:** 3, owner-approved directly in conversation
- **Decision:** After the user explicitly confirms a holding proposal, the write response includes a structured reconciliation status. Chat renders a compact status card for `new`, `updated`, or `contradiction`; no reconciliation history is persisted and no write occurs before confirmation.
- **Initial implementation:** Confirmed capture proposals are classified as `new` and return their product type plus changed fields. The response contract reserves `updated` and `contradiction` for future confirmed update paths; the UI already has distinct copy for those statuses.
- **Why:** Makes the living baseline legible at the moment it changes without adding a new screen, inbox, or retention policy.
- **Reversibility:** Response/UI extension; no new persistence model.
- **Date:** 10-Aug-2026
