# FinTutor TODOs

Standing items flagged during build or review — not build-queue tasks, but decisions or infrastructure work
that needs to be resolved before a future item is started. Each entry is tagged with the BQ it originated
from and the BQ that will resolve it.

---

## Testing infrastructure

**jest-expo test runner for pure functions**
- Origin: BQ-054 plan-eng-review (T13)
- Resolve before: any unit test coverage is added
- Note: `computeSubScores()` in `app/lib/healthScore.ts` is the ideal first test target — pure function,
  no side effects, 4 sub-scores with clearly defined formulas and edge cases.
- Decision needed: add jest-expo to devDependencies and configure `jest.config.js`. Treat as an
  infrastructure decision (new devDependency) — log in `docs/decisions/` before installing.

---

## BQ-058 planning

**Shared store vs independent fetch for health sub-scores on PortfolioScreen**
- Origin: BQ-054 plan-eng-review (T14)
- Resolve before: BQ-058 (Portfolio screen restructure) starts
- Note: BQ-058 needs health sub-scores for the donut chart. Current plan is for PortfolioScreen to call
  `computeSubScores()` independently with its own `fetchBudget + fetchHoldings + AsyncStorage.multiGet`.
  Risk: if BQ-058 also uses `useFocusEffect`, both screens fetch in parallel on the same tab focus event —
  double API calls, and if results diverge (race), the score on PortfolioScreen may differ from the score
  on HealthScoreScreen.
- Decision options: (a) shared React Context store, (b) independent fetch with accepted divergence,
  (c) PortfolioScreen fetches HealthScoreScreen's computed value from a lightweight store. Decide at
  BQ-058 planning, not now.
