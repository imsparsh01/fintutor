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
