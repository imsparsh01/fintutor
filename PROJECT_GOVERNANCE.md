# FinTutor Build — Project Governance

> This is the operating charter for the **Claude Project** (the thinking-home).
> It is NOT about the code. It's about how we run the strategy, keep the thread, and make decisions.
> Upload this + PROJECT_SPEC.md as Project knowledge so every strategy session is grounded.

---

## What this Project is for
This Claude Project is where FinTutor is **thought about** — strategy, architecture decisions, roadmap,
teaching-engine design, compliance thinking, and prioritization. Code is built on the laptop with Claude Code.
**Laptop = build. Project = think.** When confused about where something belongs, that line settles it.

## The documents that live here (Project knowledge)
1. **PROJECT_SPEC.md** — the single source of truth. Scope, philosophy, stack, decisions, change log.
2. **PROJECT_GOVERNANCE.md** (this file) — how we run the Project.
3. **DECISION_LOG.md** — one entry per meaningful decision, with the *why*.
4. (Later) system prompts, compliance notes, teaching-design docs as they're created.

## How a strategy session runs (the ritual)
1. Start: "We're in the FinTutor Build project. Read the spec + governance. Today I want to think about [X]."
2. Work through ONE strategic question — don't sprawl across five topics in one session.
3. Any decision reached → gets written into DECISION_LOG.md + reflected in PROJECT_SPEC.md.
4. End: confirm what changed and what the next strategic question is.

## Decision discipline (the core governance rule)
- **A decision isn't real until it's written down.** Verbal/implied decisions get lost. Log them.
- **Every decision records its WHY**, not just the what — so future-you (or a new session) doesn't re-litigate it.
- **Reversible vs irreversible:** mark decisions that are cheap to change (a library) vs expensive (the whole
  data model, the "teach not advise" stance). Spend thinking-time proportional to reversibility.
- **One source of truth.** If the spec and a conversation disagree, the spec wins — or you update the spec.

## Keeping the two homes in sync (laptop ↔ Project)
- After a **strategy session here** that changed the spec → download it → put in laptop repo → git commit.
- After a **build session** that forced a decision → update spec locally → re-upload here.
- The spec is one document that physically exists in two places, always kept matched.

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
