# D-138 — MVP uses Supabase-managed at-rest protection with strict access controls

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided financial-data privacy and security boundary.  

## Decision

For the MVP, FinTutor will rely on Supabase's managed encryption for the Postgres database and its backups
rather than separately encrypting individual application fields.

This is not a transfer of FinTutor's security responsibility. The MVP protection package also requires:

- verified token-derived ownership on every protected backend request (D-137/BQ-089);
- TLS for application and database traffic, with database SSL enforcement before non-development use;
- database network restrictions once the production backend location is known;
- database credentials and provider secrets kept out of the app and source control;
- no direct mobile-client authority over financial database records; and
- repeatable authorization, deletion, and cross-account isolation tests.

FinTutor will not introduce its own field-encryption keys for the MVP. Field-level application encryption
may be reconsidered if legal review, provider terms, or a later threat model demonstrates that managed
at-rest encryption and access controls are insufficient.

## Why

Application-managed field encryption would add key generation, storage, rotation, recovery, deletion, and
migration obligations. Losing or mishandling those keys could make user data permanently unreadable without
automatically producing a safer system. The managed boundary is proportionate for the private MVP when it is
combined with authenticated ownership and production transport/network controls.

## Remaining D-010 boundary

This settles only at-rest protection. Backup duration and deletion treatment, whole-account deletion
behavior, user-facing disclosure, export, provider deletion, and legal review remain open.

## Delivery

D-137/BQ-089 already supplies authenticated ownership. BQ-092 must verify SSL enforcement and applicable
network restrictions as part of the production hosting/deployment posture before non-development use.
