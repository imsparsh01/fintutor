# D-062 — Claude Code Skills adopted for bounded, mechanical procedure execution — piloted with one skill: `session-close`

- **Tier:** 2 — no §2.1 trigger fires (checked all six: no money moves; no legal/regulatory/tax/advisory/
  data-handling surface — this is Claude Code tooling, not product; doesn't contradict or reinterpret a
  standing principle; fully reversible, touches no populated data and no committed app/backend code; adds
  no product type/screen/flow/capability to `PROJECT_SPEC.md` §4; classifies cleanly as Sequencing/PM, same
  category as D-007/D-014/D-047/D-050). Deliberated through the evaluation lenses, acted on immediately per
  §2.3, subject to retroactive veto.
- **Context:** the owner asked to start using Claude Code Skills (packaged, invokable procedure files) to
  make session work more consistent. No prior use existed in this repo — this is new ground, distinct from
  D-014's parked "execution subagents" (which was about building agents to carry out already-decided
  *build* tasks, gated on the teaching engine being validated first). Skills, as scoped here, are about
  session *mechanics* — the same "owner decides, execution follows" division of labour D-014 established,
  extended to procedures this repo's own operating docs already fully specify.
- **Decision:**
  1. **What a skill may do.** A skill may only execute a procedure that is already fully decided and written
     down elsewhere in this repo (`CLAUDE.md`, `DECISION_PROTOCOL.md`, `PROJECT_GOVERNANCE.md`) — checklist
     execution, file-format enforcement, templated output. A skill must never make a product-judgment,
     compliance, or scope call itself. Concretely: a skill may format a Tier-2 lens block once a human has
     decided the verdicts, but must never decide the verdicts; it may write a session log summarizing what
     happened, but must never decide what "done" means for a task.
  2. **Skills stay inside the same file-permission lanes CLAUDE.md already sets.** A skill must never write
     to a deliberate-only file (`PROJECT_GOVERNANCE.md`, `DECISION_PROTOCOL.md`, `HOW_TO_RUN_THIS_PROJECT.md`,
     `CLAUDE.md`/`AGENTS.md`) and must never author new judgment into `DECISION_LOG.md`'s append-only lane —
     the same constraint already binds me directly; a skill is not a way around it.
  3. **Location:** project-scoped, checked into the repo at `.claude/skills/<name>/SKILL.md`, so any future
     Claude Code session working on this repo picks the same skills up automatically — new infrastructure,
     touching no existing file's permission tier.
  4. **Pilot scope: exactly one skill this session — `session-close`.** It mechanizes `CLAUDE.md`'s "End of
     every session" section (write `docs/sessions/YYYY-MM-DD.md`; flag explicitly if `PROJECT_SPEC.md` or
     `DECISION_LOG.md` changed; commit; push to the session's designated branch per D-034; fast-forward-merge
     to `main` and push per D-056, or stop and flag divergence rather than force-resolving). Chosen over any
     other candidate (e.g., Tier-2 decision-entry formatting) because it is the single most repeated,
     already-precisely-specified, and costliest-to-silently-skip procedure in the repo's own rules — a clean
     first test of the pattern with near-zero judgment surface.
  5. **Not built this session, deliberately:** any skill touching decision *content* (drafting lens verdicts,
     classifying a tier, writing a Tier-3 brief). Those sit closer to the judgment line this repo is built to
     protect, and should only be considered once the session-close pilot has actually run and proven the
     mechanical/judgment boundary holds in practice — building a second skill before the first is proven would
     repeat the exact "tooling ahead of a validated need" anti-pattern D-014 was written to avoid.
- **Why:** Session mechanics are exactly the kind of bounded, reversible, already-decided execution CLAUDE.md
  already grants autonomy over (D-034) — a skill just makes that execution consistent instead of re-derived
  from prose every session, which is where drift risk lives (a step quietly skipped, a commit message losing
  the SYNC-STATE-equivalent detail). Starting with one narrow, low-risk pilot rather than a batch of skills
  keeps the addition itself proportionate to what's actually been validated, per this project's own governing
  instinct (PROJECT_GOVERNANCE.md's "tooling as procrastination" anti-pattern).
- **Lenses:**
  ```
  Compliance      PASS      No advisory-line or user-data surface — this is repo/session tooling, not
                            product behavior; D-009/D-010/D-016 are untouched.
  Product         skip      Not run — no app-facing behavior, nothing a user ever sees.
  Technical       PASS      Buildable in one pass, fully reversible (deleting the directory reverts it),
                            no dependency on any unbuilt app/backend piece.
  Cost-and-Scope  CONCERN   Adds a new convention (a skills directory, a skill-authoring habit) that must be
                            kept in sync with CLAUDE.md's prose if the session-close ritual ever changes —
                            a skill that silently drifts from the rule it mechanizes is worse than no skill.
                            Answered by piloting exactly one skill, for the most stable procedure in the repo
                            (unchanged since D-034/D-056), and by treating "does this skill still match
                            CLAUDE.md §'End of every session'" as a standing check whenever that section is
                            next edited.
  ```
- **Reversibility:** High — `.claude/skills/session-close/` is just files; deleting it fully reverts this
  decision. No populated data, no product code, and no other file's permission tier is touched.
- **Date:** 04-Aug-2026
