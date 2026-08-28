# Onboarding acceptance matrix

**Status:** BQ-122 evidence layer; prototype tasks are locked, O-ONB-1/O-ONB-2 await owner ruling.

**Sources:** `CURRENT_PRD.md`, `JOURNEY_AND_STATES.md`, `CONTRACTS.md`, D-118, D-119 and D-126.

Every criterion has a stable ID. BQ-123 must record evidence against all criteria, not merely show that the
happy path clicks. `PENDING OWNER` criteria become executable only after the matching decision is ruled.

## A. Access and ownership

| ID | Given / when | Then |
|---|---|---|
| AC-A01 | Verified session is resolving assessment state | Neutral loader renders; neither Onboarding nor app content flashes |
| AC-A02 | Backend returns handled v2 | App opens and best-effort subject cache refresh cannot reverse access |
| AC-A03 | Backend returns in-progress v2 | Exact authoritative current question resumes |
| AC-A04 | No v2; any legacy backend row exists | App opens; no legacy track/value is translated or exposed |
| AC-A05 | Assessment read fails; handled/legacy subject cache exists | App opens using that subject-scoped outage fallback |
| AC-A06 | Assessment read fails; no authoritative/cache evidence | Owner-ruled O-ONB-1 surface appears; emptiness is not called success |
| AC-A07 | Protected request returns 401/403 | No assessment/context values remain; account-entry recovery appears, never new-user intro |
| AC-A08 | Account changes during request | Old state clears immediately and every late prior-subject response is discarded |
| AC-A09 | Any request is made | JWT subject is authoritative; fixture state cannot be selected through a user-id input |

## B. Eligibility and start

| ID | Given / when | Then |
|---|---|---|
| AC-E01 | Genuinely new user reaches intro | 18+ requirement, five optional questions, no amounts/account details and skip availability are clear |
| AC-E02 | User acknowledges 18+ | Start saves once; busy/disabled state prevents duplicate submission |
| AC-E03 | Start succeeds or identical concurrent start resolves | Q1 renders once with no duplicate record/state |
| AC-E04 | Start transport/5xx fails | Intro remains, failure is announced, no success/cache claim appears, explicit retry works |
| AC-E05 | Legacy user enters voluntary route before start | Not now returns Home without eligibility or assessment write |
| AC-E06 | Eligibility is not acknowledged | No v2 row is created |

## C. Five-question interaction

| ID | Given / when | Then |
|---|---|---|
| AC-Q01 | Any prompt renders | Correct approved title/helper/options and Question n of 5 are present |
| AC-Q02 | Single-choice answer is pressed | It saves immediately, disables controls while busy and advances once after success |
| AC-Q03 | Exposure prompt has no selection | Continue is disabled; Skip and global exit remain usable |
| AC-Q04 | Specific exposures are selected | Multiple specifics coexist and render checked |
| AC-Q05 | none/unsure/undisclosed is selected | Specifics clear; only one sentinel remains selected |
| AC-Q06 | Specific exposure is selected after a sentinel | Sentinel clears and the specific value remains |
| AC-Q07 | Skip is pressed | Only current axis becomes undisclosed and next question renders |
| AC-Q08 | Continue to app is pressed | Remaining axes become undisclosed and normal closing/handoff renders |
| AC-Q09 | Last prompt is answered/skipped | Status handles once and normal closing/handoff renders |
| AC-Q10 | Save fails | Current prompt and unsaved selection remain; alert announces not saved; retry is explicit |
| AC-Q11 | Response was lost after commit, then same request retries | Authoritative next/handled state returns without double advance or conflict |
| AC-Q12 | Different/out-of-order stale request returns 409 | Proposed value is not shown as saved; refresh/reconciliation is required |
| AC-Q13 | Flow is interrupted/reloaded | Backend state resumes exact current prompt with prior saved answers |
| AC-Q14 | An axis is skipped | It is not requested again in the same v2 flow |

## D. Closing and first-action handoff

