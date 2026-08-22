# Ten-workstream portfolio maturity audit

**Date:** 23-Aug-2026  
**Implements:** D-148 Phase 1  
**Evidence basis:** live source and routes, codemaps, decision/build history, feature documents, known
limitations, 349 passing backend tests, 65 passing frontend logic tests, and a clean TypeScript check.

## Bottom line

FinTutor has broad functional implementation but uneven product-definition maturity. The current bottleneck
is not feature count: it is whether the baseline and Arya reliably turn safe context into an understood,
personally meaningful insight. Those two workstreams also carry the largest privacy, neutrality and
financial-context risks, so they rank first.

The test suites establish strong service and pure-math confidence, but they do not establish end-to-end
comprehension, navigation, recovery, accessibility, or owner acceptance. No workstream has yet passed the
D-148 package-and-prototype gate.

## Evidence ledger

| Class | Evidence | Confidence |
|---|---|---|
| Observed fact | All ten workstreams have live implementation paths in the Expo/FastAPI application. | High |
| Observed fact | Backend suite passes 349 tests; frontend has 65 passing Node tests and passes `tsc --noEmit`. | High |
| Observed fact | Frontend tests concentrate on pure helpers; there is no aggregate `npm test` script or screen-level interaction suite. | High |
| Documented decision | D-125 requires owner validation before external D-124 activation testing. | High |
| Documented decision | Onboarding and progression already have dedicated PRD/strategy/contract packages. | High |
| Assumption | A coherent personal insight through Arya is the strongest current activation mechanism. | Medium; D-124 is designed to test it. |
| Assumption | Existing navigation and content are understandable without coaching. | Low; owner prototype validation is missing. |
| Unknown | Which entry route produces the fastest meaningful insight for each target-user subgroup. | Open until D-124. |
| Unknown | Whether users distinguish educational scores/comparisons from recommendations. | Open until owner and later user validation. |
| Unknown | Whether reminders/progression create useful return behaviour rather than pressure. | Open until real usage. |

## Scoring method

Scores use the owner-approved fixed weights: core-loop importance 30, dependency impact 25, trust/privacy/
compliance/financial risk 20, product-definition gap 15, and implementation uncertainty 10. Scores are
planning estimates, not user evidence. Ties break by dependency, then risk, then journey order.

| Rank | Workstream | Core | Dependency | Risk | Gap | Uncertainty | Total |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Arya teaching and conversational capture | 30 | 25 | 20 | 15 | 10 | **100** |
| 2 | Personal financial baseline | 30 | 25 | 20 | 12 | 8 | **95** |
| 3 | Account entry and access | 22 | 25 | 20 | 10 | 4 | **81** |
| 4 | Home and consolidated experience | 28 | 20 | 12 | 13 | 7 | **80** |
| 5 | Onboarding and first-action handoff | 27 | 22 | 16 | 8 | 5 | **78** |
| 6 | Portfolio and Portfolio Health | 25 | 18 | 16 | 12 | 7 | **78** |
| 7 | Scenario and focused-explorer suite | 24 | 14 | 20 | 12 | 8 | **78** |
| 8 | Calculator suite | 22 | 12 | 20 | 10 | 6 | **70** |
| 9 | Interactive teaching walkthroughs | 24 | 14 | 12 | 13 | 6 | **69** |
| 10 | Reminders, engagement and progression | 20 | 10 | 12 | 10 | 7 | **59** |

## 1. Account entry and access

**User problem/outcome.** A user needs to enter the correct private account, understand access failures, and
leave safely. Success is reliable authenticated entry with no ambiguity about whose data is visible.

**Current workflow.** Missing configuration leads to a dedicated screen; otherwise registration/login uses
Supabase email/password, authenticated requests attach a bearer token, FastAPI derives ownership from its
verified subject, and Home exposes export/deletion controls. Public routes contain no user data.

