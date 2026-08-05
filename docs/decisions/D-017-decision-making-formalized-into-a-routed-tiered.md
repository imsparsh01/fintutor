# D-017 — Decision-making formalized into a routed, tiered protocol
- **Decision:** FinTutor's decision-making moves from ad-hoc (owner decides everything in conversation) to a
  routed system: every decision is classified by type, assigned a tier, and either auto-decided, deliberated
  through defined evaluation lenses, or escalated to the owner. Mechanism lives in DECISION_PROTOCOL.md.
  Two framing constraints are part of the decision itself: (a) personas are evaluation **lenses**, not
  simulated org roles — the value is the angle of scrutiny, not the job title; (b) there is deliberately
  **no "CEO lens"** — that is the owner, and Tier 3 is what protects it. A system that simulates the owner's
  judgment defeats the purpose.
- **Why:** Decision volume is already the bottleneck — 16 decisions in two days, every one routed through the
  owner regardless of whether it needed to be. Retroactive classification (see DECISION_PROTOCOL.md §1) shows
  7 of 16 genuinely required owner judgment; the other 9 were reversible technical calls, sequencing logic, or
  mechanical application of a rule the owner had already set. Formalizing the routing keeps owner attention on
  what actually needs it (money, law, philosophy, irreversibility). Extends D-014's division of labour (owner
  decides, agents execute) upward from build tasks to design decisions.
- **Scalability mechanism (the "living files" requirement):** (a) the decision log stays **append-only** — new
  information creates a new superseding entry, never an edit that erases; (b) DECISION_PROTOCOL.md carries a
  **precedent section** where novel decision types are appended as they occur, so the taxonomy grows by
  accretion rather than redesign; (c) any decision the protocol **cannot classify escalates to Tier 3
  automatically** — unknown types fail safe UPWARD, never sideways into a guess.
- **Known limitation (recorded, not hidden):** Project knowledge files are read-only from inside the Project.
  "Live documents" means the manual download → edit → re-upload sync ritual already defined in
  PROJECT_GOVERNANCE.md, applied with discipline. Nothing here updates itself. Any design that assumes
  self-updating files is wrong.
- **Reversibility:** High — process/PM decision, abandonable at any point by reverting to
  owner-decides-everything. No code or data depends on it.
- **Scope note:** This is governance machinery, not product. Per D-014's own reasoning it risks the
  "tooling as procrastination" anti-pattern named in PROJECT_GOVERNANCE.md. Accepted with a hard cap:
  the protocol is ONE document written across a bounded set of sessions, then back to Phase 1 (D-006).
  Distinguishing argument vs D-014: this reduces owner load starting immediately, whereas subagents only
  pay off once there is a validated core to build against.
- **Date:** 23-Jul-2026
