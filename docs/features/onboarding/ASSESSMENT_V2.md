# Onboarding assessment v2 — product contract

**Status:** Build-ready. Product flow confirmed by D-118; persistence/privacy package approved in D-119.
**Audience:** Students through working professionals with roughly ten years of experience; ages 18–32 is
design context, not a score or public label.

## Experience

A five-question, chip-assisted conversation with Arya, designed for roughly 60–90 seconds. Chips are the
primary path; typed clarification remains available only within the eventual approved privacy boundary.
The user may skip an individual question or leave onboarding at every step.

Opening copy:

> Let’s make FinTutor useful for where you are today. Five quick questions—no amounts or account details,
> and you can skip anything.

The five questions create private starting context. They do not assess knowledge, financial health,
readiness, intelligence, risk tolerance, or progression stage. Every user begins the learning journey at
Discovering, including users who report substantial familiarity.

## Questions and normalized answers

### 1. Immediate intent

**Question:** “What would you most like to explore first?”

- Understand the basics — `learn_basics`
- See how my financial picture fits together — `connect_picture`
- Understand something I already have — `understand_existing`
- Explore a goal or scenario — `model_future`
- Build a learning routine — `build_routine`
- Ask Arya a question — `ask_arya`
- Just look around — `explore`
- Prefer not to choose — `undisclosed`

This may suggest the first app surface. It never identifies a financial priority or recommends an action.

### 2. Earning context

**Question:** “Which description is closest to where you are right now?”

- I’m studying — `student`
- I’m preparing to start earning — `pre_earning`
- I started earning recently — `early_earner`
- I’ve been working for a few years — `established_earner`
- My situation or income varies — `variable_or_transitioning`
- Prefer not to say — `undisclosed`

No age, income amount, employer, or dates are requested.

### 3. Financial responsibility context

**Question:** “Who does your money usually need to support?”

- Mostly me — `self`
- I contribute to shared or family expenses — `shared`
- Other people depend on my income — `dependents`
- It changes from month to month — `variable`
- Prefer not to say — `undisclosed`

This adjusts examples and framing only. It never labels whether the person is “responsible.”

### 4. Existing exposure

**Question:** “Which parts of money have you already dealt with? Choose any that fit.”

- Tracking spending — `spending`
- Building savings — `saving`
- Investing — `investing`
- A loan, EMI, or card balance — `borrowing`
- Insurance — `insurance`
- Planning for a goal — `goals`
- Workplace benefits or tax — `workplace_and_tax`
- None of these yet — `none`
- I’m not sure — `unsure`
- Prefer not to say — `undisclosed`

These are generic exposure flags, not inferred holdings. No institution, product/security name, value,
rate, contribution, or identifying detail is requested.

### 5. Self-reported familiarity

**Question:** “When money topics get technical, what usually works best for you?”

- Start from the foundations — `foundations`
- Explain simply first, with details available — `working_basics`
- Show me how the concepts connect — `connecting`
- Start with the mechanism and math — `deeper_context`
- It depends on the topic — `variable`
- Prefer not to say — `undisclosed`

This controls default presentation only. Simpler and deeper explanations remain immediately available.

## Closing

> You’re starting at Discovering. That only means your FinTutor journey is beginning—not that you’re a
> beginner with money. You can change how Arya explains things at any time.

The closing offers “Continue to FinTutor” and, when immediate intent is known, one clearly attributed
navigation suggestion. “Why am I seeing this?” explains the mapping. It cannot suggest a financial action.

## Skip, completion, and progress

- “Skip this question” and “Continue to app” remain visible throughout.
- Skip maps to `undisclosed`, never to a low-familiarity answer.
- `none`, `unsure`, and `undisclosed` remain distinct.
- The flow is considered **handled** when all five prompts are answered/skipped or the user chooses the
  global exit. Partial context is valid and unknown axes use neutral defaults.
- Answering, skipping one prompt, or skipping the entire assessment receives the same one-time setup
  progress treatment. Disclosure is never the price of progress.
- A skipped answer is not requested again during onboarding. Later context prompts are optional and
  independently skippable.

## Flow mechanics

- The five axes replace the old mutually exclusive `fresh_starter`, `reactive_dabbler`,
  `habit_former`, and `unclassified` identities.
- Question order is deterministic so every user can understand and finish the flow. Prior answers may
  adapt acknowledgements/examples but do not remove access or silently infer another answer.
- Each question advances after one answer or skip; no per-stage LLM judgment is required for chip answers.
- Typed clarification may use a narrow classifier, degrading to `undisclosed`; it never blocks progress.
- Every response ends with the next question or explicit completion. Existing global escape behavior stays.
- No holding proposal, financial capture, or Portfolio Health calculation runs inside this assessment.

## Legacy experience

- Existing users are never forced through assessment v2.
- Existing completion/dismissal is grandfathered for access.
- No new axis is inferred from an old track, holdings, chat, income, or other financial records.
- Old rows remain legacy routing history until the approved deletion/retention policy handles them.
- Existing users may later receive one dismissible invitation to “Personalize how Arya explains things.”
- Legacy progression credit and authoritative cross-device completion are part of the blocked Tier-3
  implementation package.

## Prohibited onboarding data

Exact income, balances, debt values, credit score, account/tax identifiers, institution/product/security
names, employer, address, health details, family-member identities, or free-form financial histories are
not requested by this flow.
