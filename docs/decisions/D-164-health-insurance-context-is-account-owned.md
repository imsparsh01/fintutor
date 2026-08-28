# D-164 — Optional health-insurance context is account-owned

- **Tier:** 3, owner-decided financial-data persistence/privacy.
- **Supersedes:** current device-local health-insurance answer as the intended product contract.
- **Date:** 29-Aug-2026

## Decision

Optional health-insurance presence belongs in the authenticated account-owned financial-context record. It
must have explicit view, change, clear, cross-device, export, deletion, retention and account-isolation
treatment. The answer remains optional, is not inferred and gates nothing.

## Why

A persistent-looking Portfolio view must not disagree across devices because one answer lives only on a local
installation. Account ownership provides clear authority and user control. The additional sensitive fact is
acceptable only with the complete existing privacy/export/deletion boundary.

## Boundaries

- BQ-128 simulates account ownership in memory; it adds no schema field or backend call.
- Production requires separate schema/API/privacy/export/deletion work and full tests.
- Unknown remains distinct from confirmed no.

## Reversibility

High at prototype stage. Production touched-data migration remains owner-gated and separately bounded.

## Disposition

READY → BQ-128 controlled-fixture realization and BQ-129 validation. Production remains separate.
