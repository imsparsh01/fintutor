# D-143 — Production FastAPI hosting is deferred until external access is required

**Supersedes:** D-005/D-008 — only the earlier wording that implied Supabase would host the Python/FastAPI
backend; Supabase remains the decided Postgres and Auth provider.  
**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided recurring cost, provider, deployment, and MVP sequencing.  

## Decision

FinTutor will keep FastAPI local during internal MVP completion and owner validation. No production backend
host will be selected or paid for yet.

The decision unparks when a real workflow requires the backend to be reachable beyond the owner's local
development machine—before external activation testing, distribution to test users, or any production-like
device validation that cannot use the local backend. At that point the provider must be selected using
current pricing, regional proximity to Supabase Singapore, security controls, secret management, health
checks, deployment reliability, and scheduled-job support.

Supabase continues to host Postgres and Auth. Its TypeScript/Deno Edge Functions are not treated as the home
of the existing Python/FastAPI application, and this decision does not authorize a backend rewrite.

## Consequences

- Production SSL enforcement, network restrictions, CORS cleanup, and hosted health checks remain deferred.
- The 400-day progression-pruning scheduler remains deferred because its runtime depends on hosting.
- External-user testing cannot begin until hosting and its production security checklist are completed.
- No hosting provider is added to the privacy-policy provider list until one is actually selected.

## Delivery

No build is currently authorized. BQ-092 and BQ-100 remain visible with the explicit external-access unpark
condition rather than being treated as forgotten work.
