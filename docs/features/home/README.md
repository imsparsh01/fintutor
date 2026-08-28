# Home and consolidated experience

Definition and controlled-fixture prototype for D-156/BQ-118 under the D-148 programme.

## Status

| Artifact | Status |
|---|---|
| `PRD.md` | Complete |
| `JOURNEY_AND_STATES.md` | Complete |
| `CONTRACTS.md` | Complete |
| `ACCEPTANCE_MATRIX.md` | Complete |
| `DECISION_REGISTER.md` | Complete |
| `prototype/` | Complete; exhaustive agent QA PASS in `QA_EVIDENCE.md` |
| `VALIDATION_RESULT.md` | Complete; owner PASS, package frozen at `f1c51a4` |

## Prototype

Serve the repository root:

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/docs/features/home/prototype/`. Add `?theme=light` or `?theme=dark` for a fixed
theme. The left panel selects a controlled validation
scenario. Fixture controls are visibly separate from the product. Nothing is sent or saved.

## Fixed boundaries

- D-104's eight areas remain reachable: financial picture, Portfolio Health, Arya, calculators, scenarios,
  Learn, learning progress/reward, and account/context controls.
- D-111 keeps the Portfolio Health name and user-controlled drill-down.
- P10 keeps real financial figures visually neutral.
- BQ-119 passed. This package is definition-complete; production changes require separately bounded items.
