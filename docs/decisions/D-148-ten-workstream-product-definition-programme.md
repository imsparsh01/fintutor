# D-148 — Ten-workstream product definition precedes further production engineering

**Tier:** 3 — owner-decided product sequencing and internal-validation boundary.  
**Interprets:** D-125 — expands the owner's internal validation into ten explicit feature workstreams without
changing D-125's external-testing sequence.  
**Date:** 23-Aug-2026

## Decision

Treat the existing application as a functional first draft rather than proof that each major feature is
complete. Audit ten named workstreams on a common 100-point model, then take them one at a time through a
decision-complete package, controlled-data interactive prototype and owner-only validation before authorising
new production engineering in that workstream.

The ten workstreams are account entry; onboarding; Home; financial baseline; Arya; Portfolio Health;
calculators; scenarios/explorers; teaching walkthroughs; and reminders/engagement/progression. Account data
controls and backend security remain cross-cutting requirements.

External target-user evidence remains D-124's integrated 12-participant activation test after internal owner
validation. Individual workstreams do not each run a separate user study.

## Boundaries

- This decision does not add MVP capabilities or unpark deferred features.
- Prototypes use controlled fixture data and do not change production schemas, APIs or money calculations.
- A prototype does not authorise production work; the approved package and validation record do.
- Money logic, privacy, legal/tax interpretation, standing-principle changes, low-reversibility architecture
  and scope increases remain separate owner decisions.
- Workstream deep dives and later builds remain one bounded task per session.

## Why

Implementation breadth is not the current constraint. The constraining uncertainty is whether the app's
implemented paths form a coherent context-to-insight-to-trust loop that the owner can use and explain without
coaching. A comparable audit prevents effort from following screen order or feature novelty instead of causal
importance and risk.

## Reversibility

High. The programme creates decision and prototype artifacts before production mutations. A workstream may be
revised, parked or reordered without migrating user data or changing running behaviour.

