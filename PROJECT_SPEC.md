# FinTutor — Project Spec (v5.0, 14-Aug-2026)

> Single source of truth for the build. Same discipline as the financial baseline doc:
> updated at the end of **every** working session. If a decision isn't written here, it didn't happen.
> Claude Code should be pointed at this file at the start of each session.

> **ORIENTATION (read this when you're confused about where something belongs):**
> **Single home as of D-033 (02-Aug-2026).** One repo, one tool (Cowork/Claude Code), covering both build
> work and strategy/compliance/decision work — the old "laptop = build, Claude Project = think" split (and
> its manual download/upload sync ritual) is retired. The discipline that split protected — bounded,
> mechanical execution kept separate from deliberate decisions on money, compliance, and irreversible calls
> — still applies, now self-enforced via DECISION_PROTOCOL.md's tiers and CLAUDE.md's file-permission lanes
> rather than by a technical access boundary. This spec remains the single source of truth, with no separate
> copy to keep in sync.

> **HOW DECISIONS GET MADE (added v1.0):** Decisions are no longer all routed through the owner by default.
> DECISION_PROTOCOL.md defines a tiered system — Tier 1 auto-decided, Tier 2 deliberated through evaluation
> lenses with owner review, Tier 3 owner-only (money, law, tax, regulation, the standing principles, the
> teach-not-advise line, irreversibility, MVP scope increases). Anything the protocol cannot classify
> escalates to Tier 3 automatically. See D-017.

---

## 1. One-line description
A mobile financial *companion* that teaches personal finance from first principles, applied to the
user's own money — never advises, only educates so the user makes their own informed decisions.

## 2. Core philosophy (non-negotiable, drives every screen)
- **Mechanism + personal context, always paired.** Never teach a concept in the abstract; never show a
  number without the mechanism behind it.
- **Teach, never advise.** No "you should buy X." Show the framework and the math for the user's own
  numbers; the decision is always theirs.
- **Learn on the go.** No curriculum/lesson tree. Teaching is triggered by the user's real actions and data.
- **Zero-friction capture: AI-surfaced, not menu-driven.** The user is never sent hunting for a category to
  fill in. Product types (loan / investment / insurance sub-types) are an internal backend taxonomy — NOT a
  menu of "Add X" buttons. The primary path for a holding to enter the baseline is the AI surfacing it
  naturally inside whatever the user is already doing (e.g. a loan conversation surfaces term insurance as a
  relevant concept; interest triggers a short guided capture in-flow). A manual fallback exists for users who
  want to log something themselves, but it is the secondary path. Minimize explicit user input everywhere;
  the AI feeds personalization, categorization, and product identification, and the backend carries that
  logic. Applies to all product types in MVP. See D-012.
- **Living baseline per user.** Every new input is reconciled against the user's stored profile
  (new / updates / contradicts) before being folded in — this reconciliation is a core feature, not a CRUD save.
- **No product/security names, ever (strict compliance stance).** FinTutor never names a specific product,
  fund, stock, or investment vehicle — not even ones the user already holds. For decision-shaped questions
  (e.g. "should I pay down my loan or invest this ₹2 lakh?"), it uses the user's full baseline + goals to
  model multiple paths side by side — mechanism, numbers, trajectory, risks — without picking a winner. See D-009.
- **The LLM never sees real product/institution names — architectural aliasing, not just a prompt rule.**
  Every fund, stock, policy, or institution the user holds is stored internally under an alias (e.g.
  "Fund-A"); all its real characteristics (asset class, expense ratio, lock-in, risk bucket, etc.) are
  tracked normally. Only the alias + characteristics are ever sent to the LLM — never the real name. This
  makes D-009's "never name a product" rule an architectural guarantee, not just a system-prompt request.
  See D-010.
- **Sensitive user data is masked/protected by design.** A real data privacy policy — covering both what
  reaches the LLM and what's protected at rest in the database — is a first-class decision, not an
  afterthought bolted on before launch. See D-010.

## 3. Target user
People beginning or actively building their financial understanding: adult students, recent graduates and
early-career earners, and working professionals with up to roughly ten years of experience. Approximately
ages 18–32 is the product-design and marketing audience. Initial release is 18+ with an eligibility
acknowledgement before onboarding (D-119); age does not become a personalization score or public label.
Experienced/sophisticated investors are not the target. The shared primary moment remains "financially unmanaged but willing" — from
learning before regular income through managing a growing mix of income, goals, holdings, insurance, debt,
and tax context. See D-114, which supersedes D-053/D-054's narrower founding-segment direction.

## 4. What the MVP does (scope — keep ruthless)
> **Scope expanded at D-031 (25-Jul-2026).** The app is structured as **persistent, user-facing category
> sections** — one per holding family — not a menu-less surface. AI-surfacing remains the PRIMARY way a
> holding enters a section (D-012 stands on primacy); the menu/manual path is the SECONDARY way. See D-031
> for the direction-vs-MVP-build split; only the MVP-build cut is listed here.

1. Register / login
2. **Onboarding and first-action handoff (D-118/D-119/D-126).** A short five-axis orientation asks only
   optional normalized context—no amounts, account details, holdings, or financial history—then offers an
   entirely optional user-chosen first action: Arya, something they already manage, a goal, a calculator or
   scenario, or Home. Income, holdings, and goals enter the living baseline progressively through explicit
   confirmed/manual actions; financial disclosure is never required for app access.
3. **Persistent category sections (MVP: three holding families).** Dedicated sections for **Investments,
   Loans, Insurance** (the D-013 taxonomy). Each holding is visible in its section with its details;
   per-item management (what the user can view/edit/act on) is a named open decision — see §8 "Decision 2".
   Real estate, Cash & bank, and Alternatives are DECIDED DIRECTION but deferred to immediately post-Phase-1
   (D-031).
4. **Consolidated view:** see the whole financial picture in one place (net worth / portfolio across sections).
5. **Budgeting / cash-flow and Goals & planning (MVP).** Included as critical AND foundational — they are
   NOT products; they reference holdings and change the data model every other object reads from, so their
   model is designed before build (see §8 "Decision 3", D-031).
6. Guided teaching moments (AI-surfaced, not button-tap): the AI surfaces relevant product types organically
   in conversation and triggers a structured teaching sequence (mechanism → applied to their numbers) when
   the user shows interest. AI confirmation ("yes, I have a loan" + details) creates a real tracked holding
   in its section. A manual add/browse path is the secondary route into the same sections. See D-012, D-031.
7. Reminders: EMI dates, credit-card payment dates
8. (Open-ended chat comes LATER — not in MVP)
9. **Engagement/gamification and learning progression (D-060, D-061, D-114).** Duolingo-style engagement mechanics — streaks,
   variable/unpredictable reward feedback, the full Hook Loop architecture (trigger → action → variable
   reward → investment) — drive daily app usage, adopted in full per D-060. D-114 adds named levels plus
   continuous progress based on meaningful learning and app participation. Bounded by D-061/D-114: cosmetic,
   behavior-reactive game elements and rewards are permitted; no XP, badge, level, streak, celebration, or
   cosmetic status may derive from actual financial data or change. Portfolio Health and financial change
   remain factual, separate surfaces; relevant teaching content is never level-gated (P9).

## 5. Explicitly NOT in the MVP (parked)
- **Real estate, Cash & bank balances, Alternatives/other holding families** — DECIDED DIRECTION (D-031), but
  deferred to immediately post-Phase-1. Cheap to add later (more instances of the D-013 pattern, not new
  machinery); pointless to build before the teaching engine is validated on three families.
- Open-ended chat ("ask anything")
- Bank / account aggregator integration (auto-pulling transactions)
- Multi-user / social / sharing
- Fine-tuning a custom model
- RAG knowledge base (nice-to-have, post-MVP)
- Payments / subscriptions / monetization
- **Conversation memory** — session-to-session recall of what was said previously. The model knows the user's
  finances every call (the baseline is re-sent — D-001), but does not remember prior dialogue. Parked as
  wanted-but-post-MVP; needs storage, retrieval, and a retention/deletion policy first. See D-022.

## 6. Architecture (decided)
```
Phone app  →  Your backend  →  Anthropic API (Sonnet = teaching, Haiku = reconciliation)
                    ↓
              Your database (user baseline profiles, loans, goals, history)
                    ↓
              Alias/mapping layer (real names ↔ internal aliases — lives ONLY in your DB,
              NEVER sent to the LLM; LLM only ever sees alias + characteristics)
```
- Backend holds the API key; phone NEVER calls Anthropic directly.
- **Authenticated ownership (D-137).** Every protected backend request carries the Supabase access token;
  the backend verifies it and derives the authoritative user identity from the token subject. A
  caller-supplied `user_id` never grants or selects ownership. Intentionally public routes containing no
  user data may remain unauthenticated.
- **Backend-only table access (D-142).** Supabase Auth remains client-facing, but application tables do not:
  every public table has RLS enabled without client policies and grants no privileges to `anon` or
  `authenticated`. All application data passes through FastAPI's private Postgres connection.
- LLM is stateless: relevant profile slice is re-sent as context on every call.
- Teaching = context engineering (system prompt + user profile), NOT fine-tuning.
- Cost levers designed in from day 1: prompt caching on system prompt + static rules; Haiku for reconciliation.
- **Real product/institution names never cross into the LLM context (D-010).** The backend resolves what
  the user is referring to (e.g. "my HDFC fund") against the internal alias table, then sends only the
  alias + the product's real characteristics to the LLM. Any re-humanizing of the LLM's response back into
  something the user recognizes happens in the backend, after the LLM call — never by asking the LLM to
  produce or process the real name.
- **Product-type taxonomy is backend-internal (D-013, extended by D-055).** The MVP product types (Equity
  MF, Debt MF, Stocks, FD/RD, PPF/EPF, Home Loan, Personal Loan, Credit Card Debt, Term Insurance,
  Endowment/ULIP, **ESOP — added at D-055**) live in the backend as the schema behind the alias/
  characteristics layer. They are NOT a user-facing menu (D-012); the teaching engine reaches into them
  when a moment calls for it. *(Note: D-013's original text says "8 distinct characteristic schemas" while
  enumerating 10 type names — a pre-existing inconsistency, not introduced or resolved here; left as-is
  rather than silently reconciled as a side effect of adding ESOP.)* **ESOP's characteristics field
  schema is resolved (D-066, 04-Aug-2026)** — a single type per D-055's scope, with a `grant_type`
  (`options`/`rsu`) field distinguishing the two per D-013's split-vs-merge test, the same resolution
  D-013 used for FD/RD. Fields: `grant_type`, `grant_date`, `total_units_granted`,
  `vesting_cliff_months`, `vesting_period_months`, `strike_price`, `current_fmv` (nullable),
  `exercise_window_months`. Landed in `app/lib/characteristicsSchema.ts`. See D-066.

## 7. Tech stack (DECIDED v0.2)
- App:        React Native via Expo (cross-platform iOS+Android, JS/TS) ✅
- Backend:    Python + FastAPI ✅ (chosen over Java: less boilerplate, Python-first AI ecosystem)
- Database:   Postgres, managed host ✅
- LLM:        Anthropic API — Sonnet (teaching) + Haiku (reconciliation) ✅
- Data/Auth hosting: Supabase ✅ — project `fintutor-dev`, region `ap-southeast-1`
- FastAPI hosting: deferred during internal MVP work (D-143); select before external access is required
- Auth:       Managed via Supabase — do NOT roll our own ✅

## 8. Open decisions (resolve these before/early in build)
- [x] Pick the specific managed backend platform (Postgres + auth + hosting) — **Supabase**, project
      `fintutor-dev` created (region `ap-southeast-1`, Nano compute). See D-008.
- [x] Get Anthropic API key — **DONE**. Key `fintutor-dev` created (no expiration), balance funded at $10.00.
      Stored securely by user (not in chat, not in git). Ready to be wired into FastAPI backend env vars
      when that build session starts.
- [x] Compliance stance: **strict — never name specific products/securities**; teach mechanism + model
      multi-path scenarios (e.g. pay loan vs. invest) using the user's real numbers/goals, never picking a
      winner. See D-009. Still pending: real legal review (India securities/fintech lawyer) before public
      launch — this is a product-level stance, not a legal sign-off.
- [ ] Legal review of compliance stance (D-009) by an India securities/fintech lawyer before public launch —
      not urgent for MVP dev, but non-negotiable before real users' money data goes live.
- [x] Design the alias/mapping methodology (D-010) — **FRAMEWORK DECIDED (D-011)**: split into 3 sub-problems
      — resolution (user selects from a list, not free text — avoids NLP matching for MVP), characteristics
      (field list per product type), re-humanizing (translate the alias back to the real name in the UI,
      since masking only ever applied to what the LLM sees). **Steps 1–2 (product-type list + characteristic
      fields) now RESOLVED in D-013** — 8-type taxonomy across investments / loans / insurance, with a
      split-vs-merge test (teaching mechanism or tax behavior differs?). Selection-based resolution note:
      with AI-surfacing (D-012) the "list" is often surfaced by the AI rather than a static dropdown, but the
      resolution stays selection-by-record-ID either way.
- [x] **AI-surfacing trigger logic + micro-capture flow (D-012) RESOLVED (09-Aug-2026) — all four
      consequences closed, across prior decisions, never a single new one.** WHICH (candidate selection):
      D-051/BQ-013, a mechanical pairing table, no model judgment. WHEN (moment selection): D-051 gated
      this on re-verifying D-032's on-topic constraint in the new-product-type scenario; D-080 ran that
      verification live (Phase-1 Run 7, FINDING 8, 0/5) and closed it. Micro-capture flow: D-078/BQ-039, a
      narrow Haiku extraction + explicit confirm card, never auto-written. Onboarding re-think:
      D-082/D-083/D-084/BQ-042. Manual fallback UI: BQ-036 (shipped earlier, before this item was revisited).
      **Trigger scope narrowed (25-Jul-2026):** proactive/unprompted "cold" surfacing (Trigger B) is OUT of
      MVP; only in-surface/in-conversation surfacing (Trigger A) is MVP. Confirmed with owner.
- [x] **Decision 3 — Budgeting/Goals data model RESOLVED (D-038, 03-Aug-2026).** Goals hold explicit thin
      funding links to holdings (`funded_by: [{holding_id, earmarked_amount}]`), progress computed live,
      never duplicated. Budget is a fully computed view — no stored object; recurring outflows (EMI, SIP,
      premium) read live off holding records, only Income and discretionary categories are stored. Income is
      a new first-class sibling object to Holdings. Reference-vs-store test extracted: a number with a
      holding home is referenced live; a number without one (income, discretionary categories, goal targets)
      is stored directly. See D-038.
- [x] **Decision 2 — Per-item management depth RESOLVED (D-059, 04-Aug-2026).** Path C adopted: full
      per-field edit, delete, and `product_type` recategorization via a standard UI — not view-only, not
      routed exclusively through AI conversation. Chosen because the chat surface (BQ-023/BQ-024) is still
      unbuilt, so a chat-dependent correction path would leave holdings functionally frozen in MVP. Owner
      knowingly accepted the resulting tension with §2's "living baseline... not a CRUD save" framing —
      capture (D-012) and post-capture management are treated as different concerns. See D-059.
- [x] **Corrected UX principles section in PRODUCT_PRINCIPLES.md (D-031) — RESOLVED (D-075/D-076/D-077,
      05-Aug-2026).** The implied UX stance (persistent sections, AI-primary/manual-secondary, aliases
      never shown, no quizzes, progressive capture) has been extracted, live and owner-confirmed one item
      at a time (session 2026-08-05a): aliases never shown was already P6; AI-primary/manual-secondary and
      progressive capture are P1's territory, patched (D-075); persistent, always-accessible sections is
      new principle P8 (D-076); no comprehension gates/no lesson-tree is new principle P9 (D-077). All five
      characteristics are now covered. Aesthetic layer (visual style, density, motion, hierarchy)
      deliberately still left for when real screen decisions force it. **Note (added 04-Aug-2026):** when
      this aesthetic layer is actually designed, `.claude/skills/design-taste-frontend/` (D-063/D-064) is
      available as design-philosophy inspiration for `app/`'s real UI work — explicit-ask only, not
      auto-triggered; see its `PROVENANCE.md` for the applicability caveat and invocation policy before
      using it.
- [ ] Write the data privacy policy (D-010): model-boundary masking is settled by D-133 and MVP at-rest
      protection by D-138 (Supabase-managed encryption plus strict access/transport/network controls; no
      application-managed field encryption for MVP). D-139 caps recovery-only backup retention after active
      deletion at seven days. D-140 settles reauthenticated, data-first, retry-safe whole-account deletion.
      D-141 places detailed disclosure for D-134's optional sensitive context in the privacy policy while
      preserving clear optional labels and user controls in-product. D-144 adds a fresh-authenticated,
      self-service JSON export covering every active user-owned record. Still needs remaining provider
      treatment, final policy text/link, and legal review.
- [x] Write DECISION_PROTOCOL.md (D-017) — **COMPLETE at v1.0.** All six sections written: §1 taxonomy
      (retroactive classification of D-001–D-016, five categories), §2 tiers + six-trigger checklist +
      routing sequence, §3 four evaluation lenses, §4 conflict/precedence + supersession marker + the
      narrowing rule, §5 output formats (Tier-1 one-liner / Tier-2 recommendation / Tier-3 brief), §6
      precedent log (empty by design, fills by accretion). See D-017, D-018, D-019, D-020. D-017's hard cap
      is reached — next work is Phase 1 (D-006).
- [x] **BRIEF-001 RESOLVED (D-025).** Unprompted prioritisation is ADVICE. Path A adopted for MVP: the model
      states rates and mechanisms but never ranks the user's problems, even when asked to. Written into
      system prompt §3 as rule 5, expressed as a test (*does this tell the user what is TRUE or what to
      ATTEND to?*) rather than a phrase blocklist. Path B (permit arithmetically-demonstrable significance)
      parked as the growth direction — unparks only on BOTH legal review of D-009 AND demonstrated
      reliability across a full eight-question run.
- [x] §5 length ranges recalibrated from Run 1 data (D-026) — 150–250 / 200–300 / 320 ceiling. Supersedes
      D-021's table only.
- [x] **Phase 1 Run 2 executed (D-027).** Q1/Q2/Q3/Q5 re-run against v0.3. Q3 flipped to a pass; Q2 and Q5
      materially cleaner; **Q1 failed in a new shape** — the ranking moved from sentences into structure via
      §2 rule 2's "go deep on one" selection. See PHASE1_RUN2_RESULTS.md.
- [x] **BRIEF-002 RESOLVED (D-028).** Path C adopted: the model no longer chooses which path to deepen. The
      backend sets a `deepen` field (alias + reason); absent means deepen nothing and treat all paths equally
      — no case falls back to model discretion. Stubbed by hand in fixtures for now. Supersedes D-015's
      selection clause only.
- [x] Fix FINDING 5 — no-self-narration line added to §1 (D-028).
- [x] **Design the backend `deepen` selection logic — RESOLVED (D-071, D-072, both built 04-Aug-2026).**
      D-071/BQ-034 wired the deterministic UI-signal case ("Ask about this" on a holding). D-072/BQ-004
      shipped the general Chat-tab case: a narrow, non-teaching Haiku call (`deepen_classifier.py`) reads
      the question + holdings and returns a confident alias or nothing, degrading cleanly to D-028's
      existing "deepen nothing" default on any ambiguity. Every `/chat` entry point now has a decided
      mechanism.
- [x] **FINDING 7 RESOLVED (D-029).** Path C adopted: any figure not traceable to the profile is given as a
      range, never a point estimate, with a standing "typical, not yours" frame built into how ranges are
      introduced. Guarded against range-washing by binding to §2 rule 4's legibility standard. See
      TEACHING_SYSTEM_PROMPT.md §2 rule 5 / §5, and SYSTEM_PROMPT_v0_5_runnable.md (build-home regeneration
      pending — BQ-005).
- [x] **Second fixture, no dominant number — RESOLVED (BQ-002 built the fixture, BQ-003 ran Q1 against
      both, see PHASE1_RUN4_RESULTS.md).** FINDING 4 does not reproduce in either fixture, including the
      harder ambiguous-magnitude case user_02 was built to test.
- [x] **`savings_balance` question RESOLVED (D-079, 05-Aug-2026) — schema-exempt, not a 9th type.** A
      savings-account balance is an instance of D-031's "Cash & bank" family, already DECIDED DIRECTION
      deferred to post-Phase-1 — not a gap inside D-013's three-MVP-family taxonomy.
      `FIXTURE_user_01.json`'s use of it is a Phase-1 prompt-testing artifact only; no fixture or schema
      change needed. Revisit D-013's split-vs-merge test on it properly when Cash & bank's post-Phase-1
      build is actually picked up.
- [x] **Q7 (memory claim) and Q8 (irrelevant-holding discipline) — RUN (BQ-001, 01-Aug-2026), see
      PHASE1_RUN3_RESULTS.md.** Q8 clean pass. Q7 passed its own checklist but produced FINDING 8
      (unprompted gap-surfacing with ranking language on a purely off-topic question) — **RESOLVED, D-032.**
      §2 rule 3 (open door) amended to be on-topic only. Runnable regeneration to v0.6 is a new build-home
      task, not yet queued in BUILD_QUEUE.md.
- [x] **RESOLVED (01-Aug-2026) — laptop back in service.** The BLOCKED item recorded 25-Jul-2026 no longer
      applies; build-home is operational (BQ-005, BQ-001, and this session's work all ran on it).
- [ ] (PARKED — D-022) Conversation memory — session-to-session dialogue recall. Fired the hard scope trigger
      (protocol §2.1 trigger 5) plus a data-retention angle (trigger 2) during the §1/§5 prompt session, so it
      was escalated and parked rather than absorbed. Revisit only after Phase 1 is validated AND the D-010
      data privacy policy settles retention/deletion.
- [x] **BRIEF-004 RESOLVED (D-035, 02-Aug-2026) — Path A adopted.** §2 rule 3's on-topic gap-surfacing
      constraint now explicitly governs the whole answer, not only the closing offer, closing the mid-answer
      channel FINDING 10 used — with an explicit guard clause so it does not loosen rule 2's requirement to
      name every already-relevant holding. Prompt regenerated as SYSTEM_PROMPT_v0_7_runnable.md.
      **FINDING 9 is NOT resolved by this decision** — the model still drops Card-1 from answers 2/5 runs;
      it needs its own path and remains a separate open item. See D-035 in docs/DECISION_LOG.md.
- [x] **FINDING 9 (Card-1 omission) — RESOLVED (D-037, Tier 2, REVIEW-FLAGGED, 02-Aug-2026) — VERIFIED
      03-Aug-2026 (BQ-008).** Classified via the actual trigger checklist rather than defaulted to Tier 3:
      naming a collateral-relevant holding is already compliance-safe per D-025's existing carve-out, so this
      is a product-judgment interpretation of D-015 (Tier 2), not a new compliance line. §2 rule 2 now
      explicitly requires naming a materially higher-cost holding and forbids substituting a vaguer
      consideration for it. Prompt regenerated as SYSTEM_PROMPT_v0_8_runnable.md. BQ-008 (n=5, fresh) came
      back 5/5 — Card-1 named unprompted in every run, no substitution pattern, FINDING 10 still 0/5, and
      FINDING 11's "worth" phrasing 0/5 under D-036's clarified test. Still REVIEW-FLAGGED for the owner's
      retroactive veto per Tier 2's design, but the fix itself is confirmed working. See
      docs/PHASE1_RUN6_RESULTS.md.
- [x] **BRIEF-005 RESOLVED (D-036, 02-Aug-2026) — no fix.** Owner judged that "worth X" bridging language
      without an attached comparative/ordering word ("first," "more than") does not cross the true-vs-attend
      line — confirmed explicitly for the two verbatim "worth having in view" instances, not just the softer
      variants. D-025's named example is narrowed: "first" was the operative failure, not the phrase alone.
      No prompt change. Comparative/ordering "worth X" phrasing remains forbidden. See D-036 in
      docs/DECISION_LOG.md.
- [ ] (PARKED — D-014) Build Claude Code execution subagents to carry out already-decided build tasks
      (starting with the D-012 pieces). Deliberately deferred until after Phase 1 (teaching engine) is
      validated and the relevant design decisions are made. User decides; agents execute. Not next-session
      work — a PM-level task to pull forward once there's a validated core to build against.

## 9. Key learnings & decisions log
- (v0.1) Chose context engineering over fine-tuning for the tutor. Model already knows finance; we supply
  the user's numbers + app voice per call.
- (v0.1) Sonnet for user-facing teaching, Haiku for the narrow reconciliation-diff step (cost + fit).

## 10. Change log

> **Older entries archived (D-081).** This section holds only the most recent ~10 change-log entries. Once a session's edit pushes the count past that, move the OLDEST kept entries into `docs/PROJECT_SPEC_CHANGELOG_ARCHIVE.md` verbatim — a per-session-close habit now (see `CLAUDE.md`'s checklist), not a one-time cleanup. Look up an older entry by grepping the archive file directly.

- v5.0 (14-Aug-2026) — **D-144 self-service data export approved and shipped.** After fresh password
  reauthentication, the verified user can download one documented JSON snapshot of active owned data.
  Browsers download directly; native uses temporary cache plus the system share/save sheet and removes the
  temporary file afterward. Secrets, masking internals, internal aliases and control keys are excluded.
- v4.9 (14-Aug-2026) — **D-143 production FastAPI hosting deferred.** Supabase remains the Postgres/Auth
  provider, but does not host the existing Python application. A backend host will be selected only before
  external testing, distribution, or another workflow needs non-local reachability; production security
  cleanup and the progression-pruning scheduler unpark at the same boundary.
- v4.8 (14-Aug-2026) — **D-142 FastAPI-only table access approved and shipped.** The progression schema
  catch-up and security migration are live on `fintutor-dev`. All 12 public tables have RLS enabled with no
  client policies or `anon`/`authenticated` privileges; direct-role reads fail while FastAPI's private role
  retains access.
- v4.7 (14-Aug-2026) — **D-141 sensitive-context disclosure placement approved.** The detailed explanation
  for dependant count and self-reported emergency-fund months will live in the privacy policy. The fields
  remain clearly labelled, optional, explicitly entered, and viewable/changeable/clearable in-product;
  collection remains blocked until the applicable policy text and accessible in-app link exist.
- v4.6 (14-Aug-2026) — **D-140 whole-account deletion contract approved.** Deletion requires fresh
  authentication and a separate final confirmation, removes active application data before the Auth account,
  is idempotent and retry-safe, and reports success only after both stages finish. BQ-099 is READY.
- v4.5 (14-Aug-2026) — **D-139 seven-day recovery-backup boundary approved.** Account deletion removes
  active data immediately; encrypted recovery-only copies expire within seven days and cannot be used for
  ordinary purposes. Any restore must reapply later deletions before serving users, and the privacy notice
  must state the delay plainly.
- v4.4 (14-Aug-2026) — **D-138 MVP at-rest protection approved.** Supabase-managed database and backup
  encryption will be paired with JWT ownership, TLS, production SSL enforcement, applicable network
  restrictions, secret isolation and security tests. FinTutor will not manage separate field-encryption keys
  for the MVP; backup duration, deletion, disclosure/export and legal review remain open under D-010.
- v4.3 (14-Aug-2026) — **D-137 authenticated backend ownership approved.** Protected backend requests will
  carry a Supabase access token; the backend verifies it and derives ownership solely from the verified
  subject rather than a client-selected `user_id`. Multiple test accounts remain supported, with
  cross-account isolation required in BQ-089.
- v4.2 (12-Aug-2026) — **D-118/D-119 onboarding v2 contract and privacy/persistence boundary approved.**
  Initial release is 18+; the five optional axes store only normalized categories in a separate versioned
  assessment table; raw dialogue is not persisted; backend completion is cross-device authoritative; and
  legacy users are grandfathered without inferred answers or forced reassessment. This authorises bounded
  onboarding implementation, not the broader progression event ledger or final D-010 privacy policy.
- v4.1 (12-Aug-2026) — **Target audience and progression direction updated (D-114); standing execution-agent
  authorisation adopted (D-115).** §3 now covers students through working professionals with roughly ten
  years' experience (approximately 18–32 as audience, never access gate), superseding D-053/D-054's narrower
  early-career-only direction. §4's engagement item now includes levels plus continuous learning progress,
  with Path A's binding separation: real financial data/change never drives game progress or rewards. D-115
  authorises parallel agents for already-decided work across the repo without per-fleet owner approval;
  decision-protocol hard stops and deliberate-only file controls remain unchanged.
