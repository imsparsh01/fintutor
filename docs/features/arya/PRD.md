# Arya product requirements document

**Status:** Candidate contract for owner validation  
**Traces:** D-001/D-002/D-009/D-010/D-012/D-022/D-028/D-029/D-032/D-051/D-067/D-071/D-072/D-078/D-080/D-085/D-091/D-099/D-105/D-119/D-133/D-145/D-148

## Bottom line

Arya is FinTutor's core teaching surface. It converts a user's safe question plus relevant current baseline
into one understandable financial mechanism, then leaves the next move with the user. It is not an adviser,
record keeper for conversations, product evaluator, general assistant, or automatic financial-data capture
agent.

The feature is successful when the user can accurately explain one consequence in their own situation,
understands that Arya did not choose for them, and voluntarily continues or stops without pressure.

## Target user and job

Primary users are Indian adults beginning or actively building financial understanding, from students and
recent graduates through professionals with roughly ten years of work experience. They are financially
unmanaged but willing, and may have incomplete or inconsistent records.

When a money situation feels unclear, the user needs to understand what their known numbers do and what is
still unknown, without first learning financial vocabulary or surrendering the decision.

## Causal model

`safe question + relevant baseline -> personal mechanism -> understood consequence -> earned trust -> voluntary continuation`

The narrowest constraint is not response generation. It is whether the response is grounded, comprehensible,
neutral and recoverable enough to earn the next piece of context.

## Product outcomes

### Primary outcome

After one meaningful exchange, the user can explain a mechanism or consequence in their own words and connect
it to the situation they asked about.

### Supporting outcomes

- The user can distinguish profile facts, typical ranges and unknown inputs.
- The user does not believe Arya selected, ranked or endorsed a financial path.
- The user can see and control every proposed baseline change before it is written.
- Sensitive names and identifiers do not cross the model boundary in recognisable form.
- A provider, masking, network or stale-data failure leaves a clear, safe recovery path.

### Failure outcomes

- A fluent answer that is generic, incorrectly personalised or advice-shaped.
- A user assumes Arya remembers prior sessions or has saved conversational details that were not confirmed.
- A proposal overwrites, duplicates or recategorises a holding without explicit informed confirmation.
- A real name or identifier reaches the external model, or an unsafe response is re-humanised.
- Failure copy exposes provider details, repeats sensitive text, or encourages blind resubmission.

## Standing product principles

- Open with the user's relevant situation and known figures, not an abstract definition.
- Teach one mechanism deeply only when the app or user has selected the thread; otherwise give relevant paths
  equal shallow treatment.
- Make every path's consequence equally concrete, then stop before a verdict.
- Never recommend, rank problems, predict markets, name or evaluate a specific product/security/institution.
- Profile-derived figures are point values. Model-supplied figures are tight, explicitly typical ranges.
- The open door stays inside the topic already raised. At most one approved absent-type candidate may surface
  when the current question makes it relevant.
- Conversation memory is absent across sessions. The current baseline is resent on every call.
- Nothing is saved from conversation without a separate explicit confirmation.
- Generated teaching copy uses the tutor typeface; UI chrome uses the UI face; figures use the mono face.

## Scope

### Included

- Chat-tab empty state, prompt entry, send/loading and message display.
- Entry from a known holding through “Ask about this,” carrying a validated alias/deepen reason.
- Minimum presentation adaptation from onboarding assessment context.
- Teaching, decision-shaped comparisons, direct-recommendation refusal and off-topic handling.
- Relevant fixed-pair surfacing of at most one absent holding type.
- Haiku extraction of mentioned holding type/fields after local masking.
- New, update, contradiction and multiple-candidate reconciliation proposals.
- Field diff, explicit save/not-now, stale refresh and saved-state feedback.
- Request-local masking, exact-token re-humanisation and fail-closed handling.
- Provider/network/configuration failure and retry.
- Session/account change clearing and no-memory legibility.
- Non-fatal learning-progression and learning-reminder emitters.

### Excluded

- Cross-session conversation memory or searchable chat history.
- Open-ended general assistant behaviour.
- Product/security evaluation, recommendations, market forecasts or ranked priorities.
- Cold Home surfacing, automated comparison detection, or proactive reminders based on chat content.
- Automatic writes, stored proposals, model-selected target records, documents/uploads or bank integrations.
- Changes to prompts, schemas, APIs, calculation methods, retention or production hosting under BQ-107.

## Entry points and exits

| Entry | Context supplied | Expected first state |
|---|---|---|
| Chat tab | Current verified user and optional derived learning context | Neutral empty state with example intents and input |
| Holding detail | Verified owned alias plus fixed reason | Chat with a visible “About this holding” context cue |
| Walkthrough handoff | User-authored missing-detail prompt | Chat with editable prefilled text, never auto-sent |
| Onboarding v1 legacy path | Narrow onboarding instruction and last AI turn only | Legacy structured teaching flow |

Exits are tab navigation, app close, “Not now” on a proposal, successful save, or a deliberate user stop. No
exit requires a quiz, recap, rating or next action.

## Success criteria

### Prototype gate

- Owner completes all seven critical tasks without explanatory coaching.
- Owner correctly identifies known, typical and unknown values in each relevant task.
- Owner reports no path as chosen or ranked by Arya.
- Every proposal save is preceded by a comprehensible candidate/diff review.
- Every failure has a safe recovery and no dead end.
- No product-intent disagreement remains unresolved.

### Later integrated activation evidence

D-124 remains authoritative: at least 8/12 participants reach a personal insight within five minutes, at
least 7/12 voluntarily continue, at least 10/12 understand neutrality, and there are zero severe trust
failures.

## Dependencies

- Supabase Auth and JWT-derived ownership.
- Holdings, income, goals, financial context and computed baseline services.
- Privacy masking and institution/identifier recognisers.
- Sonnet teaching call; Haiku deepen/capture classifiers.
- Deterministic reconciliation and holding CRUD.
- Progression and local learning-reminder systems, both non-fatal to the exchange.

## Evidence ledger

| Type | Evidence | Confidence |
|---|---|---|
| Observed | `/chat` assembles and masks a current baseline, calls teaching, extracts capture and returns a transient proposal. | High |
| Observed | Applying a proposal uses a separate resolve/apply path with ownership and stale checks. | High |
| Observed | Chat display state clears when the authenticated user changes and is not persisted. | High |
| Verified | Privacy, surfacing and reconciliation have focused automated backend coverage. | High |
| Verified | Earlier Phase-1 runs tested the teaching prompt and classifiers against the live provider. | Medium-high; model behaviour remains probabilistic. |
| Assumption | The current Chat empty state leads users to a personally useful first prompt. | Low until owner/D-124 validation. |
| Assumption | Users understand that visible thread continuity is not cross-session memory. | Low. |
| Unknown | Whether a user interprets “deepen” response emphasis as app judgment. | Open. |
| Unknown | Whether proposal terminology is understandable without knowledge of a “baseline.” | Open. |

