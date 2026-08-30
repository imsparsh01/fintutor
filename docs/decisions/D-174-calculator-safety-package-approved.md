# D-174 — Calculator safety, formula and teaching package approved

- **Tier:** 3, owner-decided money logic, financial-data scope and teaching boundary.
- **Date:** 30-Aug-2026
- **Traces / builds on:** D-128, D-129, D-145, D-173 and BQ-147.

## Decision

The owner approved the complete recommended Calculator package in `docs/features/calculators/DECISION_REGISTER.md`:

1. strict whole-string grammar and bounded finite inputs/intermediates/outputs;
2. exact shared ceilings with formula-specific tighter bounds;
3. explicit SIP and EMI zero-rate branches;
4. Inflation permits user-entered deflation down to -100%;
5. Step-up SIP permits explicit 0% return and step while retaining D-129 timing;
6. CAGR supports signed loss/equality/gain and fractional positive years;
7. Goal contribution gap remains manual-only and neutral when current value reaches/exceeds target;
8. Emergency Coverage remains the sole recorded-candidate Calculator in this package; Card Payoff remains manual-only; and
9. every valid current Calculator result may offer a confirmed privacy-minimised Arya mechanism handoff.

The exact domains and conventions in O-CA-1..O-CA-9 are binding. Prototype and production work may implement them but may not reinterpret them.

## Boundaries

- No tax/HRA, XIRR, rent-versus-buy, catalogue expansion, saved result history, default assumption, benchmark, product name, forecast, adequacy verdict or recommendation.
- Calculator inputs/results remain transient. Progression receives stable type only.
- Prototype work remains controlled data. Production changes require separately bounded reconciliation after owner validation PASS.

## Delivery disposition

READY → BQ-148. BQ-147 acceptance and decision routing is complete.
