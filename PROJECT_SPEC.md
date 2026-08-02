# FinTutor — Project Spec (v2.1, 01-Aug-2026)

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
Primary moment: "financially unmanaged but willing." Not defined by age; defined by intent.

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
- **Product-type taxonomy is backend-internal (D-013).** The 8 MVP product types (Equity MF, Debt MF,
  Stocks, FD/RD, PPF/EPF, Home Loan, Personal Loan, Credit Card Debt, Term Insurance, Endowment/ULIP — 8
  distinct characteristic schemas) live in the backend as the schema behind the alias/characteristics layer.
  They are NOT a user-facing menu (D-012); the teaching engine reaches into them when a moment calls for it.

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
- [ ] **Decision 3 — Budgeting/Goals data model (FOUNDATIONAL, do before build) (D-031).** Budgeting and
      goals are MVP but are NOT products — they reference holdings (a goal is funded by holdings; a budget
      flows into them). How do these non-product objects sit in the baseline alongside product holdings?
      This changes the shape every other object reads from, so it is designed before build to prevent rework.
      Next foundational design session. Not laptop-blocked.
- [ ] **Decision 2 — Per-item management depth (D-031).** What is the user's authority over a holding, per
      field — view only? edit? delete? recategorize? correct AI-captured values? Scoped now, DESIGNED LATER:
      its quality depends on Decision 3's data model existing AND ideally on Phase 1 producing one real
      section to react to. Designing it in a vacuum now would produce a worse answer.
- [ ] **Corrected UX principles section in PRODUCT_PRINCIPLES.md (D-031).** The implied UX stance
      (persistent sections, AI-primary/manual-secondary, aliases never shown, no quizzes, progressive
      capture) is to be extracted and written as a UX section — but only AFTER Decisions 2 and 3 exist,
      because it extracts from them. Aesthetic layer (visual style, density, motion, hierarchy) deliberately
      left for when real screen decisions force it.
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
- [ ] **Design the backend `deepen` selection logic (deferred by D-028).** The hard question is relocated,
      not answered: the backend needs a rule for which holding to deepen, without the model's contextual read
      of the question. Will fire trigger 5 as a build decision when picked up. Not next-session work.
- [x] **FINDING 7 RESOLVED (D-029).** Path C adopted: any figure not traceable to the profile is given as a
      range, never a point estimate, with a standing "typical, not yours" frame built into how ranges are
      introduced. Guarded against range-washing by binding to §2 rule 4's legibility standard. See
      TEACHING_SYSTEM_PROMPT.md §2 rule 5 / §5, and SYSTEM_PROMPT_v0_5_runnable.md (build-home regeneration
      pending — BQ-005).
- [ ] **Second fixture, no dominant number** — highest-value untested thing remaining. Card-1 at 42% is the
      loudest number in user_01 and FINDING 4 may be partly an artifact of it. Run Q1 against both fixtures.
      **Small open sub-question, surfaced by Claude Code while scoping BQ-002 (25-Jul-2026, not yet
      answered):** `FIXTURE_user_01.json` uses a `savings_balance` product type (Deposit-1: idle cash,
      `current_balance` + `interest_rate` only) that is NOT one of D-013's 8 taxonomy types. Is idle cash
      schema-exempt by design, or does it need a formal 9th D-013 type? Low-stakes but should be answered
      before BQ-002 executes, so Claude Code isn't left guessing whether to reuse it as precedent or escalate
      it as a scope trigger.
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
- [ ] (PARKED — D-014) Build Claude Code execution subagents to carry out already-decided build tasks
      (starting with the D-012 pieces). Deliberately deferred until after Phase 1 (teaching engine) is
      validated and the relevant design decisions are made. User decides; agents execute. Not next-session
      work — a PM-level task to pull forward once there's a validated core to build against.

## 9. Key learnings & decisions log
- (v0.1) Chose context engineering over fine-tuning for the tutor. Model already knows finance; we supply
  the user's numbers + app voice per call.
