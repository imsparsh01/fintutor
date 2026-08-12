# D-120 — Commit-triggered autonomous build pipeline

**Date:** 12-Aug-2026
**Tier:** 3 — new architectural pattern, new service in the stack, and unsupervised execution against
the repo. On the `CLAUDE.md` hard-stop list on two counts.
**Status:** 🟡 **DRAFT — PENDING OWNER APPROVAL.** Recommendations are pre-filled. Edit any item, then
approve. Nothing is built and no index entry is appended to `docs/DECISION_LOG.md` until this is approved.
**Revisits:** D-056 (direct-merge-to-main, for the autonomous path only)
**Builds on:** D-034 (autonomy over mechanics), D-107 (gstack sprint loop)

## Problem

The owner is the only orchestrator. Work stops whenever the queue blocks on a decision, and it stays
stopped until a session is opened by hand. On 12-Aug-2026 the READY queue emptied with two items blocked
on one owner decision — the constraint is decision latency, not build throughput.

## Decision

Adopt a commit-triggered autonomous build pipeline. Answering decisions from a phone becomes the trigger
that unblocks the queue and runs the resulting build work to completion, unattended.

### 1. Trigger

A push touching `DECISIONS_FOR_YOU.md` fires a GitHub Actions workflow. The owner's own commit is the
trigger — no cron, no polling, no webhook endpoint. Runs are expected 2–3 times per day at most.

### 2. Autopilot gate

The workflow reads an `AUTOPILOT: on|off` line in `DECISIONS_FOR_YOU.md` and exits immediately if off.

**Recommended: defaults to `off` after every completed run.** The owner re-enables it in the same commit
that carries their answers, so enabling and answering are a single action. This is fail-safe — a run that
goes wrong at 2am cannot repeat at 6am — and it doubles as the kill switch, editable from a phone in
seconds.

This is also what keeps autonomous and interactive work from colliding: autopilot is off whenever the
owner is at the desktop, and autonomous runs always work on their own branch regardless.

### 3. Answer parsing — never interpret

- A clean pick of a listed option (`1: A`) is mechanical. The run proceeds.
- Anything freeform (`A but 200 days`, `let's discuss`) **stops the run** and is left for a session.

The decision log is the project's source of truth. A misparsed answer produces a plausible-looking entry
that silently misstates what the owner decided, and nothing downstream would catch it. The run does not
guess.

### 4. Authentication — subscription first

**Recommended: subscription via `CLAUDE_CODE_OAUTH_TOKEN`, with API fallback disabled initially.**

The subscription is already paid for. Whether overnight runs meaningfully compete with next-day
interactive work is an open empirical question at ~16 sessions/day, and one week of real data answers it.
Paying for API while subscription capacity sits idle is waste; API is the right answer only if the data
shows the interactive path getting squeezed.

Revisit after one week. If mornings are being squeezed, enable API fallback for autonomous runs and keep
interactive on subscription — the split the concept document originally proposed, then reached on
evidence.

*Verify before building: confirm `claude setup-token` and `CLAUDE_CODE_OAUTH_TOKEN` behave as expected in
Actions. If subscription auth does not work in CI, this item returns to the owner rather than silently
falling back to a paid path.*

### 5. Output — pull request, never direct to main

**Recommended: one PR per run, never a direct merge.** This is the one item that revisits a standing
decision, so it is called out plainly.

D-056 removed the PR checkpoint by explicit owner choice. That was sound for supervised sessions, where
the owner sees the work as it happens. An unattended overnight run is a different case: the review that
D-056 removed was redundant with the owner's live presence, and there is no live presence here.

The cost is roughly thirty seconds on a phone in the morning. The benefit is that a bad night is a closed
PR rather than archaeology on `main` mid-workday. D-056 stands unchanged for interactive sessions.

### 6. Scope of autonomous work

Any item in READY. Queue items are already decision-gated, so authorisation is not the question.

