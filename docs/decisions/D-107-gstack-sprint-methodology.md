# D-107 — gstack sprint methodology adopted for all FinTutor build sessions

**Date:** 11-Aug-2026
**Tier:** 3, owner-decided directly in conversation
**Decision:** Adopt garrytan/gstack's Think → Plan → Build → Review → Test → Ship → Reflect
sprint structure as the mandatory workflow for every FinTutor build session. Install gstack
skills globally to `~/.claude/skills/gstack/`. Embed the Plan and Review/Test phases into
`CLAUDE.md`'s session checklist.

---

## What gstack is

An open-source collection of 23 Claude Code slash-command skills organised around a sprint
structure: **Think → Plan → Build → Review → Test → Ship → Reflect**. Each phase has dedicated
skills (`/plan-eng-review`, `/review`, `/qa`, etc.) that feed sequentially. The author (Garry
Tan, YC CEO) demonstrates individual-builder velocity matching traditional teams by enforcing
this structure via tooling rather than process documents alone.

## What was decided

### Adopted (now mandatory in CLAUDE.md)

| gstack phase | FinTutor implementation |
|---|---|
| **Think** | Unchanged — BUILD_QUEUE item + DECISION_PROTOCOL routing before any session starts |
| **Plan** | **New mandatory step:** `/plan-eng-review` before writing code on any non-trivial task |
| **Build** | Unchanged — execute the BUILD_QUEUE item exactly as scoped |
| **Review** | **New mandatory step:** `/review` (staff-engineer audit) before committing |
| **Test** | **New best-effort step:** `/qa` for any UI-touching change; skip if not available |
| **Ship** | Unchanged — git commit + push + fast-forward main (D-034/D-056; no PR) |
| **Reflect** | Unchanged — `docs/sessions/YYYY-MM-DD.md` session log |

### Not adopted (conflicts with standing decisions)

- **gstack's `/ship`** (opens a PR): FinTutor uses D-056's direct-merge-to-main. Skipped.
- **GBrain** (persistent knowledge base — PGLite/Supabase): would require a new infrastructure
  decision. Not adopted. FinTutor's existing auto-memory at `~/.claude/projects/` covers the
  same cross-session memory need.
- **gstack team mode** (SessionStart hook for auto-upgrade): adds complexity without proportional
  value for a single-owner project. Not adopted.

### Installation status

gstack cloned to `~/.claude/skills/gstack/` on 11-Aug-2026. The `./setup` build step was not
run because `bun` is not installed on this Windows machine. Consequence: compiled binary skills
(`/qa`, `/browse`, the browser automation suite) are unavailable. All text-based skills —
including `/plan-eng-review`, `/plan-ceo-review`, `/office-hours`, `/review`, `/retro`,
`/investigate`, `/learn` — load and work correctly from the SKILL.md files alone.

**To unlock `/qa` later:** install bun (`npm install -g bun`) and re-run
`~/.claude/skills/gstack/setup`.

## Why

**Karpathy's four failure modes**, which gstack explicitly addresses, are the four most common
ways FinTutor build sessions go sideways:

1. **Wrong assumptions** — building before the architecture is locked. `/plan-eng-review` forces
   this surface before a line of code is written.
2. **Overcomplexity** — over-engineering what could be simple. `/review` catches unnecessary
   changes and the "Boil the Ocean" search-first principle prevents reinvention.
3. **Orthogonal edits** — changes that solve the wrong problem. `/review` flags these.
4. **Imperative over declarative** — writing procedural glue where a data change would do.
   `/review` surface this.

The existing FinTutor process (BUILD_QUEUE + DECISION_PROTOCOL + session logs) already handles
Think, Ship, and Reflect well. Plan and Review were the structural gaps — ad-hoc rather than
mandatory. D-107 closes both.

## Reversibility

High. gstack skills are global Claude Code config (`~/.claude/skills/`), not project files.
Removing them doesn't change any FinTutor code. The CLAUDE.md addition can be removed by
logging a superseding decision. Low blast radius.
