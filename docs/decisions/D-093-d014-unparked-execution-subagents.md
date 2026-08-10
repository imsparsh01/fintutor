# D-093 — D-014 unparked: execution subagents authorised, scoped to the D-086..D-092 reskin

- **Tier:** 3 — owner-decided directly in conversation ("please spawn agents for each of the individual
  tasks"). **Interprets D-014** by satisfying its unpark condition rather than overriding it.
- **Date:** 10-Aug-2026

## Decision

D-014 parked "build Claude Code execution subagents to carry out already-decided build tasks" with an
explicit condition: *"deferred until after Phase 1 (teaching engine) is validated and the relevant design
decisions are made. User decides; agents execute."*

Both halves of that condition are now met, which is why this is an unpark and not an override:

- **Phase 1 validated** — D-080 ran Q7 live (n=5) against prompt v0.8; FINDING 8 did not reproduce, 0/5.
- **The relevant design decisions exist** — D-086 through D-092, made this session, are exactly the
  "already-decided build tasks" D-014 was waiting for.

D-014's own framing — *user decides; agents execute* — is honoured precisely: every design judgement was
made by the owner before any agent was spawned. The agents carry out decisions; they do not make them.

## Scope of the authorisation

**Authorised:** presentation-layer implementation of D-086 through D-092 in `app/` — token file, screen
and component restyling, the walkthrough container, empty-state content, and review passes over the
result.

**NOT authorised, for any agent, at any tier:**

1. **Backend changes of any kind.** Verified before spawning: every data shape the mockups draw already
   has a service (`budget`, `consolidated`, `holdings`, `income`, `goals`, `streaks`, `rewards`,
   `esop_exercise_cost`, `loan_vs_invest`, `tax_saving_room`, `onboarding`, `holding_capture_classifier`).
   This is a pure presentation change. An agent that concludes it needs a schema or service change must
   **stop and report**, never act — `CLAUDE.md` hard stop, low reversibility against populated data.
2. **New dependencies.** Specifically `react-native-reanimated`, `expo-font`, `@expo-google-fonts/*`, or
   any other package. Animation uses React Native's built-in `Animated`/`LayoutAnimation`; type uses
   platform system faces per D-088. A new library is a decision, not an implementation detail.
3. **New screens or flows beyond the reskin.** The push-notification tray, the standalone reminders
   surface, and the Income screen as drawn do not exist in `app/` and are not authorised here (trigger 5,
   no de-minimis exception). Flagged in D-086's scope note.
4. **Any change to a deliberate-only file** (`PROJECT_GOVERNANCE.md`, `docs/DECISION_PROTOCOL.md`,
   `HOW_TO_RUN_THIS_PROJECT.md`, `CLAUDE.md`).

## Model tiering

Explicitly requested by the owner ("optimize the agents to the LLM model required depending on the nature
of work; I don't want to overspend token of each small task"). Recorded as a standing pattern for future
fleets:

| Nature of work | Model | Why |
|---|---|---|
| Mechanical substitution against a fixed spec (token file, colour swaps) | Haiku | Deterministic; the spec does the thinking. |
| Screen/component implementation with layout judgement | Sonnet | Bulk of the work; needs real judgement, not architectural judgement. |
| Review against principles, cross-cutting evaluation | Opus | Must catch a violation nobody wrote a rule for yet. |

The governance writing for this session was deliberately **not** delegated: the orchestrating session
already held the full context, so a subagent would have re-derived it at higher cost and lower accuracy.

## Boundary — what stays parked

D-014's broader ambition (a general standing subagent capability for arbitrary build tasks) is **not**
unparked. This authorises one fleet for one decided body of work. The next fleet is its own call.

## Reversibility

High — agent output is ordinary code on a branch, reviewable and revertible like any other commit. The
authorisation itself creates no persistent capability.
