# D-132 — Term-insurance exploration uses user-controlled household-support scenarios

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided insurance calculation, advisory boundary, sensitive-data use, and MVP scope.  
**Completes the output-direction fork in:** D-131.

## Decision

FinTutor will not declare one personalized term-insurance requirement or author a lower/middle/upper coverage
range. It will build a user-controlled household-support scenario experience using the broader financial
picture as attributed, editable inputs.

For each scenario, the user explicitly decides:

- the annual income amount and number of support years to model;
- which debts, if any, to include;
- which goals, if any, to include and at what amount;
- which assets, if any, are genuinely available as offsets and at what amount;
- existing term cover and any transient employer/group/other cover;
- any survivor or household income offset; and
- any optional inflation assumption, with no app-supplied default.

No debt, goal, asset, horizon, rate, or offset is selected automatically merely because it exists in the
baseline. Known records may be presented as source-labelled, editable candidates. Templates may organize
choices only after the user selects one; none is preselected or described as safer, complete, ideal, or
recommended.

## Output contract

Each scenario shows:

- the modeled household-support amount;
- a component breakdown of additions and offsets;
- the existing/other cover entered; and
- a neutral signed difference between that cover and the modeled scenario.

Scenarios may be compared side by side, but FinTutor never labels one result required, recommended, adequate,
inadequate, underinsured, overinsured, a shortfall, or a surplus. The experience explains how each selected
component changes the arithmetic and what relevant facts remain unknown.

## Persistence and product boundary

Scenario selections and edits remain transient. They do not silently update income, holdings, goals,
dependants, Portfolio Health, or any other baseline object. Any later persistence requires an explicit
confirmation/reconciliation and privacy decision.

There is no insurer/product comparison, premium quote, purchase path, lead generation, policy recommendation,
or change to Portfolio Health's separately approved coverage index. India insurance/fintech counsel must
review the eventual framing, calculations, disclosures, and user flow before external launch.

## Why

The baseline contains financial facts, but facts alone do not determine which future household obligations
should be insured. Those inclusions depend on the user's values, household arrangements, intended support,
asset availability, and uncertainty. Letting the user author scenarios allows FinTutor to teach the full
mechanism without hiding suitability judgments inside a single authoritative-looking number.

## Rule extraction

For personalized protection questions, FinTutor may assemble facts and calculate consequences, but the user
must own every consequential inclusion, horizon, rate, and offset; the app never converts a modeled scenario
into a suitability verdict.

## Remaining implementation gate

Before build, document the exact component formulas, source/unknown semantics, finite/range validation,
loading and stale-user behavior, disclosures, and legal/privacy review requirements. No new durable schema or
default assumption is authorised by this decision.

