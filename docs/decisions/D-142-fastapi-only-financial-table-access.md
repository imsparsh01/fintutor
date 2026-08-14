# D-142 — Public financial tables are accessible only through FastAPI

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided financial-data security boundary.  

## Decision

FinTutor's mobile client will not access application tables through Supabase's public Data API. Every
current public table will have Row Level Security enabled with no `anon` or `authenticated` access policy,
and all direct table privileges for those roles will be revoked. FastAPI remains the sole application-data
gateway and connects through its private Postgres role, which has the required RLS-bypass authority.

Every future application table must join this boundary explicitly in its creation migration. Supabase Auth
remains client-facing; this decision changes database-table access, not registration or login.

## Why

The backend already validates the Supabase access token and derives ownership from its subject. Allowing a
second direct data path would duplicate authorization logic and risk policy drift. A backend-only boundary
keeps one enforceable ownership path and removes the public key as a route to financial rows.

## Delivery

BQ-104 applies and verifies the migration against the development project. It must prove FastAPI's private
role retains access while `anon` and `authenticated` have no table privileges.
