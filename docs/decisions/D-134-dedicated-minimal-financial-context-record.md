# D-134 — Household resilience context lives in a dedicated minimal financial-context record

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided sensitive financial-context storage and durable schema.  

## Decision

FinTutor will create one optional, dedicated financial-context record per user for durable context that has
no correct home in holdings, income, goals, or another existing first-class object.

The first approved values are:

- a nullable, non-negative count of financial dependants; and
- nullable, explicitly self-reported emergency-fund depth in months.

Both values require explicit user confirmation. The onboarding assessment's broad responsibility category
may adjust presentation style only; it must never infer, populate, or overwrite the dependant count. FinTutor
does not initially store dependant names, ages, relationships, health information, or free-text descriptions.

The emergency-fund value is labelled self-reported rather than verified or computed. It is never silently
derived or overwritten from holdings, calculators, or Portfolio Health. The user can update or clear each
value, and the product preserves when it was last confirmed so stale context can be presented honestly.

## Product and privacy boundary

- This record is separate from Income; users without income records can still hold or clear the context.
- It becomes the eventual authoritative cross-device source for Arya and Portfolio Health, replacing the
  current installation-global emergency-month storage only when the implementation is built.
- D-132 term-insurance scenarios remain transient and user-authored. Stored facts may be offered only as
  source-labelled, editable context; nothing is automatically included in a scenario.
- No new value is inferred from onboarding, holdings, goals, chat, or calculator results.
- Account ownership must follow the D3 authentication decision. Retention, deletion, backup treatment, and
  public-facing disclosure must follow the still-pending D-010 privacy package.

## Why

Dependants and emergency-fund depth are neither income nor holdings. Putting them on Income would couple
unrelated lifecycle and deletion behavior. Refusing persistence would minimize data but leave Arya's approved
baseline structurally incomplete and prevent cross-device continuity. A narrow, user-controlled object gives
the information a truthful home without expanding it into a broad personal profile.

## Rule extraction

Durable personal-finance context with no natural home in an existing first-class object belongs in a
dedicated, user-controlled context record. It is never inferred from onboarding, and collection is limited
to the minimum structure the approved mechanism actually needs.

## Implementation gate

Do not queue the schema/API/frontend build until D3 settles authenticated ownership and D-010 settles the
applicable retention, deletion, backup, and disclosure contract. The build must also migrate or clear the
current installation-global Health Score values without exposing one user's value to another account.
