# D-127 — Conversational holding reconciliation uses a user-confirmed field diff

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided financial-data mutation and living-baseline contract.  
**Builds on:** D-078 and D-099.

## Decision

When conversational input may add to or change a stored holding, FinTutor may classify it as a proposed
new holding, update, or contradiction, but it never applies the change without explicit user confirmation.

The confirmation must show:

- the target holding, identified locally to the user;
- every field proposed to change;
- the stored and proposed values for a changed existing field; and
- which supplied fields are additions versus conflicts.

Fields not supplied in the new input remain unchanged and are never interpreted as deletion. If there is
no plausible match, FinTutor proposes a new holding. If multiple existing holdings could match, the user
must select the target or choose “new”; the model may not resolve that ambiguity by itself. Declining or
dismissing the proposal changes nothing.

Conversational deletion is excluded. The existing explicit holding-delete control remains the only deletion
path. Reconciliation v1 applies to holdings only; it does not silently authorize conversational mutation of
income, goals, assessment context, or other baseline objects.

## Privacy and identity boundary

Real product or institution names remain local and must never be sent to the model. Model-side candidate
context uses aliases, product types, approved characteristics, and opaque identifiers only where required.
The user-facing chooser may re-humanize a candidate locally after the model call. Any ambiguity fails toward
user choice and no write.

## Persistence boundary

No reconciliation-history table or durable proposal store is authorised. The proposal is transient; the
confirmed write updates the existing holding through the current persistence model, and the response returns
the applied reconciliation status/diff under D-099. A durable audit/history surface requires a separate
privacy and retention decision.

## Why

The living baseline drives explanations and calculations throughout FinTutor. A visible confirmation step is
worth the small friction because an incorrect silent merge can contaminate multiple downstream experiences.
The AI extracts and compares; the user retains authority over the financial-data write.

## Rule extraction

AI may propose a financial-data mutation, but never owns record identity or the write: ambiguity, conflict,
and material change remain visible and user-confirmed.

