# FinTutor Build — Project Governance

> This is the operating charter for **strategy and decision-making sessions**.
> It is NOT about the code. It's about how we run the strategy, keep the thread, and make decisions.
> As of D-033 (02-Aug-2026) this lives in the same repo and the same tool as the build work — see
> `CLAUDE.md`'s orientation note and `docs/DECISION_LOG.md`'s D-033 entry for what changed and why.

---

## What this file is for
Strategy, architecture decisions, roadmap, teaching-engine design, compliance thinking, and prioritization
still need a different mode of attention than writing code — slower, more deliberate, proportional to
reversibility. This file is the charter for that mode. It used to be enforced by running in a physically
separate Claude Project ("Laptop = build. Project = think."); that access boundary is gone (D-033), so the
separation is now something you hold deliberately within one home, not something the tooling holds for you.

## The documents this charter governs
1. **PROJECT_SPEC.md** — the single source of truth. Scope, philosophy, stack, decisions, change log.
2. **PROJECT_GOVERNANCE.md** (this file) — how we run strategy/decision sessions.
3. **DECISION_LOG.md** — one entry per meaningful decision, with the *why*.
4. System prompts, compliance notes, teaching-design docs (`docs/prompts/*`, `docs/BRIEF-*.md`, etc.).

## How a strategy session runs (the ritual)
1. Start: "Read the spec + governance. Today I want to think about [X]." (Doesn't require a separate
   Project anymore — just say explicitly that this is a strategy session, not a build session.)
2. Work through ONE strategic question — don't sprawl across five topics in one session.
3. Any decision reached → gets written into DECISION_LOG.md + reflected in PROJECT_SPEC.md.
4. End: confirm what changed and what the next strategic question is.

## Decision discipline (the core governance rule)
- **A decision isn't real until it's written down.** Verbal/implied decisions get lost. Log them.
- **Every decision records its WHY**, not just the what — so future-you (or a new session) doesn't re-litigate it.
- **Reversible vs irreversible:** mark decisions that are cheap to change (a library) vs expensive (the whole
  data model, the "teach not advise" stance). Spend thinking-time proportional to reversibility.
- **One source of truth.** If the spec and a conversation disagree, the spec wins — or you update the spec.

## Anti-patterns to catch yourself doing
- **Tooling as procrastination.** Polishing folders/docs instead of doing Phase 1. Set up once, then build.
- **Scope creep in thinking.** "Wouldn't it be cool if..." → goes in a PARKED list, not the MVP.
- **Deciding without logging.** The thing that quietly kills solo projects. Log or it didn't happen.
- **Re-litigating settled decisions.** If it's in the log with a why, don't reopen without new information.
- **Silent scope growth.** A decision that quietly makes the MVP bigger (e.g. adding a product family, or
  committing a UX pattern to "all types" instead of one) must say so out loud in its log entry — record the
  scope change, don't let it hide inside a schema or a reworded sentence. Deciding to grow scope is fine;
  growing it without noticing is the failure.

## Standing principles (inherited from the product philosophy — never drift from these)
1. Mechanism + personal context, always paired.
2. Teach, never advise.
3. Learn on the go (no curriculum).
4. Living baseline per user (reconciliation is a feature).
5. Bootstrap tight; validate before spending.