**Recommended additional handling:** any task whose output is a number a user acts on — tax, Portfolio
Health, projections, concentration, budget math — is labelled on the PR and called out explicitly in the
run summary. CI cannot detect a plausible-but-wrong financial figure, and the owner should know which PRs
deserve real reading rather than a skim.

Autonomous runs may not create queue items or promote anything out of BLOCKED on their own judgment. Only
a parsed owner answer moves work into READY.

### 7. Hard guardrails — enforced, not instructed

The project's existing guardrails are instructions to a model and hold probabilistically. These hold
deterministically, in CI, and fail the job:

- **Path denylist.** `PROJECT_SPEC.md`, `CLAUDE.md` / `AGENTS.md`, `docs/DECISION_PROTOCOL.md`,
  `PROJECT_GOVERNANCE.md`, `HOW_TO_RUN_THIS_PROJECT.md` are unwritable by autonomous runs.
- **Verification gate.** `npx tsc --noEmit` and the backend suite must pass before any commit. Failure
  rolls back the task rather than committing it.
- **Dependency guard.** Any change to `package.json` or `requirements.txt` fails the run — a hard-stop
  item that must not arrive via automation.
- **Migration guard.** A new Alembic revision fails the run unless the queue item explicitly authorises it.

### 8. Run shape

Fresh agent context per task, sharing one branch. This is both cheaper than one long-running context
(which re-sends everything each turn and degrades as it fills) and consistent with the existing task
atomization principle.

The loop stops taking new work at **70% of the 6-hour job limit**, reserving the remainder to wrap up
cleanly: session log per `CLAUDE.md`'s checklist, branch pushed, PR opened, `DECISIONS_FOR_YOU.md`
refreshed with anything newly blocked, autopilot set back to `off`.

A task failing verification twice is left in place and reported, not retried indefinitely.

## Why

The bottleneck is decision latency. This addresses it at the point where it actually binds — the gap
between the owner answering and the work restarting — rather than at build throughput, which is not
constrained. The trigger design means the owner's existing behaviour (answer on phone, commit) is the
whole interface; nothing new to remember.

## Decision lenses

- **Compliance — PASS WITH WATCHPOINT.** No new user-facing surface and no change to the teach-not-advise
  line. The watchpoint is that unattended code generation on money math can produce a wrong figure that
  CI cannot detect; §6's labelling and §5's PR gate are the mitigations, and both depend on the owner
  actually reading flagged PRs.
- **Product — PASS.** No change to product behaviour.
- **Technical — PASS WITH WATCHPOINT.** GitHub Actions cron is unreliable, but this design does not use
  cron. The watchpoint is silent failure: a run that dies before its wrap-up leaves no trace, and absence
  of output looks identical to "nothing to do."
- **Cost/scope — PASS if subscription auth works.** ₹0 under §4's recommendation. If API fallback is later
  enabled, cost becomes real (~$1–2 per task) and needs its own cap.

## Boundaries

This authorises the pipeline described above and nothing further. It does not authorise: auto-merging PRs,
autonomous edits to the deliberate-only file tier, autonomous creation or promotion of queue items,
a third-party service beyond GitHub Actions and the Claude Code Action, scheduled/cron-triggered runs,
or a second harness (Codex) in the automated path — Codex's headless CI behaviour is unverified and
remains out of scope.

## Reversibility

High. The pipeline is additive: deleting the workflow file returns the project to today's manual flow with
no residue. Autopilot defaulting to `off` means the system is inert unless explicitly enabled. Nothing in
the repo's structure changes to accommodate it.

The one lower-reversibility element is §5's revisit of D-056 — but it narrows autonomous behaviour rather
than widening it, and D-056 remains unchanged for interactive sessions.

## Open items for the owner

Edit any of these before approving; the recommendation stands if left as-is.

| # | Item | Recommendation |
|---|---|---|
| 1 | PR or direct merge | **PR, one per run** (§5) |
| 2 | Auth | **Subscription first, API fallback off** (§4) |
| 3 | Money-math tasks | **Allowed, labelled for review** (§6) |
| 4 | Autopilot default | **Off after every run** (§2) |

## Owner response

_Pending._
