# D-157 - Home uses seven-level hierarchy and representative tool previews

- **Tier:** 2, owner-ruled.
- **Interprets:** D-104's eight-area Home restructure in the D-148 validation context.
- **Date:** 28-Aug-2026

## Decision

The owner approved the tested Home prototype's seven-level hierarchy:

1. account identity and freshness;
2. financial picture;
3. Portfolio Health;
4. Arya;
5. tools;
6. learning and participation progress;
7. context, privacy and account controls.

All eight D-104 feature areas remain reachable. Home shows one calculator and one scenario preview plus
**View all tools**, rather than giving both catalogues full competing carousels on Home.

This is interface hierarchy, not a ranking of the user's financial problems. Home never selects a holding,
goal, score area, calculator or scenario as the user's priority.

## Lenses

- **Compliance:** PASS. The layout reports facts and offers routes without recommending a financial action.
- **Product:** PASS. Arya remains the primary teaching route while every persistent/manual area remains reachable.
- **Technical:** PASS. The validated definition needs no new API, schema, navigation route or dependency.
- **Cost-and-scope:** PASS. It reduces Home density while preserving every approved capability.

## Why

D-104's implementation breadth is valuable, but eight equally weighted sections make Home feel like a
catalogue. The approved grouping gives data provenance and the teaching loop priority without telling the
user what financial issue deserves attention. BQ-118 thoroughly tested the prototype across state,
interaction, responsive, theme and accessibility requirements before the owner ruled.

## Reversibility

High. This is a validated definition; production changes are still separately bounded and not yet built.

## Disposition

SHIPPED as validated definition through BQ-119. Production implementation remains a separate future item.
