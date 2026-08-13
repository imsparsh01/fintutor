# D-140 — Whole-account deletion requires re-authentication and is retry-safe

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided irreversible deletion, privacy, and provider sequencing.  

## Decision

FinTutor will provide a user-controlled **Delete my account** action. Before deletion it will show the full
scope, explain the seven-day encrypted recovery-backup window, require fresh authentication, and then require
a separate final confirmation.

The backend operation is authenticated, idempotent, and safe to retry. It will:

1. delete all active FinTutor application data owned by the verified subject;
2. delete that subject's Supabase Auth account using backend-only provider authority; and
3. report success only after both stages complete, then clear the local session and return to registration.

If application-data deletion fails, the Auth account is retained and no success is shown. If Auth deletion
fails after application data has been removed, the account remains empty and the deletion can be retried;
financial data is not restored. Repeated requests must converge on the same fully deleted state.

## Scope of active deletion

The deletion integration must cover every current per-user table and locally stored account-scoped state,
including holdings, income, goals and funding links, discretionary categories, onboarding states and
assessment context, streak state, and all progression tiers. New per-user records must join the same deletion
registry or cascade before shipping.

## Why

Fresh authentication protects against deletion by someone who only has temporary access to an unlocked
device. Data-first sequencing avoids deleting the only login identity before application erasure has
succeeded. Idempotency turns partial provider failure into a retryable empty-account state rather than an
ambiguous recovery operation.

## Delivery

BQ-099 is READY to implement this contract together with D-139's backup disclosure and restore-safety
requirement. Data export and the final public privacy notice remain separate D-010 decisions.
