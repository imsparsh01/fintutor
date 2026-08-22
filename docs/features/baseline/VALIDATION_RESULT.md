# Baseline owner validation result

**Date:** 23-Aug-2026

**Prototype commit:** `842c0a5`

**Disposition:** PASS

| Task | No coaching | State/provenance understood | Neutrality clear | Recovery clear | Notes |
|---|---|---|---|---|---|
| Baseline orientation | Pass | Pass | Pass | Pass | Recorded, unknown and excluded remained distinct; ₹95,000 - ₹63,100 = ₹31,900. |
| Captured holding | Pass | Pass | Pass | Pass | Correction stayed unsaved; dismissal saved nothing; confirmation created one saved record. |
| Recategorise | Pass | Pass | Pass | Pass | Cancel preserved equity/value; confirm changed type and removed disclosed incompatible value. |
| Budget cadence | Pass | Pass | Pass | Pass | Adding ₹18,000 cadence changed income ₹95,000 -> ₹1,13,000 and net ₹31,900 -> ₹49,900 only. |
| Goal funding | Pass | Pass | Pass | N/A | ₹2,00,000 live value allocated ₹1,20,000/₹80,000; no movement or reservation implied. |
| Partial outage | Pass | Pass | Pass | Pass | Failure was not rendered empty; retry restored exactly two goals without duplication. |
| Saved/reminder failure | Pass | Pass | Pass | Pass | Holding remained authoritative; reminder-only retry created no duplicate. |
| Account switch | Pass | Pass | Pass | Pass | Mira records cleared during load; only Kabir fixtures rendered afterward. |

## Owner decisions

O-01 to O-04 are resolved by D-149/D-150. The owner delegated the walkthrough to an independent agent panel;
all eight scenarios passed after the bounded revisions below.

## Confusion, interventions, trust surprises and required changes

The first independent pass found two actionable prototype defects: captured proposals lacked correction and
rejection routes, and confirmed recategorisation retained a current value the disclosure said would be removed.
The prototype added correct/dismiss paths with an explicit unsaved boundary and removed the incompatible value
after confirmation. Direct browser QA and a fresh independent agent rerun then passed both revised scenarios.

Account switching validates visible stale-data suppression in a controlled fixture, not a real delayed-backend
race. Goal funding has no task-specific failure path, so recovery is recorded N/A rather than inferred.
