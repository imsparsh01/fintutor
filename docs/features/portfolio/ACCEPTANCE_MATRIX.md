# Portfolio acceptance matrix

**Status:** BQ-128 complete. D-162..D-165 are realized; `QA_EVIDENCE.md` records 96/96 PASS.

**Sources:** `PRD.md`, `JOURNEY_AND_STATES.md`, `CONTRACTS.md`, D-065, D-076, D-089, D-096,
D-106, D-110, D-111 and D-161.

Every criterion has a stable ID. BQ-128 must record direct evidence against all criteria after the owner
closes the four formerly pending criteria; a clickable happy path alone is insufficient.

## A. Access, ownership and account isolation

| ID | Given / when | Then |
|---|---|---|
| AC-A01 | Verified subject opens Portfolio | Account identity appears before financial content; neutral scoped loader renders |
| AC-A02 | Any Portfolio API request is made | Verified JWT subject is authoritative; caller user ID cannot select ownership |
| AC-A03 | One subject requests an unowned record | Neutral not-found/permission response; no record existence or content leaks |
| AC-A04 | Protected read/write returns 401/403 | All financial/context content and drafts clear; reauthentication appears |
| AC-A05 | Account changes while reads are pending | Prior content clears immediately; every late prior-subject result is discarded |
| AC-A06 | Account changes while a dialog/draft is open | Dialog, draft, cache and optional local context for prior subject clear |
| AC-A07 | User signs out | Subject-scoped local Portfolio state is actively cleared under D-155 |
| AC-A08 | Prototype fixture changes scenario/account | No fixture control becomes a production user-ID input or network selector |

## B. Portfolio overview, units and provenance

| ID | Given / when | Then |
|---|---|---|
| AC-O01 | Overview loads successfully | Identity, freshness, structure, Health, families, concentration and trend teaching render in stable order |
| AC-O02 | Three family totals render | Investments, Loans and Insurance remain separate; no signed net-worth subtraction appears |
| AC-O03 | Any figure renders | Label, unit, source boundary, inclusion rule and freshness are visible/inspectable |
| AC-O04 | Valid authoritative value is exactly zero | Zero is shown neutrally with its unit and source |
| AC-O05 | Value is missing, invalid, excluded or unavailable | It never renders as zero and its exact status is named |
| AC-O06 | One or more unclassified records exist | Separate review count appears; no family or total is guessed |
| AC-O07 | Allocation has records | Each classified record counts once; text and visual both say records, not rupees |
| AC-O08 | Allocation source fails | Unavailable state appears; family navigation remains; no empty allocation is claimed |
| AC-O09 | No classified records exist | Empty structure appears without completeness/deficiency framing; all families remain reachable |
| AC-O10 | One overview block fails | Successful blocks remain visible and interactive; retry affects only failed source |
| AC-O11 | User inspects hierarchy | Stable order is not personalized from values and contains no priority/recommendation language |

## C. Family sections and empty teaching

| ID | Given / when | Then |
|---|---|---|
| AC-F01 | Investments, Loans or Insurance has no record | Family remains reachable and says “Nothing recorded here,” not confirmed real-world absence |
| AC-F02 | Empty family opens | Mechanism/category teaching appears without named products or purchase prompt |
| AC-F03 | Empty walkthrough opens | Static steps claim no personal-number use; close/skip remain available throughout |
| AC-F04 | Empty walkthrough ends | Optional Arya handoff and “I think I have one” capture route are user chosen; nothing unlocks |
| AC-F05 | Manual add is offered | It is visible and secondary to teaching/AI-assisted capture |
| AC-F06 | Family is loading | Title and neutral loader appear; empty state does not flash |
| AC-F07 | Family read fails | Family-specific alert/retry appears; overview and other families retain state |
| AC-F08 | Family contains valid, unvalued and invalid records | Every record remains in list with human label/type and exact value status |
| AC-F09 | Family total is mixed | Known amount and limitation/counts appear together; amount alone is not called full total |
| AC-F10 | Family is fully excluded | Records remain visible; family total says excluded/unavailable under approved formula |
| AC-F11 | User opens a row | Exact owned holding detail opens with no hidden normalized ID/code as primary content |

## D. Holding detail and management

