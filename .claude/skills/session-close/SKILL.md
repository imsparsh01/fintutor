---
name: session-close
description: Closes out a FinTutor working session by executing this repo's own session-end checklist (CLAUDE.md's "End of every session" + D-056's main-sync rule) — writes docs/sessions/YYYY-MM-DD.md, flags whether PROJECT_SPEC.md or docs/DECISION_LOG.md changed, commits, pushes, and fast-forward-merges to main. Use this whenever the user wants to wrap up, close out, end, or finish a session on this repo — phrases like "let's close this session", "wrap up", "end here for today", "close out", "session-close", or when a natural stopping point is reached and the user confirms they're done for now. Do NOT use it mid-session for a single commit — it is the full end-of-session ritual, not a generic "commit and push" helper.
---

# Session close

This skill exists because CLAUDE.md already specifies exactly what closing a session means for this repo
(see its "## End of every session" section) and D-056 extended it with a main-sync step. Re-deriving that
checklist from prose every time is where steps get silently skipped — a forgotten session log, a push that
never got mirrored to `main`. This skill just executes the already-decided steps consistently.

**Scope boundary — read this before doing anything else.** This skill only *executes* an already-decided
mechanical procedure. It must never:
- decide whether a decision this session made was Tier 1/2/3, or write new judgment into
  `docs/DECISION_LOG.md` beyond what the session itself already produced and logged,
- touch `CLAUDE.md`, `AGENTS.md`, `PROJECT_GOVERNANCE.md`, `DECISION_PROTOCOL.md`, or
  `HOW_TO_RUN_THIS_PROJECT.md` (this repo's deliberate-only files — see `CLAUDE.md`'s file-permission
  section),
- resolve a `main` divergence on its own (step 6 below) — that is explicitly the owner's call.

If any step below turns up something that looks like a real decision rather than a mechanical fact (e.g.
uncommitted changes you don't recognize, a conflict, a file on the deliberate-only list that looks edited),
stop and surface it to the user instead of guessing.

## Steps

### 1. See what actually changed

```bash
git status
git diff --stat
```

Cross-reference against the conversation so far. In particular, note whether `PROJECT_SPEC.md` or
`docs/DECISION_LOG.md` changed this session — that fact is needed for step 3 and step 4's commit message.

### 2. Write the session log

Look at 1-2 recent files in `docs/sessions/` first (e.g. `ls docs/sessions/ | tail -5`, then read the most
recent one) to match the repo's existing voice and level of detail — terse, concrete, names real
file/decision/BQ IDs rather than vague summaries.

Determine today's filename: `docs/sessions/YYYY-MM-DD.md`. If a log for today already exists (an earlier
session ran today), use the next letter suffix — `YYYY-MM-DDb.md`, then `c.md`, etc. Check
`docs/sessions/` for what's already there before picking the name.

Keep it short — CLAUDE.md's own instruction is "a few lines: what changed, what's next." Cover:
- what was decided (with D-numbers) and what was built (with BQ-numbers), if anything,
- what's still open / a natural next step,
- anything unusual (a blocker hit, a step skipped and why).

### 3. Call out spec/log changes explicitly

If `PROJECT_SPEC.md` or `docs/DECISION_LOG.md` changed this session, CLAUDE.md requires this to be said
**explicitly to the user in the chat reply**, not left implicit in the session log file alone — the owner
needs to know to skim it. Do this even if you already mentioned the change earlier in the conversation;
the end-of-session summary is the reliable place the owner will look.

### 4. Commit

Stage the session's changes and commit with a clear, descriptive message. Do not use `git commit --amend`
(a stale lock or a failed hook is not a reason to rewrite prior history — see CLAUDE.md's git safety
protocol). Do not bypass hooks (no `--no-verify`) — if a hook blocks the commit, fix the underlying issue
it's flagging (e.g. this repo's pre-commit hook from D-047 requires a `docs/sessions/*.md` file staged
alongside any `app/`/`backend/` change — step 2 above should already have satisfied it).

### 5. Push to the working branch

```bash
git push -u origin <current-branch-name>
```

If it fails on a network error, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) — per
CLAUDE.md's git operations guidance. If it fails for any other reason (auth, a rejected non-fast-forward
push, a stale lock), say so plainly to the user rather than silently leaving work unpushed or forcing it.

### 6. Sync to `main` (D-056) — only if it's a clean fast-forward

```bash
git fetch origin main
git merge-base --is-ancestor origin/main HEAD && echo "clean fast-forward" || echo "diverged"
```

- **Clean fast-forward** (the check above prints "clean fast-forward" — `main` has no commits your branch
  doesn't already contain): merge and push.
  ```bash
  git checkout main
  git merge --ff-only <branch-name>
  git push origin main
  git checkout <branch-name>
  ```
  This is what lets a parallel session that pulls `origin/main` see this session's work immediately,
  instead of needing to know this session's specific branch name.
- **Diverged** (`main` has commits your branch doesn't have — the fast-forward merge would fail or would
  need a real merge/rebase): **stop.** Do not force-resolve, rebase, or merge with conflict resolution on
  your own initiative — D-056 carves this out as the one case that still needs the owner's decision. Tell
  the user plainly that `main` has diverged and ask how they want it resolved.

### 7. Confirm to the user

Summarize: what was committed (and its message/hash), whether the push to the working branch succeeded,
and whether it was merged to `main` — or, if `main` had diverged, that this is pending the owner's call.
Keep it short; this mirrors CLAUDE.md's own "what done means" — the owner should be able to tell at a
glance that nothing was left uncommitted or unpushed.
