# D-139 — Deleted account data may remain only in encrypted recovery backups for seven days

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided privacy, retention, and deletion boundary.  

## Decision

When a user deletes their account, FinTutor will remove their active application data immediately. A copy
may remain only inside encrypted disaster-recovery backups for a maximum of seven days, after which it must
expire through the provider's backup lifecycle.

FinTutor will not create additional long-lived manual database backups for the MVP. Backup-contained data is
not available for ordinary application, analytics, support, or product use. The user-facing privacy notice
must state the possible seven-day backup delay plainly.

If a backup is restored, FinTutor must not serve the restored environment until account deletions that
occurred after that restore point have been reapplied. BQ-099 must provide and test a reliable restoration
procedure; the implementation mechanism may not silently introduce a new provider or retention store.

## Why

A short recovery window protects all users against corruption or accidental loss while limiting how long
deleted financial data remains technically recoverable. Seven days matches the intended MVP provider tier's
standard recovery window and avoids a separate, longer FinTutor-controlled archive.

## Rule extraction

Deletion removes active data immediately. Recovery-only copies may survive only for the shortest declared
provider window, may not be used normally, and may never resurrect a deleted account after restoration.

## Remaining D-010 boundary

This settles backup duration and treatment. The exact whole-account deletion experience and failure
semantics, provider/Auth deletion sequencing, user-facing disclosure/export package, and legal review remain
open.
