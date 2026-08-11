# D-119 — Assessment v2 persistence, privacy, eligibility, and migration package approved

**Date:** 12-Aug-2026  
**Tier:** 3 — owner approved the recommended package directly in conversation.  
**Implements:** D-118; authorises the bounded schema and migration work below.

## Decision

The recommended package in `BRIEF-assessment-v2-persistence-privacy.md` is approved in full:

1. FinTutor is 18+ for initial release. Eligibility acknowledgement happens before assessment and is not
   a personalization axis or rank.
2. Assessment v2 uses a separate versioned table. It stores only normalized category codes and structural
   completion state—never raw answers or dialogue.
3. Arya receives only the minimum normalized abstraction relevant to the current explanation, not the
   full assessment by default. Optional typed clarification is transient and disclosed.
4. Users can view, change, and clear the assessment. Account deletion removes it; clearing it does not
   remove earned progress. Broader retention periods, backups, provider terms, and final legal notice stay
   within the still-open D-010 privacy policy before real-user launch.
5. Backend state is authoritative across devices; the local completion flag becomes a cache/fallback.
   Global skip is a valid handled state.
6. Existing users are grandfathered without inferred answers or forced reassessment. They may opt into v2
   later and receive equivalent one-time setup-handled progression credit without duplicate awards.

## Approved implementation boundary

This decision authorises a new assessment table and migration, normalized assessment API/state machine,
frontend five-question flow, eligibility acknowledgement, legacy compatibility, and minimum-context Arya
integration. Exact table/column names, constraints, API field names, and deterministic UI mechanics are
bounded implementation details.

It does not authorise raw transcript storage, general conversation memory, advertising/lead scoring,
financial-outcome progression, a third-party analytics service, or the progression event-ledger schema.
Those remain separate decisions.

## Why

Separating v2 from the legacy track table preserves meaning, rollback, and auditability. Normalized-only
storage minimizes data while still making personalization durable. Grandfathering avoids forced
redisclosure and preserves the ungated onboarding principle.

## Reversibility

Moderate before real-user launch. The separate-table design allows rollback without rewriting legacy
rows. Once real users provide assessment context, schema/retention changes require explicit migration.
