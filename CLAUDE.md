# FinTutor Operating Rules

You are Claude, working in the single home for FinTutor — a mobile app that teaches
personal finance from first principles, never advises. As of **D-033 (02-Aug-2026)**
this repo is the only home: build files (`app/`, `backend/`) and the governance/
strategy files (`PROJECT_SPEC.md`, `docs/DECISION_LOG.md`, `docs/DECISION_PROTOCOL.md`,
`PROJECT_GOVERNANCE.md`) live together, and you can read and write all of them in the
same session. The old "laptop = build, Claude Project = think" split (and its manual
sync ritual) is retired — see D-033 in `docs/DECISION_LOG.md`.

Retiring the technical wall does not retire the discipline it protected. Bounded,
mechanical execution still stays separate from deliberate decisions about money,
compliance, product philosophy, and anything low-reversibility — that separation is
now **self-enforced**, by you, via the tiered decision protocol and the file
permissions below, not by an access boundary. If something requires a decision that
isn't a bounded, already-decided build task, **stop and ask the owner** — do not
guess, do not proceed, do not invent an answer to keep moving.

## Autonomous by default (D-034)

As of **D-034 (02-Aug-2026)**, you operate autonomously on file creation, editing,
and deletion anywhere in this repo, and on `git commit` + `git push` at the end of
every session — no per-action confirmation needed for routine, in-scope work. This
is a deliberate grant of trust over mechanics, not over judgment. Exactly two things
remain checkpoints, unchanged by this grant:

1. **The hard-stop list below.** Anything on it still produces a brief and waits for
   the owner's decision before you act — it does not get silently resolved just
   because file/git mechanics are hands-off now.
2. **The deliberate-only file tier below.** Editing any of those files still needs an
   explicit, owner-confirmed decision logged first, exactly as before.

If you're ever unsure whether something falls into one of those two categories,
treat it as if it does and ask — the autonomy grant only covers what's genuinely
mechanical.

## Before doing anything in a session

1. Read `PROJECT_SPEC.md` (root) — this is the single source of truth. Pay attention
   to Section 8 (open decisions) and the change log at the bottom.
2. Read `docs/DECISION_LOG.md` — skim recent entries so you don't re-litigate a
   settled decision or contradict one.
   2b. Read `docs/BUILD_QUEUE.md` if the session is a build task — this is the task
   list. Pick ONE item from READY. Do not start anything in BLOCKED, and do not
   invent a task from PROJECT_SPEC.md §8 that isn't in the queue.
3. Read `docs/DECISION_PROTOCOL.md` if the task is anything other than pure
   mechanical implementation — it defines what you're allowed to decide yourself
   (Tier 1) vs. what must be escalated (Tier 2/3).
4. Confirm the ONE bounded task or ONE strategic question for this session with the
   owner before acting. Do not expand scope mid-session even if a related fix or
   related question seems obvious — flag it instead.

## File permissions — read this before editing anything

**Deliberate-only — editing requires an explicit, owner-confirmed decision first,
never as a side effect of a build or strategy task:**
- `PROJECT_GOVERNANCE.md`
- `docs/DECISION_PROTOCOL.md`
- `HOW_TO_RUN_THIS_PROJECT.md`
- `CLAUDE.md` (this file — `AGENTS.md` is a git-tracked symlink to it as of D-045, so editing
  either name edits the same file)

These are technically editable now (there is no separate home keeping you out of
them), which is exactly why the rule has to be procedural: if a task seems to require
changing one of these, that itself is the signal to stop and get a real decision
logged first — do not edit around the problem, and do not edit it as a quiet side
effect of something else. D-033 is the model for how this should look: the decision
was made explicitly, logged in `docs/DECISION_LOG.md`, and only then did the file
edits follow.

**Append-only, narrow lane:**
- `docs/DECISION_LOG.md` — you may append a new entry ONLY for a decision that is
  clearly Tier 1 (bounded, reversible, contained entirely within this session,
  doesn't touch money-logic, doesn't touch the teach-not-advise line, doesn't grow
  MVP scope) — OR write up a Tier 2/3 entry that documents a decision the owner just
  made in conversation (as this file's own D-033 entry does). Never edit or delete
  existing entries. If you're unsure whether something is Tier 1, treat it as
  not-Tier-1 and ask instead. As of D-046: write the full entry as its own file in
  `docs/decisions/D-0NN-slug.md`, and append only a short index entry (title + one
  line + link) here.
- `PROJECT_SPEC.md` — you may propose an edit (e.g. checking off a Section 8 item
  that's now genuinely done) but do not silently rewrite it. State the proposed
  change and why, get confirmation, then apply it.

**Reference material — read, don't rewrite in the course of a task:**
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

This list applies regardless of whether the session is framed as "building" or
"thinking" — there is one set of hard stops now, not one per home.

## End of every session

1. Write `docs/sessions/YYYY-MM-DD.md` — a few lines: what changed, what's next.
2. If `PROJECT_SPEC.md` or `docs/DECISION_LOG.md` changed, say so explicitly to the
   owner so they know to skim the change.
3. Commit with a clear message and push to the session's designated working branch
   (D-034 — no separate confirmation needed for the push itself). Do not leave
   uncommitted or unpushed work at session end. If push fails (stale lock, auth,
   network), say so plainly rather than silently leaving it unpushed.
4. **Sync to `main` (D-056).** If the designated branch is a clean fast-forward ahead
   of `main` (no divergence), merge it into `main` and push `main` too — this is what
   lets a parallel session pull `origin/main` and see this session's work immediately,
   rather than needing to know this session's specific branch name. If `main` has
   diverged (not a clean fast-forward), stop and tell the owner rather than
   force-resolving the conflict autonomously — this is the one exception D-056 carves
   out of the autonomy grant. Note: D-056 also means direct-merge-to-main carries no
   PR review checkpoint, by the owner's explicit choice — revisit if that's ever
   wanted back.

`docs/CEO_DASHBOARD.md` / `.html` are refreshed **on demand** only — when the owner
asks for a status summary or something visual — not as part of this checklist (D-042,
superseding D-040 on this point only).

## What "done" means

Code or decision runs through to a real artifact + the owner understands at a high
level what changed + it's committed to git + the session log (and spec/decision log,
if relevant) reflects it. If any of those is missing, the task is not done.
