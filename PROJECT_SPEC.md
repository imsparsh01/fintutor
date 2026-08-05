# FinTutor — Project Spec (v3.8, 05-Aug-2026)

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
Anyone earning who wants to self-manage their finances and build literacy — not hand it to an advisor.
Primary moment: "financially unmanaged but willing." Not defined by age; defined by intent. *(This framing
itself is an open question as of D-053/BRIEF-008 — see the note below.)*

> **MVP founding segment locked at D-053 (03-Aug-2026), broadened at D-054 (03-Aug-2026).** MVP design and
> Phase-3 (private structured testing) target **early-career earners with a single income stream and low
> financial complexity** (0–2 holding types, no legacy portfolio) — the segment both an independently-run
> product-fit lens and a business/GTM lens converged on (BRIEF-008). D-054 resolved that this founding
> segment is **not** narrowed further to one sub-slice: it spans three internal profiles surfaced by a
> follow-up two-lens pass (BRIEF-009) — by financial-habit maturity (fresh starters / reactive dabblers /
> habit-formers) and, judged by the owner to describe the same three people, by career-stage/timing
> (campus-to-first-job / settled early-career / early-stage startup-gig). Design must serve all three, not
> treat one as the "real" target and the others as edge cases. **All other candidate segments** (fragmented
> multi-holding, gig/variable income, debt-heavy/reactive, household financial coordinators, dual-income
> households, NRIs) **are DIRECTION, not MVP BUILD** — parked for post-MVP phases, same
> direction-vs-build split D-031 used for holding families. See BRIEF-008, BRIEF-009, D-053, D-054.

## 4. What the MVP does (scope — keep ruthless)
> **Scope expanded at D-031 (25-Jul-2026).** The app is structured as **persistent, user-facing category
> sections** — one per holding family — not a menu-less surface. AI-surfacing remains the PRIMARY way a
> holding enters a section (D-012 stands on primacy); the menu/manual path is the SECONDARY way. See D-031
> for the direction-vs-MVP-build split; only the MVP-build cut is listed here.

1. Register / login
2. Onboarding: the user's baseline profile (income, holdings, goals) is built through an AI-guided
   conversation, not a static form — see D-012. (Exact onboarding mechanism still to be designed.)
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
9. **Engagement/gamification layer (D-060, D-061).** Duolingo-style engagement mechanics — streaks,
   variable/unpredictable reward feedback, the full Hook Loop architecture (trigger → action → variable
   reward → investment) — drive daily app usage, adopted in full per D-060. Bounded by D-061: cosmetic,
   behavior-reactive game elements (mascot reactions, celebratory feedback tied to app usage) are
   permitted; no game element (XP, badge, level, mascot mood, fictional/RPG skin) may be derived from or
   reactive to the user's real financial data — real numbers are always shown straight, undecorated, never
   scored or fictionalized.

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
- Hosting:    Supabase (bundles Postgres + auth + hosting) ✅ — project `fintutor-dev`, region `ap-southeast-1`
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
- [ ] Design AI-surfacing trigger logic + micro-capture flow (D-012) — how the system decides a moment is
      right to surface an unrecorded product type, and how structured fields get captured progressively once
      the user shows interest. Also needs: a re-thought AI-driven onboarding mechanism (no longer assumed to
      be a form), and a minimal-but-real manual fallback UI. All four undesigned as of this entry.
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
- [ ] Write the data privacy policy (D-010): what's masked before reaching the LLM (product names, and
      likely PII like full name/PAN/phone), vs. what's encrypted/protected at rest in Postgres. Needs a
      decision on retention and account-deletion behavior too.
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

- v3.8 (05-Aug-2026) — **D-080: D-051's WHEN-stage surfacing verification satisfied, live.** The first
  live Anthropic API test run executed directly from inside a Cowork/Claude Code session on this
  project (network-access assumption corrected — this environment allows it, contrary to the standing
  note in `scripts/run_phase1_test.py` and several `BUILD_QUEUE.md` entries). Q7 re-run n=5 against the
  current prompt (v0.8): FINDING 8 does not reproduce, 0/5 — D-032's on-topic surfacing fix holds three
  prompt regenerations later. Also caught and fixed a real, previously-undetected `anthropic`/`httpx`
  dependency incompatibility (BQ-040) that would have crashed the backend's first live `/chat` call.
- v3.7 (05-Aug-2026) — **§8 `savings_balance` item RESOLVED (D-079).** The 25-Jul-2026 open question (does
  idle cash need a formal 9th D-013 type?) is closed: it's schema-exempt, being an instance of D-031's
  already-deferred "Cash & bank" family rather than a gap inside D-013's three-MVP-family taxonomy. No new
  type, no build work, no fixture change — owner-confirmed.
