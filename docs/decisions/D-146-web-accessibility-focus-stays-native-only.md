# D-146 — Imperative accessibility focus stays native-only

- **Date:** 14-Aug-2026
- **Tier:** 1 — bounded conformance repair
- **Status:** Shipped

## Decision

React Native's imperative `findNodeHandle` / `setAccessibilityFocus` path is used only on native platforms.
Web keeps the existing accessible result announcements and semantic headings, but does not call the native-
only focus API.

## Why

Owner live-validation exposed a web crash immediately after a calculator rendered a valid result:
`findNodeHandle is not supported on web`. The same pattern existed in four shared result/modal surfaces.
Platform-guarding those calls preserves the intended native focus behavior and prevents the web runtime from
failing. This changes no calculator formula, financial output, product behavior or persisted data.

## Delivery

BQ-106 applies the guard to calculator results, emergency coverage, holding reconciliation announcements and
the Tools loan-picker modal. The Goal contribution gap was then rerun live with the original failing inputs
and rendered its modeled value, monthly requirement and signed gap successfully.
