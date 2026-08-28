# Home acceptance matrix

## Cross-cutting invariants

- **AC-X1:** all eight D-104 areas and all account/context controls are reachable.
- **AC-X2:** no unknown, unreadable, excluded, stale or failed value appears as ₹0.
- **AC-X3:** no copy recommends, ranks, pressures or applies valence to financial figures.
- **AC-X4:** the visible account always precedes its financial content; transition/permission states show no residue.
- **AC-X5:** keyboard order equals visual order, controls have unique names, focus is visible, and status is announced.
- **AC-X6:** manual retries are local and idempotent.

## State acceptance

| ID | Given / when | Then |
|---|---|---|
| AC-L1 | Home first loads | Shape-matched skeletons reserve the final layout; no zero amounts appear |
| AC-E1 | Subject has no records | Empty copy says nothing is recorded and offers equal user-chosen routes |
| AC-P1 | Some values are missing or unreadable | Known totals remain, each limitation is named, no grand total appears |
| AC-V1 | All sources return | Refresh timestamp and every required area render in hierarchy order |
| AC-S1 | Last-known data exists and refresh fails | Values remain visibly stale with timestamp and manual retry |
| AC-F1 | One source fails | Only that section shows an error; successful sections remain interactive |
| AC-O1 | Connection drops | Offline banner appears, content remains labelled last-known, retry is manual |
| AC-D1 | Protected request is unauthorized | Subject financial content clears and reauthentication is offered |
| AC-A1 | Account changes during load | Prior content clears immediately and late responses are discarded |
| AC-R1 | Retry succeeds | One section updates in place, banner clears, no duplicate appears |

## Interaction acceptance

| ID | Interaction | Expected result |
|---|---|---|
| AC-I1 | Open a family row | Route intent names Investments, Loans or Insurance |
| AC-I2 | Open Health overall or sub-score | Route intent names Portfolio Health and optional focus area |
| AC-I3 | Ask Arya | Route intent names Chat; no suggested financial priority is injected |
| AC-I4 | Choose calculator or scenario | Chosen tool opens; preview and View all preserve the full catalogue |
| AC-I5 | Open Learn or Progress | Teaching question/progress detail opens without awarding a financial outcome |
| AC-I6 | Dismiss optional invite/reward | Only that optional card disappears |
| AC-I7 | Open context/privacy/export/logout/delete | Correct controlled panel opens; destructive simulation never deletes data |

## Prototype tasks and required test evidence

1. Complete mixed-data orientation and open every destination (AC-X1, AC-P1, AC-I1 to AC-I7).
2. Explain the empty view without interpreting unknown as zero (AC-E1, AC-X2, AC-X3).
3. Recover a financial-picture failure without losing Health or Arya (AC-F1, AC-R1).
4. Inspect a stale/offline view, restore connection and retry manually (AC-S1, AC-O1, AC-R1).
5. Trigger permission loss and verify no subject data remains (AC-D1, AC-X4).
6. Switch Mira to Kabir during an in-flight load and inspect the discarded response (AC-A1, AC-X4).
7. Navigate the entire prototype by keyboard in light and dark themes (AC-X5).
8. Repeat with reduced motion and mobile/wide viewports (AC-X5).

BQ-118 QA must record syntax/static checks, every scenario and action, console errors, responsive screenshots,
theme checks, reduced-motion checks, keyboard/focus checks and accessible-name checks before BQ-119 opens.