- v3.6 (05-Aug-2026) — **D-078: AI-surfaced holding-capture mechanism confirmed, queued as BQ-039.** Owner
  confirmed both forks: extraction via a second narrow Haiku call (same shape as D-072's `deepen_classifier`,
  not a new architectural pattern) and an explicit confirm-card UI gate before any write (never auto-create
  from free text). Builds D-002's never-implemented "Haiku for reconciliation" half and D-012's still-missing
  primary capture path. Also two §8 housekeeping fixes (no new decisions): the `deepen` selection-logic item
  checked off as resolved (D-071/D-072, already built 04-Aug-2026 but never marked here), and the
  second-fixture item checked off with its `savings_balance` sub-question split out as its own still-open
  line (unchanged status, just no longer buried inside a resolved item).
- v3.5 (05-Aug-2026) — **§8 UX-principles item RESOLVED (D-075, D-076, D-077).** The corrected UX
  principles section D-031 anticipated is now fully extracted in `PRODUCT_PRINCIPLES.md`: P1's provenance
  note patched to reflect D-031's manual/browse secondary path (D-075); new P8, a holding family's section
  is always reachable, never gated behind having data in it (D-076); new P9, no comprehension gates —
  teaching content is never locked behind a quiz or prior lesson, with an explicit boundary against P7's
  gamification toolkit being read as licensing a gate (D-077). Done live, one item at a time, owner-
  confirmed before each write, per session 2026-08-05a. Not a new product decision — this closes an
  already-decided backlog item; §8 checkbox applied on owner confirmation per this section's own edit
  rule.
- v3.4 (04-Aug-2026) — **§6 note only — no scope change.** ESOP's characteristics field schema note
  updated from "not yet designed" to resolved, reflecting D-066 (applies D-013's split-vs-merge test to
  the field-list gap D-055 left open — single type, `grant_type` distinguishes options from RSUs). Not a
  new product decision on top of D-055/D-066 — owner-confirmed before applying, per §8's own edit rule.
- v3.3 (04-Aug-2026) — **§8 note only — no scope change.** Pointer added to the UX-principles §8 item
  flagging `.claude/skills/design-taste-frontend/` (D-062/D-063/D-064: Claude Code Skills adopted this
  session, self-authored and vendored categories, this one a vendored frontend design-taste skill,
  explicit-ask only) as available inspiration for when the aesthetic layer is actually designed. Not a
  product decision — proposed and owner-confirmed before applying, per §8's own edit rule.
- v3.2 (04-Aug-2026) — **Gamification/engagement layer added to MVP scope (D-060, D-061).** New §4 item
  9: Duolingo-style engagement mechanics (streaks, variable reward, Hook Loop) adopted in full (D-060) — a
  real scope increase (trigger 5), explicitly recorded as running counter to P4's start-strict default
  rather than a clean application of it. Bounded by D-061: game elements may react to app behavior but
  never to the user's real financial data — an interpretation of P6 extended into gamification design for
  the first time. Two other candidate principles from the same session — gated feature-unlock sequencing,
  social/group stakes — were NOT adopted; both already contradict standing decisions (D-058, §5) and
  needed no new decision. Scope edit deliberately batched rather than applied incrementally per cluster.
- v3.1 (04-Aug-2026) — **Decision 2 resolved (D-059).** Per-item management depth: Path C adopted — full
  per-field edit, delete, and `product_type` recategorization via a standard UI, not routed exclusively
  through AI conversation. Chosen over view-only/delete-only alternatives because the chat surface
  (BQ-023/BQ-024) is still unbuilt, so a chat-dependent correction path would leave holdings functionally
  frozen in MVP. Owner explicitly weighed and accepted the resulting tension with §2's "living baseline...
  not a CRUD save" framing, drawing a line between capture (D-012's concern) and post-capture management
  (this decision's concern). §8 item checked off. Also unblocks the UX-principles-section dependency in
  `PRODUCT_PRINCIPLES.md` (both Decision 2 and Decision 3 now resolved) — not acted on in this entry.
- v3.0 (03-Aug-2026) — **ESOP added to the product-type taxonomy (D-055), resolving BRIEF-010's escalated
  fork.** ESOP confusion was independently named the startup/gig founding-sub-profile's (D-054) top pain
  point (BRIEF-010); owner chose to add it to MVP scope rather than park it, so that profile isn't
  launched with structurally thinner day-one value. Taxonomy membership only — the characteristics field
  schema (vesting, strike price, exercise mechanics, etc.) is deferred as its own design task, same
  two-step pattern D-011/D-013 used originally.
