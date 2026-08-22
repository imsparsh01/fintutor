# Arya journey and state contract

## Primary journey

1. **Enter:** user opens Chat or arrives with an explicit holding/walkthrough context.
2. **Orient:** screen identifies Arya as the financial tutor, shows the current context and offers an editable
   input. It never claims conversation memory.
3. **Ask:** user submits non-empty text. The submitted message becomes visible immediately and input locks for
   one in-flight request.
4. **Protect:** backend verifies ownership, creates one request-local privacy envelope, masks the question and
   complete relevant baseline, and fails closed if safe masking cannot be established.
5. **Assemble:** backend builds holdings, income/outgoings, goals, optional confirmed context, one allowed
   surfacing candidate and an optional validated deepen instruction.
6. **Teach:** Sonnet returns one bounded teaching response under the standing prompt. Model-supplied numbers
   render only as labelled ranges.
7. **Inspect:** backend re-humanises only exact known tokens, then Haiku may extract a mentioned holding type
   and fields from masked text. Extraction never chooses a record or writes.
8. **Respond:** app renders teaching copy. If capture exists, it renders a transient reconciliation card.
9. **Control:** user dismisses the proposal, selects a candidate/new record, or reviews and saves the diff.
10. **Recover:** stale data returns a refreshed diff for reconfirmation; other failures remain attached to the
    failed action with an explicit retry.
11. **Continue or exit:** user chooses another thread, types a new question, changes tabs or stops. No prompt is
    mandatory.

## Alternate journeys

### Decision-shaped question

Name every relevant path and materially related recorded holding. Use equal shallow treatment unless a valid
external deepen signal exists. State concrete consequences symmetrically and leave the choice unresolved.

### Direct recommendation request

Decline the verdict in one plain sentence, then teach the relevant mechanism or comparison without product
names, ranked priorities or a softened recommendation.

### Off-topic or memory question

Answer the question on its own terms. State the memory limit plainly when asked. Do not surface financial gaps
or append an unrelated financial open door.

### Relevant absent-type surfacing

Only a current financial question can open this route. Include at most one candidate from the fixed pair table,
open on the user's situation, use typical ranges only when necessary, and require normal confirmation for any
captured record.

### Proposal ambiguity

Show owned same-type candidates without ranking. User chooses one or explicitly chooses a new record. Only then
show the authoritative field diff and save control.

## State matrix

| State | Visible behaviour | User action | Recovery / invariant |
|---|---|---|---|
| Empty | Arya identity, scope cue, example intents, editable input | Choose an example or type | No suggestion implies priority or product choice |
| Contextual entry | Source holding/topic is named in app chrome | Edit or submit prompt | Alias is sent only if it still belongs to the verified user |
| Draft | Multiline text retained locally | Send, edit, leave | Placeholder is never the only label; no background send |
| Sending | User message visible; composer disabled; shaped skeleton shown | Wait or leave | Duplicate sends suppressed; account change invalidates result |
| Teaching success | Tutor copy, mono figures, optional range/provenance note | Continue or stop | Re-humanise exact known tokens only |
| Empty model text | No blank assistant bubble | Retry | Treat as provider failure; do not run capture/write |
| Recommendation refusal | One direct boundary sentence plus mechanism | Continue or stop | No apology, loophole, product name or disguised verdict |
| Off-topic | Direct bounded answer | Continue or stop | No gap surfacing/open door into finance |
| New proposal | Proposed fields and “new record” decision | Review, save, not now | Nothing persisted before save |
| One candidate | Stored versus proposed diff | Save or not now | Unstated fields remain unchanged |
| Many candidates | Neutral owned-record chooser plus “add as new” | Select | No model/default target selection |
| Contradiction | Conflicting stored/proposed value clearly labelled | Confirm chosen update or dismiss | Conflict is not silently resolved |
| Proposal applying | Save control disabled; local progress feedback | Wait | Duplicate applies suppressed |
| Stale proposal | Refreshed diff plus announcement | Review and reconfirm | Original expected diff is never forced through |
| Proposal saved | New/updated/contradiction result with generic confirmation | Continue or navigate to holding | Reminder failure cannot make save appear failed |
| Proposal dismissed | Card disappears for this visible message | Continue | Dismissal is not stored or treated as a financial signal |
| Masking blocked | Plain privacy-protection error; no assistant answer | Edit sensitive/ambiguous text or retry | No provider call occurred |
| Provider/config failure | Contextual unavailable message and retry | Retry or continue later | No raw provider detail or sensitive echo |
| Network failure | Connection message attached to request | Retry | Draft/request may be reused only by explicit action |
| Re-humanisation failure | Safe-response failure, no partial output | Retry later | Unknown/partial/injected tokens never render |
| Session restart | Fresh visible thread with current-baseline notice | Ask again | No “as discussed” or implied recall |
| Account switch | Empty thread, empty draft, no old errors/results | Begin under new account | In-flight old-user result discarded |
| Progression outage | No special chat failure | Continue normally | Emitter is non-fatal and runs after host work commits |
| Learning-reminder outage | No special chat failure | Continue normally | Optional local engagement cannot break teaching |

## Information provenance shown to the user

- **Recorded:** a point value already in the verified baseline, with recognisable app-side display name.
- **Typical:** a non-profile range introduced as typical and accompanied by the standing range note.
- **Unknown:** explicitly named missing input; never formatted as zero.
- **Proposed:** user-supplied information not yet persisted.
- **Stored versus proposed:** authoritative comparison immediately before confirmation.

These labels describe data state. They never grade the financial value.

