# D-122 — Customer-outcome gaps become MVP exit gates

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-directed product, scope, launch-readiness, privacy, and sequencing decision.  
**Basis:** First-principles customer-value and product-gap analyses (12-Aug-2026).

## Decision

FinTutor will not treat the current feature set as sufficient for MVP completion merely because its
screens and calculations are built. Before the MVP is considered ready for external users, the following
customer-outcome gaps must each be resolved by implementation, validation, or a deliberately documented
evidence-based decision.

1. **Activation:** a new target user can reach one personally meaningful financial insight with minimal
   disclosure, quickly enough to justify continuing.
2. **Real-user evidence:** target-user interviews and structured prototype/private-beta testing establish
   whether the experience is understood, trusted, and worth returning to.
3. **Connected value loop:** the path from first context through Arya/teaching, saved baseline, personal
   financial picture, and next useful action feels like one coherent journey rather than disconnected tools.
4. **Visible progression and return value:** the learning journey, attribution, recap/return surfaces, and
   relevant reasons to reopen are defined and shipped or deliberately replaced after evidence; an inert
   backend ledger is not sufficient.
5. **Trust and launch safety:** the production privacy/data-retention policy, backend JWT ownership
   boundary, native QA, deployment security posture, and required legal review are complete before real
   financial data is invited from external users.
6. **Initial wedge:** evidence identifies the first high-pull situation and segment to concentrate initial
   activation and acquisition around, rather than assuming the full 18–32 audience activates identically.
7. **Distribution and business viability:** a credible initial acquisition path and a testable
   monetization/willingness-to-pay hypothesis exist before the product is treated as a business-ready MVP.

This is an **exit-gate decision, not blanket feature authorization.** The current teaching, privacy, and
scope principles continue to apply. A gap may be resolved by evidence that a proposed feature is
unnecessary; it does not authorize adding new screens, integrations, financial calculations, data fields,
or advisory behaviour without the separate decision required by the protocol.

## Sequencing

The currently active major build work is completed first. The programme below then becomes the next
strategic workstream, beginning with the cheapest discriminating work: defining and running an activation
test with target users. No customer-outcome item enters READY until its concrete decision and acceptance
criteria exist.

## Why

FinTutor's value is not the presence of financial tools; it is the user's informed agency over their own
money. A calculator, dashboard, or AI response that does not create a timely, trusted, personal insight
does not produce that outcome. Building breadth before validating this mechanism increases maintenance and
scope while leaving the adoption bottleneck untouched.

## Rule extraction

For FinTutor, **feature-complete is not MVP-complete**. An MVP is ready to invite external users only when
it has evidence of activation, a safe trust boundary, and a credible return/use path—not when its build
queue happens to be empty.

## Reversibility

The exit-gate sequence is reversible before external launch. The privacy, security, money-logic, and
scope decisions required to satisfy individual gates may be low-reversibility and must be assessed
separately when they arise.
