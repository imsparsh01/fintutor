# D-046 — Decision log modularization: new decisions get their own file, going forward only (owner-confirmed)

- **Tier:** 1 — process/PM tooling, no trigger fires (same category as D-007/D-014/D-039/D-040).
  Owner-confirmed in conversation during the process review.
- **Decision:** Starting with D-045, a full decision write-up (Tier, Decision, Why, Reversibility,
  Date) lives in its own file at `docs/decisions/D-0NN-slug.md`. `docs/DECISION_LOG.md` gets a
  short index entry per decision instead — title plus a one-line summary and a link to the full
  file. **D-001 through D-044 are untouched** — this applies going forward only; the log's own
  rule ("never edit or delete existing entries") is not violated by this change.
- **Why:** `docs/DECISION_LOG.md` had grown to ~1,400 lines / 123KB, read in full at the start of
  most sessions per CLAUDE.md's "before doing anything" checklist — a real, growing token cost
  that compounds with every future decision. `docs/decisions/` already existed for exactly this
  purpose (named in CLAUDE.md's "fully yours to build in" tier) but held nothing but a
  `.gitkeep` — the modularization was already the intended design, just never executed. Doing it
  retroactively (splitting D-001–044 into files) would mean editing settled entries, which the
  log's own rule forbids; doing it going-forward-only avoids that entirely.
- **Reversibility:** High — process/format only, no code or data depends on it.
- **Date:** 03-Aug-2026
