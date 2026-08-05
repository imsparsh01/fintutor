# D-033 — Two homes retired: single unified home (Cowork/Claude Code) replaces laptop=build / Claude Project=think
- **Tier:** 3 — contradicts/reshapes a standing principle (the orientation split itself, inherited into
  PROJECT_GOVERNANCE.md's "Laptop = build. Project = think.") and is low-reversibility in the sense that it
  changes how every future session is structured. Owner decision, made directly in conversation, not
  deliberated through the four lenses (no Compliance/Product/Technical/Cost-and-Scope tension here — this is
  a pure process/infrastructure call).
- **Interprets/retires:** the orientation block in PROJECT_SPEC.md §0 (laptop/Claude Project split), and the
  "two homes" framing throughout PROJECT_GOVERNANCE.md and CLAUDE.md. D-017's "known limitation" (Project
  files are read-only from inside the Project; sync is a manual download/upload ritual) is the specific
  constraint being retired — it no longer holds.
- **What changed:** the owner moved from (a) a separate Claude Project holding PROJECT_SPEC.md,
  DECISION_LOG.md, DECISION_PROTOCOL.md, PROJECT_GOVERNANCE.md as read-only Project knowledge, manually
  synced with the laptop repo, to (b) Cowork pointed directly at this same repo, meaning every governance
  file and every build file live in one place, readable and writable by the same session. The technical wall
  that made "laptop = build, Project = think" enforceable by access alone is gone.
- **Decision:** Adopt a single unified home. One repo, one tool, covering both build work and strategy/
  compliance/decision work. The discipline the two-home split protected — bounded, mechanical execution kept
  separate from deliberate, slow decision-making on money, compliance, and irreversible calls — is preserved,
  but now self-enforced via the tiered decision protocol (DECISION_PROTOCOL.md) and CLAUDE.md's
  file-permission lanes, rather than via a hard technical access boundary.
- **What this changes downstream (mechanical consequences of this entry, not separate decisions):**
  1. PROJECT_SPEC.md's ORIENTATION block rewritten to describe the single-home model.
  2. CLAUDE.md: "two homes" framing removed; the "Never edit — thinking-home governs, not you" file lane
     (PROJECT_GOVERNANCE.md, DECISION_PROTOCOL.md, HOW_TO_RUN_THIS_PROJECT.md) is reframed as
     "deliberate-only — requires an explicit owner-confirmed decision before editing" rather than "not
     accessible to you," since it is now technically accessible; the guardrail is procedural, not physical.
     The end-of-session "re-upload to the Project" step is dropped (nothing to re-upload).
  3. PROJECT_GOVERNANCE.md: "operating charter for the Claude Project" framing retired; content that was
     Project-specific (the sync-keeping section) removed; decision discipline, anti-patterns, and standing
     principles carried forward unchanged — that content was never actually about which tool runs it.
  4. HOW_TO_RUN_THIS_PROJECT.md, README.md, AGENTS.md: two-home references removed for consistency.
- **Why now:** the owner is currently on Cowork pointed at this folder, which already has direct read/write
  access to every file that used to require the sync ritual — continuing to describe a two-home world in the
  governing docs would be actively misleading about what's technically true, and would leave the file
  permission lanes resting on a claim ("you do not have access to the Project") that is no longer accurate.
- **Considered and rejected:** (a) keeping the same tool but treating each session as an explicit "mode"
  (thinking vs. building) without touching the docs — rejected because the docs would still describe a
  nonexistent access boundary, which is worse than updating them; (b) keeping a real separate Claude Project
  for Tier 3 decisions only, as a deliberate extra-friction checkpoint — rejected by the owner in favor of
  full consolidation.
- **Guardrail carried forward (this is the point of the entry):** collapsing the technical wall does not
  collapse the discipline. PROJECT_GOVERNANCE.md, DECISION_PROTOCOL.md, HOW_TO_RUN_THIS_PROJECT.md, and
  CLAUDE.md itself remain edit-only-with-an-explicit-owner-confirmed-decision — not because a session
  physically cannot reach them, but because reaching them is declared out-of-bounds for ordinary build/think
  work by this entry. The hard-stop list in CLAUDE.md (money, legal/regulatory, standing principles,
  low-reversibility, MVP scope growth, new architecture) is unchanged and still requires stopping and asking
  regardless of which tool is running.
- **Reversibility:** Medium — nothing here is data or code; it's process documents. Reverting to a two-home
  model (e.g. a real separate Project again) is a redo of this same class of edit, not a data migration.
- **Rule extracted:** a discipline enforced by a technical boundary should be re-stated as a self-enforced
  rule the moment the boundary disappears, rather than left implicit — an access limitation that quietly
  stops being true is the kind of drift the append-only log exists to catch.
- **Date:** 02-Aug-2026
