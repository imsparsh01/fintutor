# FinTutor

Single home for the FinTutor app (Cowork / Claude Code, this repo). Code, strategy, decisions, and roadmap
all live here — the earlier split between a build-only laptop repo and a separate thinking-only Claude
Project was retired at D-033 (02-Aug-2026); see `docs/DECISION_LOG.md`.

**Source of truth:** `PROJECT_SPEC.md` at repo root. Read it at the start of every session.

See `HOW_TO_RUN_THIS_PROJECT.md` for the session ritual, and `PROJECT_GOVERNANCE.md` for how strategy/
decision sessions are run within this one home.

## One-time setup per clone

Run this once on each device after cloning/pulling for the first time:

```
git config core.hooksPath .githooks
```

This enables a local pre-commit check (D-047) that blocks committing changes under `app/` or
`backend/` unless a `docs/sessions/*.md` log is staged in the same commit.
