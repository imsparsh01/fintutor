# Critical brief — assessment v2 persistence, privacy, eligibility, and migration

**Status:** OWNER DECISION REQUIRED before implementation.
**Why Tier 3:** new durable personal-context schema; external-model data boundary; retention/deletion;
populated-state migration; legal/age eligibility.

## What is already settled

D-114 delegated the five-axis assessment design. D-118 now fixes the questions, normalized categories,
skip equivalence, no-amount boundary, and legacy experience. No further copy or flow choice is needed.

## Recommended package

Approve the following as one coherent boundary:

1. **Eligibility:** FinTutor is 18+ for initial release. Age is handled before assessment through an
   eligibility acknowledgement, not used as a personalization axis and not displayed as a rank.
2. **Persistence:** add a separate, versioned assessment table rather than changing the meaning of the
   populated legacy `onboarding_states` columns. Store normalized category codes only—never raw answers
   or dialogue. One current v2 record per user, with status/current-question/completion timestamps.
3. **Arya boundary:** send only the minimum normalized abstraction needed for the current explanation
   (principally familiarity and relevant generic exposure), never the full assessment by default. No raw
   onboarding text is persisted. Any typed clarification is processed transiently under the same provider
   boundary as chat and disclosed before the flow begins.
4. **Control and lifecycle:** users can view/change/clear assessment context. Account deletion removes it.
   A skipped/cleared value becomes `undisclosed`; clearing context never removes earned progress. Final
   retention periods, backups, provider terms, and legal notice wording remain part of the broader D-010
   privacy policy before real-user launch.
5. **Completion:** backend assessment status becomes authoritative cross-device state; the existing local
   flag becomes a cache only. Global skip is a valid `handled` status.
6. **Legacy:** grandfather existing users; do not infer new fields from old tracks; preserve legacy rows
   during compatibility rollout; offer optional reassessment. When progression launches, grant the same
   one-time setup-handled credit to grandfathered users without requiring redisclosure or allowing a
   duplicate award.

## Alternatives considered

- **Extend `onboarding_states`:** fewer objects, but mixes incompatible old-track and new-axis semantics,
  creates sparse migration columns, and weakens rollback/auditability.
- **JSON document:** flexible, but weaker constraints and easier accidental over-collection.
- **No persistence:** safest for data, but the answers cannot personalize later sessions and the user must
  repeat onboarding across devices.
- **Infer from legacy records:** rejected; old tracks cannot truthfully populate five independent axes.
- **Mandatory re-onboarding:** rejected; contradicts the ungated experience and creates disclosure pressure.

## Owner response needed

“Approve the recommended package” is sufficient. Any change to eligibility, stored values, Arya exposure,
legacy credit, or lifecycle should be stated explicitly because those choices alter the implementation
and compliance boundary.
