# FinTutor Build-Home Operating Rules

You are Claude Code, working in the **build-home** for FinTutor — a mobile app that
teaches personal finance from first principles, never advises. This repo is one of
two homes:

- **Laptop (here) = build.** Code, folders, git.
- **Claude Project (separate, not accessible to you) = think.** Strategy, product
  decisions, compliance stance, roadmap.

You do not have access to the Claude Project. If something requires a decision that
belongs there, **stop and ask the owner** — do not guess, do not proceed, do not
invent an answer to keep moving.

## Before doing anything in a session

1. Read `PROJECT_SPEC.md` (root) — this is the single source of truth. Pay attention
   to Section 8 (open decisions) and the change log at the bottom.
2. Read `docs/DECISION_LOG.md` — skim recent entries so you don't re-litigate a
   settled decision or contradict one.
   2b. Read docs/BUILD_QUEUE.md — this is your task list. Pick ONE item from READY. Do not start anything in BLOCKED, and do not invent a task from PROJECT_SPEC.md §8 that isn't in the queue.
3. Read `docs/DECISION_PROTOCOL.md` if the task is anything other than pure
   mechanical implementation — it defines what you're allowed to decide yourself
   (Tier 1) vs. what must be escalated (Tier 2/3).
4. Confirm the ONE bounded task for this session with the owner before writing code.
   Do not expand scope mid-session even if a related fix seems obvious — flag it
   instead.

## File permissions — read this before editing anything

**Never edit these — thinking-home governs them, not you:**
- `PROJECT_GOVERNANCE.md`
- `docs/DECISION_PROTOCOL.md`
- `HOW_TO_RUN_THIS_PROJECT.md`

If a task seems to require changing one of these, that itself is the signal to stop
and escalate — do not edit around the problem.

**Append-only, narrow lane:**
- `docs/DECISION_LOG.md` — you may append a new entry ONLY for a decision that is
  clearly Tier 1 (bounded, reversible, contained entirely within this build session,
  doesn't touch money-logic, doesn't touch the teach-not-advise line, doesn't grow
  MVP scope). Never edit or delete existing entries. If you're unsure whether
  something is Tier 1, treat it as not-Tier-1 and ask instead.
- `PROJECT_SPEC.md` — you may propose an edit (e.g. checking off a Section 8 item
  that's now genuinely done) but do not silently rewrite it. State the proposed
  change and why, get confirmation, then apply it.

**Reference material — read, don't rewrite in the course of a build task:**
- `docs/prompts/*` (system prompts)
- `docs/fixtures/*` (test fixtures)
- `docs/BRIEF-*.md`, `docs/PHASE1_RUN*_RESULTS.md`, `docs/TEST_PROTOCOL.md`

If a session's explicit, stated task is to edit one of these, that's fine — the
constraint is against incidental rewrites, not against ever touching them.

**Fully yours to build in:**
- `app/`, `backend/`, `docs/sessions/`, new entries in `docs/decisions/`

## Hard stops — always escalate to the owner, never decide yourself

Per `docs/DECISION_PROTOCOL.md`, any of the following means STOP and ask, don't act:
- Anything touching money movement, calculations users rely on, or financial data
- Anything with legal, tax, or regulatory shape
- Anything that contradicts a standing principle (e.g. "teach never advise," "no
  product/security names ever")
- Anything low-reversibility (schema changes after data exists, swapping a core
  dependency, etc.)
- Anything that grows MVP scope, even a little
- Introducing a new library, service, or architectural pattern that wasn't already
  decided — this is a decision, not an implementation detail, and it belongs in
  `docs/decisions/` + escalation, not silently in your code

## End of every session

1. Write `docs/sessions/YYYY-MM-DD.md` — a few lines: what changed, what's next.
2. If `PROJECT_SPEC.md` or `docs/DECISION_LOG.md` changed, say so explicitly to the
   owner — these need to be manually re-uploaded to the Claude Project to stay in
   sync. You cannot do this step; only the owner can.
3. Commit with a clear message. Do not leave uncommitted work at session end.

## What "done" means

Code runs + the owner understands at a high level what changed + it's committed to
git + the session log (and spec, if relevant) reflects it. If any of those four is
missing, the task is not done.
