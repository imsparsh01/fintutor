# D-090 — Teaching moments render as a full-screen walkthrough (fork 1f), with a mandatory P9 guard

- **Tier:** 2 — **REVIEW-FLAGGED.** Owner chose the fork directly; the flag records that this option
  carries a live P9 risk the two alternatives do not, and that the guard below is what makes it adoptable.
- **Date:** 10-Aug-2026

## Decision

Of the three forks the mockups left open for where a teaching moment appears — `1d` inline chat bubbles,
`1e` a mechanism card, `1f` a full-screen walkthrough — the owner selected **`1f`, the full-screen
walkthrough**. Note this is not the handoff document's recommended default (`1e`); it was chosen over that
recommendation, deliberately.

## The P9 guard — a hard requirement, not a suggestion

`docs/ux/mockups/MOCKUPS_v1_NOTES.md` flags that `1f` "needs a P9 guard." That guard is part of this
decision and is binding on every implementation:

1. **Skip is live on every single step** — visible, enabled, and effective on the first step, the last
   step, and every step between. Never hidden, never delayed, never disabled-until-scrolled.
2. **Nothing unlocks at the end.** Completing a walkthrough grants access to no content, no section, no
   feature, and no engagement reward that abandoning it would have withheld.
3. **No comprehension check anywhere in the sequence** — not as a gate between steps, not as a
   "confirm you've read this," not dressed as a game mechanic (P9's explicit anti-dressing clause).
4. **Steps are freely navigable**; a user may leave at any point and lose nothing, and re-entering starts a
   fresh pass rather than resuming a scored one.

An implementation missing any of these four is not a permitted variant of `1f` — it is the lesson tree
`PROJECT_SPEC.md` §2 and P9 forbid, and it fails review regardless of how it is styled.

## Why `1f` is the riskiest of the three forks

`1d` and `1e` are structurally incapable of gating: a chat bubble and an inline card have no sequence to
lock. A full-screen multi-step sequence has one by construction, and the distance between "a walkthrough"
and "a lesson with steps you must complete" is a few small, individually reasonable product instincts —
exactly the accretion P4 warns about. The guard exists because the format's failure mode is a drift, not a
single bad call anyone would notice themselves making.

## Lenses

- **Compliance — PASS.** Placement/format carries no advisory exposure; the teaching content itself is
  governed unchanged by D-009/D-025/P2.
- **Product — CONCERN, answered.** `1f` sits closest to the curriculum shape the product rejects. Answered
  by the four-part guard above, which is checkable at review rather than left to judgment.
- **Technical — CONCERN, answered.** The heaviest of the three to build — a new full-screen sequence
  surface rather than a card in an existing thread. Answered by scope: it is a presentation container over
  teaching content the backend already produces, needing no service or schema change.
- **Cost-and-Scope — CONCERN, answered.** Materially more build than `1e`. Accepted knowingly by the owner
  as a direct fork choice; recorded here so the cost is on the record rather than discovered later.

## Reversibility

Medium-high. A container format for content that already exists; swapping to `1e` later re-homes the same
content. No data migration, no schema or API contract change.
