# D-173 — Calculator suite is the next complete workstream

- **Tier:** 3, owner-decided sequencing under D-148/D-166.
- **Date:** 30-Aug-2026
- **Traces / builds on:** D-105, D-128, D-129, D-135, D-145, D-148 and D-166.

## Decision

The owner directed FinTutor to move to the **Calculator suite** and complete the workstream end to end after Scenario production parity received PASS.

The bounded definition and validation sequence is:

1. **BQ-145:** reconcile the current calculator suite into one PRD, journey and complete state matrix;
2. **BQ-146:** consolidate suite-wide functional, money, provenance, content, privacy, accessibility and recovery contracts;
3. **BQ-147:** map every requirement to acceptance evidence and route unresolved money/data/advice forks for owner ruling;
4. **BQ-148:** build the controlled-data clickable prototype and complete exhaustive agent QA; and
5. **BQ-149:** owner walkthrough and PASS / REVISE / PARK / ESCALATE disposition.

After PASS, separately bounded production-reconciliation items compare the frozen package with `app/` and `backend/`, close substantiated gaps, and run an exhaustive production parity gate.

## Scope

The workstream covers the nine production Tools calculators: SIP Goal Planner, Home Loan EMI, Inflation Impact, Step-up SIP, CAGR, Compound Growth, Credit-card Payoff, Emergency Coverage and Goal contribution gap.

It must reconcile the older embedded calculators with the newer pure modules, including assumption ownership, numeric grammar/domains, formula/timing conventions, rounding, result invalidation, source-labelled editable prefills, disclosures, neutral language, accessibility, responsive behavior, Arya teaching handoff where bounded, progression emission and failure isolation.

## Boundaries

- Tax and HRA remain blocked under D-145/BQ-098. This decision does not choose a financial year, ruleset, reviewer or legal posture.
- No XIRR, rent-versus-buy, transaction-history schema or additional catalogue is added.
- No formula, rate, target, horizon, payment, timing convention or numeric ceiling is invented during definition. Genuine money-logic gaps stop for owner decision.
- No product/security names, forecast language, recommendation, adequacy claim, app-selected assumption or saved calculator result.
- BQ-145..BQ-149 are definition and controlled-fixture work only. They do not authorize production code, backend route, schema, dependency or persistence changes.
- Production reconciliation remains a separate sequence after owner PASS.

## Why

The suite already answers nine useful questions, but its oldest tools lack the explicit formula, lifecycle and interaction evidence of newer calculators. A single platform contract reduces the risk that a mathematically valid figure is misunderstood because timing, ownership, rounding, exclusions or stale-result behavior differs by screen.

## Reversibility

High. This decision sequences documentation and controlled validation without changing production calculations or stored data.

## Delivery disposition

READY → BQ-145. Later items become READY one at a time after their prerequisite closes.
