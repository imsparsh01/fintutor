# D-137 — Backend ownership is derived from a verified Supabase JWT

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided authentication and financial-data access boundary.  

## Decision

Every protected backend request will carry the signed-in user's Supabase access token. The backend will
verify that token and derive the authoritative user identity from its `sub` claim. A caller-supplied
`user_id` will no longer grant or select ownership.

The contract is:

- the app sends the Supabase bearer token on every protected request;
- the backend validates the token before reading or changing user-owned data;
- the verified token subject is the sole user identifier used for ownership filtering and new records;
- client-supplied identifiers may identify a resource, but never the user who owns it;
- unauthenticated, invalid, or expired tokens fail without returning protected data; and
- routes that are intentionally public and contain no user data, such as a health check, may remain public.

Multiple development and test accounts remain supported. Each account receives its own token and subject,
and cross-account tests must prove that one authenticated user cannot read, change, or delete another
user's records.

## Why

Supabase already authenticates the frontend, but the backend currently trusts a UUID supplied by the
client. That is not an ownership boundary: changing the UUID could target another account. Verifying the
existing Supabase token closes that gap without introducing a second identity system and gives all current
and future per-user records one consistent ownership rule.

## Rule extraction

For every user-owned backend resource, identity comes from verified authentication context, never from a
caller-selected user identifier.

## Delivery

BQ-089 implements this contract across the backend routes and frontend API wrappers. Its acceptance tests
must include two distinct authenticated users and explicit cross-account denial cases.