| ID | Given / when | Then |
|---|---|---|
| AC-M01 | Holding detail renders | Saved fields have human labels/units; unknowns are explicit; recorded and computed content differ |
| AC-M02 | User asks Arya about holding | Owned alias is server-resolved; real display name/raw identifier is absent from model context |
| AC-M03 | Manual create opens | Family-scoped approved types and explicit fields render; alias is not requested from ordinary user |
| AC-M04 | Create is cancelled | Nothing persists and family remains unchanged |
| AC-M05 | Create succeeds | One record appears once with generated alias/fresh authoritative version |
| AC-M06 | Edit opens | Authoritative saved values remain distinct from draft; save/cancel are available |
| AC-M07 | Validation fails | Named invalid field remains in draft; saved record and derived views stay unchanged |
| AC-M08 | Edit is cancelled | No write occurs; authoritative values remain |
| AC-M09 | Edit succeeds | Updated record/version replaces old state once; affected derived views refresh without celebration |
| AC-M10 | Recategorization drops/inapplicates fields | Field-loss preview appears before explicit confirmation |
| AC-M11 | Same-version competing write arrives first | 409/current-versus-proposed comparison requires revise/reconfirm/cancel; no silent overwrite |
| AC-M12 | Mutation response is lost after commit | App reads authoritative record/version before retry; no duplicate write |
| AC-M13 | Delete is requested | Neutral impact preview names linked goals/funding/reminder and affected computed views |
| AC-M14 | Delete is cancelled | Record, links and derived views remain unchanged |
| AC-M15 | Delete becomes stale | Fresh impact/current version appears and requires reconfirmation |
| AC-M16 | Delete succeeds | Exact record and declared links disappear once; copy does not claim real-world financial change |
| AC-M17 | Record write succeeds but reminder maintenance fails | Record remains saved; separate reminder retry is non-blocking and idempotent |

## E. Concentration and trend teaching

| ID | Given / when | Then |
|---|---|---|
| AC-C01 | No supported mutual-fund records exist | Mechanism teaching appears; no “0% diversified” or deficiency verdict |
| AC-C02 | One supported fund exists | Count says one fund/one category by definition and avoids inference |
| AC-C03 | Multiple supported funds exist | Equity/debt category counts and denominator match fixture records exactly |
| AC-C04 | Concentration renders in any state | Identical “what this shows / cannot tell” limitation appears |
| AC-C05 | User reads concentration | No scheme overlap, rupee weighting, risk grade, adequacy or action is claimed |
| AC-C06 | User opens trend | Copy explains comparable snapshots; no chart, return, benchmark or fabricated history appears |

## F. Portfolio Health

| ID | Given / when | Then |
|---|---|---|
| AC-H01 | Portfolio Health loads | Four stable levers render with neutral placeholders; unknown is not zero |
| AC-H02 | No lever is measured | No composite is presented; four missing sources remain user-controlled and optional |
| AC-H03 | A lever is expanded | Name, points/unknown state, unit, mechanism, sources, formula boundary and missing inputs are exposed |
| AC-H04 | Investment rate is measured | Accepted income/outflow inputs and 10%-equals-100 rule are legible; result is not advice |
| AC-H05 | Insurance is inspected | D-162 health presence, term presence and recorded cover-to-income ratio are separate; sources/unknowns are legible |
| AC-H06 | Emergency buffer is measured | Confirmed months and 12-month scale are legible; value is not inferred from balances |
| AC-H07 | Tax utilisation is measured | Included types/cadences and ₹1.5L denominator are legible; no tax-savings claim appears |
| AC-H08 | Some measures are unavailable | Available/unknown mechanisms are unmistakable; D-163 forbids a partial/full composite |
| AC-H09 | Every mechanism is measured | Individual values/sources remain visible; no composite, averaging or grade appears |
| AC-H10 | Portfolio Health summary renders | D-165 uses availability and factual measure names only; no band/headline grade appears |
| AC-H11 | Input/context changes or clears | Only dependent measures recalculate; copy says recalculated, not improved/worsened |
| AC-H12 | Health input save fails | Prior authoritative state remains; alert and retry/cancel/back are available |
| AC-H13 | Health/source read fails | Affected lever is unavailable, not zero; unaffected levers remain inspectable |
| AC-H14 | User views/changes financial score/context | No learning/progression reward or celebration fires |

## G. Optional context, privacy and model boundary

| ID | Given / when | Then |
|---|---|---|
| AC-P01 | Optional emergency/health context is requested | Storage/use/optional status are clear before save; cancel/prefer-not-to-answer costs nothing |
| AC-P02 | Emergency months is absent | It is unknown; balances, holdings, budget and onboarding do not infer it |
| AC-P03 | Health-insurance presence is absent | It is unknown; policy holdings or another account/device do not infer it |
| AC-P04 | Health-insurance presence is saved/cleared | D-164 account-owned cross-device/view/change/clear/export/deletion/account-switch semantics hold |
| AC-P05 | Holding display name is shown in app | It remains inside authenticated UI and is replaced by alias before model boundary |
| AC-P06 | Errors/logs/fixture evidence are inspected | No names, amounts, characteristics, drafts or context answers are emitted externally |
| AC-P07 | User exports/deletes account | Every account-owned Portfolio record/final context follows existing registry/reauth contracts |
| AC-P08 | Prototype runs | All data is hypothetical/in-memory; no network, model, analytics, cookie or durable storage API exists |

## H. Failure, stale and offline recovery

| ID | Given / when | Then |
|---|---|---|
| AC-R01 | Last-known scoped data exists and refresh fails | Values stay labelled stale with timestamp; manual retry appears |
| AC-R02 | Device is offline with scoped cache | Last-known view remains labelled; unsafe mutations are unavailable; no silent retry |
| AC-R03 | Device is offline without cache | Static structure/teaching may remain; no empty/zero/score claim appears |
| AC-R04 | Connection returns | Banner changes state but financial content refreshes only after explicit retry |
| AC-R05 | Retry succeeds | Only affected block updates in place; no duplicate/reordered content |
| AC-R06 | 5xx/network failure occurs | It is unavailable, not permission loss, stale conflict or empty state |
| AC-R07 | 409 occurs | It is stale conflict with compare/reconfirm recovery, not generic retry |
| AC-R08 | 401/403 occurs | It is permission loss; data clears and reauthentication appears, not offline copy |

