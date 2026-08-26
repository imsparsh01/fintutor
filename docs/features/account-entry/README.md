# Account entry and access — feature package

Product-definition deep dive for FinTutor workstream 1 (portfolio-audit rank 3), approved as the next
workstream by **D-152** under the **D-148** ten-workstream programme. Definition/prototype only — no
production `app/`/`backend/` code, schema, or new library until a BQ-117 PASS.

## Contents

| File | Task | Status |
|---|---|---|
| `PRD.md` | BQ-113 | Done — user/problem/outcome/principles/success/exclusions/deps |
| `JOURNEY_AND_STATES.md` | BQ-113 | Done — journey, state matrix, and the three OPEN owner decisions |
| `CONTRACTS.md` | BQ-114 | Done — functional + content + privacy/accessibility contracts |
| `ACCEPTANCE_AND_VALIDATION.md`, `DECISION_REGISTER.md` | BQ-115 | Pending — acceptance matrix; owner rules the open forks |
| `prototype/` | BQ-116 | Pending — clickable fixture-only journey |
| `VALIDATION_RESULT.md` | BQ-117 | Pending — owner walkthrough + PASS/REVISE/PARK/ESCALATE |

## Open owner decisions (surfaced at BQ-113, ruled at BQ-115)

- **O-A** — session-expiry & network-loss recovery UX.
- **O-B** — duplicate-registration / wrong-password copy & account-enumeration (privacy angle).
- **O-C** — logout & account-switch device-local state.

## Deferred HARD-STOPs (out of this workstream)

Frontend screen/navigation test harness (new library/architecture); production CORS/dev-bypass cleanup
(D-095); backend hosting (BQ-092); Supabase leaked-password protection.

Security architecture (D-137 JWT ownership, D-142 FastAPI-only table access) is already decided and is
referenced, not re-litigated, here.
