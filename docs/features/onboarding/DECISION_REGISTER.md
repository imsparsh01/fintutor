# Onboarding decision register

**Status:** BQ-122 prepared; O-ONB-1 and O-ONB-2 await owner ruling before BQ-123.

## Preserved decisions

| Area | Standing rule | Prototype treatment |
|---|---|---|
| Shape | D-118 five independent optional axes | Fixed order, normalized chips, no quiz/persona |
| Eligibility | D-119 initial release is 18+ | Explicit acknowledgement before creating v2 |
| Persistence/privacy | D-119 normalized-only versioned record | Fixture shows safe state, never raw text/data |
| Access | D-119/D-126 skip is handled and financial disclosure is not an access gate | Skip/exit/handoff remain visible |
| Handoff | D-126 optional user-chosen destination | Five equal routes; attributed suggestion only |
| Legacy | D-118/D-119 grandfather; never infer | Presence-only access and voluntary opt-in |
| Progress | D-117/D-121 participation only | No answer value/outcome in events; failures isolated |
| Ownership | D-137/D-142 | Verified subject only; no direct table/client authority |
| Account switch | D-155 | Old UI clears and late response is discarded |

## Bounded prototype resolutions

| ID | Resolution | Route |
|---|---|---|
| ONB-P01 | Keep chips only; typed clarification is approved future direction but not shipped/prototype scope | Existing implementation + D-158 no-scope boundary |
| ONB-P02 | Use explicit fixture controls for failures, relaunch, auth denial and account switch | Tier 1 test mechanics; fixture-only |
| ONB-P03 | Show an in-prototype event ledger containing event names only, never answer values | Tier 1 observability required to test D-117/D-121 |
| ONB-P04 | Use one shared state machine across scenario presets so actions remain testable, not separate static mockups | Tier 1 fixture architecture; no production dependency |
| ONB-P05 | Provide deterministic light/dark theme and reduced-motion fixtures | Tier 1 QA mechanics |

## Owner brief O-ONB-1 — New-user access when eligibility cannot be persisted

- **Trigger fired:** legal/eligibility shape and interpretation of D-119; Tier 3.
- **The question:** A verified, genuinely new user has no v2/legacy/cache state and the assessment backend is
  unreachable. What may the app do before it can durably record the required 18+ acknowledgement?

### Path A — Hold at a recoverable eligibility outage screen

The user acknowledges 18+, the save fails, and the app stays at a calm full-screen recovery state with Retry
and Sign out. It explains that FinTutor cannot confirm the starting setup while offline. No assessment or Home
access is granted until the backend records acknowledgement.

- Preserves D-119's durable eligibility evidence and backend authority.
- Creates a temporary technical access gate, but not a financial-disclosure gate.
- Simple and fail-closed; a user cannot use backend-dependent app functions during the same outage anyway.

### Path B — Accept locally and open a clearly limited offline shell

The device records a subject-scoped pending acknowledgement, opens only locally available/non-financial Home
orientation, and must sync eligibility before any backend data/action. Sign-out clears the pending record.

- Avoids a dead end and preserves immediate orientation value.
- Introduces local eligibility authority, pending-sync semantics and a new limited-access mode not currently
  approved; evidence could be lost on another device or cleared storage.
- Larger production/security/access contract even if the prototype can simulate it.

### Path C — Enter the full app and ask again later

The app treats acknowledgement as presentation-only and allows normal access despite failed persistence.

- Lowest friction.
- Contradicts D-119's backend-authoritative eligibility/persistence package and weakens proof of acknowledgement;
  not compatible without explicitly superseding that boundary.

- **What only the owner can judge:** whether durable eligibility evidence must fail closed or whether a bounded
  pending local acknowledgement is acceptable.
- **Rule extraction:** when a mandatory eligibility acknowledgement cannot reach its authoritative store,
  access must either fail closed or be limited by an explicitly approved pending-evidence contract.
- **Owner outcome:** PENDING.

## Owner brief O-ONB-2 — Equivalent progression for global exit

- **Trigger fired:** live progression meaning after data exists (low reversibility) and interpretation of
  disclosure-equivalence under D-117/D-118/D-121; Tier 3.
- **The question:** How should the five v2 context-prompt events behave when global exit marks all remaining
  prompts undisclosed?

### Path A — Global exit handles and awards every remaining prompt key

On global exit, emit the same once-per-prompt/version event for each remaining prompt that is durably set to
undisclosed, then emit onboarding-handled. A user who exits immediately receives the same five prompt awards
as someone who individually answers/skips all five.

- Makes total setup progression exactly disclosure/interaction neutral.
- Treats global exit as an explicit batch skip, matching its durable effect.
- Requires idempotent batch emitter coverage; awards events for prompts not individually viewed.

### Path B — Remove context-prompt awards from initial Onboarding v2

Only onboarding-handled awards setup progress. Context-prompt events remain for later optional prompts outside
initial onboarding, where each prompt is actually encountered.

- Simplest explanation and strongest equality for initial setup.
- Changes already-awarded internal records or needs a prospective ruleset/migration treatment; greater
  historical complexity after live events exist.

### Path C — Keep current behavior

Each individually answered/skipped prompt earns its event; global exit earns only events for prompts already
handled plus onboarding-handled.

- No production change.
- Rewards more interaction, not more sensitive answer content, because individual Skip earns equally.
- Still makes global exit worth less despite the product promise of equivalent setup treatment and can create
  practical pressure to step through all questions.

- **What only the owner can judge:** whether equality means equal treatment per encountered prompt or equal
  total setup progression across global-exit and five-step paths, and how much historical change is acceptable.
- **Rule extraction:** optional disclosure flows must define equivalence at both per-prompt and total-flow level;
  “skip equals answer” alone is insufficient when a global exit exists.
- **Owner outcome:** PENDING.

## Prototype gate

BQ-123 cannot hard-code O-ONB-1 or O-ONB-2 until both owner outcomes are recorded as decisions. All other
prototype mechanics are bounded by the existing contracts and can proceed immediately afterward.
