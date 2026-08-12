# D-123 — Progression completion package approved

**Date:** 12-Aug-2026  
**Tier:** 3 — owner approved both recommendations directly in conversation.  
**Interprets:** D-090 and D-117 for the teaching-event conflict; implements D-114/D-116.  
**Brief:** `docs/features/progression/BRIEF-progression-completion-decisions.md`

## Decision

Preserve D-090 and P9 unchanged. In progression ruleset v1, leave `teaching_moment_explored`, teaching
revisits, and teaching `capability_first_used` unwired until FinTutor has a deliberate, meaningful,
non-gating teaching interaction. The need to award progress does not create a completion state, dwell-time
proxy, disclosure pressure, or lesson gate. This resolves BQ-071: every currently valid emitter is shipped.

Implement the approved user-facing package:

1. A compact learning-progress summary on Home opens a hidden Progress detail screen. The five visible
   tabs remain unchanged.
2. Home and detail show the named stage and continuous progress. Detail explains the remaining point,
   breadth, and return-day conditions and states that progression represents participation, not competence
   or financial health.
3. Detail shows recent qualifying actions from D-121's approved history using human labels only—no
   financial values, inputs, answer content, or product choices.
4. Recap and `recap_completed` are deferred because no recap interaction or honest completion contract exists.
5. Profile coverage is deferred because no evidence-backed denominator exists; it remains separate from
   learning progression.
6. Expanding shows the lifetime total and factual 250-point milestone acknowledgements, with no sixth rank
   and no new cosmetic reward system.

## Why

The package makes the approved journey visible and understandable without reopening primary navigation or
turning teaching into a curriculum. Recent semantic events provide transparent attribution while preserving
D-121's data-minimisation boundary.

## Rule extraction

A progression event must evidence a meaningful user action that already exists in the product. Awarding
progress never creates a completion state or new product surface by itself.

## Reversibility

Placement and presentation are reversible before external launch. The package does not migrate the durable
data model.