**Maturity and gaps.** Security architecture and backend ownership tests are strong. The complete UX contract
for expired sessions, network loss, duplicate registration, password errors, logout, restart, and cross-account
device-local state is not consolidated. Screen-level accessibility and recovery have not been owner-validated.

**Risk.** Cross-account leakage or misleading session recovery is severe. Production CORS/hosting and leaked-
password protection remain deferred gates, not internal-prototype gaps.

**Coverage/evidence.** Auth, ownership, RLS, export and deletion have backend tests; export formatting has
frontend logic tests. Login/Register/RootNavigator interaction paths have no automated screen suite.

## 2. Onboarding and first-action handoff

**User problem/outcome.** A new user needs a safe, low-friction orientation and an obvious first useful action
without being forced to disclose financial data.

**Current workflow.** After 18+ acknowledgement, five ordered optional chip questions can be answered, skipped,
resumed or globally exited. Completion offers Arya, Portfolio, Goals, Tools or Home. Existing users retain
legacy access and may voluntarily adopt/manage/clear v2 context.

**Maturity and gaps.** This is the best-documented workstream, with a PRD and persistence/privacy package.
Outstanding evidence is experiential: whether the wording feels optional, whether the five-choice handoff is
clear, and whether resume/legacy/context-management routes feel like one system.

**Risk.** Eligibility, optionality and stored-context legibility; accidental inference from skipped values;
being trapped by backend/cache failure.

**Coverage/evidence.** Extensive service/API tests plus vocabulary consistency tests. No complete interactive
test of first launch, interruption, resume, global exit, legacy invitation and context clearing.

## 3. Home and consolidated experience

**User problem/outcome.** A returning user needs to understand what FinTutor knows and find the next relevant
learning or management action without interpreting missing data as financial failure.

**Current workflow.** Home presents eight sections spanning financial picture, Portfolio Health, Arya, tools,
learning, streak/reward and account controls. Consolidated aggregation reports family totals, counts, status,
invalid exclusions and unclassified records.

**Maturity and gaps.** Aggregation semantics are tested, but information priority and the causal path from Home
to a meaningful insight remain assumptions. Eight competing sections may dilute the next action. Loading,
partial-service failure, stale refresh and empty-to-populated transitions lack one written state contract.

**Risk.** False completeness, silent zero interpretation, overwhelming first-use choice, and accidental valence
through hierarchy or wording.

**Coverage/evidence.** Consolidated backend math has automated coverage. The assembled Home feed, navigation,
accessibility order and comprehension have no screen-level automated or owner-prototype evidence.

## 4. Personal financial baseline

**User problem/outcome.** A user needs a trustworthy, correctable representation of holdings, income, goals and
spending that every teaching and modelling feature can safely reuse.

**Current workflow.** Users can create, view, edit, delete and recategorise three holding families; manage
income floor/range and discretionary categories; create goals and replace funding links; and view a live
computed monthly budget. Malformed/unvalued/unclassified holdings stay visible. Optional dependant/emergency
context has separate view/change/clear controls.

**Maturity and gaps.** Data models and services are substantial, but the feature is distributed across many
screens and lacks a single end-to-end baseline journey. There is no consolidated contract for duplicate
holdings, destructive confirmation, failed writes, stale edits, recategorisation field carryover, income
cadence correction, goal-funding over-allocation, or how users know their baseline is “complete enough.”

**Risk.** This is the source for most personal figures. Incorrect provenance, stale values, ambiguous unknowns,
or cross-record inconsistencies propagate into Arya, Portfolio Health and tools.

**Coverage/evidence.** Holdings, reconciliation, budget, goals, consolidated and financial context have backend
tests; calculation helpers cover selected client behaviours. CRUD screens and multi-screen correction/recovery
flows lack interaction tests and owner validation.

## 5. Arya teaching and conversational capture

**User problem/outcome.** A user needs to understand one relevant financial mechanism in personal context and
voluntarily continue, without believing the app chose a path or exposed sensitive identifiers.

