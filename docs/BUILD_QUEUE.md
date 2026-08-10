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

> **BQ-043..BQ-048 are a single authorised fleet (D-093), not six independent sessions.** D-093 unparks
> D-014's execution subagents for exactly this body of work. The usual "one item per session" rule is
> suspended for this set by that decision, and by nothing else — the next fleet needs its own call.
> **Binding on every item below:** no backend or schema change (verified unnecessary — every drawn data
> shape already has a service); no new dependency (`react-native-reanimated`, `expo-font`,
> `@expo-google-fonts/*` are all hard stops); no new screen beyond a reskin of what exists. An agent that
> concludes it needs any of these must STOP and report, not act.

- **BQ-043 — Rewrite `app/design/tokens.ts` to the D-086 warm-ledger token set.** Colour/radius/type
  tokens per D-086. `success` is **renamed to `tutor`** and recoloured to `#1D5C46` — never left in place
  under its old name. Adds `fontFamily` tokens (platform system serif/sans/mono per D-088) — the app has
  zero `fontFamily` declarations today, so this is the first. Foundation for BQ-044..BQ-046; they cannot
  start until it lands. (D-086, D-088)
- **BQ-044 — Migrate all remaining hardcoded colours in `app/screens` + `app/components` onto tokens.**
  ~52 hex literals across 21 files; 12 files already import `tokens.ts`, 9 do not. Mechanical substitution
  against BQ-043's map. (D-086)
- **BQ-045 — Apply P10 to every surface rendering a real figure.** Strip valence styling: no green/red by
  direction, no coloured progress fill, no threshold-triggered emphasis. Ledger rows in mono on hairline
  rules. Covers `ConsolidatedTotalsCard`, `HoldingsList`, `HoldingDetailScreen`, `BudgetingScreen`, and
  the three decision modals. (D-087/P10)
- **BQ-046 — Apply P11: tutor voice in serif, interface and values in sans/mono.** Chat/teaching copy in
  the serif token; labels, chrome, buttons and every real value in sans/mono. System faces only. (D-088/P11)
- **BQ-047 — Empty-state content for the three family sections.** Categories and mechanisms, never
  products; declinable walk-through offer; visibly-secondary manual add. (D-089)
- **BQ-048 — Full-screen teaching walkthrough container.** Fork `1f`. The four-part P9 guard is a build
  requirement, not guidance: skip live on *every* step, nothing unlocks at the end, no comprehension check
  anywhere, steps freely navigable. Presentation container only — teaching content comes from the existing
  backend unchanged. (D-090, REVIEW-FLAGGED)

---

## BLOCKED — do not start

*(nothing blocked right now)*

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
