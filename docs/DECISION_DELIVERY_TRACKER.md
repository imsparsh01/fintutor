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
| D-010 | SHIPPED → BQ-087 | Internal-MVP Privacy Policy v1, accessible links and dedicated context | External collection/public launch still requires qualified India counsel review under D-009 |
| D-138 | DEFERRED | Verify production SSL enforcement and applicable database network restrictions | Unparks with D-143 before any non-local/external backend deployment; JWT ownership already shipped |
| D-142 | SHIPPED → BQ-104 | Enforce FastAPI-only access to every public application table | Completed 14-Aug-2026 at Alembic head `d142a104f001`; direct client roles denied, private backend role verified |
| D-144 | SHIPPED → BQ-105 | Reauthenticated self-service JSON data export | Completed 14-Aug-2026; verified-subject export, native/web delivery, temporary-file cleanup, and future-model coverage guard |
| D-139/D-140 | SHIPPED → BQ-099 | Reauthenticated, retry-safe whole-account deletion with seven-day backup treatment | Completed 14-Aug-2026 |
| D-012/D-051 | SHIPPED → BQ-093 | Bounded in-context comparison coverage | Completed 14-Aug-2026; cold surfacing removed |
| D-022 | DEFERRED | Conversation memory | Storage, retrieval, retention and deletion policy approved; explicitly post-MVP |
| D-031/D-079 | DEFERRED | Real estate, Cash & bank, and Alternatives holding families | Explicit post-MVP unpark/priority decision |
| D-046 | SHIPPED → BQ-094 | Repair standalone-file evidence for five historical IDs | Completed 14-Aug-2026; every D-001–D-136 ID resolves to one primary artifact |
| D-060 | SHIPPED → BQ-095 | Opt-in ethical daily learning reminder | Completed 14-Aug-2026 |
| D-089 | SHIPPED → BQ-102 | Interactive own-numbers educational walkthrough | Completed 14-Aug-2026 |
| D-067 | DEFERRED | Automatic comparison-trigger detection | Real usage shows users ask decision-shaped questions without the explicit trigger |
| D-095 | DEFERRED | Tighten localhost CORS and verify the dev-auth bypass is absent | Before first non-development deployment |
| D-097 | SHIPPED → BQ-096 | Preserve valuation metadata for unmapped/malformed holdings | Completed 14-Aug-2026 |
| D-048/D-069/D-070 | SHIPPED → BQ-103 | Correct audited budget/ESOP/tax-room/streak defects | Completed 14-Aug-2026 after independent conformance review |
| D-101 | SHIPPED → BQ-097 | Preserve reminder day 1–31 with per-month clamping | Completed 14-Aug-2026 |
| D-105 | DEFERRED | Income-tax comparison and HRA exemption calculators | D-145 requires named FY, official sources, verification owner/date, stale shutdown and counsel review |
| D-106 | DEFERRED | Rent-vs-buy scenario (S-04) | Explicit schema/input and money-calculation approval |
| D-107 | SHIPPED → BQ-091 | Tool-independent mandatory engineering plan/review gates | Completed 14-Aug-2026 |
| D-117 | DEFERRED | Progression pacing simulation | Before external launch; test light/frequent paths and single-feature dominance |
| D-119 | SHIPPED → BQ-088 | Assessment context view/change/clear UI | Completed 14-Aug-2026 |
| D-119/D-121 | SHIPPED → BQ-099 | Whole-account deletion integration for assessment/progression | Completed 14-Aug-2026 |
| D-120 | NO_BUILD | Draft autonomous-pipeline design is not an approved decision | Four owner choices remain; create a new decision if approved |
| D-123 | DEFERRED | Meaningful non-gating recap interaction and `recap_completed` emitter | Approve a recap interaction/completion contract consistent with P9 |
| D-123 | DEFERRED | Progression profile-coverage dimension | Approve an evidence-backed denominator |
| D-121 | DEFERRED | Operational 400-day progression pruning | Unparks with D-143/BQ-092 when a production scheduler is required before external users |
| D-114/D-121 | DEFERRED | Internal de-identified progression/business aggregates | BQ-072 measurement design after internal MVP validation |
| D-122/D-124/D-125 | BLOCKED → BQ-072 | Customer-outcome MVP exit-gate programme | Complete approved MVP, owner simulator validation, then external activation testing |
| D-128 | SHIPPED → BQ-085 | Neutral Goal Affordability gap calculator | Completed 14-Aug-2026 |
| D-131/D-132 | SHIPPED → BQ-086 | Context-first term-insurance exploration | Completed 14-Aug-2026; counsel still required before external launch |
| D-134/D-141 | SHIPPED → BQ-087 | Privacy Policy v1 and dedicated minimal context record | Completed 14-Aug-2026; external collection/public launch remains counsel-gated |
| D-145 | SHIPPED → BQ-091/BQ-093/BQ-095/BQ-096/BQ-097/BQ-102/BQ-103/BQ-085/BQ-086/BQ-087 | Execute consolidated MVP backlog contracts | Ten builds completed 14-Aug-2026; BQ-098 remains deliberately deferred |
| D-146 | SHIPPED → BQ-106 | Keep native-only accessibility focus out of web runtime | Completed 14-Aug-2026; original Goal contribution-gap crash reproduced and retested live |
| D-129 | SHIPPED → BQ-101 | Align recurring-contribution timing and disclosures | Owner reconfirmed Option A; completed 14-Aug-2026 |
| D-005/D-008/D-143 | DEFERRED | Select and implement the production FastAPI host | Unparks before external testing/distribution or any workflow requiring a non-local backend; Supabase remains Postgres/Auth only |
| D-005/D-008/D-052/D-137 | SHIPPED → BQ-089 | Validate Supabase JWT and derive request ownership | Completed 14-Aug-2026; verified token subject is authoritative across protected routes |
| D-062/D-135 | SHIPPED → BQ-090 | Synchronize the session-close skill with mandatory delivery disposition | Completed 14-Aug-2026 |

| D-147 | SHIPPED → requirements.txt + D-147 decision file | Python 3.14/Windows venv fix; psycopg2-binary, SQLAlchemy, Alembic floor bumps + tzdata added |
| D-148 | SHIPPED → BQ-109 | Baseline package frozen after delegated eight-scenario validation PASS | Completed 23-Aug-2026; production bounded in BQ-110–BQ-112 |
| D-149 | SHIPPED → BQ-112 | Full baseline lifecycle, durable stale reconfirmation and reminder-only recovery | Completed 24-Aug-2026 at migration `b112c152a001` |
| D-150 | SHIPPED → BQ-112 | Backend-authored proportional progress provenance and partial/unknown UI | Completed 24-Aug-2026 |
| D-151 | SHIPPED → BQ-111 | Round-half-up paise conversion implemented and verified | Completed 24-Aug-2026 |

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