**Current workflow.** Each question assembles a current masked baseline, optionally selects one holding to
deepen, calls Sonnet, extracts possible holding fields through Haiku, builds a transient deterministic
reconciliation proposal, and saves only after explicit confirmation. At most one fixed-pair missing context is
surfaced when on-topic. Conversations are stateless across sessions.

**Maturity and gaps.** Technical privacy/reconciliation contracts are unusually detailed. The unresolved product
questions are the most important: first useful prompts, response length and structure, refusal/recovery copy,
model outage behaviour, no-memory legibility, when surfacing feels relevant, and whether users understand the
proposal diff. No complete conversational content/state matrix exists.

**Risk.** Highest combined risk: advice-shaped language, hallucinated provenance, unsafe masking, mistaken
capture, generic teaching, or loss of trust from statelessness. Model behaviour is probabilistic even when the
surrounding mechanics are deterministic.

**Coverage/evidence.** Strong privacy, surfacing and reconciliation tests plus earlier live model verification.
There is no repeatable owner prototype covering first insight, ambiguity, refusal, provider failure, masking,
stale proposal and session restart as one journey.

## 6. Portfolio and Portfolio Health

**User problem/outcome.** A user needs to see how their recorded picture is structured and which mechanisms are
measurable, without receiving a portfolio-quality or suitability verdict.

**Current workflow.** Portfolio presents record-count allocation, family navigation, category concentration,
trend teaching and shared health sub-scores. Portfolio Health shows a 0-100 score with expandable investment,
insurance, emergency and tax components and measured/unknown states.

**Maturity and gaps.** Formula behaviour is documented, but the semantic contract of a “health score” needs
owner testing: whether 0-100, progress presentation or category concentration is perceived as evaluation or
advice. Partial-data and score-change explanations are not consolidated.

**Risk.** Users may infer judgment, urgency or portfolio weighting despite neutral math and non-valence colour.
Unknown inputs may look like poor performance rather than unavailable measurement.

**Coverage/evidence.** Backend budget/consolidated services are tested; health and concentration are pure client
logic but lack dedicated test files and end-to-end comprehension/accessibility validation.

## 7. Calculator suite

**User problem/outcome.** A user needs transparent arithmetic for a self-chosen question, with editable
assumptions and no implied forecast or recommendation.

**Current workflow.** Tools routes to nine client-side calculators: SIP goal, EMI, inflation, step-up SIP, CAGR,
compound growth, credit-card payoff, emergency coverage and goal affordability. Valid results can emit
progression; edits invalidate stale results.

**Maturity and gaps.** Newer calculators have explicit contracts and focused tests; older five are embedded in a
large screen without equivalent pure modules/tests. Input conventions, rounding, error language, disclosure
placement, saved-record prefill and result accessibility need one platform-wide contract.

**Risk.** Users may act on a figure whose timing, rate ownership, rounding or limitation they did not understand.
The nine tools must feel consistent without hiding important model differences.

**Coverage/evidence.** Compound growth, step-up SIP, card payoff, emergency coverage and goal affordability have
pure tests. SIP goal, EMI, inflation and CAGR lack equivalent dedicated coverage; there is no screen interaction
suite. Tax/HRA remain deliberately outside this workstream.

## 8. Scenario and focused-explorer suite

**User problem/outcome.** A user needs to compare consequences of self-chosen assumptions side by side without
FinTutor selecting, ranking or endorsing a path.

**Current workflow.** Five client scenarios cover emergency runway, SIP increase, debt cost, idle cash and time
to corpus. Focused explorers cover loan prepayment versus investing, ESOP exercise cost, 80C room and
term-insurance support components. Recorded data may prefill inputs but remains editable.

**Maturity and gaps.** Backend explorers have service tests and recent contracts; the five scenario formulas
live in one untested client module. The suite lacks a shared distinction between calculator, scenario and
explorer, as well as consistent comparison language, provenance, stale-prefill behaviour and result exits.

