# D-047 — Local pre-commit hook enforcing session-log discipline (owner-confirmed)

- **Tier:** 1 — process/PM tooling, no trigger fires, same category as D-046. Owner-confirmed in
  conversation during the process review.
- **Decision:** Add a repo-tracked hook, `.githooks/pre-commit`, that blocks a commit touching
  `app/` or `backend/` unless a `docs/sessions/*.md` file is staged in the same commit. The repo
  uses `core.hooksPath=.githooks` (git does not read tracked hooks by default), so each clone needs
  a one-time `git config core.hooksPath .githooks` — documented in `README.md`. The hook is a
  local pre-commit check, not CI; it requires no new service or infra.
- **Why:** session logs already happen every session by prompt discipline (18 exist under
  `docs/sessions/`) — this mechanizes an existing, working habit rather than inventing a new
  process. It directly targets the "context drift via forgotten manual updates" inefficiency
  identified in the process review, without needing a test suite or GitHub Actions (neither
  exists yet in this repo).
- **Reversibility:** High — `git config --unset core.hooksPath` or deleting the hook file fully
  reverts this; the hook only blocks commits touching `app/`/`backend/`, nothing else, and can
  always be bypassed intentionally with `git commit --no-verify`.
- **Date:** 03-Aug-2026
