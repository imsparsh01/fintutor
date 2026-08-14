# D-141 — Detailed sensitive-context disclosure lives in the privacy policy

**Date:** 14-Aug-2026  
**Tier:** 3 — owner-decided privacy and financial-data disclosure boundary.  

## Decision

The detailed explanation of how FinTutor collects, uses, protects, retains, and deletes the dedicated
financial-context values approved by D-134 will live in the privacy policy, rather than being repeated as
long-form disclosure beside those fields in the product UI.

The product UI must still identify the fields clearly, state that they are optional, require explicit user
entry or confirmation, and provide view, change, and clear controls. It must not hide collection, prefill or
infer either value, or use acceptance of the privacy policy as consent to manufacture financial context.

The privacy policy must specifically cover the dependant-count and self-reported emergency-fund-months
values, their personalization uses, their Supabase storage/protection, active deletion behavior, and the
seven-day recovery-backup boundary. Collection cannot ship until that policy text and an accessible in-app
link are present.

## Why

This keeps the data-entry surface short while preserving one authoritative, reviewable explanation of the
data lifecycle. Minimal field-level transparency remains necessary so that “privacy policy only” does not
become silent or inferred collection.

## Delivery

BQ-087 remains blocked only on the final D-010 privacy-policy artifact and accessible link. Its earlier
authentication, retention, backup, and deletion gates are settled by D-137 through D-140.
