# Baseline decision register

## Settled and binding

| Area | Decision | Package treatment |
|---|---|---|
| Families | Investments, loans and insurance only in MVP | Preserved |
| Capture | Arya primary, manual fallback secondary, explicit confirmation | Preserved |
| Management | Holdings have full edit/delete/recategorisation | Preserved |
| Budget | Computed live; conservative income; references holding outflows | Preserved |
| Goals | Thin explicit funding links; no money movement | Preserved |
| Privacy | JWT ownership, FastAPI-only data, local masking before models | Preserved |
| Unknowns | Malformed/unvalued/unclassified records remain visible | Preserved |
| Rewards | No reward from financial data/change | Preserved |

## Prototype presentation hypotheses

| ID | Hypothesis | Evidence for PASS |
|---|---|---|
| H-01 | A source-status strip makes recorded, unknown and excluded facts legible | Owner explains all three without coaching |
| H-02 | A recategorisation impact preview prevents accidental field loss | Owner cancels or confirms with correct prediction |
| H-03 | Invalid cadence belongs beside the source and derived budget | Owner corrects source and predicts budget refresh |
| H-04 | Goal-link language prevents a reservation/movement interpretation | Owner states that no money moved or was reserved |
| H-05 | Partial failure must occupy the failed section, not become empty | Owner recognises outage and retries it |
| H-06 | Clearing old content before account load prevents cross-account trust failure | Owner sees no prior-account record during switch |

## Owner decision status

| ID | Fork | Trigger |
|---|---|---|
| O-01 | Full edit/delete for income, discretionary categories and goals | RESOLVED, D-149 Path B |
| O-02 | Shared proportional live available-value goal progress | RESOLVED, D-149/D-150 Path B |
| O-03 | Durable compare-on-write plus refreshed reconfirmation | RESOLVED, D-149 Path B |
| O-04 | Holding save authoritative; reminder failure separate/retryable | RESOLVED, D-149 Path A |

See `OWNER_DECISION_BRIEF.md` and `GOAL_PROGRESS_RULE_BRIEF.md`. All forks are resolved. Production remains
unauthorised until owner prototype validation is complete.
