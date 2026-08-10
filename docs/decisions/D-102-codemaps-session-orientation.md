# D-102 — Token-lean codemaps added; session-start protocol updated

**Tier:** 1 — pure documentation/tooling, no product or schema change, fully reversible.

**Decision:** Generate and maintain `docs/CODEMAPS/{architecture,backend,frontend,data}.md` as a
persistent orientation layer for every build session. Update `CLAUDE.md`'s session-start checklist
(step 2c) to read `architecture.md` always and the relevant layer codemaps for each task, and to
keep them current when a session adds new modules.

**Why:** Cold source-file reads were consuming an estimated 15–40K tokens per build session just for
orientation — reading individual files to understand what each module does. The codemaps cover the
entire codebase (48 source files, 22 API routes, 11 screens, 11 components, 20 lib files, 6 DB tables)
in ~2K tokens total, with no information loss for orientation purposes. The pattern mirrors D-081's
governance-layer rolling-window restructuring, applied to the code layer.

**Reversibility:** Fully reversible — the codemaps are additive documentation. Removing step 2c from
`CLAUDE.md` and deleting `docs/CODEMAPS/` reverts everything cleanly.

**Date:** 11-Aug-2026
