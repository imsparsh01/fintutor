# D-159 — Pending local eligibility acknowledgement opens a limited offline Home

- **Tier:** 3, owner-decided legal/eligibility and access boundary.
- **Date:** 29-Aug-2026
- **Resolves:** O-ONB-1 in the D-158 Onboarding workstream.
- **Interprets:** D-119 for the case where a genuinely new verified user cannot reach the assessment backend.

## Decision

The owner selected **Path B**. When a genuinely new verified user explicitly acknowledges that they are 18 or
older but the backend cannot persist the acknowledgement, FinTutor may retain a subject-scoped **pending local
acknowledgement** and open a clearly limited offline Home.

The limited state may show only locally available, non-financial orientation and navigation explanation. It
must not load or mutate backend data, run Arya, start financial capture, calculate from user data, award
progress, or represent onboarding as durably handled. Every backend-dependent action remains unavailable with
plain “connect to continue” treatment.

When connectivity returns, eligibility must sync before ordinary app data/actions unlock. A successful sync
starts/resumes the authoritative v2 assessment. Sign-out/account switch clears the pending acknowledgement;
it cannot grant another subject access and cannot be treated as cross-device evidence.

## Why

This avoids a dead end while keeping the unpersisted state narrow and explicit. The user has made the required
acknowledgement, but FinTutor does not pretend the server recorded it or allow the pending device state to
become financial-data authority.

## Boundaries

- No full app, financial data, model call, capture, calculation, progression or durable handled state offline.
- The pending key is subject-scoped, temporary and actively cleared on sign-out/switch.
- The Home surface must visibly say that setup is waiting to sync and what is unavailable.
- Prototype realization is BQ-123. Production implementation requires a separately bounded post-validation
  build; this decision alone does not mutate production code.

## Reversibility

High at prototype stage. Production local-state and sync mechanics remain separately reviewable before build.

## Disposition

READY → BQ-123 controlled-fixture realization and validation.
