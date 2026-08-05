# D-040 — Dashboard refresh added to the mandatory end-of-session checklist; local HTML snapshot added (owner-confirmed in conversation)
- **Tier:** 1 — process/PM tooling, no trigger fires (same category as D-007/D-014/D-039). Logged as a full
  entry rather than a bare one-liner only because it authorizes an edit to CLAUDE.md, which is deliberate-
  only per the file-permission rules — the owner's explicit "yes" in conversation is the decision this
  entry documents, following the same before-not-around pattern as D-033.
- **Decision:** (1) `docs/CEO_DASHBOARD.md` is refreshed at the end of every session, added as step 2 of
  CLAUDE.md's "End of every session" checklist. (2) A static rendered snapshot, `docs/CEO_DASHBOARD.html`,
  is regenerated alongside it each time — a real file in the repo the owner can open directly (double-click
  → opens in browser) without asking Claude or going through claude.ai's Artifact hosting. It is a snapshot
  as of last regeneration, not live; the masthead's "last synced" date is the freshness signal.
- **Why:** the owner wants a project-status view they can reach on their own, on demand, without a chat
  round-trip — a plain markdown file doesn't render visually, and the previously-published Artifact lives
  on claude.ai rather than in the folder the owner actually opens. A committed static HTML file solves both.
- **Reversibility:** High — process text + a regenerated file, nothing else depends on it.
- **Date:** 03-Aug-2026
