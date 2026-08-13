# FinTutor TODOs

Standing items flagged during build or review — not build-queue tasks, but decisions or infrastructure work
that needs to be resolved before a future item is started. Each entry is tagged with the BQ it originated
from and the BQ that will resolve it.

---

## Testing infrastructure

**Frontend test-runner consolidation**
- Origin: BQ-054 plan-eng-review (T13)
- Current state: pure-function coverage already runs directly with Node; 30 tests cover compound growth,
  credit-card payoff, emergency coverage, and reminder scheduling. `tsc --noEmit` remains the type check.
- Revisit when: component/native-module tests genuinely require a React Native-aware runner.
- Decision needed then: adding jest-expo remains a new-devDependency decision and must be logged before
  installation. It is not a prerequisite for pure-function unit coverage.

---
