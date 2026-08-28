# Portfolio journey and complete state matrix

## End-to-end journey

1. **Enter:** authenticated user opens Portfolio from the persistent tab or an explicit Home/Onboarding route.
2. **Resolve:** show a neutral account-scoped loading shell while holdings, totals, health inputs and optional
   context resolve independently; prior-account content never flashes.
3. **Orient:** identify the account, freshness, partial/offline status and the exact unit of the first view.
4. **Read structure:** inspect Investments, Loans and Insurance as recorded families, with known and limited
   values named rather than collapsed into one net figure.
5. **Understand health:** open Portfolio Health, inspect its four levers, source data, missing inputs,
   calculation limits and non-judgment boundary.
6. **Inspect family:** enter any persistent family whether empty or populated. Empty teaches categories;
   populated shows every record including unvalued or invalid ones.
7. **Inspect holding:** open one record to understand saved characteristics and source provenance.
8. **Manage deliberately:** edit, recategorize or delete through consequence review and version-safe
   confirmation; cancel leaves authoritative state unchanged.
9. **Explore:** open category concentration or trend teaching, then optionally ask Arya or use an own-numbers
   walkthrough without unlocking or rewarding a financial action.
10. **Recover:** retry only the failed source, reconcile stale writes, explicitly refresh after reconnect and
    preserve every independently successful section.
11. **Return:** the authoritative picture refreshes; changed values identify their scope without celebration,
    judgment or implied improvement.
12. **Exit/switch:** logout, permission loss or account change clears all prior-subject records and local
    financial context before the next subject loads; late responses are discarded.

## State matrix

| ID | State | What appears | Available action | Must never happen |
|---|---|---|---|---|
| P-01 | Initial loading | Account shell, Portfolio title and shape-matched neutral skeletons | Wait or use safe account exit | ₹0, stale prior-account chart or score flash |
| P-02 | Empty all families | Three reachable empty families, no overall score claim, neutral teaching offer | Open any family, Arya or secondary manual add | “Incomplete,” purchase prompt or forced capture |
| P-03 | Populated valid | Recorded structure, explicit units, family routes and current timestamp | Inspect any figure/record | Synthetic net worth, priority or performance verdict |
| P-04 | Mixed partial | Known values plus named unvalued/invalid/excluded counts | Open affected family | Silent omission or partial presented as complete |
| P-05 | Unclassified record | Separate unclassified count outside three family totals | Review record classification | Guess a family or hide the record |
| P-06 | One family empty | Empty family stays equally reachable and teaches mechanisms | Walkthrough, Arya, manual add or leave | Hide family or imply user should acquire it |
| P-07 | Family loading | Family title and neutral loader | Wait/back | Empty-state flash |
| P-08 | Family failed | Family-specific alert; other Portfolio content remains | Retry, back, optional manual add when safe | Whole Portfolio erased |
| P-09 | Family populated | Every record, human label/type and known value status | Open record, walkthrough, add | Drop unvalued records from list |
| P-10 | Holding detail | User-recognizable name, type, saved fields and unknowns | Edit, recategorize, delete, ask | Expose internal IDs or call unknown zero |
| P-11 | Edit draft | Authoritative value plus explicit draft fields | Save/cancel | Draft shown as saved before confirmation |
| P-12 | Edit conflict | Current-versus-proposed diff and consequence re-confirmation | Reconfirm, revise or cancel | Overwrite newer state silently |
| P-13 | Delete impact | Linked goals/reminders and exact deletion scope | Confirm or cancel | Cascade surprise or deletion before review |
| P-14 | Post-write recovery | Authoritative record changed; failed reminder is separately recoverable | Retry reminder or continue | Roll back saved record or duplicate write |
| P-15 | Allocation unavailable | Local failure copy and family routes | Retry affected source | Empty allocation claim |
| P-16 | Record-count allocation | Count, legend and “records, not rupees” disclosure | Inspect families | Read as asset weighting or include hidden denominator |
| P-17 | Concentration empty | Mechanism teaching and limitation block | Open Investments | “0% diversified” or deficiency framing |
| P-18 | Concentration populated | Category counts and same limitation block | Inspect contributing funds | Scheme overlap, value weighting or verdict |
| P-19 | Trend unavailable by design | One-point explanation; no fabricated chart | Learn why snapshots are required | Performance line, benchmark or return claim |
| P-20 | Health loading | Four stable mechanism groups with neutral placeholders | Wait/back | Zero values or shifting layout |
| P-21 | Health none measured | No composite; four named unknown mechanisms | Inspect any mechanism or leave | Treat missing data as zero |
| P-22 | Health partial | Available and unknown measures named; no average/grade | Inspect source/limit | Present partial composite or completeness judgment |
| P-23 | Health fully measured | Individual measures, sources, formulas and non-judgment boundary; no composite/band | Expand any mechanism | Good/bad grade, recommendation or priority |
| P-24 | Health input save failure | Prior authoritative value and announced failure | Retry/cancel/back | Proposed value shown as current |
| P-25 | Health context changed | Updated affected lever and visible provenance | Continue or clear/manage context | Celebration or claim finances improved |
| P-26 | Stale snapshot | Last-known timestamp and stale label | Retry or continue knowingly | Present stale values as current |
| P-27 | Offline with cache | Last-known scoped content plus offline banner | Manual retry after reconnect | Silent resend or current claim |
| P-28 | Offline without cache | Neutral unavailable state; family teaching can remain if static | Reconnect, back or sign out | Fabricated zero/empty financial state |
| P-29 | Permission denied | Financial content clears and account-entry recovery appears | Sign in again or leave | Records remain behind banner |
| P-30 | Account transition | Neutral shell identifies destination account | Wait/cancel through auth | Old-account flash or late-response overwrite |
| P-31 | Retry success | Repaired source replaces only its failed/stale block | Continue | Duplicate/reordered content |
| P-32 | Optional teaching | Decline/close always available; saved sources named when used | Continue, ask Arya or dismiss | Gate content or imply financial action earns progress |

## Controlled prototype fixtures

- **Mira, mixed:** Investments/Loans/Insurance all populated; one unvalued policy, one invalid investment
  value, one unclassified record, partial Portfolio Health and multiple fund categories.
- **Kabir, empty:** no holdings or health inputs; every family remains reachable and neutral.
- **Aarav, complete:** all three families readable and all four health inputs present for full-measurement
  comprehension testing.
- **Meera, transition:** distinct sparse records used to prove account-switch isolation and late-response
  discard.

Every amount and identity is hypothetical, stays in browser memory and never leaves the fixture.

## BQ-127 owner outcomes

1. D-162: insurance uses transparent factual components, not one score.
2. D-163: no overall Portfolio Health score at any completeness level.
3. D-164: optional health-insurance presence is account-owned.
4. D-165: no score bands or headline grade.
