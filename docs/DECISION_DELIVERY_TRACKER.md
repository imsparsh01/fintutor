# FinTutor — Decision Delivery Tracker

> Delivery-control index established by D-135. This is not a second decision log: reasoning stays in each
> decision file, executable scope stays in `BUILD_QUEUE.md`, and shipped history stays in
> `BUILD_QUEUE_ARCHIVE.md`. Every new decision receives exactly one disposition here in the same session.

## Disposition rules

`NO_BUILD` · `READY → BQ-###` · `BLOCKED → BQ-###` · `DEFERRED` ·
`SHIPPED → BQ-### / commit or artifact` · `SUPERSEDED → D-###`

Absence is an error, not an implicit `NO_BUILD`. A blocked or deferred row must name what changes its state.

## Open delivery obligations

| Decision | Disposition | Deliverable | Blocker / transition |
|---|---|---|---|
| D-009 | DEFERRED | India securities/fintech legal review | Before public launch |
| D-010 | BLOCKED | Final data privacy policy | Owner decisions on at-rest protection, account deletion and backup retention; legal review |
| D-012/D-051 | BLOCKED → BQ-093 | Complete in-context AI surfacing coverage across the MVP taxonomy | Owner-approved pairing content/precedence beyond loan→term insurance; cold surfacing stays out |
| D-022 | DEFERRED | Conversation memory | Storage, retrieval, retention and deletion policy approved; explicitly post-MVP |
| D-031/D-079 | DEFERRED | Real estate, Cash & bank, and Alternatives holding families | Explicit post-MVP unpark/priority decision |
| D-046 | SHIPPED → BQ-094 | Repair standalone-file evidence for five historical IDs | Completed 14-Aug-2026; every D-001–D-136 ID resolves to one primary artifact |
| D-060 | BLOCKED → BQ-095 | Complete or narrow the Hook Loop trigger layer | Owner-approved engagement-trigger design under P2/D-061 |
| D-089 | BLOCKED → BQ-102 | Reconcile empty-state walkthrough with “using the user's own numbers” | Owner confirms current Chat handoff or approves personalized walkthrough contract |
| D-067 | DEFERRED | Automatic comparison-trigger detection | Real usage shows users ask decision-shaped questions without the explicit trigger |
| D-095 | DEFERRED | Tighten localhost CORS and verify the dev-auth bypass is absent | Before first non-development deployment |
| D-097 | BLOCKED → BQ-096 | Preserve valuation metadata for unmapped/malformed holdings | Owner approval for money-shaped error semantics |
| D-048/D-069/D-070 | BLOCKED → BQ-103 | Remaining audited budget/ESOP/tax/streak conformance defects | Owner approves exact corrections to user-facing financial/state behavior |
| D-101 | BLOCKED → BQ-097 | Reconcile reminders with the approved 1–31/month-end rule | D4 confirmation or corrected scheduling design |
| D-105 | BLOCKED → BQ-098 | Income-tax comparison and HRA exemption calculators | FY/rule-source/update/stale/legal contract required by D-128 |
| D-106 | DEFERRED | Rent-vs-buy scenario (S-04) | Explicit schema/input and money-calculation approval |
| D-107 | BLOCKED → BQ-091 | Restore or supersede mandatory gstack plan/review gates | Prove compatible plan + review invocations, or owner approves a manual fallback |
| D-117 | DEFERRED | Progression pacing simulation | Before external launch; test light/frequent paths and single-feature dominance |
| D-119 | SHIPPED → BQ-088 | Assessment context view/change/clear UI | Completed 14-Aug-2026 |
| D-119/D-121 | BLOCKED → BQ-099 | Whole-account deletion integration for assessment/progression | D3 ownership plus D-010 deletion/backup contract |
| D-120 | NO_BUILD | Draft autonomous-pipeline design is not an approved decision | Four owner choices remain; create a new decision if approved |
| D-123 | DEFERRED | Meaningful non-gating recap interaction and `recap_completed` emitter | Approve a recap interaction/completion contract consistent with P9 |
| D-123 | DEFERRED | Progression profile-coverage dimension | Approve an evidence-backed denominator |
| D-121 | BLOCKED → BQ-100 | Operational 400-day progression pruning | Production scheduling mechanism after deployment architecture |
| D-114/D-121 | DEFERRED | Internal de-identified progression/business aggregates | BQ-072 measurement design after internal MVP validation |
| D-122/D-124/D-125 | BLOCKED → BQ-072 | Customer-outcome MVP exit-gate programme | Complete approved MVP, owner simulator validation, then external activation testing |
| D-128 | BLOCKED → BQ-085 | Goal Affordability calculator | Exact input/formula/disclosure/edge-case contract |
| D-131/D-132 | BLOCKED → BQ-086 | Term-insurance Coverage scenarios | Exact component formula/source/validation/disclosure contract; counsel before external launch |
| D-134 | BLOCKED → BQ-087 | Dedicated minimal financial-context record | D3 authenticated ownership and D-010 privacy/deletion/backup contract |
| D-129 | SHIPPED → BQ-101 | Align recurring-contribution timing and disclosures | Owner reconfirmed Option A; completed 14-Aug-2026 |
| D-005/D-008 | BLOCKED → BQ-092 | Confirm and implement the production hosting/deployment target | Owner confirms whether Supabase “hosting” still governs FastAPI or is superseded |
| D-005/D-008/D-052/D-137 | READY → BQ-089 | Validate Supabase JWT and derive request ownership | Owner approved token-derived ownership on 14-Aug-2026 |
| D-062/D-135 | SHIPPED → BQ-090 | Synchronize the session-close skill with mandatory delivery disposition | Completed 14-Aug-2026 |

## Current-session decisions

| Decision | Disposition | Evidence |
|---|---|---|
| D-135 | SHIPPED → governance artifact | This tracker plus the D-135 session-close rule in `CLAUDE.md` |
| D-136 | SHIPPED → governance artifact | Exception-only historical audit method and recovered obligations in this tracker |

## Historical reconciliation

- Shipped implementation decisions through D-133 are traced to their completed BQ entries or named
  artifacts in `docs/BUILD_QUEUE_ARCHIVE.md`, except for the open obligations listed above.
- Governance, research, evaluation, and principle decisions requiring no separate runtime artifact are
  evidenced by their decision/brief/protocol/spec artifacts and are treated as `NO_BUILD`.
- Superseded decisions retain their original entries; their later decision files name the supersession.
- This reconciliation is exception-based but exhaustive: any historical decision later found without a
  shipped/no-build/superseded trace must be added above immediately as a control failure.

## Update protocol

1. Add the decision row in the same session the decision is logged.
2. If `READY` or `BLOCKED`, create and link its BQ item in that same session.
3. When a BQ ships, change the row to `SHIPPED` and link the archive entry/commit.
4. When an unpark condition occurs, replace `DEFERRED` with `READY` or `BLOCKED`; never leave prose-only work.
5. At session close, reconcile every decision added or changed that session against this file.
