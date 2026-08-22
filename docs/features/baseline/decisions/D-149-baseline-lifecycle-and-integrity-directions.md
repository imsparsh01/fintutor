# D-149 — Baseline lifecycle and integrity directions approved

**Tier:** 3, owner-decided

**Interprets:** D-038 and D-059 for the wider personal-baseline lifecycle

**Date:** 23-Aug-2026

## Decision

1. Income sources, discretionary categories and goals receive full edit and delete support in the MVP. Their
   correction lifecycle should be coherent with the already-approved holding lifecycle, with explicit impact
   disclosure and recovery rather than add-only dead ends.
2. Goal progress will derive from live available value in linked holdings, subject to an explicit cap,
   allocation and unknown-value rule. This selects the live-value direction but does not invent the remaining
   money formula; that narrower rule stays owner-blocked.
3. Ordinary direct edits will use a durable concurrency token and compare it on write. A mismatch returns the
   current record and proposed change for explicit refreshed reconfirmation. Silent stale overwrite is not the
   contract.
4. A committed holding write is authoritative even if local reminder scheduling fails. Reminder failure is a
   separate non-blocking state with its own retry and must never invite a duplicate financial-record write.

## Why

The baseline is a user-correctable source of truth reused throughout FinTutor. Add-only supporting objects,
silent stale overwrites, and ambiguous partial success make correction less trustworthy than capture. The owner
accepted the additional MVP and schema/API work needed to make those integrity boundaries coherent.

Goal progress is separated because selecting live value is not enough to define user-relied-on arithmetic. A
holding can fund multiple goals, current value can fall below earmarks, and some holdings are unvalued. The cap,
allocation and unknown rules must be explicit before code or prototype claims a result.

## Build boundary

No production work is authorised until the baseline package completes D-148 owner validation and the remaining
goal-progress formula is approved. Later build items must include ownership, impact previews, export/deletion,
concurrency conflicts, cross-account state and accessibility tests.

## Reversibility

The product direction is deliberate. UI/error-copy changes are reversible; new lifecycle APIs and concurrency
schema are low-reversibility once populated, so their exact migration must remain bounded and tested. Goal money
logic is not reversible after users rely on it and therefore remains blocked until fully specified.