| ID | Given / when | Then |
|---|---|---|
| AC-H01 | Assessment becomes handled | Discovering is explained as journey position, not knowledge/financial judgment |
| AC-H02 | Any closing renders | Arya, Portfolio, Goals, Tools and Home all remain visible/selectable |
| AC-H03 | Intent has a mapped destination | At most one route says “Suggested from what you chose” and its accessible name includes that reason |
| AC-H04 | Intent is explore/undisclosed/unknown | No route is highlighted and no inference is invented |
| AC-H05 | Any route is chosen | All choices disable synchronously; one navigation event is recorded |
| AC-H06 | Home is chosen with no context/records | Home opens; no disclosure or baseline record is required |
| AC-H07 | Any suggestion is shown | No “best/recommended/right next step” language or reordered/hidden alternative appears |

## E. Legacy, management and clearing

| ID | Given / when | Then |
|---|---|---|
| AC-M01 | Legacy invitation appears | It is clearly optional, dismissible and does not block Home |
| AC-M02 | Legacy invite is dismissed | Only that subject's invitation hides; access/context remain unchanged |
| AC-M03 | Voluntary v2 is interrupted | Re-entry resumes current question; it never returns to legacy track conversation |
| AC-M04 | Handled user opens Personalization | Five user-facing labels appear; no normalized codes/IDs/timestamps appear |
| AC-M05 | One axis is changed | Approved value saves; cleared status ends; other axes remain unchanged |
| AC-M06 | Edit is cancelled | Last authoritative values remain and no write occurs |
| AC-M07 | Edit save fails | Proposed value is not shown as current; alert + retry/cancel/back remain |
| AC-M08 | Clear is requested | Separate consequence confirmation offers Yes clear and Keep answers |
| AC-M09 | Clear succeeds | Five values become Not provided/undisclosed; visible cleared notice appears; access/progress remain |
| AC-M10 | Clear fails | All prior values remain; not-cleared alert and safe recovery remain |
| AC-M11 | Cleared context reaches Arya | No assessment-derived learning context is sent |

## F. Privacy, content and progression

| ID | Given / when | Then |
|---|---|---|
| AC-P01 | Any Onboarding state | No amount, balance, debt, score, identifier, institution/product, employer/address/health/family identity or free-form history is requested |
| AC-P02 | Any axis is unknown/skipped/cleared | No other record or axis infers it; it never becomes low familiarity or missing holding |
| AC-P03 | Handled context personalizes Arya | Only approved explanation style and exact topic-matched prior-exposure boolean may derive |
| AC-P04 | Assessment is absent/in-progress/cleared | No learning context derives |
| AC-P05 | User answers versus individually skips same prompt | Same prompt-handled progression treatment; answer value never enters event |
| AC-P06 | Assessment completes or globally exits | One onboarding-handled milestone per flow version; emitter failure cannot block success |
| AC-P07 | Global exit handles remaining prompts | Total treatment follows owner-ruled O-ONB-2 and is explicitly visible in fixture ledger |
| AC-P08 | Context changes/clears | Progress never visibly decreases and no disclosure celebration appears |
| AC-P09 | Fixture runs | No network, model, analytics or durable browser/device storage is used |

## G. Accessibility, responsive behavior and recovery

| ID | Given / when | Then |
|---|---|---|
| AC-X01 | Keyboard-only use | Visual-order Tab path reaches every action; Enter/Space activate; focus is always visible |
| AC-X02 | Screen reader semantics are inspected | One page heading; progressbar name/value; radio/checkbox checked; busy/disabled/alert/status names are correct |
| AC-X03 | Question succeeds | Focus moves to new question heading; no lost focus |
| AC-X04 | Failure occurs | Error is announced and triggering action remains recoverable |
| AC-X05 | Context saves/clears | Result is announced without color-only meaning |
| AC-X06 | Targets/contrast are measured | Every target is at least 44×44; text/control contrast meets AA thresholds |
| AC-X07 | 320/390 mobile viewport | No horizontal overflow; skip/exit/error/handoff/confirmation remain visible and usable |
| AC-X08 | Wide desktop viewport | Reading width stays bounded and task/control relationship remains clear |
| AC-X09 | 200% text zoom | Content reflows without clipping, overlap or hidden actions |
| AC-X10 | Reduced motion | Non-essential transitions stop; no action depends on animation/timing |
| AC-X11 | Light/dark/system fixture theme | Deterministic palette renders with the same semantics and AA contrast |
| AC-X12 | Console and DOM audit runs | Zero errors/warnings, duplicate IDs, nested interactive controls, unnamed controls or invalid heading gaps |