## I. Content, accessibility and responsive behavior

| ID | Given / when | Then |
|---|---|---|
| AC-X01 | Any Portfolio state renders | Copy uses precise recorded/known/unknown/invalid/excluded/unavailable language |
| AC-X02 | Any financial figure/state renders | No good/bad, optimize/fix, urgency, priority, recommendation or performance language/color appears |
| AC-X03 | Keyboard-only use | Visual-order Tab reaches every action; Enter/Space work; focus is always visible |
| AC-X04 | Screen-reader tree is inspected | One page heading, ordered sections, named controls, expanded states, text equivalents, alerts/status are correct |
| AC-X05 | Dialog opens/closes | Focus traps/restores; title and consequence are associated; Escape/cancel works |
| AC-X06 | State changes after retry/save/conflict | Focus moves to meaningful result/error; no lost focus or page-top jump |
| AC-X07 | Targets/contrast are measured | Every product target is at least 44×44; text/control/focus contrast meets AA |
| AC-X08 | 320px/390px mobile | Figures/legends/actions stack with no horizontal page overflow or hidden recovery |
| AC-X09 | Wide desktop | Reading width remains bounded and related source/figure/limit content stays together |
| AC-X10 | 200% text zoom | Content reflows with no clipping, overlap, fixed-height loss or precision gesture |
| AC-X11 | Reduced motion | Non-essential motion/smooth scroll stop; no action depends on timing/animation |
| AC-X12 | Light/dark/system themes | Same semantics and AA contrast hold; financial valence does not change |
| AC-X13 | DOM/console/static audit runs | Zero errors/warnings, duplicate IDs, nested controls, unnamed controls, heading gaps or forbidden APIs |

## J. State and journey coverage map

| Source | Acceptance evidence |
|---|---|
| P-01..P-05 | AC-A01..A05, AC-O01..O06 |
| P-06..P-10 | AC-F01..F11, AC-M01..M02 |
| P-11..P-14 | AC-M03..M17 |
| P-15..P-19 | AC-O07..O10, AC-C01..C06 |
| P-20..P-25 | AC-H01..H14, AC-P01..P04 |
| P-26..P-31 | AC-R01..R08, AC-A04..A07 |
| P-32 | AC-F02..F05, AC-H14, AC-X01..X02 |
| Journey 1–4 | AC-A01..A08, AC-O01..O11 |
| Journey 5 | AC-H01..H14 |
| Journey 6–8 | AC-F01..F11, AC-M01..M17 |
| Journey 9 | AC-C01..C06, AC-F02..F05 |
| Journey 10–12 | AC-R01..R08, AC-A04..A07 |

## K. BQ-128 prototype tasks

1. **Complete Portfolio:** orient in Aarav's three-family/full-health view; explain every unit; open every
   overview, family, holding and health route.
2. **Empty Portfolio:** use Kabir to enter all three empty families, complete/skip walkthroughs, open Arya and
   manual capture, and prove nothing is gated or written implicitly.
3. **Mixed partial:** use Mira to locate known/unvalued/invalid/excluded/unclassified records and explain why
   no synthetic total appears.
4. **Manage holding:** inspect, create/cancel, edit/cancel/fail/succeed, recategorize with field-loss review,
   lost-response reconciliation and stale conflict.
5. **Delete holding:** cancel, stale conflict, confirm, then simulate reminder-only post-write failure/retry.
6. **Concentration/trend:** test zero/one/many supported funds, identical limitation block and no fabricated
   trend or performance claim.
7. **Portfolio Health:** test none/partial/full measured states under D-162..D-165 outcomes; save/fail/retry/
   clear optional context and verify no reward.
8. **Read recovery:** local source failure/retry, stale, offline with/without cache and explicit reconnect.
9. **Auth/isolation:** 401/403 and Aarav-to-Meera switch during in-flight reads/writes with zero residue.
10. **Cross-cutting QA:** static/syntax/forbidden API/storage; every control/route; mobile/wide/zoom;
    keyboard/focus/semantics; target/contrast/themes/reduced motion; DOM and console integrity.

## L. Owner validation recording contract

BQ-128 agent QA records PASS/FAIL and evidence for every AC ID. BQ-129 owner validation records per task:

- completed without coaching;
- correctly understood records versus rupees, points and category counts;
- correctly understood unknown, excluded, invalid, stale and unavailable;
- correctly understood Portfolio Health and concentration as non-judgmental mechanisms;
- recovered without dead end, duplicate write or stale/cross-account residue;
- confusion, surprise or trust concern; and
- PASS / REVISE / PARK / ESCALATE disposition.

A broad approval cannot replace the criterion ledger, and owner comprehension cannot be inferred from agent QA.
