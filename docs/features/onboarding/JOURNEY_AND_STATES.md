# Onboarding journey and state matrix

**Status:** BQ-120 reconciled.  
**Scope:** first launch, assessment, handoff, legacy opt-in, context management, account transition and
recovery. This describes current approved intent and observed shipped behavior; `OPEN` rows are not decisions.

## End-to-end journey

### J1 — New user, complete answers

1. Registration yields a verified session.
2. App checks v2 assessment state; no record and no legacy completion are found.
3. User sees the 18+ acknowledgement and optionality/no-financial-details explanation.
4. Acknowledgement creates/resumes v2 at immediate intent.
5. User answers all five questions in fixed order. Each successful response advances one step.
6. The handled response opens the Discovering explanation and five-way handoff.
7. User chooses any destination once; MainTabs opens there with all capabilities still reachable.

### J2 — Per-question skip and global exit

- At any prompt, Skip stores `undisclosed` for that axis and advances normally.
- Continue to app handles every unanswered axis neutrally and opens the same closing/handoff.
- Answer, individual skip and global exit give equal access and equal one-time setup progression treatment.

### J3 — Interrupted and resumed

- Relaunch/account return reads backend state and resumes the exact `current_question`.
- Previously saved answers remain; the screen does not replay or infer them.
- A stale response from a prior subject/session must be discarded after account transition.

### J4 — Save or network failure mid-question

- Current prompt and unsaved local selection remain visible.
- Stable alert explains that the answer was not saved.
- Controls re-enable for explicit retry; the UI does not advance optimistically or duplicate a saved answer.
- If a prior request actually committed but its response was lost, the backend's ordered/idempotent state is
  authoritative on retry/reload.

### J5 — First-action handoff

- Closing explains Discovering without judging familiarity.
- Any immediate-intent-derived suggestion is explicitly labelled “Suggested from what you chose.”
- Arya, Portfolio, Goals, Tools and Home remain equally reachable; Home requires no financial details.
- Selection is single-fire and creates no new persisted handoff state.

### J6 — Legacy existing user

- Presence of any legacy onboarding row grandfathers access without reading or translating its track.
- A device-local legacy completion is an outage fallback, not backend ownership evidence.
- Home may show one dismissible invitation to personalize; dismissal is subject-scoped and does not affect
  access.
- Entering voluntarily permits cancellation before eligibility acknowledgement. After start, ordinary
  per-question skip/global exit/resume applies.

### J7 — View, change and clear

- A handled user opening the hidden Assessment route sees all five normalized values.
- Not-provided/cleared values display plainly rather than as low familiarity or absence of experience.
- A user can change one axis, cancel an edit, or clear all after explicit confirmation.
- Clear keeps the record handled, preserves progress and removes all learning-context influence.
- Failure keeps the last authoritative values, reports an alert and allows retry/back navigation.

### J8 — Account switch

- Subject change resets loader, assessment state and handoff destination before fetching the new subject.
- Backend JWT identity is authoritative; local fallback keys are subject-scoped.
- Late responses from the previous effect are ignored and no prior answer, suggestion or context card appears.

## State matrix

