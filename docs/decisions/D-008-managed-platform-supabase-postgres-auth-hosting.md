# D-008 — Managed platform: Supabase (Postgres + auth + hosting)
- **Decision:** Use Supabase for the managed backend platform. Project created: `fintutor-dev`, region
  `ap-southeast-1` (Singapore), compute tier Nano. Status confirmed Healthy.
- **Why:** Resolves the D-005 open item. Supabase bundles Postgres + auth in one managed service, matching
  the "don't self-host, don't roll own auth" decision. Singapore region chosen (likely lowest latency for
  an India-based user base among available options).
- **Reversibility:** Medium — same as D-005 (migration is work but possible). Locking the specific provider
  now; region/compute tier can be revisited before scaling past MVP.
- **Date:** 23-Jul-2026
