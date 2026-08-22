# Personal financial baseline feature package

**Work item:** BQ-109

**Status:** Definition and fixture prototype complete. Owner decisions and validation remain open.

**Production impact:** None. The prototype uses controlled data and makes no network or storage request.

## Package contents

- `PRD.md`: user problem, outcome, scope, evidence and success criteria.
- `JOURNEY_AND_STATES.md`: end-to-end journey and state matrix.
- `CONTRACTS.md`: functional, data, privacy, accessibility and failure contracts.
- `ACCEPTANCE_AND_VALIDATION.md`: acceptance matrix and eight owner tasks.
- `DECISION_REGISTER.md`: settled constraints, hypotheses and unresolved Tier-3 forks.
- `OWNER_DECISION_BRIEF.md`: four owner decisions exposed by the audit.
- `VALIDATION_RESULT.md`: pending owner record.
- `prototype/`: standalone HTML/CSS/JavaScript controlled-fixture journey.

## First-principles model

The baseline is not a completeness score. It is a user-owned set of facts with visible provenance and limits.

`explicit capture -> authoritative owned record -> visible correction -> live derived views -> safe reuse`

The bottleneck is not record creation. It is knowing which facts are current, which are excluded, and what a
change affects before other features reuse it.

## Prototype design read

Preserve-mode trust-sensitive product UI using FinTutor's warm-ledger language.

- `DESIGN_VARIANCE: 3`: predictable hierarchy for high-consequence record changes.
- `MOTION_INTENSITY: 2`: only short state feedback, with reduced-motion support.
- `VISUAL_DENSITY: 6`: enough provenance and exclusion detail without a dashboard wall.
- One green accent, soft-card radius system, IBM Plex Sans/Mono and Newsreader roles, light/dark system theme.

## Run

From the repository root:

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/docs/features/baseline/prototype/`.

## Gate

The prototype does not settle the four forks in `OWNER_DECISION_BRIEF.md`. Owner decisions must be recorded
before those paths can be frozen. The remaining settled scenarios then require owner validation under D-148.
