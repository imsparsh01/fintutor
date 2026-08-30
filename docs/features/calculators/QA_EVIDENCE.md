# BQ-148 Calculator Prototype QA Evidence

Date: 2026-08-30  
Outcome: **PASS**

The controlled prototype implements all nine approved Calculators and directly loads every `CA-01..CA-51` canonical state. It contains no network, model, persistence, cookie, analytics or service-worker capability and uses only hypothetical fixture values.

## Automated evidence

- `node --check prototype/app.js`: PASS.
- `node prototype/qa.mjs`: PASS.
- Integrity: exactly 55 unique acceptance IDs, 51 canonical states and nine calculator entries.
- Exact fixtures: SIP and EMI zero-rate branches, Emergency Coverage division and signed CAGR fixture.
- Static safety: no fetch/XHR/WebSocket/beacon/storage/cookie/service-worker capability and no advisory phrases.
- Accessibility hooks: polite result announcement, alert region, semantic dialog, labelled controls; inherited prototype CSS includes ≥44px targets, visible focus, forced-colour and reduced-motion rules.

## Rendered browser evidence

- Tools rendered all nine entries with no runtime error.
- SIP Goal produced a current result and moved focus to its named result region.
- Editing the target removed the result and Arya action immediately and logged the exact rerun lifecycle.
- Rerun exposed an exact confirmation dialog containing only calculator type, normalized inputs, formula boundary and omissions. Focus entered the dialog; cancel sent nothing.
- No horizontal document overflow at 320, 390 or 1440 CSS pixels. The shared responsive stylesheet collapses the validation frame and comparison/actions at phone width; relative sizing and content flow remain available at zoom.
- Light/dark theme tokens, forced colours and reduced motion are explicit in the shared audited stylesheet. No animation carries meaning.

## Formula and state coverage

The acceptance matrix maps all shared lifecycle/provenance/privacy/recovery/progression/accessibility criteria and formula-specific criteria for SIP, EMI, Inflation, Step-up SIP, CAGR, Compound Growth, Credit-card Payoff, Emergency Coverage and Goal contribution gap. The canonical-state selector exposes all 51 states; fixture controls expose offline, source failure, permission loss, account switch, progression cap and reset.

## Pre-flight review

- Correctness: PASS against D-174 formula branches and domains for controlled validation.
- Security/privacy: PASS; fixture memory only, no external capability.
- Scope: PASS; no deferred calculator or production mutation.
- Content: PASS; neutral arithmetic, no forecast/adequacy/recommendation.
- Visual consistency: PASS; existing FinTutor palette/type/radius system, one accent, clear focus/contrast, no landing-page pattern or added dependency.

Prototype evidence is definition validation only and cannot substitute for later production parity evidence.
