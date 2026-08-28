# Portfolio prototype QA evidence

**Scope:** BQ-128 controlled fixture only  
**Prototype:** `prototype/index.html`  
**Result:** PASS, 96/96 acceptance criteria

## Test environment and methods

- Chromium in-app browser against `http://127.0.0.1:4173/docs/features/portfolio/prototype/`.
- Direct interaction with all ten scenario selectors, product routes, dialogs and fixture controls.
- Browser DOM snapshots, console logs, focus checks, computed theme tokens and responsive overflow/target audit.
- Viewports: 320×720, 390×844, default desktop and 1440×900. Browser zoom enlarged twice for reflow.
- Explicit `?theme=light`, `?theme=dark`, system theme and reduced-motion CSS inspection.
- `node --check prototype/app.js`, `node prototype/qa.mjs`, `git diff --check` and forbidden-API search.
- No external request, storage, cookie, analytics, model or service-worker capability exists in the fixture.

## Acceptance ledger

| ID | Result | Direct evidence |
|---|---|---|
| AC-A01 | PASS | Initial/loading fixtures show the account label and scoped skeleton before financial content. |
| AC-A02 | PASS | Fixture has no caller-ID/network surface; account selection exists only in separated validation controls. |
| AC-A03 | PASS | “Request unowned record” returns one neutral unavailable dialog with no record facts. |
| AC-A04 | PASS | “Lose permission” clears screen/history/dialog state and renders reauthentication only. |
| AC-A05 | PASS | Aarav-to-Meera switch immediately shows a clean destination loader; late Aarav response is logged discarded. |
| AC-A06 | PASS | Switch and permission handlers close the open dialog and null family/holding history. |
| AC-A07 | PASS | “Sign out” uses the same active subject-state clearing path and announces removal. |
| AC-A08 | PASS | Scenario/account controls are visibly labelled fixture-only and no network/user-ID input exists. |
| AC-O01 | PASS | Overview order is identity, freshness, structure, families, Health, concentration, trend and controls. |
| AC-O02 | PASS | Three family cards show separate recorded values; no signed or net-worth total is rendered. |
| AC-O03 | PASS | “How this is formed” exposes label/unit, source, inclusion and exclusion for figures. |
| AC-O04 | PASS | Zero-capable formatter renders exact authoritative zero as `₹0`, distinct from null. |
| AC-O05 | PASS | Mixed fixture names unvalued, invalid, excluded and unclassified states; none renders zero. |
| AC-O06 | PASS | Mira shows one separate classification-review record outside family totals. |
| AC-O07 | PASS | Allocation text and accessible label count each classified record and explicitly say “not rupees.” |
| AC-O08 | PASS | Failed overview says unavailable and keeps direct Health route; it never claims empty allocation. |
| AC-O09 | PASS | Kabir shows zero classified records plus all three reachable families without deficiency language. |
| AC-O10 | PASS | Failed current block retains independent routes and retry updates only the selected source. |
| AC-O11 | PASS | Stable fixture order is value-independent and visible copy contains no priority/recommendation framing. |
| AC-F01 | PASS | Every empty family says “Nothing recorded here” and disclaims real-world absence. |
| AC-F02 | PASS | Each empty family has mechanism teaching without product/security names or purchase prompt. |
| AC-F03 | PASS | Walkthrough dialog states no personal numbers are used and exposes Close throughout. |
| AC-F04 | PASS | Walkthrough ends with optional Arya/capture controls; closing changes nothing. |
| AC-F05 | PASS | Manual add is a text-style secondary action after teaching, Arya and capture. |
| AC-F06 | PASS | Family loading retains its h1 and three skeletons; no empty copy flashes. |
| AC-F07 | PASS | Family failure has a family-specific alert, retry and Portfolio back action. |
| AC-F08 | PASS | Mira lists every valid, unvalued and invalid record with human label/type/status. |
| AC-F09 | PASS | Mixed family shows known amount together with valued/limited counts and explicit limitation. |
| AC-F10 | PASS | Aarav Insurance retains the excluded term record and says family value unavailable. |
| AC-F11 | PASS | Holding row opens the exact named record; raw IDs/aliases are absent from primary content. |
| AC-M01 | PASS | Detail separates recorded fields, units, unknowns and computed-view disclosure. |
| AC-M02 | PASS | Arya handoff states Alias-01 plus approved characteristics and excludes display name/raw ID. |
| AC-M03 | PASS | Manual create shows family-scoped type and labelled fields; it never asks for an alias. |
| AC-M04 | PASS | Native dialog Cancel/Escape closes with unchanged family fixture. |
| AC-M05 | PASS | Add inserts one in-memory record with generated internal key/version 1 and announces once. |
| AC-M06 | PASS | Edit identifies saved version as authoritative and labels input as an unsaved draft. |
| AC-M07 | PASS | Empty label produces inline error, retains dialog draft and leaves saved record unchanged. |
| AC-M08 | PASS | Edit Cancel/Escape returns focus and preserves name/version. |
| AC-M09 | PASS | Save increments version once, replaces name and announces recalculation without valence. |
| AC-M10 | PASS | Recategorize previews exact inapplicable fields before confirmation. |
| AC-M11 | PASS | Stale edit shows current/proposed columns with revise, reconfirm and cancel. |
| AC-M12 | PASS | Lost-response control increments authoritative version and logs that no duplicate write was sent. |
| AC-M13 | PASS | Delete preview names goal, reminder and recalculated family views. |
| AC-M14 | PASS | Delete Cancel leaves record and declared links intact. |
| AC-M15 | PASS | Test stale review presents fresh version/current-proposed comparison before reconfirmation. |
| AC-M16 | PASS | Confirm removes one fixture record once and avoids real-world financial-change claims. |
| AC-M17 | PASS | Reminder failure appears after commit; retry clears it without repeating deletion. |
| AC-C01 | PASS | Zero-fund state teaches mechanism and explicitly rejects “0% diversified.” |
| AC-C02 | PASS | One-fund control renders one fund and one broad category without inference. |
| AC-C03 | PASS | Many-fund control derives exact equity/debt counts from Mira fixture records. |
| AC-C04 | PASS | One invariant “What this shows / cannot tell” block remains in zero/one/many states. |
| AC-C05 | PASS | Limit text excludes overlap, rupee weight, risk, adequacy, performance and action. |
| AC-C06 | PASS | Trend screen explains comparable snapshots and contains no chart/return/benchmark/history. |
| AC-H01 | PASS | Health loading holds four stable skeleton groups and never prints zeros. |
| AC-H02 | PASS | Kabir has four unknown mechanisms and no composite at all. |
| AC-H03 | PASS | Each expandable row exposes unit, mechanism, source, boundary and missing input. |
| AC-H04 | PASS | Investment rate names accepted income/outflows and the 10%-to-100-points mapping. |
| AC-H05 | PASS | Insurance expands to separate health presence, term presence and cover/income ratio. |
| AC-H06 | PASS | Emergency buffer identifies user-confirmed months and states it is not inferred. |
| AC-H07 | PASS | Tax utilisation names included sources/₹1.5L denominator and rejects savings claims. |
| AC-H08 | PASS | Mira names available and unknown mechanisms with no partial/full composite. |
| AC-H09 | PASS | Aarav shows every individual mechanism with no average, composite or grade. |
| AC-H10 | PASS | Summary says “groups available” plus “No composite score or grade.” |
| AC-H11 | PASS | Context save/clear affects dependent rows and uses “recalculated,” never improved/worsened. |
| AC-H12 | PASS | Test save failure retains dialog/prior values and provides retry, cancel and Escape/back. |
| AC-H13 | PASS | Failed insurance source says unavailable; other three mechanism rows remain inspectable. |
| AC-H14 | PASS | No progression state/event exists; context actions explicitly log “no reward emitted.” |
| AC-P01 | PASS | Context dialog explains optional account storage/use/control before save and supports cancel. |
| AC-P02 | PASS | Missing emergency months remains “Unknown” and says it is not inferred from balances. |
| AC-P03 | PASS | Missing health presence remains “not provided” despite insurance holdings. |
| AC-P04 | PASS | Context copy states account-owned, cross-device, change/clear/export/delete semantics. |
| AC-P05 | PASS | Authenticated UI displays human name; Arya route documents server alias replacement. |
| AC-P06 | PASS | Console/error log stays empty; fixture log contains events only, never payloads/amounts. |
| AC-P07 | PASS | Overview exposes export and delete-account previews; context copy includes both. |
| AC-P08 | PASS | Static audit proves hypothetical in-memory data and no forbidden external/durable APIs. |
| AC-R01 | PASS | Stale fixture retains values, timestamp label and explicit “Refresh now.” |
| AC-R02 | PASS | Offline-with-cache labels last-known state and disables edit/delete/context mutations. |
| AC-R03 | PASS | Offline-without-cache renders unavailable teaching, not empty/zero/score. |
| AC-R04 | PASS | Restore changes to stale banner; financial refresh waits for explicit action. |
| AC-R05 | PASS | Retry clears only `failedBlock`; order and independent content stay unchanged. |
| AC-R06 | PASS | Source failure copy says unavailable and is distinct from empty, permission and conflict. |
| AC-R07 | PASS | 409 simulation shows compare/reconfirm semantics, not generic retry. |
| AC-R08 | PASS | Permission simulation clears data and renders sign-in recovery, not offline copy. |
| AC-X01 | PASS | Visible-copy audit uses recorded/known/unknown/unvalued/invalid/excluded/unavailable terms. |
| AC-X02 | PASS | Search and browser audit find no good/bad, optimize/fix, urgency or performance valence. |
| AC-X03 | PASS | Native controls are keyboard reachable; Enter/Space work and 3px focus outline is visible. |
| AC-X04 | PASS | DOM snapshots show one screen h1, ordered h2s, named controls, expanded state, alerts/status. |
| AC-X05 | PASS | Native modal identifies title/body, traps focus; Escape closes and focus restoration test passes. |
| AC-X06 | PASS | Rendered state changes focus the main result or the relevant error field/opener. |
| AC-X07 | PASS | Product controls have 44px minimum; palette/focus pairs were inspected in both themes. |
| AC-X08 | PASS | 320×720 and 390×844 audits report no horizontal document overflow; actions stack. |
| AC-X09 | PASS | 1440×900 audit keeps phone at 430px and validation/evidence lines bounded. |
| AC-X10 | PASS | Two browser zoom increments retain reflow with no document overflow or clipped dialog. |
| AC-X11 | PASS | Reduced-motion media query disables animation, transition and smooth scrolling. |
| AC-X12 | PASS | Explicit light token `#f4f1ea`, dark token `#171917` and system mode render same semantics. |
| AC-X13 | PASS | DOM/static audit finds no duplicate/static h1, forbidden APIs or console warnings/errors. |

## Browser run summary

- Core route run: complete overview → Investments → holding → lost response, PASS, console clean.
- Management run: invalid edit → valid save → stale comparison → cancel, PASS, console clean.
- Empty/Health/recovery/isolation run: all asserted states true, console clean.
- Deletion run: impact → stale comparison → reconfirm → reminder-only retry, PASS, console clean.
- Responsive run: 320, 390 and 1440 widths reported zero horizontal document overflow.
- Theme/focus regression run: explicit light/dark tokens differ correctly; Escape closes and restores opener.

## Findings fixed during QA

1. Explicit light mode was initially overridden by the system dark media query. Explicit theme tokens were
   moved to final cascade authority and retested.
2. Native Escape did not reliably restore focus in the automation path. An explicit dialog Escape handler
   now closes through the shared restoration function and retests PASS.

No unresolved BQ-128 finding remains in this evidence run.
