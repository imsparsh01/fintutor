# Onboarding clickable-prototype QA evidence

**Gate:** BQ-123 complete on 29-Aug-2026. **Result:** PASS for agent QA; owner validation remains BQ-124.

**Artifact:** `prototype/index.html` with fixture-only `styles.css` and `app.js`. The prototype makes no
network/model/analytics calls, uses no browser/device storage, and changes no production application,
backend, schema, API, dependency, financial data or money calculation.

## Scenario evidence

| Task | Result | Observed evidence |
|---|---|---|
| Complete | PASS | Eligibility led to all five approved prompts. Single-choice answers advanced once. Exposure specifics coexisted, each sentinel cleared specifics, and a later specific cleared the sentinel. Completion produced Discovering copy, at most one attributed suggestion and exactly `onboarding_handled:v2`. Arya, managed-item, goal, calculators/scenarios and Home dialogs all opened without hidden data or recommendation language. |
| Skip and global exit | PASS | A per-question skip advanced one axis; global exit handled all remaining prompts. The closing screen was identical in access and the event ledger contained only one `onboarding_handled:v2`. |
| Interrupt and resume | PASS | Relaunch restored authoritative question 3, with no restart or repeated earlier prompt. |
| Save/reconcile/stale | PASS | Failed save retained the unsaved selected option and recoverable alert; retry advanced once. A committed-but-lost response stayed on the prompt, identical retry reconciled without double advance, and a different stale write produced a 409-style refresh alert while retaining authoritative state. |
| Legacy | PASS | Grandfathered Home remained usable; invitation dismissal wrote no v2 state. Voluntary start exposed Not now before acknowledgement, and Not now returned Home with no write/event. No legacy track/value appeared. |
| Manage and clear | PASS | Five human labels showed no codes or timestamps. Cancel preserved the authoritative answer; change affected one axis only. Clear required separate Keep/Yes confirmation; failure preserved all values; retry replaced all five with neutral undisclosed values while the onboarding milestone remained. |
| Permission and account switch | PASS | 401/403 fixture cleared subject context and showed sign-in recovery. Switching Aarav to Meera cleared the old view immediately; the late Aarav response was discarded and Meera loaded with no residue. |
| New user offline | PASS | Pending 18+ acknowledgement opened only the D-159 limited Home. Arya, Portfolio, Goals, calculators/scenarios and progress remained locked. Reconnection did not silently replay anything; explicit sync opened question 1 with no progression event. |

## Cross-cutting evidence

- `node --check prototype/app.js` passed. Static scans found no `fetch`, XHR, WebSocket, storage,
  Supabase, FastAPI, analytics or model integration and no trailing whitespace or dash-copy violations.
- All nine scenario presets and every product/fixture route were operated in the in-app browser. Browser
  console warning/error log was empty after the complete suite.
- DOM audit found one product `h1`, no duplicate IDs, unnamed controls, nested interactive elements or
  horizontal overflow at the tested desktop viewport. Progress, radio/checkbox, disabled, alert, status and
  dialog semantics were exposed in the accessibility tree. Every product target is at least 44px high;
  40px fixture buttons are explicitly outside the product, and native 13px inputs are wrapped by 50px
  labelled option buttons.
- Keyboard activation uses native button/select/input semantics; visible focus is a 3px high-contrast outline.
  Successful question transitions focus the next question heading. Errors remain announced and actionable.
- The responsive contract is encoded at 880px and 430px: task/phone stack, full-width 100dvh phone at
  320/390 widths, one-column evidence/confirmation, reduced padding and no fixed content width. All content
  lives in scrolling containers, so 200% text cannot clip or hide actions. Desktop content is bounded to a
  430px device and 760px fixture/evidence area.
- Explicit light and dark fixtures were browser-verified after repair: light used `#f4f1ea`, dark used
  `#171917`; measured primary light text contrast was 14.30:1. System mode follows the OS. Semantic borders,
  text and focus tokens are theme-specific. `prefers-reduced-motion: reduce` removes animation, transition
  and smooth scrolling; no state change depends on time or motion.

## Acceptance disposition

All AC-A01..A09, AC-E01..E06, AC-Q01..Q14, AC-H01..H07, AC-M01..M11, AC-P01..P09 and
AC-X01..X12 pass for the controlled-fixture prototype. Production behavior is not claimed by this evidence.

## Findings repaired during QA

1. The owner task-panel title was demoted from `h1` to `h2`, preserving exactly one product page heading.
2. Explicit light mode no longer loses to the operating-system dark preference; only `theme=auto` follows it.
3. A successful context-change or clear retry now removes the earlier failure alert.

No open agent-QA defect remains. BQ-124 must still record the owner's comprehension and PASS / REVISE /
PARK / ESCALATE disposition before the prototype package is frozen.
