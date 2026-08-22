# Arya feature package

**Work item:** BQ-107  
**Status:** Package and prototype complete; awaiting owner validation.  
**Production impact:** None. The prototype is fixture-only and does not call FastAPI, Supabase, or a model.

## Package contents

- `PRD.md`: user problem, outcome, principles, success criteria, scope and evidence.
- `JOURNEY_AND_STATES.md`: entry-to-exit journey and complete state matrix.
- `CONTRACTS.md`: functional, content, privacy, accessibility and failure contracts.
- `ACCEPTANCE_AND_VALIDATION.md`: acceptance matrix, seven owner tasks and recording protocol.
- `DECISION_REGISTER.md`: settled constraints, prototype hypotheses and escalation boundaries.
- `VALIDATION_RESULT.md`: owner walkthrough record and final disposition.
- `prototype/`: standalone interactive HTML/CSS/JavaScript fixture journey.

## Prototype design read

Preserve-mode mobile product prototype for a trust-sensitive Indian personal-finance learner. It uses the
existing warm-ledger tokens, restrained state-only motion and moderate daily-app density.

- `DESIGN_VARIANCE: 3` - predictable mobile hierarchy supports trust and task observation.
- `MOTION_INTENSITY: 2` - motion is limited to short state feedback and respects reduced-motion settings.
- `VISUAL_DENSITY: 5` - enough context for financial provenance without turning Chat into a dashboard.
- Visual system: FinTutor's existing IBM Plex Sans, Newsreader and IBM Plex Mono roles with one tutor-green
  accent, one soft-card radius system and page-level light/dark themes.

## Run the prototype

From the repository root:

```bash
python3 -m http.server 4173
```

Open:

`http://127.0.0.1:4173/docs/features/arya/prototype/`

Append `?theme=light` or `?theme=dark` for deterministic theme review. Without a parameter, the page follows
the operating-system preference.

Use the task selector above the phone frame. Complete the tasks in the validation document without reading
the expected observations first. Record the outcome in `VALIDATION_RESULT.md` using the provided template.

## Gate

BQ-107 remains blocked on owner validation. A PASS freezes this package and permits bounded production build
items. REVISE, PARK and ESCALATE follow D-148. Do not edit production prompts, APIs, schemas or calculations
from prototype feedback without completing that disposition.
