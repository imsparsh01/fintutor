# D-034 — Autonomous file/git operation, with the hard-stop list and deliberate-only file tier kept as the only checkpoints
- **Tier:** 3 — this decision itself sets the boundary of what future work may be auto-decided, which is the
  single most owner-only kind of call there is (same shape as D-030's "it defines what may later bypass the
  owner"). Owner decision, made directly in conversation via explicit confirmation, not run through the four
  lenses (pure process/autonomy call, no Compliance/Product/Technical/Cost-and-Scope tension to adjudicate).
- **Decision:** Claude operates autonomously on file creation, editing, and deletion across this repo, and on
  `git commit` + `git push` after every session, without pausing to ask permission for each action. Two
  categories remain checkpoints, unchanged from before and explicitly NOT swept into this autonomy grant:
  1. **The hard-stop list in `CLAUDE.md`** (money-movement logic, legal/regulatory shape, anything touching a
     standing principle including the teach-not-advise compliance line, low-reversibility calls, MVP scope
     growth, new architecture/library/service). Any of these still produces a brief and waits for the owner's
     decision before acting — exactly the BRIEF-001 through BRIEF-004 pattern.
  2. **The deliberate-only file tier** (`PROJECT_GOVERNANCE.md`, `docs/DECISION_PROTOCOL.md`,
     `HOW_TO_RUN_THIS_PROJECT.md`, `CLAUDE.md`, `AGENTS.md`). Editing any of these still requires an explicit,
     owner-confirmed decision logged first — this entry is itself an instance of that rule being followed.
- **Why these two survive full automation:** the point of D-017–D-020's tiered protocol was never "reduce
  owner interruptions" as an end in itself — it was to route Tier 3 judgment (money, law, compliance,
  irreversibility, scope) to the only place that can actually make it, while auto-deciding everything that is
  genuinely mechanical. Automating those two categories away would not be "more automation," it would be
  deleting the protocol's entire reason for existing. FINDING 9/10 (raised earlier this session, still
  awaiting a brief) is the live example: a compliance-line interpretation call, exactly the kind of thing that
  must not get silently auto-resolved just because file/git mechanics are now hands-off.
- **What this changes downstream (mechanical consequences of this entry, not separate decisions):**
  1. `CLAUDE.md` and `AGENTS.md`: new explicit framing — autonomous by default, with the hard-stop list and
     the deliberate-only file tier named as the only two exceptions; end-of-session step now includes an
     automatic `git push`, not just a local commit.
  2. **Push credentials:** a fine-grained GitHub PAT (owner-generated, scoped to only this repo, Contents:
     Read and write, short expiry) is stored via a repo-local git credential helper
     (`.git/git-credentials`, referenced only by this repo's local git config, not the sandbox's ephemeral
     home directory, and never committed — `.git/` internals are not tracked content). This lets push happen
     without the token being re-shared in chat each session.
- **Guardrail on the credential itself:** the token is scoped narrowly (single repo, contents-only) precisely
  so that even full trust here has a hard ceiling — it cannot touch other repos, org settings, or account-level
  actions. Owner remains responsible for rotating/revoking it periodically; this entry does not make the
  token permanent.
- **Reversibility:** High. Reverting to a manual/ask-first model is another log entry plus reverting the
  `CLAUDE.md`/`AGENTS.md` edits; revoking the stored token on GitHub instantly cuts off push access without
  touching anything else.
- **Feeds:** `CLAUDE.md`, `AGENTS.md`, repo-local git config (`.git/config`, `.git/git-credentials`).
- **Date:** 02-Aug-2026
