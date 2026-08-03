# D-045 — AGENTS.md collapsed to a symlink of CLAUDE.md (owner-confirmed)

- **Tier:** owner-confirmed directly in conversation — logged as a full entry because it edits
  `CLAUDE.md` and `AGENTS.md`, both deliberate-only, same escalation pattern as D-033/D-040/D-042.
- **Decision:** `AGENTS.md` no longer holds independent prose. It becomes a git-tracked symlink
  (`AGENTS.md -> CLAUDE.md`), so Codex and Claude Code always read byte-identical operating rules
  from one canonical file. There is no second copy to maintain and no "keep them consistent if
  either changes" instruction to remember.
- **Why:** the two-file mirror had already drifted in practice, not just in theory — `AGENTS.md`
  was missing the D-042 update (dashboard refresh moved to on-demand-only) despite CLAUDE.md
  carrying it, and the two files' own "deliberate-only" lists disagreed with each other (AGENTS.md
  listed both files; CLAUDE.md listed only itself). This was flagged as the clearest live example
  of the "context drift" inefficiency during the process review — the fix removes the mechanism
  (manual sync) rather than adding more discipline to sustain it.
- **Reversibility:** High — replacing the symlink with an independent file restores the prior
  state at any time; no data or code depends on `AGENTS.md`'s content beyond agents reading it as
  instructions.
- **Date:** 03-Aug-2026
