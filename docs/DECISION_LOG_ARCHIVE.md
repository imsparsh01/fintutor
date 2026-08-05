# FinTutor — Decision Log Archive

> Older decisions, moved here verbatim from `docs/DECISION_LOG.md` once the live file's rolling window
> filled (see `docs/DECISION_LOG.md`'s own header for the archiving rule — D-081). Same condensed-index
> format as the live file: title + one-line teaser (quoted from the decision's own first substantive
> bullet, not paraphrased) + pointer to the full write-up + date. Chronological, oldest first.
>
> **Never edited after being moved here.** If new information changes what an archived decision means,
> log a NEW entry in the live `DECISION_LOG.md` that supersedes or interprets it by ID — this file is
> historical record, not a place to revise.
>
> **Do not read this file wholesale as part of routine session start.** Grep it (or `docs/decisions/`
> directly) for a specific ID when you actually need one — that is the only intended access pattern.

---

### D-001 — Teach via context engineering, NOT fine-tuning
- The tutor is an off-the-shelf Anthropic model fed the user's profile + app rules as context on each call. No custom-trained model.
- Full write-up: `docs/decisions/D-001-teach-via-context-engineering-not-fine-tuning.md`
- **Date:** 22-Jul-2026

### D-002 — Two-model split: Sonnet for teaching, Haiku for reconciliation
- User-facing teaching responses use Sonnet; the narrow "does this new input update the baseline" reconciliation step uses Haiku.
- Full write-up: `docs/decisions/D-002-two-model-split-sonnet-for-teaching-haiku-for.md`
- **Date:** 22-Jul-2026

### D-003 — Backend: Python + FastAPI (rejected Java)
- Backend in Python/FastAPI.
- Full write-up: `docs/decisions/D-003-backend-python-fastapi-rejected-java.md`
- **Date:** 22-Jul-2026

### D-004 — App: React Native via Expo (cross-platform)
- One codebase → iOS + Android using React Native/Expo.
- Full write-up: `docs/decisions/D-004-app-react-native-via-expo-cross-platform.md`
- **Date:** 22-Jul-2026

### D-005 — Managed platform for hosting + DB + auth (don't self-host, don't roll own auth)
- Use a managed backend platform bundling Postgres + auth + hosting. Specific provider TBD.
- Full write-up: `docs/decisions/D-005-managed-platform-for-hosting-db-auth-don-t-self-host.md`
- **Date:** 22-Jul-2026

### D-006 — Build order: teaching engine FIRST, then plumbing
- Phase 1 proves the teaching engine (Sonnet + system prompt + fake profile → good teaching moment) before building app/login/UI.
- Full write-up: `docs/decisions/D-006-build-order-teaching-engine-first-then-plumbing.md`
- **Date:** 22-Jul-2026

### D-007 — Sequencing: stand up Claude Project + governance first, Claude Code in parallel after
- Set up the thinking-home (Project, spec, governance, decision log) first; begin laptop/Claude Code build in parallel once governance is in place.
- Full write-up: `docs/decisions/D-007-sequencing-stand-up-claude-project-governance-first.md`
- **Date:** 22-Jul-2026

### D-008 — Managed platform: Supabase (Postgres + auth + hosting)
- Use Supabase for the managed backend platform. Project created: `fintutor-dev`, region `ap-southeast-1` (Singapore), compute tier Nano. Status confirmed Healthy.
- Full write-up: `docs/decisions/D-008-managed-platform-supabase-postgres-auth-hosting.md`
- **Date:** 23-Jul-2026

### D-009 — Compliance stance: strict "no product/security names, ever" — mechanism + scenario modeling only
- FinTutor NEVER names a specific product, security, fund, stock, or investment vehicle — not even ones the user already holds. It only teaches concepts and mechanisms (compound interest, EMI amortization,…
- Full write-up: `docs/decisions/D-009-compliance-stance-strict-no-product-security-names.md`
- **Date:** 23-Jul-2026

### D-010 — Architectural aliasing: the LLM never sees real product/institution names; sensitive data is masked by design
- All user holdings (funds, stocks, insurance policies, and the institutions/companies behind them) are stored internally under an alias (e.g. "Fund-A", "Policy-3"). Every real characteristic of that holding — asset…
- Full write-up: `docs/decisions/D-010-architectural-aliasing-the-llm-never-sees-real-product.md`
- **Date:** 23-Jul-2026

### D-011 — Alias methodology broken into 3 sub-problems; leaning toward selection-based resolution + full re-humanizing for the user
- D-010's "alias methodology" is treated as three separate design questions, not one blob: (1) **Resolution** — how the backend maps what a user means to the right internal record. Leaning strongly toward **selection, not…
- Full write-up: `docs/decisions/D-011-alias-methodology-broken-into-3-sub-problems-leaning.md`
- **Date:** 23-Jul-2026

### D-012 — Zero-friction data capture: AI-surfaced, not menu-driven; product-type taxonomy is a backend schema, not a UI category list
- The product-type list (loan sub-types, investment sub-types, insurance sub-types, etc.) is an internal backend taxonomy used by the teaching engine and the alias/characteristics schema (D-010, D-011, D-013) — it is NOT…
- Full write-up: `docs/decisions/D-012-zero-friction-data-capture-ai-surfaced-not-menu-driven.md`
- **Date:** 23-Jul-2026

### D-013 — MVP product-type taxonomy + per-type characteristic fields (resolves D-011 Steps 1–2)
- The MVP internal product-type taxonomy is **8 types** across three families. Splits vs merges are driven by one test: *does the teaching mechanism or tax behavior actually differ?* If yes → separate type; if only the…
- Full write-up: `docs/decisions/D-013-mvp-product-type-taxonomy-per-type-characteristic.md`
- **Date:** 23-Jul-2026

### D-014 — Build execution subagents LATER, as a parked PM task — not before the teaching core is validated
- The four D-012 design problems (trigger logic, micro-capture flow, onboarding redesign, manual fallback UI) will be *decided by the user* and *executed by Claude Code subagents*. But building those subagents is…
- Full write-up: `docs/decisions/D-014-build-execution-subagents-later-as-a-parked-pm-task.md`
- **Date:** 23-Jul-2026

### D-015 — Teaching method defined: 4 settled dimensions that shape every teaching moment
- How FinTutor teaches is fixed along four dimensions (these drive the "Teaching Method" section of the system prompt — see the prompt file): 1. **Open with the user's situation, surface the mechanism as it unfolds.** A…
- Full write-up: `docs/decisions/D-015-teaching-method-defined-4-settled-dimensions-that.md`
- **Date:** 23-Jul-2026

### D-016 — Compliance wall refusal behavior: 4 judgment calls on how the model holds the line
- The compliance wall (system prompt §3) turns D-009/D-010 into hard model instructions. Most of it is mechanical transcription (never advise, never name, alias-only reasoning, model-all-paths-then-stop). Four behavioral…
- Full write-up: `docs/decisions/D-016-compliance-wall-refusal-behavior-4-judgment-calls-on.md`
- **Date:** 23-Jul-2026

### D-017 — Decision-making formalized into a routed, tiered protocol
- FinTutor's decision-making moves from ad-hoc (owner decides everything in conversation) to a routed system: every decision is classified by type, assigned a tier, and either auto-decided, deliberated through defined…
- Full write-up: `docs/decisions/D-017-decision-making-formalized-into-a-routed-tiered.md`
- **Date:** 23-Jul-2026

### D-018 — Decision protocol §2: tier definitions, trigger checklist, and seven routing judgment calls
- DECISION_PROTOCOL.md §2 is written and complete. The core structural choice: **the Tier-3 trigger checklist runs BEFORE tier assignment**, so the checklist *produces* the tier rather than confirming a guess. Six hard…
- Full write-up: `docs/decisions/D-018-decision-protocol-2-tier-definitions-trigger-checklist.md`
- **Date:** 23-Jul-2026

### D-019 — Decision protocol §3: four evaluation lenses, compliance veto, relevance selection with a floor
- DECISION_PROTOCOL.md §3 is written and complete. The four lenses are **Compliance**, **Product**, **Technical**, and **Cost-and-Scope**, each defined not by a job title but by *the objection only it can raise*. Four…
- Full write-up: `docs/decisions/D-019-decision-protocol-3-four-evaluation-lenses-compliance.md`
- **Date:** 23-Jul-2026

### D-020 — Decision protocol §4/§5/§6: supersession marker, the narrowing rule, output formats, precedent log
- DECISION_PROTOCOL.md §4, §5 and §6 are written. The protocol is COMPLETE at v1.0 and D-017's hard cap is reached — next work is Phase 1 (D-006). Two owner judgment calls this session, both in §4: 1. **Supersession…
- Full write-up: `docs/decisions/D-020-decision-protocol-4-5-6-supersession-marker-the.md`
- **Date:** 23-Jul-2026

### D-023 — P-001 appended to the protocol's precedent log (Tier 1)
- 1 — recording an event that already happened, within this home, no trigger fires. Logged as one entry per §2.3.
- Full write-up: `docs/decisions/D-023-p-001-appended-to-the-protocol-s-precedent-log-tier-1.md`
- **Date:** 23-Jul-2026

### D-024 — Phase 1 Run 1 executed; results recorded (Tier 1)
- 1 — running an already-designed test protocol and recording what happened. No trigger fires; within this home; no decision made. One entry per §2.3.
- Full write-up: `docs/decisions/D-024-phase-1-run-1-executed-results-recorded-tier-1.md`
- **Date:** 23-Jul-2026

### BRIEF-001 — ESCALATED, awaiting owner: does D-009's "never pick a winner" cover problems the user did not raise?
- Tier 3 brief written and awaiting owner decision. Full brief in **BRIEF-001_prioritisation.md**. Nothing proceeds on the teaching prompt until this is settled — it is the only Run 1 finding that touches the compliance…
- Full write-up: `docs/decisions/BRIEF-001-escalated-awaiting-owner-does-d-009-s-never-pick-a.md`
- **Date:** 23-Jul-2026

### D-025 — BRIEF-001 RESOLVED: unprompted prioritisation is ADVICE (Path A for MVP; Path B parked for growth)
- 3 — owner decision on the brief raised by D-024. Interprets a compliance-category decision, so Tier 3 only per protocol §4.3, with no exception for interpretations that tighten.
- Full write-up: `docs/decisions/D-025-brief-001-resolved-unprompted-prioritisation-is-advice.md`
- **Date:** 23-Jul-2026

### D-026 — §5 length ranges recalibrated from Run 1 data (Tier 2)
- 2 — no trigger fires. Calibration of a prompt-level number that D-021 explicitly recorded as a hypothesis to revisit after real output. Reversible (prompt text, no data touched). Acted on immediately per §2.3;…
- Full write-up: `docs/decisions/D-026-5-length-ranges-recalibrated-from-run-1-data-tier-2.md`
- **Date:** 23-Jul-2026

### D-027 — Phase 1 Run 2 executed; rule 5 fixed three of four, failed on the fourth (Tier 1)
- 1 — running an already-designed test protocol against an amended prompt and recording what happened. No trigger fires; within this home; no decision made. One entry per §2.3.
- Full write-up: `docs/decisions/D-027-phase-1-run-2-executed-rule-5-fixed-three-of-four.md`
- **Date:** 23-Jul-2026

### BRIEF-002 — ESCALATED, awaiting owner: does "go deep on one path" hand the model a ranking channel rule 5 cannot reach?
- Tier 3 brief written and awaiting owner decision. Full brief in **BRIEF-002_deepen_channel.md**. Blocks further teaching-prompt work — it is the only Run 2 finding that touches the compliance line.
- Full write-up: `docs/decisions/BRIEF-002-escalated-awaiting-owner-does-go-deep-on-one-path-hand.md`
- **Date:** 23-Jul-2026

### D-028 — BRIEF-002 RESOLVED: the model no longer chooses which path to deepen (Path C, stubbed)
- 3 — owner decision on the brief raised by D-027.
- Full write-up: `docs/decisions/D-028-brief-002-resolved-the-model-no-longer-chooses-which.md`
- **Date:** 23-Jul-2026

### D-029 — BRIEF-003 resolved: provenance rule for non-profile numbers (Path C)
- A number in a teaching moment has a provenance — it is either the user's (from the profile) or the genre's (typical/illustrative). Any figure not traceable to the profile is given as a **range, never a point estimate**,…
- Full write-up: `docs/decisions/D-029-brief-003-resolved-provenance-rule-for-non-profile.md`
- **Date:** 25-Jul-2026

### D-030 — Product principles established; Product lens given substantive content; product decisions become routable
- 3 — a meta-decision that encodes the owner's product judgment so that future product decisions can be routed without the owner. The most owner-only kind of decision there is: it defines what may later bypass the owner.…
- Full write-up: `docs/decisions/D-030-product-principles-established-product-lens-given.md`
- **Date:** 25-Jul-2026

### D-031 — App structure: persistent category sections; MVP scope expanded (direction vs. build split)
- 3 — a scope decision (trigger 5, the hard no-de-minimis version from D-018). Fired inside a UX discussion, not announced as scope — the P-001 pattern (scope disguised as another conversation). Named and logged…
- Full write-up: `docs/decisions/D-031-app-structure-persistent-category-sections-mvp-scope.md`
- **Date:** 25-Jul-2026

### D-032 — FINDING 8 resolved: the open door may only lead to a room the user is already in (Path B)
- 3 — compliance-category (touches §3 rule 5's advisory-line test and D-012's Trigger A/B scope), owner-decided per DECISION_PROTOCOL §4.3 and PRODUCT_PRINCIPLES P2 (Product lens cannot resolve advisory-line questions on…
- Full write-up: `docs/decisions/D-032-finding-8-resolved-the-open-door-may-only-lead-to-a.md`
- **Date:** 01-Aug-2026

### D-033 — Two homes retired: single unified home (Cowork/Claude Code) replaces laptop=build / Claude Project=think
- 3 — contradicts/reshapes a standing principle (the orientation split itself, inherited into PROJECT_GOVERNANCE.md's "Laptop = build. Project = think.") and is low-reversibility in the sense that it changes how every…
- Full write-up: `docs/decisions/D-033-two-homes-retired-single-unified-home-cowork-claude.md`
- **Date:** 02-Aug-2026

### D-034 — Autonomous file/git operation, with the hard-stop list and deliberate-only file tier kept as the only checkpoints
- 3 — this decision itself sets the boundary of what future work may be auto-decided, which is the single most owner-only kind of call there is (same shape as D-030's "it defines what may later bypass the owner"). Owner…
- Full write-up: `docs/decisions/D-034-autonomous-file-git-operation-with-the-hard-stop-list.md`
- **Date:** 02-Aug-2026

### BRIEF-004 — ESCALATED, awaiting owner: does the gap-surfacing rule (D-032) need to widen, without making FINDING 9 worse?
- Tier 3 brief written and awaiting owner decision. Full brief in **BRIEF-004_gap_surfacing_scope.md**. Nothing proceeds on the teaching prompt's §2/§3 rules until this is settled — per D-034, this is exactly the category…
- Full write-up: `docs/decisions/BRIEF-004-escalated-awaiting-owner-does-the-gap-surfacing-rule-d.md`
- **Date:** 02-Aug-2026

### D-035 — BRIEF-004 RESOLVED: Path A adopted — on-topic gap-surfacing constraint extended to the whole answer
- 3 — owner decision on the brief raised as BRIEF-004. Interprets a compliance-category decision (D-032), so Tier 3 only per protocol §4.3, no exception for interpretations that tighten.
- Full write-up: `docs/decisions/D-035-brief-004-resolved-path-a-adopted-on-topic-gap.md`
- **Date:** 02-Aug-2026

### BRIEF-005 — ESCALATED, awaiting owner: does the "worth [X]" bridging pattern need its own rule, and can another named-example patch actually close it?
- Tier 3 brief written and awaiting owner decision. Full brief in **BRIEF-005_worth_framing_recurrence.md**.
- Full write-up: `docs/decisions/BRIEF-005-escalated-awaiting-owner-does-the-worth-x-bridging.md`
- **Date:** 02-Aug-2026

### D-036 — BRIEF-005 RESOLVED: no fix — "worth" framing without an attached ordering word does not cross the line
- 3 — owner decision on the brief raised as BRIEF-005. Interprets a compliance-category decision (D-025), Tier 3 only per §4.3.
- Full write-up: `docs/decisions/D-036-brief-005-resolved-no-fix-worth-framing-without-an.md`
- **Date:** 02-Aug-2026

### D-037 — FINDING 9 (Card-1 omission): §2 rule 2 now requires naming a materially higher-cost holding, not substituting a vaguer consideration for it
- 2 — REVIEW-FLAGGED. Ran the §2.1 trigger checklist rather than defaulting to a Tier-3 brief: trigger 2 (compliance) does not fire — D-025 already settled that naming a collateral-relevant holding "with its numbers,…
- Full write-up: `docs/decisions/D-037-finding-9-card-1-omission-2-rule-2-now-requires-naming.md`
- **Date:** 02-Aug-2026

### D-038 — Budgeting/Goals data model resolved (Decision 3): explicit thin links, computed budget, new Income object
- 2 — no §2.1 trigger fired (no money movement; goals/budgets are the user's own labels, not products, so D-009 doesn't reach them; no goals/budget data exists yet so the touched-data test keeps this reversible; already…
- Full write-up: `docs/decisions/D-038-budgeting-goals-data-model-resolved-decision-3.md`
- **Date:** 03-Aug-2026

### D-039 — Created `docs/CEO_DASHBOARD.md` as the standing status-reporting source file (Tier 1)
- 1 — process/PM tooling, no trigger fires, same category as D-007/D-014. One-line log per §2.3.
- Full write-up: `docs/decisions/D-039-created-docs-ceo-dashboard-md-as-the-standing-status.md`
- **Date:** 03-Aug-2026

### D-040 — Dashboard refresh added to the mandatory end-of-session checklist; local HTML snapshot added (owner-confirmed in conversation)
- 1 — process/PM tooling, no trigger fires (same category as D-007/D-014/D-039). Logged as a full entry rather than a bare one-liner only because it authorizes an edit to CLAUDE.md, which is deliberate- only per the…
- Full write-up: `docs/decisions/D-040-dashboard-refresh-added-to-the-mandatory-end-of.md`
- **Date:** 03-Aug-2026

### D-041 — Backend scaffolding stack: FastAPI + SQLAlchemy + Alembic (owner-confirmed)
- owner-decided directly in conversation — escalated per CLAUDE.md's explicit hard stop on introducing a new library/architectural pattern (no de-minimis exception, same logic as trigger 5). Logged as a full entry rather…
- Full write-up: `docs/decisions/D-041-backend-scaffolding-stack-fastapi-sqlalchemy-alembic.md`
- **Date:** 03-Aug-2026

### D-042 — Dashboard refresh moved from automatic-every-session to on-demand only (owner-confirmed)
- owner-decided directly in conversation — logged as a full entry rather than a one-liner because it edits CLAUDE.md (deliberate-only), same escalation pattern as D-033/D-040.
- Full write-up: `docs/decisions/D-042-dashboard-refresh-moved-from-automatic-every-session.md`
- **Date:** 03-Aug-2026

### D-043 — Income/Goal schema built with loose UUID references, no FK, to not-yet-built tables (owner-confirmed)
- 1 — bounded technical implementation detail surfaced mid-session, contained entirely within this session, no money-logic or teach-not-advise line touched, no MVP scope change, fully reversible (a later migration can add…
- Full write-up: `docs/decisions/D-043-income-goal-schema-built-with-loose-uuid-references-no.md`
- **Date:** 03-Aug-2026

### D-044 — Holdings model built: single table + JSONB characteristics; product_type left unconstrained
- 1 — executes already-decided design (D-010 aliasing, D-011 framework, D-013 taxonomy) rather than making new product/compliance decisions; both technical sub-choices are bounded, reversible, contained within this…
- Full write-up: `docs/decisions/D-044-holdings-model-built-single-table-jsonb.md`
- **Date:** 03-Aug-2026

### D-045 — AGENTS.md collapsed to a symlink of CLAUDE.md (owner-confirmed)
Full entry: `docs/decisions/D-045-agents-md-symlink.md`. Kills the AGENTS.md/CLAUDE.md manual-mirror
drift risk (AGENTS.md had already gone stale, missing D-042) by making AGENTS.md a git-tracked
symlink to CLAUDE.md — one canonical file, zero sync risk going forward. Reversibility: High.
Date: 03-Aug-2026.

### D-046 — Decision log modularization: new decisions get their own file, going forward only (owner-confirmed)
Full entry: `docs/decisions/D-046-decision-log-modularization.md`. Starting at D-045, full write-ups
live in `docs/decisions/D-0NN-slug.md`; this file gets a short index entry instead. D-001–D-044
stay inline, untouched. Reversibility: High. Date: 03-Aug-2026.

### D-047 — Local pre-commit hook enforcing session-log discipline (owner-confirmed)
Full entry: `docs/decisions/D-047-session-log-precommit-hook.md`. `.githooks/pre-commit` blocks a
commit touching `app/`/`backend/` unless a `docs/sessions/*.md` file is staged alongside it;
requires one-time `git config core.hooksPath .githooks` per clone (see README.md). Mechanizes the
existing session-log habit; no new infra. Reversibility: High. Date: 03-Aug-2026.

### D-048 — Discretionary categories stored as their own table, sibling to Income/Goal (owner-confirmed)
Full entry: `docs/decisions/D-048-discretionary-categories-table.md`. Executing BQ-010, owner chose
a new `discretionary_categories` table over a JSONB field on Income. Also covers BQ-010's
`compute_budget()`/`GET /budget` build: monthly-normalization convention for Income/insurance
frequencies, and the product_type slugs the computation keys on. Reversibility: High.
Date: 03-Aug-2026.

### D-049 — BRIEF-006 resolved: deepen-selection logic deferred (Path C), BQ-004 re-scoped to a real interface existing
Full entry: `docs/decisions/D-049-deepen-selection-deferred.md`. Tier 3 (triggers 2 and 5 both
fired). Backend selection logic not built now — nothing consumes it yet (Phase 1 uses D-028's
fixture stub), the narrow-classifier path (A) doesn't actually satisfy D-028's own guarantee, and
the mechanical path (B) either converges on "deepen nothing" anyway or needs `app/` screens that
don't exist. BQ-004 re-scoped: blocked on a real conversation interface, not just an undecided rule.
Reversibility: High. Date: 03-Aug-2026.

### D-050 — Added a "Pending Approval Queue" section to CEO_DASHBOARD.md (Tier 1)
- **Tier:** 1 — process/PM tooling, no trigger fires, same category as D-007/D-014/D-039. One-line
  log per §2.3.
- **Context:** owner researched a much larger "departmental agents" operating-model proposal
  (multi-persona agents, async GitHub-issue orchestration, a parallel `DECISION_MATRIX.md`, MCP-first,
  repo restructuring) — evaluated in conversation, not adopted: it substantially duplicates
  DECISION_PROTOCOL.md, reverses D-042's on-demand dashboard cadence, and reopens the MCP question
  already held earlier this session. Owner chose the minimal, non-conflicting piece only: a Pending
  Approval Queue in the existing dashboard, listing open `docs/BRIEF-*.md` files with no resolving
  decision yet. No other part of the proposal was adopted.
- **Date:** 03-Aug-2026

### D-051 — BRIEF-007 resolved: Path A adopted, staged (WHICH now, WHEN verified before shipping)
Full entry: `docs/decisions/D-051-surfacing-candidate-selection.md`. WHICH (candidate selection) is
mechanical, backend-only, no model judgment — built now as BQ-013. WHEN stays gated on re-verifying
D-032's on-topic constraint in this new scenario via Phase-1 fixture testing before it ships. Ties
broken by fixed precedence in the pairing table, same architectural-guarantee pattern as D-028's
`deepen` field. Path C rejected (would reverse D-012's explicit commitment, unlike BQ-004's
deferral); Path B rejected (repeats D-028's known routed-around pattern). Reversibility: High.
Date: 03-Aug-2026.

### D-052 — App scaffold stack: Expo + TypeScript + React Navigation (manual setup); Supabase JS client for auth (owner-confirmed)
Full entry: `docs/decisions/D-052-app-scaffold-stack.md`. `app/` bootstrapped now (BQ-014) — bare
skeleton only: auth stack (Supabase-backed login/register) + a tab shell with placeholder
Investments/Loans/Insurance/Consolidated screens (D-031), plus a backend `/health` ping. React
Navigation chosen over Expo Router — owner's call, explicit manual routing over file-based
convention. Onboarding/capture logic, per-item management explicitly out of scope for this pass.
Needs Supabase URL + anon key in `app/.env` before auth can be verified end-to-end; degrades
gracefully without it. Reversibility: Medium. Date: 04-Aug-2026.

### D-053 — BRIEF-008 resolved: Path A adopted — early-career, low-complexity segment as sole MVP founding target; others parked, not discarded
Full entry: `docs/decisions/D-053-founding-user-segment.md`. Tier 3, resolves BRIEF-008. The segment
both independently-run lenses converged on (early-career, single-income, low-complexity salaried) is
now the sole founding target for MVP design + Phase-3 testing; all other candidates parked for
post-MVP, not discarded. Debt-heavy/reactive segment's P2 stress-test question resolved as a side
effect (not in founding population). §3's "not defined by age" framing left open, not silently
changed. Further subdivision of the chosen segment queued as next work. Reversibility: Medium.
Date: 03-Aug-2026.

### D-054 — BRIEF-009 resolved: no sub-segment picked to start with — all three cuts treated as one population, fully in MVP scope
Full entry: `docs/decisions/D-054-founding-segment-full-coverage.md`. Owner judged the Product lens's
three sub-segments (by habit maturity) and the Business lens's three sub-segments (by career-stage) in
BRIEF-009 describe the same three populations from two angles, not six. All three stay fully in MVP
scope as the founding segment's internal diversity — no narrowing, no exclusion. D-053's outer
founding-segment boundary (and every other BRIEF-008 candidate staying parked) is unchanged. Correlation
caveat flagged, not silently dropped: BRIEF-009 called it an unverified guess; this decision proceeds on
the owner's judgment, to be revisited if design/testing later contradicts it. Reversibility: High.
Date: 03-Aug-2026.

### D-055 — BRIEF-010's escalated fork resolved: ESOPs added to the product-type taxonomy as MVP scope
Full entry: `docs/decisions/D-055-esop-added-to-taxonomy.md`. Tier 3 (Trigger 5, MVP scope increase).
ESOPs added to D-013's taxonomy as a 9th MVP type, in MVP scope — not parked — because ESOP confusion
was independently named the startup/gig profile's #1 pain point (BRIEF-010) and leaving it out would
ship that profile with thinner day-one value than the other two D-054 profiles. Supersedes D-013 on
type-count only. Membership decided now; ESOP's characteristics schema is a deferred follow-on task, not
designed as a side effect of this decision. Not conflated with the separately still-open `savings_balance`
9th-type question in §8. Reversibility: High. Date: 03-Aug-2026.

### D-056 — End-of-session ritual extended: designated branch pushed AND fast-forward-merged to main, so parallel sessions stay synced (owner-confirmed)
Full entry: `docs/decisions/D-056-end-of-session-main-sync.md`. Extends D-034. This session found that
every decision was logged and pushed correctly but stayed invisible to a parallel fresh session, because
the working branch was never merged to `main`. Going forward: push the designated branch as before, then
fast-forward-merge it into `main` and push `main` too, so parallel sessions pulling `main` see the latest
immediately — unless `main` has diverged, in which case stop and ask rather than force-resolve. Owner
explicitly chose direct merge over PR-first when asked; recorded as a tradeoff (no review checkpoint),
not silently absorbed. Reversibility: High. Date: 03-Aug-2026.

### D-057 — Method clarification: two-lens generative research is additional to DECISION_PROTOCOL.md, not a replacement for its evaluation lenses (Tier 1)
Owner asked whether the Product/Business two-lens technique used for BRIEF-008/009/010/011 was on top of
the standing decision framework or instead of it. Clarified and now practiced: the two lenses generate
candidate content for open questions with no decision yet to evaluate; `DECISION_PROTOCOL.md`'s own four
evaluation lenses (Compliance always-runs, Product/Technical/Cost-and-Scope relevance-selected) still
apply once something concrete needs judging, per protocol, unchanged. Compliance lens had been running
only incidentally (via the two generative lenses self-flagging); now applied explicitly as its own step —
demonstrated on BRIEF-011, surfacing one real CONCERN (fresh-starters sequencing copy) that self-flagging
alone hadn't named as clearly. Tier 1 — process/method note, no trigger fires. Date: 03-Aug-2026.

### D-058 — Onboarding shape resolved: ungated, chip-guided conversation as the default landing screen, fully skippable
Full entry: `docs/decisions/D-058-onboarding-shape.md`. Resolves BRIEF-013's onboarding fork. Owner chose
a third combination, not the plain A/B framing first proposed: the chip-guided conversation (Option C —
tappable starters, no structured field anywhere) is the default landing screen right after registration,
but with an explicit skip affordance so it's never a hard gate — removes onboarding friction while still
giving every user the guided entry point fresh starters specifically need (BRIEF-010). No hard-stop
trigger fires; reinforces P1/D-012 rather than contradicting a principle. Reversibility: High.
Date: 03-Aug-2026.

### D-061 — Founding UX framework, cluster 2 of 3 resolved: middle ground — game elements may react to app behavior, never to real financial data
Full entry: `docs/decisions/D-061-real-data-gamification-middle-ground.md`. Tier 3 — trigger 5 continues
from D-060 (same unresolved gamification scope, still unapplied to `PROJECT_SPEC.md` §4), and this decision
**Interprets: P6** (extends "the user sees their real world" from its original masking/aliasing scope into
gamification design — treated at Tier 3 since P6 is compliance/privacy-flavored, per §4.1). Middle ground
adopted: cosmetic, behavior-reactive game elements (mascot celebrating a completed teaching moment, generic
streak/session flourishes) are permitted; any XP/badge/level/mascot-mood/fictional skin derived from or
reactive to the user's actual financial data (loan balance, net worth, a specific holding) is forbidden —
real financial data always shown straight, never scored or fictionalized. New operative test established:
does the game element react to app behavior (OK) or real financial data (not OK)? Guards against implying
judgment on the user's choices (P2-adjacent) and against degrading the user's real view of their own money
(why P6 exists). Cluster 2 of 3; cluster 1 (engagement mechanics) resolved D-060; cluster 3 (previously
identified as blocked outright by D-058/§5) remains to close out. Reversibility: High. Date: 04-Aug-2026.

### D-060 — Founding UX framework, cluster 1 of 3 resolved: engagement mechanics (streaks, variable reward, Hook Loop) adopted in full
Full entry: `docs/decisions/D-060-engagement-mechanics-full-adoption.md`. Tier 3 — two triggers fired:
trigger 3 (contradicts P4's "start strict, relax deliberately" — this decision adopts the permissive form
immediately, no strict-first step) and trigger 5 (MVP scope increase — no gamification/engagement layer
exists in `PROJECT_SPEC.md` §4 today). Owner chose full adoption of loss-aversion streaks, variable/
unpredictable reward feedback, and the full Hook Loop architecture — "same playbook as Duolingo,"
explicitly aware of the gambling/social-media mechanic-shape, judged as building a good habit around a
good product rather than exploiting the user. Recorded as a scoped carve-out to P4 (P4 still governs other
permissiveness dials, compliance-adjacent ones especially) not a supersession. Explicit boundary flagged:
does not pre-clear tying a specific reward/streak to a specific financial action — that still needs its
own P2 check when designed. Only 1 of 3 contested UX clusters from this session; §4 scope addition not
yet applied, pending whether to batch with clusters 2/3. Reversibility: High. Date: 04-Aug-2026.

### D-059 — Decision 2 resolved: Path C adopted — full per-field edit, delete, and recategorize authority over holdings
Full entry: `docs/decisions/D-059-per-item-management-depth.md`. Tier 3 (trigger 2, user financial data
handling), resolves `PROJECT_SPEC.md` §8's Decision 2, open since D-031. Users get full direct-manipulation
authority over AI-captured holdings — edit any field, delete, recategorize `product_type` — via a standard
UI, not routed exclusively through AI conversation. Chosen over view-only/delete-only alternatives because
the chat surface (BQ-023/BQ-024) is still unbuilt, so a chat-dependent correction path would leave holdings
functionally frozen in MVP. Owner explicitly weighed this against tension with §2's "living baseline, not a
CRUD save" framing and D-012's anti-menu capture philosophy, and chose it anyway — recorded as a knowingly
accepted tension (capture vs. post-capture management are different concerns), not silently resolved. A
candidate rule extraction (route future Income/Goals edit-authority questions through the same test) was
proposed but NOT adopted as a standing rule — future cases return as their own Tier-3 questions.
Reversibility: Medium (cheap now, no real user data yet; closes once real usage exists). Date: 04-Aug-2026.

### D-062 — Claude Code Skills adopted for bounded, mechanical procedure execution — piloted with one skill: `session-close`
Full entry: `docs/decisions/D-062-claude-code-skills-adopted.md`. Tier 2 (no trigger fires; Sequencing/PM,
same category as D-007/D-014/D-047/D-050). A skill may only execute a procedure already fully decided and
written down elsewhere in this repo — never a product-judgment, compliance, or scope call — and stays inside
the same file-permission lanes `CLAUDE.md` already sets (never writes a deliberate-only file, never authors
new judgment into this log). Skills live at `.claude/skills/<name>/SKILL.md`, checked into the repo. Piloted
with exactly one skill this session, `session-close`, mechanizing `CLAUDE.md`'s "End of every session"
checklist (session log, spec/log-change flag, commit, push, D-056's fast-forward-merge to `main`) — chosen as
the most repeated, most precisely pre-specified, costliest-to-silently-skip procedure already in the repo's
rules. Deliberately not extended to any decision-content skill (lens drafting, tier classification) this
session — that's closer to the judgment line the repo protects and waits on the pilot proving out first.
Reversibility: High. Date: 04-Aug-2026.

### D-063 — Vendored-skill category added to skill management (D-062 extension); first instance: `design-taste-frontend` ("taste-skill")
Full entry: `docs/decisions/D-063-vendored-skill-policy-and-taste-skill.md`. Tier 2 (no trigger fires;
Sequencing/PM, same category as D-062). Project skills are now either self-authored (D-062's original
scope) or **vendored** — third-party published skills, pulled in deliberately, reviewed for embedded code
before adding, and told apart via a required `PROVENANCE.md` sibling naming source/license/date and,
crucially, actual fit to this project. First instance: `.claude/skills/design-taste-frontend/`, vendored
verbatim from `github.com/Leonxlnx/taste-skill` (MIT) by owner request. Applicability caveat recorded
plainly, not smoothed over: the skill's own frontmatter scopes it to web landing pages/portfolios/
redesigns, explicitly excluding "dashboards... multi-step product UI" — which is what FinTutor's React
Native `app/` is, so its concrete checklist is inspiration only there, literal only if a real web surface
is ever built. Reversibility: High. Date: 04-Aug-2026.

### D-064 — Invocation policy pinned for `design-taste-frontend`: explicit-ask only, scoped to FinTutor app UI work, never CEO_DASHBOARD/personal artifacts (Tier 1)
- **Tier:** 1 — owner stated this directly in conversation as a usage rule, no ambiguity, no trigger fires
  (no money/compliance/scope/reversibility issue) — same shape as D-057 (method clarification). One-line-
  plus-context log per §2.3.
- **Decision:** the vendored `design-taste-frontend` skill (D-063) is explicit-ask only — it must never
  auto-trigger off generic keyword matches ("landing page," "redesign," "frontend," "UI"). It is only to be
  consulted when the owner explicitly asks for it, and specifically when beginning UI/design work on the
  FinTutor app itself (`app/`) — never for `docs/CEO_DASHBOARD.md`/`.html` or other personal/one-off web
  artifacts, even though those are also technically web surfaces. Implemented by editing the vendored
  file's frontmatter `description` field (the field that actually drives triggering) to state this gate
  directly — the one disclosed deviation from D-063's verbatim-vendoring rule; the document body is
  untouched. See `.claude/skills/design-taste-frontend/PROVENANCE.md`'s "Invocation policy" section.
- **Why:** D-063's applicability caveat already said the skill's literal checklist doesn't fit `app/`
  (React Native) and its concrete use-case (web landing pages) doesn't exist in this repo yet — but left
  open exactly when/how it should ever fire. The owner closed that gap directly rather than leaving it to
  inference: reserved for FinTutor app UI work specifically, never spent on smaller personal-use asks, and
  never auto-triggered regardless of context.
- **Reversibility:** High — a one-line frontmatter edit, reverted by re-copying the upstream description
  from `PROVENANCE.md`'s source link if this policy ever changes.
- **Date:** 04-Aug-2026

### D-065 — Consolidated net-worth aggregation shape: FD/RD value source, per-family totals not a net figure
- **Tier:** 3 — hard trigger 1 (money calculations users rely on). BQ-018 had no already-decided formula
  to execute against. FD/RD value = `principal_or_monthly_amount` as-is (no accrual formula invented);
  endpoint returns separate `investments_total`/`loans_total`/`insurance_total`, not one net figure. Full
  write-up: `docs/decisions/D-065-consolidated-aggregation-shape.md`.
- **Date:** 04-Aug-2026