- (v0.1) Sonnet for user-facing teaching, Haiku for the narrow reconciliation-diff step (cost + fit).

## 10. Change log
- v2.2 (02-Aug-2026) — **Two homes retired: single unified home (D-033).** The owner moved from Cowork (built
  on Claude Code) pointed at a separate, manually-synced Claude Project, to Cowork pointed directly at this
  repo — meaning PROJECT_SPEC.md, DECISION_LOG.md, DECISION_PROTOCOL.md, and PROJECT_GOVERNANCE.md now live
  in one place, read/write in the same session that builds code, with no download/upload sync ritual. The
  orientation block above rewritten accordingly. The discipline the split protected (bounded execution vs.
  deliberate decision-making) is preserved via DECISION_PROTOCOL.md's tiers and CLAUDE.md's file-permission
  lanes, now self-enforced rather than access-enforced. CLAUDE.md, PROJECT_GOVERNANCE.md,
  HOW_TO_RUN_THIS_PROJECT.md, README.md, and AGENTS.md updated in the same pass to drop two-home framing.
- v2.1 (01-Aug-2026) — **FINDING 8 resolved (D-032).** BQ-001 (Q7/Q8 run) closed §8's last untested item; Q8
  clean, Q7 produced FINDING 8 — unprompted gap-surfacing with ranking language ("worth looking at") on a
  purely off-topic question. Diagnosed as NOT a P-002 case (no rule had ever governed this channel — D-031's
  Trigger-A/B narrowing was decided at spec level but never transcribed into the prompt) — a missing rule
  being written for the first time, not a routed-around one. Path B adopted: §2 rule 3 (the open-door offer)
  tightened to on-topic only, using Q8's clean on-topic offer as the deciding control evidence over Q7's
  off-topic one. Path A (blanket Trigger-A/B gate) and Path C (backend field) held in reserve, pending
  evidence Path B doesn't hold. Laptop-repair BLOCKED item retired (machine operational). GitHub remote
  established this session (github.com/imsparsh01/fintutor, public) as a lighter-weight transport for
  laptop-to-thinking-home file sync — Project knowledge remains the source of truth for the five tracked
  governance files; GitHub is transport, not a replacement store.
