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
| D-022 | DEFERRED | Conversation memory | Storage, retrieval, retention and deletion policy approved; explicitly post-MVP |
| D-067 | DEFERRED | Automatic comparison-trigger detection | Real usage shows users ask decision-shaped questions without the explicit trigger |
| D-120 | NO_BUILD | Draft autonomous-pipeline design is not an approved decision | Four owner choices remain; create a new decision if approved |
| D-122/D-124/D-125 | BLOCKED → BQ-072 | Customer-outcome MVP exit-gate programme | Complete approved MVP, owner simulator validation, then external activation testing |
| D-128 | BLOCKED → BQ-085 | Goal Affordability calculator | Exact input/formula/disclosure/edge-case contract |
| D-131/D-132 | BLOCKED → BQ-086 | Term-insurance Coverage scenarios | Exact component formula/source/validation/disclosure contract; counsel before external launch |
| D-134 | BLOCKED → BQ-087 | Dedicated minimal financial-context record | D3 authenticated ownership and D-010 privacy/deletion/backup contract |

## Current-session decisions

| Decision | Disposition | Evidence |
|---|---|---|
| D-135 | SHIPPED → governance artifact | This tracker plus the D-135 session-close rule in `CLAUDE.md` |

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