**Risk.** Highest money/compliance risk after Arya/baseline: comparison framing can become advice; user-entered
rates can be mistaken for FinTutor forecasts; tax/insurance boundaries require prominent limitations.

**Coverage/evidence.** Loan, ESOP, 80C and term-insurance logic are tested; emergency coverage is tested. Other
scenario functions and the integrated modal/screen journeys lack direct interaction coverage. Rent-versus-buy
and income-tax/HRA remain deferred and are not silently included.

## 9. Interactive teaching walkthroughs

**User problem/outcome.** A user needs a short, skippable explanation of a holding-family mechanism, optionally
connected to consented saved facts, with an obvious next action but no comprehension gate.

**Current workflow.** Investment, loan and insurance sections open a full-screen step sequence. Empty families
use static mechanism content; populated families can show source-labelled saved figures and explicit unknowns.
The final step may hand missing details to Arya, where capture still requires confirmation.

**Maturity and gaps.** The no-gating and provenance boundaries are strong. The feature lacks a complete content
curriculum contract, entry/return behaviour across every family, interruption/resume semantics, and owner
evidence that “two-minute walkthrough” matches actual comprehension and duration.

**Risk.** A full-screen sequence can feel mandatory despite a skip control; personal-number claims may exceed
available data; the Chat handoff can feel like forced disclosure.

**Coverage/evidence.** The step builder has tests for provenance, zeroes, malformed values and empty families.
The container navigation, accessibility, skip/dismiss and Chat handoff have no automated interaction suite.

## 10. Reminders, engagement and learning progression

**User problem/outcome.** A user needs useful reasons to return for learning or obligations without pressure,
manipulation, or rewards tied to financial outcomes.

**Current workflow.** Local EMI/card reminders maintain six upcoming dates and preserve due day 1-31. Learning
reminders require explicit opt-in and support time change, pause and disable. App opens update streaks and may
show a generic fact. A replayable event ledger awards capped learning-participation progress across stages and
shows awarded history.

**Maturity and gaps.** Progression has a mature strategy/rules/privacy package and reminders have focused
scheduling logic. The combined engagement system lacks a single experience contract: offer timing, notification
permission recovery, multiple reminder coexistence, device/account switch, timezone expectations, streak-loss
emotion, stage explanation and whether the mechanics produce curiosity or pressure.

**Risk.** Behaviour design can undermine the product's calm educational stance even while avoiding financial
outcome rewards. Local-only schedules and fixed IST progression boundaries have known limitations.

**Coverage/evidence.** Backend progression/streak tests and frontend reminder arithmetic tests pass. Native OS
permission/scheduling behaviour, account switching, notification taps and the integrated emotional experience
require device QA and owner validation. Progression pacing simulation remains a pre-external-launch obligation.

## Cross-cutting findings

1. **The dominant gap is experiential evidence, not missing backend machinery.** Every workstream needs an owner
   task protocol; most need screen-level or native journey validation.
2. **Frontend coverage is structurally incomplete.** Pure helpers are tested, but the app has no standard test
   script and no component/navigation interaction harness. Introducing a new test library would require an
   owner-approved architectural decision; the audit does not make it.
3. **Privacy/security are strongest as backend contracts, weaker as user comprehension.** Users still need to
   understand what is stored, sent to a model, unknown, exported and deleted.
4. **The suites need platform contracts.** Calculators and scenarios have individually good recent work but
   inconsistent levels of documentation and automated coverage across older versus newer members.
5. **Existing deferred boundaries remain intact.** Hosting, legal review, tax/HRA, rent-versus-buy,
   conversation memory, post-MVP holding families and evidence-gated progression additions stay deferred.

## Ranked next action

Begin the Arya workstream package and owner prototype first. It must test the core causal chain—safe context to
personal mechanism to understood insight to trust to voluntary continuation—before polishing downstream return
mechanics. The baseline deep dive follows because Arya's personalisation and capture quality depend on it.

