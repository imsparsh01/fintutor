# D-042 — Dashboard refresh moved from automatic-every-session to on-demand only (owner-confirmed)
- **Tier:** owner-decided directly in conversation — logged as a full entry rather than a one-liner because
  it edits CLAUDE.md (deliberate-only), same escalation pattern as D-033/D-040.
- **Supersedes:** D-040 — in respect of the automatic-every-session refresh cadence only. The rest of D-040
  stands unchanged: `docs/CEO_DASHBOARD.html` remains a real, committed, double-clickable local file, and
  `docs/CEO_DASHBOARD.md` remains the source-of-truth data file for it.
- **Decision:** `docs/CEO_DASHBOARD.md` / `.html` are refreshed **on demand** — whenever the owner asks for
  a status summary, CEO dashboard, or "something visual" — not automatically as a step in every session's
  wrap-up. CLAUDE.md's "End of every session" checklist reverts to its pre-D-040 three steps; the dashboard
  step is removed.
- **Why:** the owner judged the every-session refresh as more overhead than it returns — the dashboard's
  job is served fine by refreshing only when it's actually going to be looked at.
- **Reversibility:** High — process text only.
- **Date:** 03-Aug-2026