## H. State and journey coverage map

| Source coverage | Acceptance evidence |
|---|---|
| S-01, S-02, S-03, S-04, S-05 | AC-A01, AC-A06, AC-E01..AC-E04 |
| S-06, S-07, S-08, S-09, S-10, S-11 | AC-Q01..AC-Q14 |
| S-12, S-13, S-14, S-15, S-16 | AC-H01..AC-H07, AC-P06/AC-P07 |
| S-17, S-18, S-19, S-20, S-21 | AC-A02..AC-A06 |
| S-22, S-23, S-24, S-25 | AC-E05, AC-M01..AC-M03 |
| S-26, S-27, S-28, S-29, S-30, S-31 | AC-M04..AC-M11 |
| S-32, S-33, S-34, S-35, S-36 | AC-A07/AC-A08, AC-Q12, AC-P03..AC-P08 |
| J1 complete | AC-E01..AC-E03, AC-Q01..AC-Q09, AC-H01..AC-H06 |
| J2 skip/exit | AC-Q07..AC-Q09, AC-P05..AC-P07 |
| J3 resume | AC-A03, AC-Q13, AC-M03 |
| J4 failure/retry | AC-Q10..AC-Q12, AC-X04 |
| J5 handoff | AC-H01..AC-H07 |
| J6 legacy | AC-A04, AC-M01..AC-M03 |
| J7 manage/clear | AC-M04..AC-M11 |
| J8 switch | AC-A08/AC-A09 |

## I. BQ-123 prototype tasks

1. **New complete:** acknowledge, answer five including exposure exclusivity, verify suggested handoff and open
   every destination (AC-E01..04, AC-Q01..09, AC-H01..07).
2. **Skip/exit:** individually skip, globally exit, verify undisclosed meanings and O-ONB-2 ledger behavior
   (AC-Q07..09, AC-P05..08).
3. **Interrupt/resume:** save partial state, simulate relaunch and resume exact prompt (AC-A03, AC-Q13).
4. **Failure/reconciliation:** fail save, retry; simulate committed/lost response; trigger stale conflict and
   refresh (AC-Q10..12, AC-X04).
5. **Legacy:** grandfather access, dismiss invite, voluntarily start/cancel/resume (AC-A04, AC-E05,
   AC-M01..03).
6. **Manage/clear:** inspect labels, change/cancel/fail/retry, confirm/cancel/fail/succeed clear (AC-M04..11).
7. **Auth/switch:** deny permission and switch subjects while response is pending; prove zero residue
   (AC-A07..09).
8. **New-user outage:** execute the owner-ruled O-ONB-1 recovery and prove eligibility/access semantics.
9. **Cross-cutting QA:** static/syntax/forbidden API/storage checks; all controls/routes; mobile/wide/zoom;
   keyboard/focus/semantics; contrast/themes/reduced motion; DOM/console integrity (AC-P09, AC-X01..12).

## J. Validation recording contract

BQ-123 agent QA records PASS/FAIL and evidence for every AC ID. BQ-124 owner validation records, per task:

- completed without coaching;
- correctly understood what is optional, saved, unknown, cleared and used by Arya;
- correctly understood Discovering and route suggestion neutrality;
- recovered without a dead end or stale/cross-account residue;
- confusion, surprise or trust concern; and
- PASS / REVISE / PARK / ESCALATE disposition.

A broad “looks good” cannot substitute for the criterion ledger, and a passing happy path cannot cover an
untested failure or account-transition state.
