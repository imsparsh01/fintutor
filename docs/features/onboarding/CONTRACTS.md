# Onboarding functional, content and safety contracts

**Status:** BQ-121 complete contract draft; acceptance/decision routing pending BQ-122.

**Traces to:** D-009, D-061, D-114, D-117, D-118, D-119, D-121, D-126, D-137, D-142,
D-148, D-155, D-158, D-159 and D-160.

**Applies to:** new-user v2, voluntary legacy opt-in, first-action handoff, context management, outage fallback
and account transitions.

This file converts `CURRENT_PRD.md` and `JOURNEY_AND_STATES.md` into testable contracts. “Must” is an
acceptance requirement. “Observed” describes shipped behavior but does not automatically bless a conflict.
Two conflicts remain OPEN for BQ-122 and are not silently resolved here.

## 1. Functional state contract

### 1.1 Access-state resolution

Resolution is per verified JWT subject and follows this precedence:

1. handled v2 backend state → enter app;
2. in-progress v2 backend state → resume its `current_question`;
3. no v2 + legacy backend row → grandfathered app access;
4. no v2/legacy + subject-scoped handled cache → outage-fallback app access;
5. no v2/legacy + subject-scoped legacy completion cache → outage-fallback app access;
6. no authoritative/cached handled evidence → new-user eligibility intro.

The UI must remain neutral while resolution is pending. It must not flash another branch, reuse the previous
subject's state, infer a handled result from financial data, or create a record on read.

Under D-159, branch 6 may accept an explicit subject-scoped pending 18+ acknowledgement and open only a
limited offline Home. It cannot load/mutate backend data, call Arya, calculate, capture or award progress.
Ordinary access unlocks only after authoritative sync; sign-out/switch clears the pending state.

### 1.2 Assessment transition machine

| From | Event | Guard | Durable result | Next UI |
|---|---|---|---|---|
| absent | acknowledge 18+ | verified subject + backend reachable | v2 row, `in_progress`, Q1 | Q1 |
| absent | decline/not now (voluntary route only) | legacy/grandfathered access | no write | Home |
| in_progress Qn | valid single answer | question equals authoritative current question | normalized code | Qn+1 or closing |
| in_progress Q4 | valid exposure set | non-empty; sentinels exclusive; values allowlisted | ordered unique codes | Q5 |
| in_progress Qn | skip | question equals current | `undisclosed` (array for Q4) | Qn+1 or closing |
| in_progress | global exit | record exists | all remaining nulls become undisclosed; `handled_via=global_exit` | closing |
| handled | repeat same answer request | stored value matches | no duplicate transition | current handled state |
| handled | context update | approved question/value | one field replaced; `cleared_at=null` | context view |
| handled | clear after confirmation | record exists | all five undisclosed; handled/progress retained | cleared context view |

Rules:

- Fixed order is authoritative; the client cannot jump forward or overwrite an already-handled question with a
  different retry payload.
- Repeated start, identical retry and repeated global handle are idempotent.
- The backend returns 409 for stale/different or out-of-order writes; the UI must refresh/reconcile rather than
  claim the proposed value was saved.
- 404 means no assessment record for that subject; 401/403 means account-entry recovery, never “new user.”
- 422 means unsupported question/value/action; user-facing copy remains stable and does not expose internals.
- A request may be retried only by explicit user action. Lost-response retries must not double-advance.

### 1.3 Question behavior

- Question order is immutable within flow version 2.
- Progress announces “Question n of 5” and reflects the current authoritative question, not local optimism.
- Single-choice selection saves immediately; the selected control is disabled while saving.
- Prior exposure is multi-select. Continue is disabled when selection is empty.
- `none`, `unsure`, and `undisclosed` each clear specific exposure selections; selecting a specific exposure
  clears any sentinel. They never coexist.
- Skip remains available for every question and maps only to undisclosed.
- Continue to app remains available after the assessment has started and globally handles remaining questions.
- No answer changes route availability, starting progression stage, financial calculations or baseline records.

