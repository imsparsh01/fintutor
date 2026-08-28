# Onboarding and first-action handoff — current PRD

**Status:** BQ-120 reconciled definition; prototype pending.  
**Decisions:** D-118, D-119, D-126, D-148, D-158.  
**Observed implementation:** `RootNavigator.tsx`, `OnboardingScreen.tsx`,
`VoluntaryAssessmentScreen.tsx`, `AssessmentContextScreen.tsx`, `onboardingAssessment.ts`, and the
`/onboarding-assessment/*` backend routes/services.

## Target user and moment

An authenticated adult opening FinTutor for the first time, plus an existing/legacy user who may voluntarily
personalize how explanations begin. The user may be a student, pre-earner or working professional. Reported
life context is private orientation, never a public persona, knowledge score, financial-health judgment or
progression advantage.

## Problem

A new user needs to understand what FinTutor is, provide only the context they choose, and reach one useful
part of the app without being forced to disclose financial information. Existing users need one coherent way
to adopt, review, change or clear that context without losing access or learning progress.

## Observable outcome

Without coaching, the user can:

1. understand that FinTutor currently requires an 18+ acknowledgement;
2. distinguish optional orientation from financial-data collection;
3. answer, skip or leave each of five deterministic prompts;
4. resume exactly where they stopped;
5. understand that “Discovering” describes journey position, not money knowledge;
6. choose any first destination, including Home with no financial disclosure;
7. later view, change or clear all saved personalization context; and
8. recover safely from ordinary loading, save and connectivity failures without duplicate or cross-account
   state.

## Experience contract

### Entry

- After a verified session, backend v2 state is checked before rendering Onboarding or the app.
- A handled v2 record grants access across devices. Device cache is outage fallback only.
- A legacy onboarding row or legacy device completion grandfathers access; no v2 answer is inferred.
- A genuinely new user sees the 18+ acknowledgement before a v2 record is created.

### Orientation

- Opening copy states: five quick questions, no amounts or account details, and everything is skippable.
- Questions remain in the approved order: immediate intent, earning context, responsibility context, generic
  prior exposure, self-reported explanation familiarity.
- Chips are the deterministic primary interaction. The shipped v2 screen contains no free-text input.
- Single-choice answers save immediately. Prior exposure is multi-select and requires Continue.
- `none`, `unsure`, and `undisclosed` are mutually exclusive from specific exposure flags.
- “Skip this question” stores `undisclosed`; “Continue to app” globally handles all remaining unknowns.
- Save failure retains the current question, shows a stable alert and permits explicit retry.

### Completion and handoff

- Answering/skipping all prompts or using global exit produces the same handled access and one-time setup
  progression treatment.
- Closing copy explains Discovering neutrally and states that explanation style remains changeable.
- Five destinations remain equally selectable: Arya, something already managed, a goal, tools, or Home.
- A suggestion may be visibly attributed to the immediate-intent answer; it never hides, disables or ranks
  other destinations and is not a financial recommendation.
- Handoff stores no additional state. One selection navigates once; every destination remains available later.

### Return and context control

- Existing legacy users may enter v2 voluntarily and cancel before acknowledging eligibility.
- An interrupted voluntary v2 flow resumes from backend state.
- A handled user entering the assessment route sees context management instead of the questions.
- Each normalized answer can be changed. All five can be cleared after a separate confirmation.
- Clear replaces all answers with `undisclosed`, keeps handled status/access and does not remove progress.
- After clear, Arya uses a neutral starting point until context is added again.

## Data and personalization boundaries

- Persist normalized category codes and structural status only; never raw answer text or dialogue.
- Never request or infer amounts, balances, debt values, scores, identifiers, institutions, products,
  employers, addresses, health details, family-member identities or free-form financial history.
- Backend JWT subject owns the state. Caller-provided `user_id` has no authority.
- Arya receives only a topic-relevant presentation abstraction: explanation style and, when explicitly
  topic-matched, a prior-exposure boolean. It does not receive the complete assessment.
- Cleared, absent or unhandled context contributes no learning context.
- Disclosure cannot affect starting stage, access, capability availability or the setup progress award.

## Success criteria

- All critical journeys in `JOURNEY_AND_STATES.md` are represented in the fixture prototype.
- Optionality, eligibility and stored-context meaning are correctly understood during owner validation.
- Every failure leaves an explicit, safe retry or exit and never displays another subject's state.
- Keyboard, screen-reader semantics, touch targets, contrast, reduced motion and responsive layout pass the
  BQ-123 QA contract.
- The prototype performs no network/model/storage call and production code remains unchanged.

## Exclusions

- No income, holding, goal or financial-history capture inside onboarding.
- No financial recommendation, priority ranking, risk score or knowledge assessment.
- No new progression rules, analytics vendor, conversation memory, schema, route or capability.
- No production implementation work in this definition/prototype workstream.
- No external-user study; D-124 follows integrated internal MVP validation.

## Dependencies

- Verified Supabase session and JWT-derived backend ownership.
- D-119 assessment state endpoints and normalized vocabulary.
- MainTabs destinations for Home, Portfolio, Goals, Tools and Arya.
- Progression emitter failure isolation.
- Account-switch state reset and subject-scoped local fallback keys.

## Reconciled differences and open boundary

- The historical `PRD.md` and `docs/ux/journeys/onboarding.md` describe a legacy AI conversation that builds
  baseline data. D-118/D-119/D-126 supersede that for new users; current onboarding collects no financial
  records and uses deterministic chips.
- `ASSESSMENT_V2.md` mentions optional typed clarification, but the shipped v2 UI exposes chips only. Typed
  clarification is therefore permitted direction, not current prototype scope; adding it to production would
  require a separate bounded implementation.
- **OPEN O-ONB-1:** a new account with no cached/authoritative handled state and an unreachable backend cannot
  persist eligibility, start or globally exit. Access without acknowledgement would reinterpret D-119's legal
  boundary; blocking access conflicts with the fail-safe/ungated experience. BQ-122 must route this to the
  owner before BQ-123 hardens a recovery behavior.
