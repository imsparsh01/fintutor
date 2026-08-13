# D-136 — Historical delivery audits remain exception-only and token-lean

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-confirmed governance constraint protecting D-081 while applying D-135.  

## Decision

Historical decision-to-delivery reconciliation must not recreate the large mandatory-reading surface that
D-081 removed. Audits use compact title/cross-reference indexes, codemaps and the live delivery tracker
first; they open only specific decisions, BQ entries and source files whose trace is missing, partial or
contradictory.

The persistent output is exception-only:

- open obligations live in `DECISION_DELIVERY_TRACKER.md`;
- executable or decision-gated implementation lives in `BUILD_QUEUE.md`;
- completed history remains in existing archives and is grepped on demand; and
- no second full narrative matrix of every historical decision is maintained.

An audit is complete when every shortlisted exception has evidence and a disposition, not when every old
decision has been copied into a new file. Any later-discovered exception is added immediately and treated as
a control failure rather than forcing another wholesale reread.

## Why

D-081 reduced mandatory session-start reading from roughly 58,000 tokens to 9,000–10,000. A comprehensive
duplicated traceability matrix would gradually restore the same compounding cost. Exception-first auditing
preserves full coverage through indexes and targeted evidence while keeping routine context bounded.

## Rule extraction

Coverage is established by searchable traces plus explicit exceptions; it does not require duplicating
closed history into the live context window.
