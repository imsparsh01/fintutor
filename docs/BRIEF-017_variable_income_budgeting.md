# BRIEF-017 — Variable-income budgeting for the startup/gig founding sub-profile

> Picks up BRIEF-011's escalated hard-stop, left as "a decision is needed" with two unsketched shapes.
> Written so the owner is choosing between real, costed options, not approving a vague direction.
> **Date raised:** 04-Aug-2026.

---

### BRIEF — How, or whether, should FinTutor compute a budget for a user whose income isn't a fixed monthly figure?

- **Trigger fired:** §2.1 hard trigger 1 — `CLAUDE.md`'s first hard-stop item, "anything touching money
  movement, calculations users rely on, or financial data." `compute_budget()`'s income-total figure is
  exactly this: a number a user would size their spending and savings against.
- **Category:** Compliance-adjacent via correctness, not the advisory line — BRIEF-011's own Compliance
  pass already cleared the *general* shape of startup/gig content (PASS). What's unresolved here is purely
  computational: what number does the app show someone whose income genuinely isn't one fixed figure.
- **The question:** `compute_budget()` currently assumes every income source is a fixed amount at a fixed
  frequency (`Income.sources: [{label, amount, frequency}]`, normalized to monthly via `_to_monthly`). That
  assumption is simply false for freelance/gig/early-stage-startup income. What replaces it?

### Why this can't be answered by extending the existing model quietly
`_to_monthly()` picks one number and treats it as certain. For irregular income, doing that silently would
produce a budget the user might trust as precise when it's actually a guess dressed as a fact — the exact
failure mode CLAUDE.md's hard-stop exists to catch, independent of whether any *advice* is given on top of
it.

### What's already settled, not re-litigated here
D-054 confirmed the startup/gig sub-profile is part of the founding population, not a later add-on, and
that "design must serve all three [sub-profiles], not treat one as the real target and the others as edge
cases." That commitment doesn't by itself force a specific technical answer here, but it means **Path C
below has a real cost to weigh**, not just an engineering shortcut.

---

### Path A — Rolling-window / trailing-average, computed from logged income events

**What it is.** A new object (e.g. `IncomeEntry {date, amount, label}`) the user logs each time they're
actually paid — no bank integration exists or is planned for MVP (`PROJECT_SPEC.md` §5), so this is manual
entry, not auto-pulled. `compute_budget()` would average the trailing N months (e.g. 3) of logged entries
into the income figure, instead of reading one static declared number.

**Consequence, concretely.** The most honest of the three — the number converges toward what's actually
landing, self-correcting as real pay events accumulate, and matches how a freelancer/gig worker actually
experiences their own income (looking back, not projecting forward).

**What it costs / forecloses.** Real new MVP scope, not a formula tweak: a new schema object + migration, a
new capture flow (in tension with D-012's zero-friction/AI-surfaced philosophy unless the AI proactively
asks about it in-conversation, which is its own design problem), and a genuine cold-start gap — a
day-one gig user has zero logged history, so the app has nothing to average for at least the first pay
cycle or two. In practice Path A only becomes itself after weeks of use; before that it behaves like some
version of Path B anyway. This is the most expensive path and the only one that fires trigger 5 (scope
increase) on top of trigger 1.

### Path B — Explicit, self-declared income, two sub-variants (no new history-tracking)

**B1 — a single self-reported "typical monthly" figure.** Reuses `Income.sources` exactly as it exists
today; the only change is honest framing in the UI ("this is what you told us, not a verified number") and
encouraging the user to edit it (`PUT /income/{id}`, already built) whenever it materially changes. Zero
new schema, zero new computation logic — ships essentially immediately.

**B2 — a declared range (low/high) instead of one point figure, budgeted against the low end.** Small
schema addition (e.g. an optional `amount_high` alongside the existing `amount`, treated as the floor).
Budget math computes `recurring_outflows_total` against the **low** bound, not an average — reframing the
teaching moment from "here's your income" (a claim of precision the app can't back) to "here's whether your
fixed costs survive your worst realistic month" (a feasibility check, which is arguably the actually useful
question for irregular income, and stays inside "teach, don't advise" — it states a fact about the numbers,
never a directive).

**Consequence, concretely (both).** Cheap — B1 needs no new code at all; B2 needs one field and one formula
branch. Both stay honest about uncertainty instead of hiding it inside a false-precision average.

**What it costs / forecloses.** Neither delivers Path A's self-correcting, evidence-based number — both
depend entirely on the user's own estimate staying roughly accurate, with no mechanism to catch drift other
than the user remembering to update it. B1 in particular doesn't really address the "wrong number" risk
BRIEF-011 raised, just relabels it as user-supplied rather than assumed; B2 is the meaningfully different
one of the two.

### Path C — Defer entirely; startup/gig users get the same single-figure model as everyone else

**What it is.** No new engineering. The startup/gig sub-profile uses the identical Income model and budget
computation every other user gets, with the existing update path as the only correction mechanism. The gap
is disclosed (`docs/KNOWN_LIMITATIONS.md`), not silently absorbed.

**Consequence, concretely.** Free. Keeps the queue focused elsewhere (device verification, privacy policy)
while nothing about this is urgent — no real users exist yet to be given a wrong number.

**What it costs / forecloses.** Directly in tension with D-054's "don't treat one sub-profile as an edge
case" commitment — BRIEF-011's Business lens named this exact gap as the startup/gig segment's core
budgeting need, not a nice-to-have. Shipping nothing here means that sub-profile's budgeting screen is
functionally the same UX as everyone else's despite a structurally different underlying reality.

---

### What only the owner can judge

**Whether this is worth building before real users exist**, or whether Path C (disclosed, deferred) is the
right call until there's evidence of the gap actually biting someone — the same evidence-before-generalizing
discipline this project has applied elsewhere (D-006, D-067), weighed against D-054's explicit
don't-treat-as-edge-case commitment.

**If building something, how much new scope is acceptable right now** — Path A is real new schema +
capture-flow scope on top of the hard-stop itself (two triggers, not one), while B1/B2 are close to free.
Given the standing, larger risk that nothing shipped this week has been verified on a real device yet, is
this the right moment to add a new data object, or does that compound the wrong kind of unverified surface
area?

**For B2 specifically, if chosen:** should the budget math silently use the low-end floor, or should the
user see both figures (a typical estimate and the worst-case floor) so the choice of which to trust is
visibly theirs rather than baked into the backend? A smaller framing decision, but still a real one.

### Rule extraction

**For any figure the user can only estimate, not verify, and that feeds an affordability/feasibility
check: default the calculation to the conservative bound, not an average.** An average answers "what's
typical"; a floor answers "am I safe" — irregular income needs the second question answered, and
conflating the two is exactly how a guess ends up dressed as a fact. This generalizes past this one case to
any future value FinTutor can't observe directly.

### No recommendation
Unlike BRIEF-014/015/016, none of these paths is forced by an existing constraint the way the
never-predict-markets rule forced the hurdle-rate shape — this is a genuine three-way tradeoff between
fidelity (A), honesty-at-low-cost (B), and not building anything yet (C). Left unpicked deliberately, per
DECISION_PROTOCOL.md §5.2's default; happy to give a lean if asked.
