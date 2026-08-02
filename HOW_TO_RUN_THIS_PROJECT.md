# How to run this project (your operating manual)

You are the **owner/orchestrator**. Claude (via Cowork/Claude Code) writes the code and, since D-033
(02-Aug-2026), also runs strategy/decision sessions in this same repo — there's no separate Claude Project to
maintain anymore. Your job is structure, decisions, and keeping the thread. This file explains how.

## The golden rule
**PROJECT_SPEC.md is the source of truth.** Start every Claude Code session by telling it to read the spec.
End every session by updating the spec's change log. This is the exact same discipline as the finance
baseline doc — it works.

## Recommended folder structure (create this once)
```
fintutor/
├── PROJECT_SPEC.md            # source of truth — read at start of every session
├── HOW_TO_RUN_THIS_PROJECT.md # this file
├── docs/
│   ├── decisions/             # one short file per big decision (why we chose X)
│   ├── prompts/               # the LLM system prompts, version-controlled
│   └── sessions/              # a 5-line log per work session (date, what got done, what's next)
├── app/                       # the mobile app code (Claude Code works here)
├── backend/                   # the server code (Claude Code works here)
└── README.md                  # quick start for future-you
```

## Session ritual (every time you sit down to build)
1. Open `PROJECT_SPEC.md`, re-read section 8 (open decisions) and the change log.
2. Pick ONE bounded task (not "build the backend" — "build the register endpoint").
3. Tell Claude Code: *"Read PROJECT_SPEC.md. Today we're doing [one task]. Don't touch anything else."*
4. When done, write a 5-line note in `docs/sessions/YYYY-MM-DD.md`: what changed, what's next.
5. Update the spec's change log if any decision was made.

## Rules for working with Claude Code (learned the hard way by many)
- **One task per session.** Bounded scope. It's tempting to let it build everything; don't.
- **Make it explain before it builds.** Ask "what will you change and why" before "go."
- **Never let it invent architecture silently.** If it proposes a new library/service, that's a decision →
  it goes in `docs/decisions/` and the spec.
- **Use version control (git) from day one.** Commit after every working task. This is your undo button.
- **You own the money-touching logic review.** Even if you can't write it, read what it did to anything
  involving user financial data or the "teach not advise" rules. That's the part that must not drift.

## What "done" means for a task
Code runs + you understand at a high level what it does + it's committed to git + the spec/session log
reflect it. If any of those four is missing, the task isn't done.
