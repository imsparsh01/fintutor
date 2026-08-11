# D-110 — Portfolio and Health Score share a lightweight computed snapshot

**Tier:** 2, owner-confirmed
**Interprets:** D-106 — resolves the data-sharing mechanism delegated to BQ-058 planning
**Date:** 12-Aug-2026

## Decision

Portfolio and Health Score share a small module-level snapshot keyed by user ID. Portfolio refreshes
the snapshot on focus; Health Score reuses the resolved snapshot when opened from Portfolio. In-flight
loads are deduplicated, and Health Score input edits recompute the same cached value immediately.

This is not a general application store and does not introduce a provider or dependency. It owns only
the inputs and outputs already needed to compute the four D-106 Health Score sub-scores.

## Lenses

- **Compliance — PASS:** changes data transport only; formulas, user-facing claims, and financial-data
  handling remain unchanged.
- **Product — PASS:** both surfaces display one calculation from one snapshot, avoiding contradictory
  scores within the same navigation flow.
- **Technical — PASS:** smaller than a React Context data layer, deduplicates active requests, and leaves
  a clear path to replace the module if broader shared state is later justified.
- **Cost-and-Scope — PASS:** one narrow module and no new dependency; contained within already-approved
  BQ-058 scope.

## Why

The owner selected the lightweight shared-computed-value option over a full shared store or independent
fetches. It solves the actual risk—two surfaces calculating from different fetches—without establishing
a new app-wide state architecture for one feature.

## Reversibility

High. No schema or persisted-data change; both screens can return to direct fetching or migrate to a
future shared store without data migration.
