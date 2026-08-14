# FinTutor Privacy Policy — Internal MVP v1

**Effective date:** 14 August 2026
**Status:** Internal MVP only. This policy and the product flow require review by qualified India
privacy/fintech counsel, with any required changes applied, before external real-user collection or launch.

FinTutor is an educational personal-finance companion for people aged 18 or older. It teaches mechanisms
using information a user chooses to provide; it does not move money or provide financial advice.

## Information we collect

We store the account identifier and email used for authentication; optional onboarding answers; holdings,
income, spending categories, goals and funding links the user records; optional confirmed dependant count
and emergency-fund months; app-learning progression and streak activity; and messages submitted for an Arya
interaction while that request is processed. Product and institution display names may be stored in the
database but are replaced with internal aliases before model processing. FinTutor does not intentionally
collect data from anyone under 18.

The financial-context record is optional. Users can view, change or clear it without losing app access.
Unknown values are not silently converted to zero.

## Why we use it

We use account data only to authenticate and operate the app, display the user's own records, calculate the
educational models the user requests, tailor explanations, maintain learning progression, provide export and
deletion controls, secure and troubleshoot the service, create de-identified first-party product measurements,
and meet applicable obligations. We do not sell personal information, use it for advertising, use it to
decide credit or insurance eligibility, or use financial outcomes to target engagement rewards.

## Service providers and model processing

Supabase provides authentication and the managed PostgreSQL database. FinTutor's FastAPI backend is the only
application-data gateway; Supabase client roles cannot read application tables. Anthropic processes the
minimised, masked context needed to answer an Arya request. Real product/institution names and recognized
identifiers are replaced with request-local opaque tokens before that request and restored only by FinTutor's
backend afterward. Masking reduces exposure but cannot guarantee that free text contains no sensitive data;
users should avoid entering information that is unnecessary for their question.

FinTutor has not yet selected a production FastAPI hosting provider and does not name one here. Provider
processing and retention are governed by the settings and agreements in force for the internal MVP; this
policy does not make an unverified promise about a provider's retention period.

FinTutor does not keep conversation memory across sessions. Request content is sent only when needed for the
current Arya interaction. When a user exports data, the browser or device operating system and the user's
chosen save/share destination handle the downloaded file; FinTutor does not silently upload that export.

## Retention, export and deletion

Active records are kept for the life of the account unless the user changes, clears or deletes them.
Individual learning-progression events are retained for up to 400 days; retained daily rollups and the
learning summary remain for the account lifetime. A freshly reauthenticated user can download a JSON copy
of active user-owned data. Account deletion removes active application records before permanently deleting
the authentication identity. Encrypted recovery-only backups may retain deleted data for up to seven days;
they are not part of normal serving and expire through the backup lifecycle. FinTutor does not create
additional long-lived manual copies of deleted account data.

## Security

FinTutor uses TLS in transit, Supabase-managed encryption at rest, verified access tokens, backend-enforced
record ownership, restricted database roles, data minimisation, and request-local masking. No system is
perfectly secure, so this policy does not promise absolute security.

## Choices and contact

Users can view/change/clear optional context, correct or delete recorded items, download their data, and
delete their account from the app. During this closed internal MVP, privacy questions or requests should be
sent directly to the FinTutor project owner through the same private channel that provided access. A public
privacy contact will replace this internal contact route before any external launch.

## Changes

The effective date and version above identify this policy. Material changes will be shown in-product before
they apply. Continued internal testing will not be treated as consent to a materially different use that
requires a new choice.
