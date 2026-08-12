# FinTutor — Build Queue

**This is the build worklist. Claude reads this file to find its build task.**

Rules for this file:
- Nothing enters this queue until the decision behind it has an ID in `docs/DECISION_LOG.md`.
- Items here are **already decided** — Claude executes them, it does not re-open them.
- If executing an item requires a new decision (new library, schema change, anything on
  the `CLAUDE.md` hard-stop list), **STOP and escalate to the owner**. Do not decide it here.
- One item per session. Move it to DONE with a date when complete.
- This file is build-task-tracking only (single home as of D-033 — see `docs/DECISION_LOG.md`).
- Before picking up an item, check `docs/KNOWN_LIMITATIONS.md` — a disclosed gap from a shipped feature
  may already flag exactly the edge case the new item is about to hit.

---

## READY — pick one of these

### BQ-069 — Progression event ledger and rebuildable summary — TOP PRIORITY

Traces to D-114/D-116/D-117; data contract approved by **D-121** (12-Aug-2026). Build the append-only
event ledger, the per-user-per-day rollup, and the single current summary row, plus the deterministic
replay/rebuild path.

Scope is fixed by D-121's approved implementation boundary — read it before starting. Load-bearing points:

- Points are **never** stored on an event row. Point values, dimension mapping, caps, and stage floors live
  in the ruleset version and are applied at computation time.
- `local_date` is materialized at write time on a fixed Asia/Kolkata boundary. Replay must never read the
  wall clock — all windows compute from `local_date`, never from `now()`.
- Dedup is a database guarantee: `UniqueConstraint(user_id, idempotency_key)`, not service logic.
- The summary carries `ruleset_version` and `displayed_points_floor`. Rebuild is deterministic and
  idempotent; a replay producing a lower total leaves the displayed figure at the floor, and stage never
  regresses.
- Raw events prune at 400 days; rollups and summary persist for account life; account deletion hard-deletes
  all three tiers.
- The only historical backfill is D-119's one-time onboarding credit, keyed
  `onboarding_handled:v{flow_version}`. Infer nothing else.

Out of scope: progression *surfaces* and placement (BQ-070), per-user timezones, and any selective
"clear my progression" control — D-121 deliberately does not offer one.

---

## BLOCKED — do not start

### BQ-070 — Progression surfaces and placement — TOP PRIORITY, BLOCKED

Traces to D-114/D-116. The data contract it was waiting on is now settled (D-121), but it remains blocked
on its own placement decision for stage, continuous progress, attribution, recap, profile coverage, and
Expanding milestones.

---

## NOT IN THIS QUEUE — thinking-home only

These are open items that are **not build tasks** (Claude Code should not mistake them for work):
- Decision 3, Decision 2, and the UX principles section — all RESOLVED (D-038, D-059, D-075/D-076/D-077).
- FINDING 7 provenance — RESOLVED (D-029); execution was BQ-005 (see DONE).
- `savings_balance` 9th-taxonomy-type question — RESOLVED (D-079): schema-exempt, an instance of D-031's
  deferred Cash & bank family, nothing to build.
- AI-surfacing WHEN-stage verification — RESOLVED (D-080, Phase-1 Run 7): FINDING 8 does not reproduce
  0/5 against v0.8, live. `known_gaps` surfacing (already wired into every `/chat` call) can be treated as
  verified, not provisional.
- Conversation memory (PARKED — D-022). Subagents (PARKED — D-014). Legal review of D-009. Data privacy
  policy (D-010, unwritten).

---


> **DONE items archived (D-081).** Completed build items move to `docs/BUILD_QUEUE_ARCHIVE.md` as soon as
> they're marked done — this file stays limited to READY/BLOCKED/NOT-IN-QUEUE. This is a per-completion
> habit now (see `CLAUDE.md`'s checklist), not a one-time cleanup.

## DONE

See `docs/BUILD_QUEUE_ARCHIVE.md` — every completed item lives there, newest first.
