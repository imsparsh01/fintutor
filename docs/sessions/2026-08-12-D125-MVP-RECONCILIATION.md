# D-125 Step 1 — MVP Reconciliation Audit

**Date:** 12-Aug-2026
**Scope:** D-125 step 1 — reconcile the approved MVP (`PROJECT_SPEC.md` §4, §2, §6) and standing strategy
decisions against the live application; identify every missing, incomplete, disconnected, or stale
implementation.

**Boundary observed (D-125's own):** this audit proposes bounded items for *already-approved* scope only.
It does not unpark deferred capability, invent evidence-gated features, or use "integration" as a label for
scope growth. Items requiring a new decision are listed as decisions, not as build tasks.

---

## What is genuinely complete

Register/login · onboarding v2 + optional first-action handoff · three category sections (Investments,
Loans, Insurance) · consolidated view · budgeting + goals · AI-surfaced capture with user-confirmed
reconciliation · learning progression (ledger, emitters, surfaces) · streaks · 8 calculators · 5 scenarios ·
request-scoped privacy masking envelope.

§4 items 1–6, 8, 9 are substantially built. Item 7 is not — see F-3.

---

## A. Blocks the owner's own live validation (D-125 step 4)

### F-1 — No deployment posture exists at all
No Dockerfile, Procfile, CI config, or hosting definition anywhere in the repo. The backend runs on
`localhost:8000` only, and `main.py:53` CORS is localhost-only (D-095, itself flagged "tighten before
deploy"). The owner can currently exercise the app only by running FastAPI and Expo together on one
development machine.

**Why it matters for D-125:** step 4 says "the owner uses and live-validates the integrated application."
Whether that is satisfied by a simulator on the dev machine, or requires a real phone talking to a reachable
backend, changes what has to be built first. **Needs an owner decision (D1).**

### F-2 — Backend test suite cannot be run on this machine
`pytest` is absent from `backend/.venv` and from `requirements.txt`. Bare `python3` resolves to anaconda
carrying SQLAlchemy 1.4.39 against the required 2.0.35, so collection fails there with an import error. The
122-test suite is currently unrunnable locally. Mechanical to fix; consequence is that backend health is
unverifiable right now.

---

## B. Approved MVP scope that is incomplete

### F-3 — Reminders (§4 item 7) are one-shot, not recurring
`app/lib/reminders.ts` schedules exactly one local notification per holding, and only at create/update time
(`ChatThread.tsx:182`, `HoldingEditModal.tsx:106`/`:114`). Nothing re-arms after a notification fires and
nothing reschedules on app open.

Consequences:
- A monthly EMI reminder fires **once**, then never again until the user happens to re-edit that holding.
- For credit cards, `payment_due_date` is a single date string; once it is past, `nextReminderDate()`
  returns `null` and the user receives nothing further.

§4 item 7 lists "Reminders: EMI dates, credit-card payment dates" as MVP scope. What exists demonstrates the
mechanism but does not deliver a working recurring reminder. The fix is bounded (re-arm on app open; roll
credit-card due dates forward monthly), but confirming that monthly-recurring local notifications are the
intended design is worth one line from the owner. **Mostly queueable; see D4.**

### F-4 — `baseline.dependents` / `baseline.emergency_fund_months` never reach the teaching engine
Already recorded in `KNOWN_LIMITATIONS.md`. `SYSTEM_PROMPT_v0_8_runnable.md` §4 documents both as part of
`baseline`; neither has a backing schema field, so `assemble_baseline()` omits both from every `/chat` call.
The teaching engine is running against a baseline structurally thinner than the prompt it was written for.
**Needs an owner decision (D2)** — new fields on `Income`, or a small new profile object. Schema shape is
hard-stop territory.

---

## C. Blocks external users, not owner validation

### F-5 — No JWT ownership enforcement on any backend route
Verified across `backend/app/main.py`: every route takes `user_id: uuid.UUID` as a plain query parameter
with no auth dependency. Supabase authenticates the *app*; the API proves nothing about *who is calling*.
Anyone who can reach the API and knows or guesses a UUID can read and write that user's financial records.

Already in `KNOWN_LIMITATIONS.md`, and it is D-122's "production trust/safety (JWT ownership)" gate.
**Needs an owner decision (D3)** — it touches sensitive financial data and cannot be a drive-by.

### F-6 — Pre-launch legal and privacy work still open
- `PROJECT_SPEC.md` §8: data privacy policy (D-010) unwritten. D-121 settled progression retention
  (400 days raw + durable summary) but explicitly flagged that **backups are undecided**, so the honest
  public retention number may not be 400.
- §8: legal review of the D-009 compliance stance by India securities/fintech counsel — still open.
- D-132 additionally requires India insurance/fintech counsel review of term-insurance framing before
  external launch.

These are owner/external actions, not build items. Noted so they are not rediscovered late.

---

## D. Untested money math (risk is inverted)

### F-7 — The oldest, most consequential financial services have zero automated coverage
Backend tests exist for: goals, holdings, holding reconciliation, onboarding assessment (×2), privacy
masking, progression, progression emitters.

Confirmed **zero** test files reference: `loan_vs_invest`, `tax_saving_room`, `esop_exercise_cost`,
`budget`, `consolidated`, `surfacing`, `streaks`.

Frontend is thinner still: 3 test files against 65 source files, and all three cover recently-added
calculators.

The pattern is that the newest features are best covered while the oldest money math — the figures a user
would actually act on — is uncovered. Under `CLAUDE.md`'s own hard-stop framing ("calculations users rely
on"), this is the inverse of the desired risk profile. **Queueable with no new decision.**

---

## E. Stale documentation (mechanical)

| # | Location | Problem |
|---|---|---|
| F-8 | `docs/CODEMAPS/architecture.md:69` | Claims "BQ-069 is backend only: no existing service emits events yet, and no screen reads them." False — BQ-070/071 shipped emitters (`main.py:501`, `:505`, `:760`) and reader surfaces (ProgressScreen, Consolidated, Calculator, Scenario). |
| F-9 | `docs/CODEMAPS/backend.md:104` | Lists `teaching.py` as calling `claude-3-5-sonnet`; actual value is `claude-sonnet-5`. |
| F-10 | `docs/CODEMAPS/architecture.md` nav map | Lists only Assessment as a hidden screen; eight exist (Calculator, Scenario, Investments, Loans, Insurance, Budgeting, HealthScore, Progress). |
| F-11 | `DECISIONS_FOR_YOU.md:3`, `:98` | Header claims "Blocking: nothing — the build queue is moving again" (READY is empty); line 98 calls BQ-069 "the top item in the build queue" (completed and archived 12-Aug). |

---

## Owner decisions this audit surfaces (D-125 step 2)

| ID | Question | Blocks |
|---|---|---|
| **D1** | What does "the owner live-validates the integrated application" require — dev-machine simulator, or a real phone against a reachable backend? | F-1, and the shape of any deployment work |
| **D2** | How do `dependents` and `emergency_fund_months` enter the schema — fields on `Income`, or a new small profile object? | F-4 |
| **D3** | What is the auth boundary — validate Supabase JWT and derive `user_id` from it, or another approach? | F-5, external testing |
| **D4** | Confirm recurring local notifications are the intended reminder design (vs. server-side, vs. deliberately one-shot). | F-3 |

---

## Proposed queue (pending owner approval)

**No new decision required — Tier 1, ready to queue now:**
- **BQ-081** — Repair backend test environment: add `pytest` to `requirements.txt`, install into
  `backend/.venv`, document the `./.venv/bin/python -m pytest` invocation. (F-2)
- **BQ-082** — Automated coverage for uncovered financial services: `loan_vs_invest`, `tax_saving_room`,
  `esop_exercise_cost`, `budget`, `consolidated`, `surfacing`, `streaks`. (F-7)
- **BQ-083** — Codemap and status-doc staleness fixes. (F-8 … F-11)

**Decision-gated — do not queue until the matching decision lands:**
- Reminder recurrence correction (F-3, gated on D4)
- Baseline schema fields (F-4, gated on D2)
- Auth boundary implementation (F-5, gated on D3)
- Deployment posture (F-1, gated on D1)

**Already decided, awaiting scoping into a build item:**
- D-132 term-insurance household-support scenarios — the decision is unusually complete (inputs, output
  contract, persistence boundary all specified). Counsel review is required before *external launch*, not
  before build. Tier 3 area, so queueing it is an owner call.
