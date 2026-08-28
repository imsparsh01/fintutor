# Home functional, content and safety contracts

## Inputs and outputs

Home reads the verified subject, consolidated totals/status/count metadata, Portfolio Health snapshot,
progression summary, streak/reward result and assessment-invite eligibility. Home writes no financial data.
Its outputs are navigation intents, independent retry intents, dismissals and explicit account-control opens.

## Functional contract

- Each independently sourced block owns loading, last-known, failure and retry state.
- A refresh generation is subject-scoped; late results from another subject are discarded.
- Empty/unvalued/excluded/mixed statuses use the backend metadata directly.
- No signed net-worth total is invented from the three family totals.
- Portfolio Health shows measured coverage and routes to the selected mechanism; unknown sub-scores show “Not measured.”
- Calculators and scenarios are user-chosen routes. Prefills remain editable downstream.
- Account controls remain grouped and visibly lower-priority than the learning/financial picture.

## Content contract

Use: “Recorded,” “Not recorded,” “Not valued yet,” “Some values need review,” “Last updated,” “Try again,”
and “Choose where to continue.”

Do not use: “healthy/unhealthy finances,” “good/bad,” “urgent,” “fix this first,” “recommended,” “best next
step,” “behind,” “complete your profile,” or any wording that turns missing data into failure.

Every calculated or recorded amount stays in neutral ink. Behaviour colour may appear only on participation
mechanics under P7/P10.

## Privacy and ownership

- The verified JWT subject is authoritative (D-137); app tables remain backend-only (D-142).
- Account identity is visible before financial data.
- Permission loss and account transition clear financial content immediately.
- Optional assessment/context prompts state that amounts and account details are not required.
- Export, deletion and privacy disclosure retain their existing reauthentication/disclosure contracts.

## Accessibility

- One H1-equivalent page title, followed by section headings in visual order.
- Every interactive card is a named button; no nested interactive controls.
- Status changes use a polite live region; permission loss uses an assertive alert.
- Focus moves to a retried section result or opened panel, not to the page top.
- Minimum 44px targets, visible focus, AA text/control contrast and no colour-only meaning.
- Horizontal collections provide explicit previous/next controls in addition to touch scrolling.

## Failure and recovery

- Offline and ordinary section failures preserve successful content and input/navigation position.
- A retry is manual and idempotent; it never duplicates content or silently repeats a prior action.
- Permission denial is not treated as offline; it removes subject data and requests reauthentication.
- Stale content includes its source timestamp until a successful refresh replaces it.

## Progression and analytics

Viewing Home does not imply learning completion. Existing app-open/streak semantics remain unchanged.
Prototype interactions emit no analytics and persist nothing.