### 1.4 Handoff

- Closing appears only after an authoritative handled response.
- Five routes are always shown: Arya, Portfolio, Goals, Tools and Home.
- Immediate intent may produce at most one attributed suggestion using this fixed mapping:

| Intent | Suggested route |
|---|---|
| `ask_arya`, `learn_basics` | Arya |
| `connect_picture`, `understand_existing` | Portfolio |
| `model_future` | Tools |
| `build_routine` | Home |
| `explore`, `undisclosed`, absent/unknown | none |

- The mapping is navigation assistance, never a financial ranking. It does not change copy/order, hide routes,
  persist a recommendation, or claim the suggested route is best.
- A press disables all handoff choices synchronously and navigates once.
- Home and every selected destination must remain usable with no financial records.

### 1.5 Legacy and context management

- Legacy compatibility exposes presence only. It never returns, translates or mutates the old track/stage.
- A voluntary invitation is dismissible, subject-scoped and non-gating.
- Before voluntary eligibility acknowledgement, Not now returns Home without a write.
- A handled user opens management directly; an interrupted v2 user resumes questions.
- Management shows user-facing labels only, never normalized codes, internal IDs or timestamps.
- Each axis is independently changeable. Multi-select uses the same exclusivity rules as capture.
- Clear requires a separate confirmation and states that progress remains.
- Clear sets all answers to undisclosed and suppresses learning context; it does not delete the assessment row,
  revoke access, reopen onboarding or decrease progression.

## 2. API and persistence contract

### 2.1 Routes

| Route | Purpose | Success | Expected controlled failures |
|---|---|---|---|
| `GET /onboarding-assessment` | Read v2 | API-safe state | 404 absent; 401/403 auth; transport failure |
| `GET /onboarding-assessment/compatibility` | Legacy presence | `{legacy_user:boolean}` | 401/403; transport failure |
| `POST /onboarding-assessment/start` | Confirm eligibility/start/resume | API-safe state | 422 false/invalid acknowledgement; auth/transport |
| `POST /onboarding-assessment/answer` | Save current normalized answer | next/handled state | 404, 409, 422, auth/transport |
| `POST /onboarding-assessment/skip` | Save undisclosed | next/handled state | 404, 409, 422, auth/transport |
| `POST /onboarding-assessment/handle` | Global exit | handled state | 404, auth/transport |
| `PUT /onboarding-assessment/context/{q}` | Change handled context | handled state | 404, 409, 422, auth/transport |
| `POST /onboarding-assessment/clear` | Clear all context | handled/cleared state | 404, auth/transport |

Every route is protected by JWT-derived ownership. A caller-supplied `user_id` must never select a record.
Public/anonymous table access remains denied; the app uses Supabase directly for Auth only.

### 2.2 API-safe response

The client may receive only:

- `flow_version`;
- `status` (`in_progress` or `handled`);
- `current_question` or null;
- the five normalized answers;
- `handled_via`, `handled_at`, and `cleared_at`.

The client does not receive row ID, authoritative user ID, eligibility timestamp, creation/update internals,
raw text, legacy track, progression ledger details or model-bound context.

### 2.3 Durable record invariants

- One record per verified subject and flow version.
- `flow_version > 0`.
- `in_progress` implies a valid non-null current question and null handled fields.
- `handled` implies null current question, handled timestamp/method and all five non-null normalized answers.
- Exposure is a non-empty allowlisted array; sentinel values are exclusive.
- Eligibility acknowledgement timestamp is mandatory for any v2 record.
- No raw answer, dialogue, institution/product name, amount or financial identifier is stored.
- Account deletion removes the record. Context clear is not account deletion.

### 2.4 Local state

- Handled and legacy-invite keys are namespaced by subject.
- Local completion is outage fallback only and cannot override an authoritative in-progress backend record.
- Logout/account switch actively clears or isolates subject-scoped view/query state under D-155.
- Prototype fixtures must be in-memory only: no localStorage, IndexedDB, cookies, network, model or analytics.