| ID | Situation | Required presentation | Allowed actions | Persistence / recovery | Status |
|---|---|---|---|---|---|
| S-01 | Auth state resolving | No Onboarding/App flash | Wait | Supabase session authoritative | Shipped |
| S-02 | Assessment state loading | Neutral “Preparing your starting point…” loader | Wait | Do not infer new/handled | Shipped |
| S-03 | New: no v2, legacy or local completion | 18+ intro; optionality and no-details copy | Acknowledge 18+ | Start creates v2 | Shipped |
| S-04 | Intro start saving | Busy primary control; no duplicate start | Wait | Concurrent/repeated start is idempotent | Shipped |
| S-05 | Intro start failure | Stable alert; intro remains | Retry | No local completion written | Shipped; see O-ONB-1 |
| S-06 | In progress, single-choice | Question n/5, radio options, skip, global exit | Answer/skip/exit | Successful response advances exactly once | Shipped |
| S-07 | In progress, multi-choice empty | Checkboxes; Continue disabled | Select/skip/exit | Nothing saved until Continue | Shipped |
| S-08 | In progress, multi-choice selected | Exclusive neutral choices cannot mix with specifics | Toggle/continue/skip/exit | Deterministic ordered list | Shipped |
| S-09 | Answer/skip saving | Controls disabled; progress unchanged | Wait | No optimistic advance | Shipped |
| S-10 | Answer/skip failure | Current question + alert | Retry/choose another action | Backend remains authoritative | Shipped |
| S-11 | Interrupted partial state | Exact current question and prior saved answers | Continue/skip/exit | Cross-device backend resume | Shipped |
| S-12 | Global exit success | Same Discovering close and full handoff | Choose any destination | Remaining axes become undisclosed; handled_via=global_exit | Shipped |
| S-13 | All five handled | Discovering close and full handoff | Choose any destination | handled_via=completed | Shipped |
| S-14 | Suggested handoff | One visibly attributed suggestion; no suppressed choices | Choose any route | No handoff state stored | Shipped |
| S-15 | No suggestion | Five equal routes, no invented recommendation | Choose any route | No inference from skip/explore/unknown | Shipped |
| S-16 | Handoff pressed | All choices disabled immediately | Wait for navigation | Single-fire local guard | Shipped |
| S-17 | Handled backend state | App opens without onboarding | Use app | Best-effort subject cache refresh | Shipped |
| S-18 | Assessment read outage + handled cache | App opens | Use app | Subject-scoped cache fallback | Shipped |
| S-19 | Assessment read outage + legacy cache | App opens | Use app | Subject-scoped legacy fallback | Shipped |
| S-20 | Assessment read outage + no cache | 18+ intro currently appears | Retry start only | Cannot establish eligibility/handled state | OPEN O-ONB-1 |
| S-21 | Any legacy backend row | App opens; no track translation | Use app / voluntary invite | Presence-only compatibility | Shipped |
| S-22 | Voluntary route loading | Centered loader | Wait | Fresh backend read | Shipped |
| S-23 | Voluntary route load failure | Plain failure + Back to Home | Return Home | No cached values shown as authoritative | Shipped |
| S-24 | Legacy opt-in before start | 18+ intro with Not now | Start/cancel | Cancel changes no server state | Shipped |
| S-25 | Voluntary partial state | Resume current prompt | Continue/skip/exit | Backend authoritative | Shipped |
| S-26 | Handled context view | Five saved categories and clear explanation | Change/clear/back | No raw/internal metadata shown | Shipped |
| S-27 | Context edit | Approved choices; current value visible | Save/cancel | One normalized axis updates | Shipped |
| S-28 | Context edit failure | Last authoritative value + alert | Retry/cancel/back | Failed value not presented as saved | Shipped |
| S-29 | Clear confirmation | Consequence + Yes, clear / Keep answers | Confirm/cancel | No clear before confirmation | Shipped |
| S-30 | Cleared | Visible cleared notice; all values not provided | Re-add/change/back | Handled/access/progress preserved; learning context null | Shipped |
| S-31 | Clear failure | Existing values + alert | Retry/keep/back | No partial clear | Shipped |
| S-32 | Permission/401/403 | No other-subject context; stable failure surface | Reauthenticate/back where available | JWT subject remains authoritative | Contract needed BQ-121 |
| S-33 | Account switch during request | Reset to new-subject loader; no old response | Wait | Ignore inactive request generation | Shipped at root; prototype must prove |
| S-34 | Stale/out-of-order write | Current authoritative question wins | Reload/retry | Backend ordering/conflict rules; no skipped inference | Contract needed BQ-121 |
| S-35 | Progression emitter failure | Onboarding success remains success | Continue | Emitter is fail-open and isolated | Shipped |
| S-36 | Cleared/absent/unhandled Arya context | Neutral presentation | Use Arya normally | No learning context emitted | Shipped |

## Invariants for all states

1. No state requires financial disclosure for app access.
2. `undisclosed`, `none` and `unsure` keep distinct meanings.
3. Unknown never becomes a negative score, beginner label, absent holding or low familiarity.
4. Every user begins progression at Discovering, regardless of answers.
5. No result from another JWT subject, prior account or late request may render.
6. No assessment path invokes holding capture, baseline reconciliation, Portfolio Health or financial math.
7. Save failure never masquerades as success; progression failure never blocks a successful assessment write.
8. All five first-action destinations remain available and Home requires no context.

## Open issue routed forward

**O-ONB-1 — New-user access during backend outage.** This is not resolved in BQ-120. It combines the D-119
18+ eligibility requirement with the standing ungated/fail-safe direction. Because eligibility has legal
shape, BQ-122 must present owner paths rather than treating a fixture behavior as a Tier-1 implementation
detail.
