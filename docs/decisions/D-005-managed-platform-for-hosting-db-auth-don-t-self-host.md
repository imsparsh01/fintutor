# D-005 — Managed platform for hosting + DB + auth (don't self-host, don't roll own auth)
- **Decision:** Use a managed backend platform bundling Postgres + auth + hosting. Specific provider TBD.
- **Why:** Biggest effort-saver for a solo bootstrapped MVP. Rolling your own auth is a security liability
  and time sink. Postgres chosen as the DB.
- **Reversibility:** Medium (migration is work but possible). Provider choice still open.
- **Date:** 22-Jul-2026