## 3. Privacy and model-boundary contract

- Initial v2 asks only the approved normalized context; every axis is optional.
- Prohibited collection includes exact income/balances/debt, credit score, dates, holdings, institutions,
  product/security names, identifiers, employer, address, health data, family identities and free-form financial
  history.
- No skipped/cleared answer may be inferred from holdings, baseline, legacy track, chat or another axis.
- Arya receives no full assessment. When handled and not cleared, the backend may derive only:
  - one approved explanation-style value from familiarity; and
  - `prior_exposure_to_current_topic=true` only when a caller-provided allowlisted topic exactly matches a
    stored generic exposure.
- Absent, in-progress, cleared, variable or undisclosed context adds nothing unless explicitly mapped by the
  approved derivation.
- Presentation context cannot change substantive conclusions, financial calculations, compliance rules or
  capability access.
- The prototype visibly explains what is saved, why it is used, that it can be changed/cleared, and that no
  amounts/account details are requested.

## 4. Content contract

### 4.1 Voice and meaning

- Plain, adult, neutral language. Never childlike, diagnostic, congratulatory about disclosure or remedial.
- “Discovering” describes the start of a FinTutor journey only. It never means beginner, low knowledge, low
  wealth, financial unpreparedness or poor financial health.
- Immediate-intent copy says the choice shapes where the app begins and is not a recommendation.
- Earning/responsibility questions describe context without praising independence or judging dependants.
- Familiarity controls explanation entry depth only and never limits access.
- “Prefer not to say,” “Not sure,” and “None of these yet” retain distinct visible labels.

### 4.2 Required disclosures

Before start, the user must understand:

- FinTutor is currently for adults 18 and older;
- five questions are optional;
- no amounts or account details are needed;
- each question can be skipped; and
- context can be changed later.

At closing, the user must understand:

- Discovering is a journey position, not an assessment of money knowledge;
- all routes remain available;
- Home requires no financial details; and
- any highlighted route comes only from what they selected.

In management, the user must understand:

- categories shape how explanations begin;
- they do not limit exploration;
- clear makes Arya use a neutral starting point; and
- progress remains after clear.

### 4.3 Prohibited claims and patterns

- No “best,” “right next step,” “recommended for you,” financial priority, adequacy or readiness claim.
- No assertion that FinTutor knows the user's holdings, income, dependants, risk tolerance or knowledge beyond
  an explicit normalized answer.
- No dark pattern: preselected disclosure, hidden skip, weaker access after skip, celebratory answer feedback,
  shame copy, countdown, repeated prompt after skip or ambiguous clear confirmation.
- No product/security/institution names in prototype fixtures.
- No em dash/en dash in visible prototype copy; use punctuation that renders consistently.

### 4.4 Stable failure copy principles

- Say what failed (“could not save/load”) and the safe next action (“try again,” “back to Home,” or account
  recovery). Do not blame the user or imply a value was saved.
- Do not expose server details, record existence across subjects, normalized codes or security internals.
- Transport failure and safe 5xx may share neutral retry copy. 401/403 must not be treated as a new account.
- 409 must state that state changed and require refresh/reconciliation before resubmission.

## 5. Accessibility and responsive contract

- Exactly one visible page-level H1-equivalent per state; heading order is logical.
- Progress uses an accessible progressbar name/value (“Question n of 5”) and is never color-only.
- Single options use one radiogroup with radio checked states. Exposure options use checkbox checked states.
- Every button/control has a unique accessible name; suggested status is included in the handoff option's name.
- Busy/disabled/selected/expanded states are programmatically exposed. Errors use alert/live-region semantics
  and focus/announcement without relying on color.
- Keyboard order follows visual order. Every action is reachable with Tab/Shift+Tab and activates with
  Enter/Space where appropriate. Focus remains visible.
