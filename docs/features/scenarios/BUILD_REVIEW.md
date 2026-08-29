# BQ-133 Build Review

Date: 2026-08-29  
Status: locked before final implementation and QA

## Scope

Build a fixture-only clickable prototype for the owner-approved D-170 Scenario contract. Cover five dedicated scenarios, four contextual explorers, eight owner tasks, all 50 canonical states, and all 96 acceptance criteria. Do not touch `app/`, `backend/`, APIs, schemas, persistence, production formulas, or product scope.

## Architecture

- Plain local HTML, CSS, and JavaScript under `docs/features/scenarios/prototype/`.
- One in-memory state object; fixtures are static and hypothetical.
- A direct `SC-01` through `SC-50` state registry supports deterministic review.
- Formula paths implement only the D-170/D-171 prototype contract and are guarded by explicit finite/range/output checks.
- No network, storage, cookie, analytics, model, service-worker, or external-asset path.

## Edge cases locked

Unknown is never converted to zero; candidates begin excluded; touched inputs are not silently refreshed; a changed input removes the prior result; permission/account changes synchronously clear financial state; late fixture responses cannot restore prior-account data; contextual explorers retain their origin and consent boundaries; equal and negative comparisons stay descriptive; results remain usable when progression fails or caps.

## Test plan

1. Static safety and coverage audit for 96 AC IDs, 50 SC IDs, nine formula branches, prohibited APIs, and forbidden advisory copy.
2. Exact normal/boundary formula fixtures and D-171 rejection checks.
3. Browser walkthrough of all eight validation tasks, nine entries, state fixtures, keyboard/dialog behavior, error/result focus, themes, 320/390/1440 layouts, and 200% zoom.
4. Pre-commit diff review for correctness, security, privacy, scope, and test evidence.

## Design preflight

Accessibility-critical, trust-first product prototype. Restrained editorial teaching surface; no dashboard chrome, gradients, decorative animation, fake metrics, or recommendation language. Design dials: variance 4/10, motion 2/10, density 5/10.
