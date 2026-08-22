# Arya functional and content contracts

## Current public interface

### `POST /chat`

Authenticated ownership supplies `user_id`; callers cannot select it.

Request body:

```json
{
  "question": "string",
  "deepen_alias": "optional owned alias",
  "onboarding": false,
  "onboarding_track_hint": "legacy optional normalized hint",
  "onboarding_last_ai_message": "legacy onboarding-only optional text",
  "learning_topic": "optional generic topic"
}
```

Response body:

```json
{
  "response": "user-visible re-humanised teaching text",
  "holding_proposal": "null or transient proposal",
  "onboarding_state": "legacy onboarding only"
}
```

BQ-107 introduces no API change. Any future change must preserve authenticated ownership and receive its own
decision/build contract.

### Reconciliation interfaces

- `POST /holding-reconciliation/resolve`: accepts product type, extracted fields and the user's candidate/new
  selection; returns an authoritative transient proposal and diff.
- `POST /holding-reconciliation/apply`: accepts target and expected diff; row-locks, rechecks and either applies
  or returns a refreshed stale proposal.

No proposal table or conversation history exists.

## Data flow invariants

1. Verify bearer token and derive authoritative subject.
2. Load only that subject's current records.
3. Create one random-nonce privacy envelope for the whole request.
4. Register known entities and mask question, permitted prior context and complete model-bound baseline.
5. Abort before any model call when safe masking cannot be established.
6. Derive optional learning presentation context and deepen instruction outside Sonnet.
7. Send only masked aliases/characteristics and permitted context to models.
8. Re-humanise only exact, request-local known tokens.
9. Run capture extraction over masked input; select no target and write nothing.
10. Return response and transient proposal.
11. Record progression only after host work commits, and never surface emitter failure.

## Model-bound context

### Permitted

- Holding aliases and relevant characteristics.
- Computed monthly income and fixed outgoings.
- Goals and aliased funding links.
- Optional confirmed dependant count and emergency-fund months.
- At most one fixed-pair surfacing candidate.
- Validated deepen alias/reason.
- Minimal generic presentation context from onboarding assessment.
- Legacy onboarding instruction and its one permitted last-AI-turn exception.

### Prohibited

- Real product, security or institution names.
- Raw account, card, policy, PAN, Aadhaar-like, UPI, CIF, phone or email identifiers.
- Complete onboarding assessment, labels, lifecycle metadata or unanswered values.
- Streak/progression state.
- General chat history or claims about prior sessions.
- Internal export/control fields, auth secrets or database identifiers except masked tokens.

## Teaching response contract

### Structure

- Start with the user's relevant situation or state that the required input is unknown.
- Explain the smallest mechanism that answers the question.
- For decision-shaped questions, name every relevant path before any permitted depth.
- Use equal numerical vividness across paths.
- Stop after the mechanism and one optional on-topic continuation.

### Language

- Use plain Indian English and rupee formatting appropriate to the app.
- Tutor prose uses calm, direct sentences. UI labels remain functional.
- State limits once without apology or compliance narration.
- Describe facts, mechanisms, uncertainty and consequences; never attention order or suitability.

### Prohibited output

- “You should,” “I recommend,” “best,” “better for you,” priority or urgency ranking.
- Specific product/institution names generated or evaluated by the model.
- Market forecasts, timing claims or implied returns supplied by FinTutor.
- Point estimates not present in the baseline.
- Claims of remembering conversations.
- Quizzes, homework, comprehension gates, guilt, pressure or mandatory follow-up.

## Capture and confirmation contract

- Classification extracts only supported product type and supplied allowlisted scalar fields.
- A proposal remains visibly labelled as not saved.
- Zero candidates permits explicit “add as new.” One candidate permits diff review. Multiple candidates require
  an explicit selection or add-new choice.
- Diff rows show stored and proposed values without valence colour or recommendation.
- Apply merges only confirmed fields and preserves unstated characteristics.
- A stale comparison must be refreshed and reconfirmed.
- “Not now” removes the visible decision card without storing refusal intent.
- Successful save feedback does not restate or grade the financial figure.

## Failure contract

| Boundary | Public behaviour | Logged behaviour |
|---|---|---|
| Missing model configuration | Arya unavailable; retry after configuration | Controlled configuration error |
| Provider error | Temporary teaching-engine failure; retry control | Model name and exception class only, no raw provider body |
| Unsafe input masking | Could not safely protect this text; edit/retry | Controlled reason without raw sensitive text |
| Unsafe output token | Response withheld; retry later | Token class/namespace metadata only |
| Network/timeout | Connection failure attached to exchange | Standard request metadata, no question body |
| Reconciliation validation | Inline proposal error | Controlled validation reason |
| Stale apply | Refreshed diff and reconfirmation | Conflict metadata without model content |
| Reminder/progression emitter | No user-visible chat failure | Non-fatal warning |

Retry is always explicit. The app does not silently resend potentially sensitive text.

## Accessibility contract

- Arya identity, message roles, loading state, errors, proposal announcements and save results are exposed to
  assistive technology.
- Composer has a persistent accessible name; disabled state is conveyed programmatically.
- New assistant content and proposal-state changes are announced without stealing focus on web.
- Native focus moves only for a meaningful result/state boundary and remains platform-guarded.
- Candidate choice and save/not-now are fully keyboard and screen-reader operable.
- Figures do not rely on colour; focus/error states meet WCAG AA; touch targets are at least 44px.
- Motion is limited to state feedback and disabled under reduced-motion preference.

## Analytics and progression contract

- `arya_exchange_completed` records a successfully completed ordinary exchange, not a financial result.
- One event is deduplicated by the existing idempotency/ruleset system.
- Failed, blocked or empty responses do not earn completion.
- Proposal save is not a positive financial-outcome event.
- Analytics/progression failure never changes response delivery or capture persistence.

