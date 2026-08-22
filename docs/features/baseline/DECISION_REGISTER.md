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

## Owner decisions required

| ID | Fork | Trigger |
|---|---|---|
| O-01 | Management breadth for income, discretionary categories and goals | MVP scope/product contract |
| O-02 | Goal progress: static earmark sum or live holding-value mechanism | User-relied-on money logic |
| O-03 | Stale-write contract for ordinary direct edits | Low-reversibility architecture/data correctness |
| O-04 | Holding write succeeds but reminder side effect fails | Financial-data correctness and architecture |

See `OWNER_DECISION_BRIEF.md`. Until decided, the prototype demonstrates the fork without authorising production.
