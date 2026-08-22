# FinTutor ten-workstream product-definition programme

**Status:** Phase 1 complete; workstream deep dives proceed one at a time.  
**Decision:** D-148.  
**Boundary:** This programme validates and improves the already-approved MVP. It does not authorise new
production scope, schema changes, money-logic changes, or reinterpretation of FinTutor's standing principles.

## Purpose

The live application is evidence of what has been implemented, not proof that every feature is coherent,
understood, or ready for external users. The programme converts each major product area into an
owner-validated, decision-complete feature package before further production engineering in that area.

The sequence is:

`portfolio audit -> ranked deep dive -> interactive fixture prototype -> owner validation -> build contract`

D-124 remains the integrated external activation test after internal validation. Individual feature
prototypes are owner-validated; they are not separate target-user studies.

## Workstreams

1. Account entry and access
2. Onboarding and first-action handoff
3. Home and consolidated experience
4. Personal financial baseline
5. Arya teaching and conversational capture
6. Portfolio and Portfolio Health
7. Calculator suite
8. Scenario and focused-explorer suite
9. Interactive teaching walkthroughs
10. Reminders, engagement, and learning progression

Account data controls and backend security are cross-cutting review requirements, not an eleventh
workstream.

## Common deep-dive package

Each workstream must produce, in one self-contained feature folder:

1. A PRD covering target user, problem, observable outcome, principles, success criteria, exclusions and
   dependencies.
2. A journey map covering discovery, entry, primary and alternate paths, completion, return and exit.
3. A state matrix covering loading, empty, partial, valid, invalid, stale, permission denial, offline/backend
   failure, account transition and recovery where applicable.
4. A functional contract covering inputs, outputs, persistence, calculations, API requirements, privacy,
   accessibility, progression/analytics and failure semantics.
5. A content contract covering teaching intent, neutral wording, disclosures, provenance and prohibited
   claims.
6. An acceptance matrix connecting requirements to prototype tasks and eventual automated/manual tests.
7. A decision register routing every unresolved fork through the standing tier protocol.
8. A clickable journey using controlled fixture data only, plus 5-8 owner task scenarios and a validation
   record.

Existing documents are reconciled and referenced rather than rewritten. Existing code is an observed fact,
not an automatically accepted requirement.

## Prototype gate

A prototype passes only when the owner can complete every critical task without coaching and can correctly
explain what the feature knows, does not know, calculates, and does not recommend. The record must capture
interventions, confusion, trust surprises, dead ends and required specification changes.

- **PASS:** freeze the package and create bounded build-queue items.
- **REVISE:** return only the failed workflow or assumption to definition/prototype.
- **PARK:** record an explicit unpark condition.
- **ESCALATE:** write an owner brief for a Tier-3 boundary.

No production implementation is authorised by a prototype alone.

## Programme controls

- One workstream deep dive per session; production build items remain separately bounded.
- Prototype data is hypothetical or seeded and requires no production schema/API mutation.
- Money logic, privacy, legal/tax interpretation, principle changes, low-reversibility architecture and MVP
  scope increases remain owner-only decisions.
- Every eventual build contract must include exact UI states, interfaces, data controls, calculations and
  disclosures, accessibility, automated tests, manual prototype scenarios, and codemap updates.
- After all approved workstreams are built, run one integrated owner walkthrough before D-124 recruitment.

