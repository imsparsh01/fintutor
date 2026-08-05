# D-014 — Build execution subagents LATER, as a parked PM task — not before the teaching core is validated
- **Decision:** The four D-012 design problems (trigger logic, micro-capture flow, onboarding redesign,
  manual fallback UI) will be *decided by the user* and *executed by Claude Code subagents*. But building
  those subagents is explicitly PARKED as a project-management-level task, to be picked up only after (a)
  the Phase 1 teaching-engine prototype (D-006) is validated, and (b) the relevant design decisions have
  actually been made. Division of labour is fixed: the user makes the design/product-judgment calls;
  subagents execute bounded, already-decided build tasks (and may act as read-only researchers feeding the
  user's decisions). Subagents do NOT make the three product-defining design decisions.
- **Why:** An execution agent is only as valuable as the decision it executes and the core it builds against.
  Right now neither exists — the three design decisions are unmade and the teaching engine is unproven.
  Building agent scaffolding first would automate around an empty core (the "tooling as procrastination"
  anti-pattern in the governance doc). The compounding payoff of agents is real but it accelerates
  *execution throughput*, which has no validated target yet — so it is deliberately second, not first.
  Handing the three design decisions to an agent is also rejected on principle: those are product-judgment
  calls about how FinTutor should feel and where the "teach not advise" line sits — the exact reason the
  thinking-home (Project) exists separately from the build-home (laptop).
- **Reversibility:** High — this is a sequencing/PM call, not an architectural one. Can be pulled forward the
  moment Phase 1 is validated and a design decision is ready to execute.
- **Date:** 23-Jul-2026
