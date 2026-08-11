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

### BQ-056 — Scenario modelling ("What if…" — batch 1)
**Decision:** D-106 (batch 1 scenarios + S-01 user-set target; S-04 parked)
**Scope:** Build 4 scenario cards + user-set target (S-01):
- S-05: Emergency runway — "If you lost income today, how long could you sustain expenses?"
- S-03: SIP increase — "What does ₹2000 more/month do to your corpus in 10 years?"
- S-06: Debt cost — "How much is your outstanding debt costing you per year?"
- S-07: Inaction tax — "What's the opportunity cost of cash sitting in a savings account?"
- S-01: User-set corpus target (user enters the number; app shows SIP needed)
S-04 (Rent vs buy) is parked — schema change required. C-16/C-23 are batch 2.

### BQ-059 — Goals screen restructure (illustrated goal cards, insurance entry, emergency CTA)
**Decision:** D-106 (Goals tab confirmed in 5-tab nav; placeholder GoalsScreen already live)
**Scope:** Replace GoalsScreen placeholder with full illustrated layout:
- 4 goal-type cards (Higher education, Secure retirement, Dream house, Perfect wedding)
- Insurance entry card with coverage summary
- Emergency readiness CTA
Illustration style: decide during build — simple icon (SF Symbol / vector) is acceptable as
placeholder; no external asset library needed.

### BQ-061 — Portfolio overlap indicator (Option A — category concentration)
**Decision:** D-106 (Option A confirmed: educational category concentration indicator)
**Scope:** Add a card to PortfolioScreen showing how many equity MFs are in the same broad
category. No external API, no ISINs, no scheme names. Copy explains what overlap means and
why it matters (mechanism fact, P2-safe). Wire to existing holdings data (product_type filter).

---

## BLOCKED — do not start

### BQ-058 — Portfolio screen restructure (donut chart, sub-scores, trend section)
**Blocked on:** TODOS.md BQ-058 store decision (shared store vs independent fetch — must be decided before building).

### BQ-060 — Home screen restructure (8-section scrollable layout)
**Decision needed:** Health Score card wiring to BQ-060's layout (shape TBD).

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
