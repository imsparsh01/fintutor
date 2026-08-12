# D-133 — Sensitive names and identifiers are masked locally before every model call and re-humanized for users

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided privacy, financial-data handling, model boundary, and D-010 architecture.  
**Completes the immediate blocker in:** D-127/BQ-077.  
**Builds on:** D-009/D-010/D-011.

## Decision

FinTutor preserves the user's original product or institution name in the user-facing experience while
ensuring that every Sonnet or Haiku request contains only an opaque alias.

Example:

```text
User sees/types:  HDFC car loan
Model receives:   Loan-A
User sees reply:  HDFC car loan
```

Before every model call, a backend-local sanitizer must replace:

- stored product/institution display names with their existing aliases;
- high-confidence newly typed Indian institution/product names with request-scoped opaque aliases;
- PAN-like identifiers;
- account, card and policy-number patterns;
- email addresses; and
- phone-number patterns.

The original-to-alias map remains inside the trusted backend boundary. It is never included in model prompts,
logs, errors, analytics, progression events, or other external payloads. Newly typed names remain transient
unless the user separately confirms a holding write under D-078/D-127.

Every model call involved in a turn—including teaching, deepen selection, and holding extraction—receives the
sanitized text, never the original. After a response returns, FinTutor re-humanizes only exact opaque alias
tokens using the request-local/stored map before returning text to the app. The user continues to see the
original names they supplied or saved, not FinTutor's internal aliases.

## Recognition and failure behavior

Use deterministic local recognition: exact stored-name matching, a locally maintained Indian financial-
institution/product dictionary, and high-confidence structured-identifier patterns. No third-party PII service
is authorised.

If safe masking cannot be completed, a likely sensitive name/identifier remains unresolved, alias integrity is
ambiguous, or masking would destroy the request's useful meaning, FinTutor does not send the original text. It
holds the message locally and asks the user to rewrite it without identifying details. It never falls back to
the unmasked request merely to keep Chat working.

Amounts, interest rates, ordinary dates, durations, and generic financial mechanisms are not masked by this
decision; broader minimisation remains part of the complete D-010 privacy policy.

## Security boundaries

- Opaque aliases use a reserved, collision-resistant token format that user text cannot impersonate.
- Re-humanization is exact-token replacement only—never fuzzy or substring replacement.
- Model-generated text cannot create an arbitrary alias-to-name mapping.
- Sanitized/original request text is not written to application logs by the sanitizer.
- User-facing re-humanization happens only after the model call and before the response reaches the app.

## Why

A warning alone does not protect users who naturally refer to “my HDFC car loan.” FinTutor's standing promise
is architectural: users may see recognisable names, while external models never do. Local masking plus exact
re-humanization preserves both usability and the privacy boundary without sending the sensitive text through a
second external service.

## Boundaries

- No external PII detector or new dependency/service.
- No automatic persistence of request-scoped names.
- No product, insurer, lender, fund, or security recommendation.
- No weakening of fail-closed behavior because a model request would otherwise be unavailable.
- Backup retention, at-rest encryption, export, whole-account deletion, and broader D-010 policy remain open.

