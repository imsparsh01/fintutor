# D-097 — Consolidated totals expose explicit valuation metadata

- **Tier:** 3, owner-approved directly in conversation
- **Decision:** `/consolidated` now returns per-family holding counts, valued counts, excluded counts, and a status (`empty`, `valued`, `unvalued`, `mixed`, or `excluded`) alongside the existing totals. The backend owns classification; the client never infers financial meaning from a numeric zero.
- **Display:** empty families show `—`; valued and mixed families show the numeric total; unvalued and fully excluded families show `Not valued yet`.
- **Scope:** term insurance and ESOP are counted as tracked but excluded from current-value totals. No valuation formula is introduced for either.
- **Why:** A numeric zero alone cannot distinguish a genuine zero from absent, unvalued, or intentionally excluded holdings. Explicit metadata preserves financial meaning and keeps interpretation out of the presentation layer.
- **Reversibility:** API response extension; no database migration.
- **Date:** 10-Aug-2026
