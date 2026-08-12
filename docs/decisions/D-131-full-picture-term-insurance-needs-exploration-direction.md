# D-131 — Term insurance uses a full-picture needs exploration, not a simple income multiple

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided MVP scope expansion, financial-data use, insurance/regulatory shape, and
teach-not-advise interpretation.  
**Supersedes:** D-128's bounded term-insurance coverage-calculator assumption only.

## Direction approved

FinTutor will not reduce term-insurance understanding to a fixed income multiple or a single user-entered
income-replacement horizon. It will use the user's broader financial picture to teach what contributes to
their protection requirement and what tradeoffs or uncertainties they must consider.

The experience must help the user understand the mechanism behind potential needs, including the relevance
of household support, time horizon, essential expenses, liabilities, goals or obligations, existing term
cover, potentially available assets/support, inflation and important exclusions or unknowns.

## Boundary still requiring a follow-on decision

This direction does not yet authorise a formula, new schema, or a user-facing “required cover” number. The
owner must separately choose the output contract—one app-calculated requirement versus multiple transparent,
user-controlled scenarios/framework—and approve the exact inclusion/exclusion rules and any new sensitive
inputs before implementation.

FinTutor must remain educational: no policy/product recommendation, no insurer or security name, no claim
that a modeled amount is adequate, and no instruction to buy or change a specific cover. India insurance/
financial-regulatory counsel must review the eventual framing and disclosures before external launch.

## Why

Term-insurance need is a household resilience question, not merely an income multiplication. A full-picture
experience can teach the user why different responsibilities produce different protection considerations.
But because the chosen inclusions and output can become an implicit suitability recommendation, the detailed
calculation cannot be invented during implementation.

## Scope controls

- No build item until the output/formula and data contracts are approved.
- No silent reuse or persistence of new sensitive context.
- No automatic assumption that every debt, goal, asset, or income source should be counted.
- No change to Portfolio Health's existing coverage index under this direction.
- No product comparison, purchase recommendation, lead generation, or insurer integration.

