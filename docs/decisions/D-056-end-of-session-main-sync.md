# D-056 — End-of-session ritual extended: designated branch pushed AND fast-forward-merged to main, so parallel sessions stay synced (owner-confirmed)

- **Tier:** owner-decided directly in conversation, extending D-034's autonomy grant. Process/PM tooling —
  no money, compliance, irreversibility, or MVP-scope trigger fires. Logged as a full entry (not just a
  Tier-1 one-liner) because it changes `CLAUDE.md` itself, a deliberate-only file per that file's own rule,
  and future sessions need the full reasoning on file, not just an index line.
- **Context / why now:** this session surfaced a real, concrete gap. Every decision made this session
  (D-053 through D-055) was logged and pushed immediately, exactly per existing discipline — but a
  separate, parallel fresh session asked to summarize the finalized target-user segment found nothing,
  because this session's harness-assigned working branch (`claude/mobile-popup-recurring-bug-j7xj3n`) had
  never been merged into `main`. `CLAUDE.md`'s existing end-of-session step 3 already said "push to
  `origin/main`" (per D-034) — but current sessions are harness-assigned a designated feature branch to
  develop on, not `main` directly, and are told not to push elsewhere without explicit permission. That
  gap between the written ritual and actual practice is what this decision closes; this session didn't
  invent the drift, it found it by hitting the actual failure mode.
- **Decision:** End-of-session step 3 amended, effective immediately:
  1. Commit and push to the session's designated branch, as before.
  2. If that branch is a clean fast-forward ahead of `main` (no divergence), merge it into `main` and push
     `main` too — so any parallel session that pulls `origin/main` sees the latest logged decisions right
     away. This is the owner's explicit, stated purpose: running parallel sessions that stay in sync by
     pulling `main`, rather than each needing to know another session's specific branch name.
  3. If `main` has diverged (not a clean fast-forward), **stop and tell the owner** rather than
     force-resolving conflicts autonomously. Conflict resolution on the shared trunk is judgment, not
     mechanics, and stays a checkpoint — this decision extends autonomy over the happy path only.
- **Explicit owner authorization, recorded so it's auditable:** this satisfies the runtime instruction not
  to push to a different branch without explicit permission — the owner gave that permission directly, in
  conversation, for this exact action, and asked for it to apply "automatically... each session going
  forward." Recording it here means a future session (which won't have this conversation in context) has
  real, on-file authorization to act on, not an assumption.
- **Tradeoff recorded, not silently absorbed:** the owner explicitly chose direct merge-to-main over
  open-a-PR-first when asked (this session, same conversation) — meaning no review checkpoint sits between
  a session's work and `main` going forward. If the owner wants that checkpoint back later, it's a one-line
  reversal of step 2 above (PR instead of direct merge), not a new decision from scratch.
- **Reversibility:** High — a process/ritual change, no data or schema touched.
- **Date:** 03-Aug-2026