- After successful question transition, focus moves to the new question heading; after an error, the error is
  announced while the triggering control remains recoverable; after context save/clear, result status is
  announced.
- Minimum interactive target is 44×44 CSS pixels/density-independent pixels with adequate spacing.
- Text and meaningful controls meet WCAG AA contrast (4.5:1 normal text, 3:1 large text/UI boundaries).
- Content works at 320 CSS px without horizontal scrolling and at wide desktop without unreadably long lines.
- 200% text zoom/reflow does not hide skip, exit, error, confirmation or handoff controls.
- Reduced-motion preference removes non-essential transitions; no timer or animation is required to proceed.
- Light/dark/system theme behavior is deterministic in the prototype fixtures.

## 6. Progression and analytics contract

- `onboarding_handled` is awarded at most once per flow version whether completed, individually skipped or
  globally exited. It contributes the same setup milestone and cannot unlock content alone.
- Outside initial v2, a later optional context-prompt award treats answer and skip identically; its subject key
  is prompt/version and retries are deduplicated.
- A progression-emitter failure never rolls back or visually fails a successful assessment write.
- No event contains answer values, amounts, sensitive context, financial outcomes, raw text or route choice.
- No third-party analytics/telemetry is introduced by this workstream or prototype.
- Progress never visibly decreases when context changes or clears.

Under D-160, initial Onboarding v2 emits only the once-per-version onboarding-handled milestone. None of its
five setup questions emits context-prompt progression, regardless of answer, individual skip or global exit.
Later optional context prompts outside initial onboarding retain their existing event contract.

## 7. Failure and recovery contract

| Failure | Must preserve | Must show | Recovery | Must never do |
|---|---|---|---|---|
| Initial state read transport/5xx | subject isolation; authoritative uncertainty | neutral loading then defined fallback | cached handled/legacy or D-159 limited offline path | infer handled from finances |
| Start failure | no v2 success claim; intro inputs | stable alert | retry or D-159 limited offline Home | unlock ordinary data/actions before sync |
| Answer/skip transport failure | current question + local unsaved choice | not-saved alert | explicit retry or reload | advance optimistically |
| Lost response after commit | backend next question/handled state | reconciled authoritative state | idempotent retry/read | advance twice |
| 409 stale/out-of-order | proposed choice separately from current | state-changed message | refresh then reselect | overwrite current silently |
| 401/403 | no assessment/context data | account-entry recovery | reauthenticate | show new-user intro as if 404 |
| Voluntary read failure | existing access | failure + Back to Home | return/retry later | force assessment |
| Context save failure | last saved value | not-saved alert | retry/cancel/back | display proposal as current |
| Clear failure | all prior values + progress | not-cleared alert | retry/keep/back | partially clear |
| Progression failure | successful assessment result | no blocking error | background/logged retry policy | roll back assessment |
| Account switch mid-request | blank/new-subject resolving state | new-subject loader | accept only current generation | render late prior-subject response |

## 8. Prototype fixture contract

BQ-123 must implement controlled fixtures for at least:

1. new user completing all five prompts;
2. per-question skip plus global exit;
3. interrupted/resumed state;
4. save failure, retry and lost-response reconciliation;
5. handoff with and without an attributed suggestion;
6. legacy user invitation, dismiss and voluntary resume;
7. handled context view/change/clear with failure recovery;
8. permission/session denial and account-switch late-response discard;
9. D-159 limited offline Home and D-160 single-milestone equivalence.

The fixture must expose enough state/status evidence to verify no duplicate advance, no stale residue and no
cross-account bleed. It must not call production services or persist fixture data.

## 9. Decisions resolved in BQ-122

| ID | Owner outcome | Decision |
|---|---|---|
| O-ONB-1 | Pending local acknowledgement + limited offline Home | D-159 |
| O-ONB-2 | Initial onboarding emits only onboarding-handled | D-160 |

All other contract choices above are direct reconciliations of standing decisions and observed mechanics; they
do not add MVP scope or reinterpret a compliance boundary.