- v2.0 (25-Jul-2026) — **App structure + MVP scope expansion (D-031).** Major bump: the app is now structured
  as persistent user-facing category sections (partially superseding D-012's "no menu / backend-only
  taxonomy" clause — AI-surfacing stays primary, menu is secondary). Scope logged in two layers: DIRECTION
  (six holding families — investments, loans, insurance, real estate, cash & bank, alternatives — plus
  budgeting, goals, and per-item management) vs. MVP BUILD (three families only + budgeting + goals +
  per-item management; real estate / cash / alternatives deferred to immediately post-Phase-1). §4 and §5
  rewritten accordingly. Recorded as a real increase against the "keep ruthless" instruction and P4; the
  owner judged it justified (tracking the whole financial picture is the product's point) and the system
  recorded the direction/build split as the counter-discipline. Three new §8 items: Decision 3
  (budgeting/goals data model — foundational, before build), Decision 2 (per-item management depth — scoped
  now, designed later), and the corrected UX principles section (after 2 and 3). Rule extracted:
  direction-scope and build-scope are logged separately so a want can be committed to without being built now.
- v1.9 (25-Jul-2026) — **BRIEF-003 resolved (D-029)** — FINDING 7 (Q2 supplying a market-typical figure the
  fixture didn't contain) closed. Path C adopted: non-profile numbers are given as ranges with a standing
  "typical, not yours" frame, never point estimates, guarded against range-washing by §2 rule 4's existing
  legibility standard. Rule extracted: a rule introducing a number must state its provenance — the third
  instance of the FINDING 1/4/7 error class (a rule governing one channel, silent about an adjacent one).
  §2 gains rule 5 and §5 gains a typical-figure phrasing example in TEACHING_SYSTEM_PROMPT.md; the runnable
  regeneration to v0.5 is build-home work, queued as BQ-005. Also recorded: the laptop build-home is
  temporarily out of service (Apple repair) — all build-home tasks paused; see new §8 item.
- v1.8 (23-Jul-2026) — **BRIEF-002 resolved (D-028)** — the second architectural move of the project, after
  D-010. The model no longer selects which path to deepen: the backend sets a `deepen` field carrying the
  alias and a reason, and the model obeys it. Three owner sub-decisions kept the guarantee intact: an absent
  field means deepen NOTHING (equal shallow treatment) rather than model's discretion, so no case falls back
  to the model choosing; the field carries a backend-authored reason the model may state, since a supplied
  reason cannot be a ranking the model invented; and the field is hand-stubbed in fixtures now, decoupling
  "the model does not choose" from "how the backend chooses", which is deferred as its own build decision.
  Chosen over three cheaper options because the same behavior had already re-routed twice — evidence about
  the instrument rather than the rule. Rule extracted: when a prompt-level rule has been routed around twice,
  the third attempt should be architectural. §2 rule 2 also now names reference-frame capture; §1 gains a
  no-self-narration line. Prompt regenerated as v0.4.
- v1.7 (23-Jul-2026) — **Phase 1 Run 2 executed (D-027).** Rule 5 (D-025) fixed three of four: Q3 flipped
  from the Run 1 break to a pass, Q5 no longer redirects the user's priorities, and Q2 confirms the D-012
  narrowing works — the insurance gap surfaces without ranking. **Q1 failed in a new shape.** The ranking
  moved out of sentences and into structure: §2 rule 2 requires the model to name every path then go deep on
  one, and is silent on how to choose, so the model complied with rule 5 sentence-by-sentence while
  expressing the same judgment by selecting the card as the deepened path and narrating the other paths from
  its point of view. This is the second re-route of the same behavior (Run 1: blocklist → "worth"; Run 2:
  sentence rule → structure), escalated as **BRIEF-002**. Also recorded: the model narrated its own
  compliance (FINDING 5, a side effect of putting a nameable test in the prompt); "worth" splits cleanly into
  a forbidden population (operating on holdings) and a permitted one (operating on concepts), confirming the
  word itself is not the problem; and Q2 supplied a market figure the fixture did not contain, which breaks
  no rule but raises an unanswered prompt question. All four outputs sat inside D-026's recalibrated length
  bands.
- v1.6 (23-Jul-2026) — **BRIEF-001 resolved (D-025)** — the first Tier-3 compliance interpretation since
  D-009 itself. Unprompted prioritisation is advice: Path A adopted for MVP, so the model states each item's
  rate and mechanism but never ranks the user's problems, even on request. Written into §3 as rule 5 and
  expressed as a reusable TEST — *does this sentence tell the user what is true, or what to attend to?* —
  because Run 1 proved a phrase blocklist cannot hold the line (the model routed around every forbidden
  phrase using "worth"). Two narrowings settled inside Path A: the rule bans ordering language, not
  mentioning an unnamed holding (preserving Q1's unprompted Card-1 surfacing); and surfacing a gap is not
  ranking, so D-012's AI-surfacing philosophy survives intact. Path B parked as the growth direction with
  two unpark conditions, both required: legal review of D-009 AND demonstrated reliability across a full
  eight-question run. Also D-026: §5 length ranges recalibrated from real output (150–250 / 200–300 / 320
  ceiling), superseding D-021's table only. Prompt regenerated as v0.3. Next: Phase 1 Run 2.
- v1.4 (23-Jul-2026) — D-021: system prompt §1 (role) and §5 (tone/voice/length) drafted — no persona,
  thinking partner not lecturer, holds views about concepts but never about what the user should do, speaks
  from the live baseline without claiming conversational recall, matter-of-fact about limits, Indian-English
  register. Length set as an explicit hypothesis with its reasoning recorded. D-022: conversation memory
  PARKED to post-MVP — fired the hard scope trigger plus a data-retention angle and was escalated rather than
  absorbed. First live exercise of the decision protocol.
- v1.5 (23-Jul-2026) — **Phase 1 Run 1 executed (D-024)** — the teaching engine produced real output for the
  first time. Six of eight test questions run against prompt v0.2 + FIXTURE_user_01 on the Console Workbench.
  5 of 6 held the compliance wall; Q3 (direct recommendation demand) broke it, refusing in form while
  recommending in substance. Q1 passed the fixture's deliberate trap by surfacing Card-1 at 42% unprompted —
  evidence of reasoning rather than mimicry. Three findings: unprompted prioritisation (escalated as
  BRIEF-001); the leak sits in evaluative framing verbs ("worth") rather than the forbidden phrases §3 lists,
  so a blocklist cannot hold the line; and §5's length ranges are wrong as D-021 predicted. Inverted
  expectation recorded: the wall held under the distressed user and broke under the firm one — the trigger is
  being told teaching is not wanted, not emotional pressure. New §8 items: BRIEF-001 (blocking) and the
  length recalibration.
- v1.3 (23-Jul-2026) — D-020: DECISION_PROTOCOL.md §4/§5/§6 written; protocol COMPLETE at v1.0 and D-017's
  cap is reached. Two owner calls: supersession requires a formal `Supersedes:` marker on the new entry while
  the old entry is never touched (partial supersession must state its scope); and the narrowing rule —
  interpreting a compliance-category decision is Tier 3 only, including interpretations that appear to
  tighten, while other interpretations may run at Tier 2 with a mandatory REVIEW-FLAG, because interpretation
  drift is cumulative and quieter than contradiction. §5 fixes three output shapes, with skipped lenses
  listed rather than omitted and a rule-extraction field on every Tier-3 brief (the mechanism that made one
  D-013 test convert ten decisions). §6 opens empty with append criteria and a ~10-entry review trigger.
  Next session returns to Phase 1 (D-006, teaching engine prototype).
- v1.2 (23-Jul-2026) — D-019: DECISION_PROTOCOL.md §3 complete. Four evaluation lenses defined by the
  objection each alone can raise: Compliance, Product, Technical, Cost-and-Scope. Compliance BLOCK is a hard
  veto → Tier 3 regardless of other lenses; Compliance always runs while the other three are
  relevance-selected (a skipped veto-holding lens is the one gap the doubt threshold cannot catch); verdicts
  are structured PASS/CONCERN/BLOCK + one sentence; deadlock between two non-Compliance lenses escalates
  rather than being resolved by invented precedence. Cost-and-Scope narrowed to owner-attention and
  maintenance drag (trigger 5 already blocks scope-adders from reaching Tier 2). Anti-decoration rule added.
  §4 shrinks to two open questions.
- v1.1 (23-Jul-2026) — D-018: DECISION_PROTOCOL.md §2 complete (tiers, six-trigger checklist, routing
  sequence). Structural choice: the trigger checklist runs BEFORE tier assignment, so it produces the tier
  rather than confirming a guess — this is what makes a silent Tier 1 safe. Seven owner judgment calls
  recorded: hard scope-increase trigger; Tier 2 acts immediately under retroactive veto; Tier-1 authority
  bounded by home (cross-home work escalates because only the owner can perform the sync ritual); promotion
  by new appended entry rather than rewrite; mid-deliberation escalation carries its work; touched-data
  reversibility test; 25% doubt threshold on Tier 2 only. A mandatory SYNC STATE block now closes every
  session. Accepted consequence: the hard scope trigger would have fired on D-013.
- v1.0 (23-Jul-2026) — D-017: decision-making formalized into a routed, tiered protocol. Governance shifts
  from "owner decides everything" to classify → tier → auto-decide / deliberate / escalate. New file
  DECISION_PROTOCOL.md created (§1 retroactive classification of D-001–D-016 complete; tiers, lenses, and
  output formats still to write). Key findings from the retroactive pass: 7 of 16 decisions genuinely needed
  the owner (~55% of decision bandwidth is recoverable); five real categories exist, not four
  (technical-architectural, technical-economic, product-judgment, compliance, sequencing/PM); boundary
  decisions like D-013 and D-016 mean the protocol needs a multi-category rule — the STRICTER category
  governs. Scalability handled by append-only logging, an appendable precedent section, and
  unclassifiable-fails-upward. Recorded limitation: Project files are read-only from inside the Project;
  "live" means the manual sync ritual, not automation. Orientation block updated. New §8 open item.
- v0.9 (23-Jul-2026) — Two decisions this session. (1) D-012: zero-friction, AI-surfaced data capture — the
  product-type list is a backend taxonomy, NOT a menu of "Add X" buttons; the AI surfaces relevant types
  organically and captures details only on user interest, with a manual fallback. Applies to ALL types in
  MVP. Onboarding reworded (section 4) — now flagged as needing its own AI-driven design, not assumed a form.
  New philosophy bullet added (section 2). New open item: trigger logic / micro-capture / onboarding
  redesign / manual fallback UI (all undesigned). (2) D-013: MVP product-type taxonomy resolved — 8 distinct
  types across investments (Equity MF, Debt MF, Stocks, FD/RD, PPF/EPF), loans (Home, Personal, Credit Card),
  insurance (Term, Endowment/ULIP), each with a lean characteristic-field list, decided by a split-vs-merge
  test. Resolves D-011 Steps 1–2. Insurance added to MVP scope (a real scope increase, recorded not implied).
  (3) D-014: execution subagents parked as a PM-level task — user decides, agents execute; deferred until
  after Phase 1 is validated. New Section 8 open item added.
- v0.8 (23-Jul-2026) — Alias methodology framework decided (D-011): split into resolution / characteristics /
  re-humanizing sub-problems. Leaning toward selection-based resolution (no NLP matching needed for MVP) and
  full re-humanizing back to real names in the UI (masking only ever applied to the LLM, not the user's own
  view). Product-type list + characteristics fields still open — in progress separately.
- v0.7 (23-Jul-2026) — Anthropic API key created (`fintutor-dev`, no expiration). Billing settlement lag
  resolved on its own; balance confirmed at $10.00. Resolves the last blocking item from Section 8 before
  Phase 1 (teaching engine prototype) can start.
- v0.6 (23-Jul-2026) — Two new philosophy principles added: (1) architectural aliasing — the LLM never
  sees real product/institution names, only internal aliases + characteristics, making D-009's "no product
  names" rule an architectural guarantee rather than a prompt-level request; (2) sensitive data
  masking/privacy as a first-class decision, not a launch afterthought. See D-010. Architecture diagram
  updated to show the alias/mapping layer. New open items: design the aliasing methodology, write the data
  privacy policy.
- v0.5 (23-Jul-2026) — Compliance stance decided: strict posture, no product/security names ever; teach
  mechanism + model multi-path scenarios using the user's real numbers/goals for decision-shaped questions.
  Resolves the compliance open item. See D-009. New open item: legal review before public launch.
- v0.4 (23-Jul-2026) — Managed platform decided: Supabase. Project `fintutor-dev` created and verified
  Healthy (region `ap-southeast-1`, Nano compute). Resolves the D-005 open item. See D-008.
- v0.3 (22-Jul-2026) — Added the orientation anchor (laptop = build / Project = think). Decided to stand up
  the Claude Project + governance first, then move to Claude Code in parallel.
- v0.2 (22-Jul-2026) — Stack locked: Python/FastAPI backend, React Native/Expo app, Postgres, managed
  platform for hosting+auth. Java rejected for backend (boilerplate + weaker AI ecosystem). Remaining
  open: specific managed platform, API key, compliance stance.
- v0.1 (22-Jul-2026) — Spec created. MVP scope, philosophy, architecture locked. Stack + compliance open.
