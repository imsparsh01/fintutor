# D-098 — Recurring cadence is explicit before budget provenance is shown

- **Tier:** 3, owner-approved directly in conversation
- **Decision:** Expand recurring holding data with explicit `sip_frequency` and `emi_frequency` fields. Budget normalization includes EMI, SIP, and insurance premiums only when an amount and cadence are both captured; missing cadence is not silently treated as monthly. `/budget` returns generic, read-only recurring-outflow provenance rows with the original amount, frequency, source field, and normalized monthly amount. EPF contributions remain outside recurring outflows until separately decided.
- **Why:** The mockup's provenance rows are only trustworthy when cadence is known. Explicit frequency prevents hidden monthly assumptions and keeps recurring financial logic in the backend.
- **Compatibility:** Existing holdings without a cadence remain tracked but are omitted from the computed recurring total until the cadence is added or edited.
- **Reversibility:** JSON characteristics/API response extension; no database migration.
- **Date:** 10-Aug-2026
