# D-125 — Complete and internally validate the approved MVP before external testing

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided product sequencing and external-readiness boundary.  
**Supersedes:** D-122's sequencing paragraph and D-124's immediate recruitment sequence only; D-122's
customer-outcome exit gates and D-124's eventual test method remain standing.

## Decision

FinTutor will first implement the complete, already-approved MVP strategy as one integrated application.
The implementation must reflect the standing product principles, approved design decisions, first-principles
customer-experience conclusions, and all MVP capabilities already authorised in `PROJECT_SPEC.md`.

The sequence is:

1. Reconcile the approved MVP and strategy decisions against the live application and identify every
   missing, incomplete, disconnected, or stale implementation.
2. Resolve only the genuine owner decisions that block that implementation; reversible mechanics and
   Tier-1/Tier-2 decisions continue autonomously under D-017/D-115.
3. Build the approved MVP end to end in dependency order, with review, automated verification, and native
   experience QA.
4. The owner uses and live-validates the integrated application.
5. Fix internal-validation failures.
6. Only then recruit external participants and run D-124's activation test, followed by the remaining
   evidence-dependent D-122 gates.

External participants will not be asked to evaluate an application that the owner cannot yet use as a
coherent end-to-end product. D-124 is retained as the eventual external test protocol, with the owner-approved
privacy-minimal Path A: no audio, video, or screen recording; participant codes; rounded or hypothetical
figures; anonymized written notes; session-level notes deleted after 90 days; only aggregated findings retained.

## Why

An unfinished or disconnected build confounds product evidence with implementation incompleteness. External
testing is useful only after the internally chosen strategy exists in the product strongly enough for a
participant's failure to reveal a customer-experience problem rather than a known missing flow. The immediate
bottleneck is therefore implementation fidelity and integration, not participant recruitment.

This does not redefine “MVP” as every conceivable feature. “Complete” means the already-approved MVP scope and
strategy, not parked capabilities, new breadth, or speculative additions. D-122 still governs the later claim
that FinTutor is ready for external users or business launch.

## Boundaries

- No parked or post-MVP capability is unparked.
- No evidence-gated feature is invented before evidence exists.
- Privacy, auth ownership, legal/tax, money logic, irreversible architecture, and MVP-scope changes remain
  owner decisions.
- The implementation audit may create bounded build items only for already-approved scope. It may not use
  “integration” as a label for silent scope growth.

## Rule extraction

External product testing follows internal strategy fidelity: first make the approved product coherent and
usable enough for the owner to validate; then use customers to discover what the team could not know
internally, rather than asking them to rediscover known incompleteness.

