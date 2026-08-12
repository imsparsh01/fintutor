# BRIEF — How should learning progression be completed without turning teaching into a lesson gate?

**Status:** Awaiting owner decision.  
**Date:** 12-Aug-2026  
**Blocks:** BQ-071 remainder and BQ-070.

## Triggers fired

- **Standing-principle interpretation:** D-117 expects a meaningful teaching-engagement event while
  D-090/P9 deliberately gives `TeachingWalkthrough` no completion state or completion signal.
- **MVP scope:** recap and profile-coverage surfaces do not currently exist; creating them cannot be
  smuggled into progression placement as an implementation detail.
- **Product judgment:** placement and presentation define what the learning journey means to the user.

## Decision 1 — Teaching progression signal

### Path A — Preserve D-090; defer teaching events for v1 (recommended)

Leave `teaching_moment_explored`, teaching revisits, and the teaching capability milestone unwired until
FinTutor has a deliberate non-gating teaching interaction. Other Explore events still allow progression.

- Preserves P9 completely.
- Closes BQ-071 without fabricating engagement from a screen view or rewarding lesson completion.
- Costs one currently-defined event family in v1.

### Path B — Credit explicit engagement with static `TeachingBlock` only

The owner would need to choose a qualifying interaction and subject namespace. Viewport dwell is weak
evidence; a deliberate “explore” control is stronger but adds UI semantics. Walkthroughs remain uncredited.

### Path C — Credit reaching the end of a walkthrough

Requires superseding D-090's no-completion guard. Not recommended: it recreates completion pressure around
teaching and moves toward the lesson-tree behaviour P9 forbids.

## Decision 2 — Minimum progression surface package

### Recommended package

1. Put a compact learning-progress summary on Home and open a hidden Progress detail screen; keep D-106's
   five visible tabs unchanged.
2. Show the named stage plus continuous progress. On detail, show the next-stage point, breadth, and return
   conditions in plain language, including the statement that the stage is participation—not competence or
   financial health.
3. Show recent qualifying actions using D-121's approved event history, human labels, and no financial
   values, inputs, or answer content.
4. Defer recap to a separately bounded decision: no recap feature or honest `recap_completed` interaction
   contract exists today.
5. Defer profile coverage to a separately bounded decision: no evidence-backed denominator exists, and it
   must remain mathematically and visually separate from learning progression.
6. In Expanding, show the lifetime total and factual 250-point milestone acknowledgements; do not introduce
   a sixth rank or a new cosmetic reward system in this item.

### Alternatives

- A sixth tab reopens the decided five-tab navigation and gives progression disproportionate prominence.
- A Profile/settings placement requires a new primary concept that does not exist.
- Building recap/profile coverage now expands the current task before their meaning and qualifying signals
  are defined.

## What only the owner can judge

Whether preserving the no-completion teaching boundary is worth leaving teaching events unwired, and
whether the recommended minimum progression package gives learning progress enough prominence without
turning it into FinTutor's primary product.

## Rule extraction

A progression event must evidence a meaningful user action that already exists in the product. The need to
award progress never creates a completion state, disclosure pressure, or new product surface by itself.
