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

*(nothing ready right now — BQ-043..BQ-048 shipped 10-Aug-2026, see the archive. Everything left from
that fleet is BLOCKED on an owner decision below, not on build work.)*

---

## BLOCKED — do not start

> **BQ-049..BQ-054 all came out of the three-reviewer audit of the D-086..D-092 reskin (session
> 2026-08-10b).** None is an engineering question — each needs an owner decision first, and several are
> Tier 3. Do not resolve any of them by picking the reasonable-looking option.

- **BQ-049 — The empty-section CTA promises a walkthrough it does not deliver.** All three family screens
  render "Walk me through it, with my numbers" / "Takes about two minutes. Commits you to nothing." wired
  to a single `/chat` prefill — one message, not a walkthrough. `components/TeachingWalkthrough.tsx`
  (BQ-048) is the artifact that caption describes and sits built but unwired. **D-089 and D-090 were
  decided the same day and the parallel build split severed them.** Owner picks: wire the CTA to
  `TeachingWalkthrough` (D-090's chosen fork), or keep the prefill and delete the false caption.
- **BQ-050 — Walkthrough step content has no decided source.** Blocks BQ-049's first option. D-089 promises
  "your own numbers" on a surface that is by definition empty, so either static per-family copy ships (and
  "with my numbers" is wrong) or steps come from the backend (a new response shape — off limits without a
  decision).
- **BQ-051 — `ConsolidatedTotalsCard` cannot distinguish zero from absent.** `consolidated.py` collapses
  "no holdings", "holdings with `current_value` unfilled", and "ESOP-only, deliberately excluded" into the
  same `0.0`. **Do NOT take the shortcut `total === 0 ? '—'`: a fully repaid loan is a real, meaningful
  zero and that would hide it.** Options: card also fetches `/holdings` to count per-family rows
  (presentation-layer, allowed, extra request, still cannot separate case 1 from case 2); accept `₹0` and
  log it; or a backend change (needs its own decision — off limits under D-093).
- **BQ-052 — D-091's requirement list contradicts its own approved example (Tier 3).** D-091 requires every
  "what we won't say" block to state what the app will do instead; the approved ESOP wording contains no
  such offer. A build agent hit this contradiction and wrote its own sentence, which was reverted for being
  factually false (it claimed a tax computation the service does not perform). The inconsistency is in the
  decision document, not the code. Owner: narrow the requirement, or give the ESOP block an accurate offer
  half. Compliance-category — Tier 3, no Tier-2 resolution available.
- **BQ-053 — Goal progress bar: keep the bar or show the fraction only?** `BudgetingScreen`'s monochrome
  ink fill on a `lineSoft` track honours P10's letter (no colour, no valence). But a filled bar's *form*
  still asserts "how far along you are", which is the one opinion the register avoids elsewhere. The
  mockup's own answer was the fraction in neutral ink, no bar. Owner's call — flagged by the design review
  as borderline, deliberately not treated as a violation.
- **BQ-054 — Insurance empty-state copy is inconsistent with its two siblings.** Two lines against
  Investments' and Loans' five (it was lifted from D-089's *illustrative* example, never written as
  finished screen copy), and the noun switches mid-screen: "+ Add a policy manually" in the empty state vs
  "+ Add insurance" in the populated list. Copy decision, not an engineering one.

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
