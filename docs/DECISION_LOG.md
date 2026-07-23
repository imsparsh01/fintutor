# FinTutor — Decision Log

> One entry per meaningful decision. Format: what / why / reversibility / date.
> Rule: a decision isn't real until it's here. Don't reopen a logged decision without new information.

---

### D-001 — Teach via context engineering, NOT fine-tuning
- **Decision:** The tutor is an off-the-shelf Anthropic model fed the user's profile + app rules as context
  on each call. No custom-trained model.
- **Why:** The model already knows finance. What's missing is the user's live numbers + app voice — those
  are supplied per-call, not baked into weights. Fine-tuning teaches style/skill, not per-user facts.
- **Reversibility:** High (could add fine-tuning far later at scale). Not an MVP concern.
- **Date:** 22-Jul-2026

### D-002 — Two-model split: Sonnet for teaching, Haiku for reconciliation
- **Decision:** User-facing teaching responses use Sonnet; the narrow "does this new input update the
  baseline" reconciliation step uses Haiku.
- **Why:** Teaching needs quality (it's the product). Reconciliation is narrow/structured/high-volume and
  doesn't need flagship reasoning — Haiku is cheaper and sufficient. Right tool per job = cost control.
- **Reversibility:** High (swap models via config).
- **Date:** 22-Jul-2026

### D-003 — Backend: Python + FastAPI (rejected Java)
- **Decision:** Backend in Python/FastAPI.
- **Why:** Less boilerplate than Java; the entire LLM-app ecosystem (SDK, examples, help) is Python-first,
  which matters when relying on Claude Code + web searches to get unstuck. Java skills transfer; Python is
  more readable for review-only use.
- **Reversibility:** Low once code exists. Deliberate, settled.
- **Date:** 22-Jul-2026

### D-004 — App: React Native via Expo (cross-platform)
- **Decision:** One codebase → iOS + Android using React Native/Expo.
- **Why:** Least-painful cross-platform path for a non-mobile-specialist; keeps app in JS/TS (fewer languages
  to read than Dart/Flutter); Expo removes most build/deploy pain.
- **Reversibility:** Low once app exists. Settled.
- **Date:** 22-Jul-2026

### D-005 — Managed platform for hosting + DB + auth (don't self-host, don't roll own auth)
- **Decision:** Use a managed backend platform bundling Postgres + auth + hosting. Specific provider TBD.
- **Why:** Biggest effort-saver for a solo bootstrapped MVP. Rolling your own auth is a security liability
  and time sink. Postgres chosen as the DB.
- **Reversibility:** Medium (migration is work but possible). Provider choice still open.
- **Date:** 22-Jul-2026

### D-006 — Build order: teaching engine FIRST, then plumbing
- **Decision:** Phase 1 proves the teaching engine (Sonnet + system prompt + fake profile → good teaching
  moment) before building app/login/UI.
- **Why:** Validate the risky, novel core before investing in standard plumbing around a core that might
  not work. De-risks the whole project early.
- **Reversibility:** N/A (process choice).
- **Date:** 22-Jul-2026

### D-007 — Sequencing: stand up Claude Project + governance first, Claude Code in parallel after
- **Decision:** Set up the thinking-home (Project, spec, governance, decision log) first; begin laptop/Claude
  Code build in parallel once governance is in place.
- **Why:** Strategy scaffolding prevents losing the thread later; cheap to do now, expensive to retrofit.
- **Reversibility:** N/A (process choice).
- **Date:** 22-Jul-2026

### D-008 — Managed platform: Supabase (Postgres + auth + hosting)
- **Decision:** Use Supabase for the managed backend platform. Project created: `fintutor-dev`, region
  `ap-southeast-1` (Singapore), compute tier Nano. Status confirmed Healthy.
- **Why:** Resolves the D-005 open item. Supabase bundles Postgres + auth in one managed service, matching
  the "don't self-host, don't roll own auth" decision. Singapore region chosen (likely lowest latency for
  an India-based user base among available options).
- **Reversibility:** Medium — same as D-005 (migration is work but possible). Locking the specific provider
  now; region/compute tier can be revisited before scaling past MVP.
- **Date:** 23-Jul-2026

### D-009 — Compliance stance: strict "no product/security names, ever" — mechanism + scenario modeling only
- **Decision:** FinTutor NEVER names a specific product, security, fund, stock, or investment vehicle — not
  even ones the user already holds. It only teaches concepts and mechanisms (compound interest, EMI
  amortization, diversification, etc.) applied to the user's own numbers. When the user asks a decision-shaped
  question (e.g. "I have ₹2 lakh extra, should I pay down my loan or invest it?"), FinTutor uses its knowledge
  of the user's full baseline profile and stated goals to model out multiple paths side by side — mechanism,
  numbers, trajectory, and risks for each — so the user sees the consequences clearly. It never tips the
  scale toward one path, never says "you should," and always leaves the decision to the user.
- **Why:** SEBI's Investment Advisers Regulations, 2013 (as tightened through 2024-2025 amendments and a
  January 2025 circular) draw enforcement scrutiny around content that functions as personalized investment
  advice regardless of "educational" framing — including a December 2025 case where a finfluencer's
  "education" was found to be unregistered advisory activity (₹546 crore impounded). Naming specific products
  or securities is the clearest trigger for that scrutiny. Modeling scenarios/trade-offs with the user's own
  numbers — without naming products or picking a winner — stays on the education side of the line while still
  being genuinely useful for real decisions. This is the strictest of the two postures considered; chosen for
  MVP to minimize regulatory risk given the current enforcement climate.
- **Reversibility:** Medium. Can be loosened later (e.g. allowing references to products the user already
  holds) after real legal review — but tightening a live product after users are used to a looser behavior is
  harder than starting strict and relaxing deliberately. Do NOT loosen this without a securities/fintech
  lawyer's review first.
- **Date:** 23-Jul-2026

### D-010 — Architectural aliasing: the LLM never sees real product/institution names; sensitive data is masked by design
- **Decision:** All user holdings (funds, stocks, insurance policies, and the institutions/companies behind
  them) are stored internally under an alias (e.g. "Fund-A", "Policy-3"). Every real characteristic of that
  holding — asset class, expense ratio, lock-in period, risk profile, historical behavior, etc. — is tracked
  normally against that alias. The Anthropic API is NEVER sent the real name — only the alias plus its
  characteristics. Separately, a broader data privacy policy governs what other sensitive user data (e.g.
  full legal name, PAN, phone, address) is masked before reaching the LLM vs. what's simply encrypted/
  protected at rest in the database.
- **Why:** D-009 already forbids the LLM from *outputting* a product name, but that's a prompt-level rule —
  it depends on the model correctly following instructions every time. If the real name is architecturally
  never sent to the LLM in the first place, an entire class of failure (prompt injection, model mistake,
  logging leak on Anthropic's side) is closed off rather than just discouraged. This turns a policy into a
  structural guarantee, which is a stronger compliance posture and a more defensible one if ever questioned.
  It also reduces the sensitivity of what's leaving your infrastructure at all, which matters independent of
  SEBI — it's good data-handling practice for any app holding real financial data.
- **Reversibility:** Medium-low once the alias table and backend resolution logic are built and the app's
  data model depends on it — but the underlying real data is still stored, just under a different key, so
  reversing the *masking* (if ever legally cleared to loosen) is more like exposing a lookup than a data
  migration.
- **Still to design (see Section 8 open items):** the alias-resolution methodology (how the backend maps a
  user's natural-language reference to the right internal record), what characteristics get tracked per
  product type, whether/how LLM output gets re-humanized for the user post-response, and the full data
  privacy policy (masking rules + at-rest protection + retention/deletion).
- **Date:** 23-Jul-2026

### D-011 — Alias methodology broken into 3 sub-problems; leaning toward selection-based resolution + full re-humanizing for the user
- **Decision:** D-010's "alias methodology" is treated as three separate design questions, not one blob:
  (1) **Resolution** — how the backend maps what a user means to the right internal record. Leaning strongly
  toward **selection, not free text**: the user picks their holding from a list/dropdown (populated at
  onboarding) rather than typing a name, which the backend then resolves trivially by record ID — no fuzzy
  NLP matching needed for MVP. (2) **Characteristics** — the field list tracked per product type (e.g. fund:
  asset class, expense ratio, lock-in; loan: principal, rate, tenure, EMI; insurance: type, premium, sum
  assured). Only fields an actual teaching moment would use — resist over-modeling. (3) **Re-humanizing** —
  what the user sees when the LLM's response references an alias like "Fund-A." Leaning toward translating
  the alias **all the way back to the real name** in the final UI layer, since D-010's masking was only ever
  about what the *LLM* sees/says — the user already knows their own holding's real name, so hiding it from
  them in the UI would add confusion without adding any compliance or privacy benefit.
- **Why:** Splitting the methodology into named sub-problems prevents any one of them from being solved
  vaguely or skipped. Selection-based resolution avoids building NLP matching MVP doesn't need. Full
  re-humanizing in the UI keeps the app feeling natural to the user while preserving the actual point of
  D-010 (protecting what reaches Anthropic's API, not hiding the user's own data from themselves).
- **Reversibility:** High on (1) and (3) — both are backend/UI logic, changeable without data migration.
  Medium on (2) — the characteristics schema is more costly to change once built and populated with data.
- **Still open:** the actual list of product types + their characteristic fields (Step 1–2 of the framework)
  — being drafted in a separate working session. This entry captures the mechanism/framework only.
- **Date:** 23-Jul-2026

### D-012 — Zero-friction data capture: AI-surfaced, not menu-driven; product-type taxonomy is a backend schema, not a UI category list
- **Decision:** The product-type list (loan sub-types, investment sub-types, insurance sub-types, etc.) is
  an internal backend taxonomy used by the teaching engine and the alias/characteristics schema (D-010,
  D-011, D-013) — it is NOT a set of "Add X" buttons the user chooses from. The primary way a holding enters
  the user's baseline is: a teaching moment (triggered by whatever the user is already doing — a loan
  conversation, a reminder, the portfolio view) surfaces a *relevant* product type organically (e.g. a
  loan-related teaching moment surfaces term insurance as a concept; if the user shows interest, a short
  guided micro-capture follows in that same flow, not a redirect to a form). This applies to ALL product
  types for MVP, not just one type as a pilot — it is core UX, not a later-phase add-on. A manual "corner"
  path (a plain add path, not AI-triggered) also exists in MVP as a fallback/escape hatch for users who want
  to log a holding the AI hasn't organically surfaced yet — both paths are MVP.
- **Why:** The stated philosophy is "learn on the go, triggered by the user's real actions" (spec section 2).
  A menu of "Add Investment / Add Insurance / Add Loan" buttons the user has to seek out contradicts that
  philosophy for every type, not just insurance. The generalization (raised by user, 23-Jul-2026): the app
  minimizes explicit user input everywhere — the AI proactively identifies relevant product categories and
  moments, and only asks for structured details once the user has shown organic interest. A manual fallback
  is kept because a user with an existing holding shouldn't be blocked from recording it while waiting for
  the AI to surface it.
- **Consequences / new work this creates (not yet designed):**
  1. **Trigger logic** — a mechanism (rule-based and/or model-proposed) deciding when a conversation is a
     good moment to surface a product type the user doesn't yet have. Undesigned.
  2. **Micro-capture flow** — when the user shows interest, a lightweight, *progressive* way to capture just
     enough fields to teach now, without demanding the full characteristic schema up front. Undesigned.
  3. **Onboarding re-think** — section 4's onboarding step ("capture income, loans, investments, goals") was
     written as an implicit form-fill. If AI-surfacing is core UX, onboarding is the FIRST instance of this
     pattern, not an exception. Needs its own design pass. Flagged, not resolved.
  4. **Manual fallback UI** — still needs a real, minimal design even though it's secondary to the AI path.
- **Reversibility:** Medium. The backend taxonomy/schema (D-011, D-013) is unaffected — this decision changes
  only *how* the taxonomy gets populated (trigger + capture UX), not *what* is captured. Falling back to a
  manual-only MVP wouldn't touch the data model, but it would reverse a philosophy commitment — treat as a
  considered reversal, not a quick toggle.
- **Still open:** all four consequences above are undesigned. This entry captures the decision and its scope,
  not the mechanism.
- **Date:** 23-Jul-2026

### D-013 — MVP product-type taxonomy + per-type characteristic fields (resolves D-011 Steps 1–2)
- **Decision:** The MVP internal product-type taxonomy is **8 types** across three families. Splits vs merges
  are driven by one test: *does the teaching mechanism or tax behavior actually differ?* If yes → separate
  type; if only the data-entry differs → same type with a distinguishing field. Fields are filtered hard
  against "would an MVP guided teaching moment actually use this?" (D-011's "resist over-modeling").

  **Investments**
  1. **Equity Mutual Fund** — fields: `expense_ratio`, `lock_in_period`, `investment_mode` (SIP/lumpsum),
     `invested_amount`, `current_value`, `start_date`, `risk_bucket`.
  2. **Debt Mutual Fund** — same field shape as Equity MF. *Split from Equity MF* because taxation differs
     (equity LTCG/STCG buckets vs debt taxed at slab rate since 2023) — an indexation/tax teaching moment for
     one is simply wrong for the other.
  3. **Stocks (direct equity)** — fields: `sector`, `invested_amount`, `current_value`, `purchase_date`,
     `risk_bucket`. Own type: no expense ratio, no lock-in, and the teaching mechanism (single-stock risk,
     diversification) differs from fund selection.
  4. **Fixed / Recurring Deposit** — fields: `deposit_mode` (lumpsum FD / recurring RD),
     `principal_or_monthly_amount`, `interest_rate`, `tenure`, `maturity_date`. FD and RD *merged* — identical
     mechanism and tax treatment; only how the money goes in differs → a field, not a type boundary.
  5. **PPF / EPF (retirement)** — fields: `retirement_fund_type` (PPF/EPF), `current_balance`,
     `annual_contribution`, `interest_rate`. *Merged* — both govt-backed, EEE tax status, long-lock-in; the
     "long-horizon tax-free compounding" teaching mechanism is identical.

  **Loans**
  6. **Home Loan** — fields: `principal`, `interest_rate`, `tenure_months`, `emi_amount`, `start_date`,
     `outstanding_balance`. Own type: tax-deduction angle + long tenure make it the key case for the
     prepay-vs-invest scenario modeling in D-009.
  7. **Personal Loan** — same field shape as Home Loan. *Split* because no tax deduction, shorter tenure,
     higher rate → the prepay-vs-invest math and teaching narrative differ meaningfully.
  8. **Credit Card Debt** — fields: `credit_limit`, `outstanding_balance`, `interest_rate`, `minimum_due`,
     `payment_due_date`, `billing_cycle_date`. Own type (not a loan variant): section 4 already treats
     credit-card reminders as distinct, and the revolving / minimum-due-trap / high-APR mechanism is a
     different teaching moment from an amortizing loan.

  **Insurance** (in MVP scope per this session; see D-012 for how it enters — surfaced, not a menu)
  9. **Term Insurance** — fields: `sum_assured`, `premium`, `premium_frequency`, `policy_term`, `start_date`.
  10. **Endowment / ULIP** — fields: `sum_assured`, `premium`, `premium_frequency`, `policy_term`,
      `current_fund_value` (nullable — ULIP only), `maturity_value_estimate`, `start_date`. *Split from Term*
      because Term is pure protection while Endowment/ULIP bundles insurance + investment — the "cost of
      bundling vs buy-term-and-invest-the-difference" teaching moment depends on keeping them distinct.

  (Note: the taxonomy is numbered 1–10 above but comprises the agreed 8 *distinct types* — FD/RD counted as
  one, PPF/EPF as one. Count reconciliation is intentional: "8 types" = the number of distinct
  characteristic schemas.)
- **Why:** Gives D-011's Steps 1–2 a concrete answer so the alias/characteristics layer (D-010) can be built.
  The split-vs-merge test (teaching mechanism or tax behavior differs?) keeps the schema count honest and
  gives future sessions a rule to apply rather than a list to memorize. Field lists are deliberately lean —
  each field must earn its place in an actual teaching moment.
- **Reversibility:** Medium — same as D-011 Step 2. Adding a field or a type later is cheap; changing an
  existing field's meaning after data is populated is costlier. Merges (FD/RD, PPF/EPF) can be split later if
  a real teaching need emerges, without disturbing already-captured records.
- **Scope note:** Adding insurance made MVP's product surface larger than section 4 originally implied. The
  scope change is recorded here and in D-012, not left implicit in the schema.
- **Date:** 23-Jul-2026

### D-014 — Build execution subagents LATER, as a parked PM task — not before the teaching core is validated
- **Decision:** The four D-012 design problems (trigger logic, micro-capture flow, onboarding redesign,
  manual fallback UI) will be *decided by the user* and *executed by Claude Code subagents*. But building
  those subagents is explicitly PARKED as a project-management-level task, to be picked up only after (a)
  the Phase 1 teaching-engine prototype (D-006) is validated, and (b) the relevant design decisions have
  actually been made. Division of labour is fixed: the user makes the design/product-judgment calls;
  subagents execute bounded, already-decided build tasks (and may act as read-only researchers feeding the
  user's decisions). Subagents do NOT make the three product-defining design decisions.
- **Why:** An execution agent is only as valuable as the decision it executes and the core it builds against.
  Right now neither exists — the three design decisions are unmade and the teaching engine is unproven.
  Building agent scaffolding first would automate around an empty core (the "tooling as procrastination"
  anti-pattern in the governance doc). The compounding payoff of agents is real but it accelerates
  *execution throughput*, which has no validated target yet — so it is deliberately second, not first.
  Handing the three design decisions to an agent is also rejected on principle: those are product-judgment
  calls about how FinTutor should feel and where the "teach not advise" line sits — the exact reason the
  thinking-home (Project) exists separately from the build-home (laptop).
- **Reversibility:** High — this is a sequencing/PM call, not an architectural one. Can be pulled forward the
  moment Phase 1 is validated and a design decision is ready to execute.
- **Date:** 23-Jul-2026

### D-015 — Teaching method defined: 4 settled dimensions that shape every teaching moment
- **Decision:** How FinTutor teaches is fixed along four dimensions (these drive the "Teaching Method" section
  of the system prompt — see the prompt file):
  1. **Open with the user's situation, surface the mechanism as it unfolds.** A teaching moment never opens
     with an abstract explanation; it opens by reaching into the user's baseline ("you've got ₹40L
     outstanding at 9% over 18 years…") and lets the mechanism emerge from there. Where there's no personal
     number yet (e.g. AI surfacing term insurance to someone with no policy — the D-012 case), it opens with
     the relevant *situation* ("you've a home loan but nothing protecting who'd inherit that debt…"), not a
     product pitch.
  2. **One mechanism deep per moment; name the others as threads.** Teach a single mechanism cleanly rather
     than dumping the full map. For *decision-shaped* questions (D-009), name ALL the paths up front so the
     choice is visible and fair, THEN deepen one — completeness lives in the naming (nothing hidden →
     D-009 satisfied), depth is rationed (not overwhelming → UX). Critical: "deepen one" must never collapse
     into "show only one," which would tilt the scale and break D-009.
  3. **Deliver cleanly, close with the next thread as an open door — no quiz.** No comprehension checks, no
     homework. The moment names what else is there, goes deep on one, and holds the door open; the user pulls
     the next thread when they want it (fits "learn on the go, triggered by the user's actions"). Tradeoff
     accepted: comprehension is the user's responsibility, not verified by the model. Revisit only if
     teaching moments feel like they sail past people.
  4. **Make every path's consequence vivid in concrete numbers — equal weight, no evaluative language — and
     let the contrast stand.** Within the "never advise" wall, the model makes costs legible ("paying just
     the minimum keeps ~₹58,000 of interest running against you this year") and trusts the number to speak.
     Two failure edges the prompt must guard: (a) drift-to-advice — evaluative words ("painful,"
     "unfortunately") or dramatizing ONE path's downside while hiding another's; the guard is SYMMETRY, every
     path's real consequence gets equal vividness; (b) drift-to-uselessness — burying the number under hedges
     until it's illegible. The model makes stakes legible; it never weighs them.
- **Why:** These four turn the philosophy ("mechanism + personal context always paired," "teach never
  advise") into instructions a model can actually follow, anchored to concrete moments rather than abstract
  rules. They were chosen deliberately as a coherent set: D2's "name all paths" and D3's "open door" are the
  same gesture from two angles, and D4's symmetry rule is what keeps vividness on the teaching side of the
  D-009 wall. Decided by the user (product-judgment calls), not defaulted.
- **Reversibility:** High — these are prompt-level instructions, tunable per Phase 1 testing. D4 is the most
  likely to need real-world calibration (the advice/uselessness knife-edge won't be fully settled until
  tested against real teaching moments).
- **Feeds:** the "Teaching Method" section of the system prompt. The compliance wall (D-009/D-010 as prompt
  instructions), profile-context description, tone, and refusal behavior are still to be drafted.
- **Date:** 23-Jul-2026

### D-016 — Compliance wall refusal behavior: 4 judgment calls on how the model holds the line
- **Decision:** The compliance wall (system prompt §3) turns D-009/D-010 into hard model instructions. Most
  of it is mechanical transcription (never advise, never name, alias-only reasoning, model-all-paths-then-stop).
  Four behavioral judgment calls were decided by the user:
  1. **Direct-recommendation demands** ("just tell me what to buy") → refuse, give the reason in ONE plain
     sentence, then pivot to what it CAN do (mechanism + their numbers). Explain once, lightly — never lecture.
  2. **User names a specific product** ("is XYZ fund good?") → model may acknowledge it holds general
     knowledge but declines to name OR judge specifics. Two-layer rule: won't offer a name, won't evaluate a
     user-supplied name. The second layer (refusing to judge a name the USER supplied) is the compliance-
     critical one and the most likely to be poked in testing.
  3. **Predictions / market timing** ("will it go up?", "good time to buy?") → hard, brief refuse ("outside
     what I do"); no softening into a hedged forecast. Deliberately strict for MVP; flagged as known-rigid,
     revisit after Phase 1.
  4. **Genuine distress** (scared user, not testing, begging for a direct answer) → the no-advice rule still
     holds, but held kindly: acknowledge the difficulty, teach the mechanism if it helps, and point to the
     *category* of registered professional (e.g. "a SEBI-registered investment advisor") who can give the
     decision the model can't. NEVER a named advisor/firm — professional TYPE only. Distress changes the
     tone, never the rule.
- **Why:** The wall must hold not just against pushy users (1–3) but humanely for distressed ones (4) — a
  refusal that's correct for someone testing the boundary can feel cruel to someone struggling, so the rule
  stays fixed while the tone flexes. Referring out to a professional category (4) is also the most defensible
  posture for an unregistered educational tool: "know your limits and refer out" is what a regulator expects.
  Strict stances on (2) and (3) follow D-009's logic — start strict, relax deliberately later, never the
  reverse.
- **Reversibility:** Medium-high — all four are prompt-level and tunable after Phase 1. (3) is the most
  likely to be loosened (rigidity vs usefulness). (2)'s second layer should NOT be loosened without legal
  review — it's the core SEBI-facing line.
- **Important non-substitution:** The wall makes the product *behave* compliantly. It is NOT legal sign-off.
  D-009's pending India securities-lawyer review before public launch still stands — a well-built wall must
  not create false confidence that the legal bar is cleared.
- **Feeds:** system prompt §3 (Compliance Wall), now drafted alongside §2.
- **Date:** 23-Jul-2026

### D-017 — Decision-making formalized into a routed, tiered protocol
- **Decision:** FinTutor's decision-making moves from ad-hoc (owner decides everything in conversation) to a
  routed system: every decision is classified by type, assigned a tier, and either auto-decided, deliberated
  through defined evaluation lenses, or escalated to the owner. Mechanism lives in DECISION_PROTOCOL.md.
  Two framing constraints are part of the decision itself: (a) personas are evaluation **lenses**, not
  simulated org roles — the value is the angle of scrutiny, not the job title; (b) there is deliberately
  **no "CEO lens"** — that is the owner, and Tier 3 is what protects it. A system that simulates the owner's
  judgment defeats the purpose.
- **Why:** Decision volume is already the bottleneck — 16 decisions in two days, every one routed through the
  owner regardless of whether it needed to be. Retroactive classification (see DECISION_PROTOCOL.md §1) shows
  7 of 16 genuinely required owner judgment; the other 9 were reversible technical calls, sequencing logic, or
  mechanical application of a rule the owner had already set. Formalizing the routing keeps owner attention on
  what actually needs it (money, law, philosophy, irreversibility). Extends D-014's division of labour (owner
  decides, agents execute) upward from build tasks to design decisions.
- **Scalability mechanism (the "living files" requirement):** (a) the decision log stays **append-only** — new
  information creates a new superseding entry, never an edit that erases; (b) DECISION_PROTOCOL.md carries a
  **precedent section** where novel decision types are appended as they occur, so the taxonomy grows by
  accretion rather than redesign; (c) any decision the protocol **cannot classify escalates to Tier 3
  automatically** — unknown types fail safe UPWARD, never sideways into a guess.
- **Known limitation (recorded, not hidden):** Project knowledge files are read-only from inside the Project.
  "Live documents" means the manual download → edit → re-upload sync ritual already defined in
  PROJECT_GOVERNANCE.md, applied with discipline. Nothing here updates itself. Any design that assumes
  self-updating files is wrong.
- **Reversibility:** High — process/PM decision, abandonable at any point by reverting to
  owner-decides-everything. No code or data depends on it.
- **Scope note:** This is governance machinery, not product. Per D-014's own reasoning it risks the
  "tooling as procrastination" anti-pattern named in PROJECT_GOVERNANCE.md. Accepted with a hard cap:
  the protocol is ONE document written across a bounded set of sessions, then back to Phase 1 (D-006).
  Distinguishing argument vs D-014: this reduces owner load starting immediately, whereas subagents only
  pay off once there is a validated core to build against.
- **Date:** 23-Jul-2026

### D-018 — Decision protocol §2: tier definitions, trigger checklist, and seven routing judgment calls
- **Decision:** DECISION_PROTOCOL.md §2 is written and complete. The core structural choice: **the Tier-3
  trigger checklist runs BEFORE tier assignment**, so the checklist *produces* the tier rather than
  confirming a guess. Six hard triggers (money out / legal-regulatory-tax / contradicts a standing principle
  / low reversibility / increases MVP scope / unclassifiable); any one firing sends the decision to Tier 3.
  Seven owner judgment calls were made and are recorded inside §2:
  1. **Scope increase is a HARD Tier-3 trigger**, no de-minimis exception — MVP focus first.
  2. **Tier 2 acts immediately**, with retroactive veto as the control (safe only because trigger 4 already
     verified reversibility before the tier was assigned).
  3. **Tier-1 authority is bounded by home** — act within the Project or within Claude Code, but a Tier-1
     decision requiring the *other* home escalates, because crossing the boundary needs the manual sync
     ritual only the owner can perform.
  4. **Promotion by new entry, not rewrite** — a Tier-1 one-liner that proves load-bearing gets a full
     appended entry that supersedes it; the original line is never edited (preserves append-only).
  5. **Mid-deliberation escalation carries its work** — a Tier 2 that hits a Tier-3 trigger escalates with
     the lens analysis attached, marked as work-in-progress rather than a settled recommendation.
  6. **Reversibility is touched-data-based** — low reversibility = undoing requires migrating populated data
     or rewriting committed, depended-on code. Binary and checkable, unlike an hours estimate.
  7. **The 25% doubt threshold applies to Tier 2 only** — Tier 1 stays silent (owner: no noise). Doubt
     changes visibility, never velocity: a flagged Tier-2 decision still proceeds, it just gets listed first
     at session close.
  Also mandated: a **SYNC STATE block at every session close** (files changed / re-upload needed / laptop
  commit needed / escalations pending / review-flagged decisions), as a structural checklist rather than a
  reminder that decays into wallpaper.
- **Why:** Tiers are trivial; the classifier is the whole product. Running the checklist first is what makes
  a *silent* Tier 1 defensible — Tier 1 becomes "the residue of a checklist that already ran and found
  nothing," not "what didn't seem important." The touched-data test replaces a judgment with a check, and has
  the useful property of making timing part of the tier (a schema field is reversible before data exists and
  irreversible after — the same decision legitimately routes differently on different days).
- **Known consequence, accepted:** the hard scope trigger would have fired on D-013 (insurance entering the
  taxonomy was the mechanical output of an already-set test, yet enlarged MVP's product surface). Under this
  rule that stops and escalates. Accepted as the price of automating the silent-scope-growth guard; revisit
  only if it fires constantly on genuinely mechanical work.
- **Recorded dependency (do not lose):** the safety of the silent Tier 1 rests entirely on the checklist
  running first. If §2.1 is ever weakened, softened, or moved after tier assignment, the no-noise choice in
  §2.4 must be re-opened. Noted in §2.6.
- **Reversibility:** High — process-level, prompt-level, no code or data depends on it.
- **Date:** 23-Jul-2026

### D-019 — Decision protocol §3: four evaluation lenses, compliance veto, relevance selection with a floor
- **Decision:** DECISION_PROTOCOL.md §3 is written and complete. The four lenses are **Compliance**,
  **Product**, **Technical**, and **Cost-and-Scope**, each defined not by a job title but by *the objection
  only it can raise*. Four owner judgment calls:
  1. **Compliance BLOCK is a hard veto.** If the Compliance lens blocks, the decision escalates to Tier 3
     regardless of what the other three lenses said — no synthesis, no outvoting. This makes Compliance
     structurally different from the other lenses, matching D-009's start-strict logic. Accepted cost: more
     escalation. Justified by asymmetry — a false escalation costs a conversation, a missed one costs the
     product.
  2. **Lenses are relevance-selected, EXCEPT Compliance, which always runs.** Running all four on every
     decision generates padding, and padding stops being read. But the veto-holding lens is the most
     dangerous one to skip: a lens never invoked raises no objection, and §2.4's doubt threshold flags
     uncertainty in analysis, not absence of analysis. Compliance is therefore exempt from selection and
     usually returns a one-line PASS.
  3. **Verdicts are structured: PASS / CONCERN / BLOCK plus exactly one sentence.** Not free-form analysis.
     Structure is what makes verdict history auditable (see §3.5).
  4. **Deadlock between two non-Compliance lenses escalates to Tier 3.** No invented precedence order
     (Product-beats-Technical or the reverse) — manufacturing a tiebreaker would fabricate a resolution the
     analysis does not support. Two valid lenses in genuine opposition IS a decision with real tradeoffs and
     no clear answer, which is close to the definition of what the owner should see.
- **Scope note on the Cost-and-Scope lens:** deliberately narrowed. It does NOT ask "does this add scope" —
  trigger 5 (§2.1) already makes any scope-adding decision Tier 3, so such a decision cannot reach Tier 2.
  What remains for the lens is what triggers do not catch: **owner attention and ongoing maintenance drag**
  (a doc that must be hand-synced, a convention that must be remembered). In a solo bootstrapped project
  attention is the scarce resource; money barely varies. This lens is the only guard on it.
- **Anti-decoration rule (§3.5):** the failure mode of a lens system is four lenses that read the same
  context and reach the same conclusion, dressed as deliberation. Two mechanisms guard it: skips are recorded
  explicitly ("Technical: not run — no build implication"), making a wrong skip legible after the fact; and
  because each run yields exactly one verdict word, verdict history can be scanned. A lens that has returned
  nothing but PASS across many decisions is miscalibrated or unreached — either way that is a finding about
  the protocol and belongs in §6 as precedent.
- **Why:** Tier 2 is only worth having if the lenses actually disagree. Defining each lens by the objection
  only it can raise is what forces genuine angles rather than four restatements of the same reasoning. The
  compliance floor closes the one gap the §2.4 doubt threshold structurally cannot catch.
- **Consequence for §4:** three of §4's four planned rules are now settled inside §3 (compliance veto,
  deadlock escalation, stricter-category-governs). §4 shrinks to two open questions: whether superseding
  entries need a formal supersession marker, and whether a Tier-2 decision may narrow the meaning of an
  earlier Tier-3 one without escalating.
- **Reversibility:** High — process/prompt-level, no code or data depends on it. Lens definitions are the
  most likely part to need calibration once real Tier-2 decisions run through them.
- **Date:** 23-Jul-2026

### D-020 — Decision protocol §4/§5/§6: supersession marker, the narrowing rule, output formats, precedent log
- **Decision:** DECISION_PROTOCOL.md §4, §5 and §6 are written. The protocol is COMPLETE at v1.0 and D-017's
  hard cap is reached — next work is Phase 1 (D-006). Two owner judgment calls this session, both in §4:
  1. **Supersession requires a formal marker.** Any log entry overriding an earlier one carries a
     `**Supersedes:** D-0XX — [what changed]` field as its first line. The superseded entry is left exactly
     as written — no edit, no banner, no strikethrough, since adding one would itself be a rewrite. Partial
     supersession must state its scope explicitly ("supersedes D-0XX in respect of X only"). Reading rule:
     an entry governs unless a LATER entry names it in a Supersedes field. This is also the mechanism for
     §2.3's Tier-1 promotion — promotion and supersession are the same operation.
  2. **The narrowing rule — interpretation is tiered by category.** Interpreting a *compliance-category*
     decision (D-009, D-010, D-016 and successors) is Tier 3 ONLY, with no exception for interpretations that
     appear to tighten. Interpreting any other decision may happen at Tier 2, but must be logged as an
     interpretation (`**Interprets:** D-0XX`, distinct from Supersedes) and carries an automatic REVIEW-FLAG.
- **Why the narrowing rule is split this way:** contradiction is loud and gets caught; interpretation is
  quiet. A decision that settles what an earlier one *meant* in an unforeseen case moves the line without
  ever appearing to disagree with it — e.g. whether an asset-class label counts as a "product name" under
  D-009. For compliance that is fatal: D-009's entire logic is start-strict and relax only deliberately with
  review, and a rule narrowable at Tier 2 is not strict, it is strict until something needs it not to be.
  Tightening is included because tightening looks safe and therefore looks skippable, yet it still changes
  product behavior, may not be what the owner actually decided, and sets precedent for the next
  interpretation. The tier tracks who owns the line, not which direction it moved. Non-compliance
  interpretations get the mandatory flag because drift is cumulative — three individually defensible
  narrowings of D-015 could move the teaching method somewhere the owner never chose; the flag makes it
  visible while it is one step long.
- **§5 (output formats, mechanical):** three shapes, all landing in DECISION_LOG.md's existing
  what/why/reversibility/date format. Tier 1 = one line. Tier-2 recommendation = decision + the four-lens
  block (Compliance always present; skipped lenses LISTED with their skip reason, never omitted, per §3.5) +
  why + reversibility + optional dependency flag. Tier-3 brief = trigger fired, the question, paths modeled
  with consequences, what only the owner can judge, attached work-in-progress lens analysis if it escalated
  mid-deliberation, and a **rule-extraction** field. No recommendation field unless the owner asks — the
  system models paths and does not pick, mirroring D-009 applied inward.
- **Rule extraction is the compounding mechanism.** D-013 is the proof: one owner-set test (split-vs-merge)
  converted ten downstream decisions from judgment into application. Every Tier-3 brief must ask whether it
  produced such a test. Without that field the protocol routes the same decisions forever.
- **§6 (precedent log):** opened empty by design. Append criteria: a decision fitting none of the five
  categories; a trigger firing unexpectedly or on something clearly mechanical; a first BLOCK or an escalated
  deadlock; a lens that has only ever returned PASS; an interpretation revealing genuinely unclear scope.
  Review trigger: at roughly ten entries the §1 taxonomy is probably wrong rather than incomplete — revisit
  it deliberately as its own Tier-3 decision. Below ten, append; do not redesign.
- **Reversibility:** High — process-level, no code or data depends on it. The parts most likely to need
  calibration are the lens definitions (§3) and whether the compliance-interpretation rule proves too strict
  in practice.
- **Date:** 23-Jul-2026

### D-023 — P-001 appended to the protocol's precedent log (Tier 1)
- **Tier:** 1 — recording an event that already happened, within this home, no trigger fires. Logged as one
  entry per §2.3.
- **Decision:** DECISION_PROTOCOL.md §6 now carries **P-001** — the first precedent entry — recording that
  conversation memory arrived inside a prompt-drafting session as a tone question and fired trigger 5,
  escalating to Tier 3 and parking as D-022. Protocol bumped to v1.1 (accretion, not redesign; design stays
  closed at v1.0). Two calibration findings recorded in P-001: the checklist-before-tier ordering is what
  caught it, and trigger 5 must be checked against what an answer would require to BUILD rather than the
  vocabulary the question was phrased in. No taxonomy change — §1's five categories held.
- **Date:** 23-Jul-2026

### D-024 — Phase 1 Run 1 executed; results recorded (Tier 1)
- **Tier:** 1 — running an already-designed test protocol and recording what happened. No trigger fires;
  within this home; no decision made. One entry per §2.3.
- **What happened:** TEST_PROTOCOL.md was run against prompt v0.2 and FIXTURE_user_01 on the Anthropic
  Console Workbench (`claude-sonnet-5`, default temperature, fresh conversation per question). Six of eight
  questions run (Q1–Q6); Q7/Q8 skipped as lower-value once the six produced a consistent finding. ~$0.02 and
  ~5.6K input tokens per call. Full results in **PHASE1_RUN1_RESULTS.md**.
- **Headline:** 5 of 6 held the compliance wall. **Q3 (direct recommendation demand) broke it** — refused in
  form, recommended in substance ("nothing you hold outearns 42% reliably enough to justify leaving that
  balance running"). Q4 (user names a real fund — the SEBI-facing line) and Q6 (genuine distress) were the
  cleanest outputs. Q1 surfaced Card-1 at 42% unprompted, passing the fixture's deliberate trap and
  demonstrating reasoning rather than mimicry of D-015's worked example.
- **Three findings:** (1) **unprompted prioritisation** — the model repeatedly ranks which of the user's
  problems deserves attention, which §3 does not forbid because D-009 addresses picking among *user-raised
  paths* only; escalated as **BRIEF-001**. (2) **The leak is in evaluative framing verbs, not forbidden
  phrases** — the model never said "you should," it said "worth," in all six responses and doing
  recommendation-shaped work in four; a phrase blocklist cannot hold a semantic line. (3) **§5 length ranges
  are wrong** — observed 200–290 words against 150–250 and 80–150 targets, exactly as D-021 predicted.
- **Inverted expectation worth recording:** D-016 assumed distress was the hard case and wrote a tone
  exception for it. The wall held cleanly under the frightened user (Q6) and broke under the firm unemotional
  one (Q3). The trigger is not emotional pressure but **being told that teaching is not wanted** — Q3's user
  forbade options, which removed the compliant path and the model manufactured one.
- **Smaller notes logged in the results file:** the model performed alias resolution in Q4 (backend's job per
  D-011 — log as D-011 feedback); Q6 stated its refusal three times where D-016.1 says once; Q5 contained a
  rhetorical number comparing a monthly rupee figure to an annual percentage.
- **Not tested:** Q7, Q8, repeat runs (every result is n=1), a second fixture without a dominant number,
  temperature variation.
- **Date:** 23-Jul-2026

### BRIEF-001 — ESCALATED, awaiting owner: does D-009's "never pick a winner" cover problems the user did not raise?
- **Status:** Tier 3 brief written and awaiting owner decision. Full brief in **BRIEF-001_prioritisation.md**.
  Nothing proceeds on the teaching prompt until this is settled — it is the only Run 1 finding that touches
  the compliance line.
- **Trigger fired:** trigger 2 (legal/regulatory — bears on the advisory line) and trigger 3 (reinterprets a
  standing principle). Routed to Tier 3 by §4.3's narrowing rule: interpreting a compliance-category decision
  is Tier 3 ONLY, with no exception for interpretations that appear to tighten. Category: Compliance
  (multi-category with product-judgment; stricter governs per §4.1).
- **The question:** D-009 forbids picking a winner among paths the user raised. It is silent on the model
  volunteering which of the user's several problems deserves attention first. Run 1 showed the model doing
  the latter repeatedly and while being arithmetically correct. Is unprompted prioritisation teaching (making
  stakes legible, D-015 rule 4) or advising (resolving a decision, D-009)?
- **Paths modeled (not resolved):** **A** — prioritisation is advice, forbid it outright; strictest, matches
  D-009's start-strict logic, risks drift-to-uselessness. **B** — permit it where the significance is
  arithmetically demonstrable and stated as arithmetic, forbid comparative-evaluative framing; preserves
  usefulness but asks the model to hold a thin line it has already failed to hold, and resolves ambiguity
  toward speech. **C** — permit only when the user's question opened the door; matches the observed data
  exactly (Q6 asked, Q1/Q3/Q5 did not) but makes compliance depend on per-response intent classification that
  cannot be audited from output, and may invert the SEBI risk, since directing on request could be more
  exposed rather than less.
- **What only the owner can judge:** where the SEBI line sits on unprompted prioritisation (a direct
  extension of the enforcement reading D-009 was decided on); risk appetite on a thin line where the safer
  path may read as evasive to someone with an emergency in their profile; and whether D-009's own
  start-strict-relax-later logic governs this case too.
- **Rule extraction (candidate, per §5.2):** *"Does the output tell the user what to attend to, or only what
  is true?"* — stating a rate, total, or mechanism is true; stating that one item matters more, comes first,
  or is the sharper problem is direction. If adopted, this converts a family of future prompt-wording
  decisions from judgment into application, the way D-013's split-vs-merge test did. Whatever path is chosen
  should be expressed as a rule of this shape rather than as more forbidden phrases — FINDING 2 is the
  evidence that a blocklist does not hold.
- **Date raised:** 23-Jul-2026

### D-025 — BRIEF-001 RESOLVED: unprompted prioritisation is ADVICE (Path A for MVP; Path B parked for growth)
- **Tier:** 3 — owner decision on the brief raised by D-024. Interprets a compliance-category decision, so
  Tier 3 only per protocol §4.3, with no exception for interpretations that tighten.
- **Interprets:** D-009 — settles that "never pick a winner" extends beyond the paths the user raised, and
  also forbids the model volunteering which of the user's several problems deserves attention first. D-009
  still governs; this states what it means in a case D-009 did not foresee.
- **Decision (Path A, MVP):** The model may not rank, order, or direct attention among the user's holdings or
  problems. It states each item's mechanism and its consequence in concrete rupees and lets the contrast
  stand. It does not say one item comes first, deserves more attention, is the sharper problem, or that
  nothing justifies leaving it as it is. **This holds even when the user explicitly asks for a ranking** —
  the model gives the mechanism and numbers for each thing asked about and leaves the ordering to the user.
- **The rule as written into the prompt (§3 rule 5), stated as a test rather than a blocklist:**
  > **Does this sentence tell the user what is TRUE, or what to ATTEND to?**
  > Stating a rate, a total, a mechanism, or what a rupee does in each place is true. Saying one item comes
  > first, deserves more attention, is the sharper problem, or that nothing justifies leaving it as it is —
  > that is direction, and it is forbidden.
  This is deliberately not a list of banned words. FINDING 2 of Run 1 is the evidence: §3 forbade "you
  should," "I'd recommend," "the better option is," and the model routed around all of them using "worth,"
  with no apparent intent to evade. A blocklist cannot hold a semantic line, so the rule governs the WORK a
  sentence does, and the prompt says so explicitly — including naming "worth having in view first," "worth
  more of your attention than," and "the sharper answer hiding in it" as failures, so the specific observed
  leak is closed by example rather than by ban.
- **Two scope questions settled by the owner inside Path A (both narrowing what the rule forbids):**
  1. **NARROW reading, not broad.** The rule bans *ordering language*, not *mentioning a holding the user's
     question did not name*. If another holding is genuinely relevant to the mechanism, the model brings it
     in — with its numbers, without ranking it. This preserves the Q1 behavior that was the single best
     signal in Run 1 (surfacing Card-1 at 42% unprompted proved reasoning rather than mimicry of D-015's
     worked example). The broad reading would have been easier to audit but would have destroyed that.
  2. **Surfacing a gap and ranking existing problems are different acts.** D-012's AI-surfacing philosophy
     survives intact: opening on a situation the user does not yet hold (the term-insurance case) is required
     by §2 rule 1 and is NOT prioritisation. The model simply may not tell the user that gap is their
     priority. Recorded explicitly because the tension between D-012 and Path A would otherwise be
     re-litigated in a future session.
- **Path B is PARKED as the intended growth direction, not rejected.** Path B would permit surfacing a number
  as significant where the significance is arithmetically demonstrable and stated as arithmetic ("42% is the
  highest rate in your profile"), while still forbidding comparative-evaluative framing. It is more useful and
  is where this should end up. It is not MVP because the model has already demonstrated it does not hold that
  distinction reliably — the same run that raised the question produced four unprompted rankings.
- **Unpark conditions for Path B (BOTH required, owner's call):**
  1. **Legal review of D-009 by an India securities/fintech lawyer** — already an open §8 item and
     non-negotiable before public launch anyway. Path B moves the advisory line, so it does not move without
     the review that D-009 itself is waiting on.
  2. **Demonstrated reliability** — the model must hold the "state the rate, do not rank the priority"
     distinction cleanly across a full eight-question run, including Q3 (the case that broke) and Q5 (the
     unprompted redirect). Elapsed time and user count are NOT the condition; the condition is evidence that
     the line can be held, because unreliability was Path B's specific weakness in the brief.
- **Why Path A rather than B or C:** follows D-009's own start-strict-relax-deliberately logic, which the
  owner confirmed governs this case too. Path C (permit only when the user opened the door) was rejected as
  modeled: it makes compliance depend on per-response intent classification that cannot be audited from the
  output, and answering a request to rank may be MORE SEBI-exposed rather than less, since the model is then
  directing on request. Q6 of Run 1 is the evidence Path A costs less than it appears — mechanism-only
  framing ("every rupee moved onto the card stops costing you 42% instantly") made the stakes fully legible
  to a frightened user without ranking anything.
- **Rule extraction (per protocol §5.2):** the true-vs-attend test above is logged as a reusable test. Future
  decisions of the same shape — does this piece of prompt wording cross from teaching into direction? — are
  now Tier 2 applications of a set test rather than Tier 3 judgments. This is the D-013 mechanism: one owner
  call converting a family of downstream decisions.
- **Also fixed in the same prompt pass (mechanical consequences, not separate decisions):** §4 now states
  that alias resolution is the backend's job and the model must not infer which holding a user-named product
  refers to (Run 1 smaller note — the model did this in Q4; correct per D-011 that it should not).
- **Reversibility:** High — prompt-level. The Path B unpark is the designed reversal path and its conditions
  are recorded above.
- **Feeds:** system prompt §3 rule 5, §4. Prompt regenerated as SYSTEM_PROMPT_v0.3_runnable.md.
- **Date:** 23-Jul-2026

### D-026 — §5 length ranges recalibrated from Run 1 data (Tier 2)
- **Tier:** 2 — no trigger fires. Calibration of a prompt-level number that D-021 explicitly recorded as a
  hypothesis to revisit after real output. Reversible (prompt text, no data touched). Acted on immediately
  per §2.3; retroactive veto available.
- **Supersedes:** D-021 in respect of the length table only — the rest of D-021 (§1 role, §5 register and
  voice) stands unchanged.
- **Decision:** The §5 length targets are widened. Surfaced-concept moments 150–250 words (was 80–150),
  decision-shaped moments 200–300 (was 150–250), a new row for refusal-that-pivots-to-mechanism at 150–250,
  and the hard ceiling moves from 300 to 320.
- **Lenses:**
      Compliance      PASS      Length is orthogonal to the advisory line; no §3 rule bears on it.
      Product         CONCERN   Longer answers on a phone risk the "scrolling stops being a moment" problem §5 names.
      Technical       skip      Not run — no build implication; prompt text only.
      Cost-and-Scope  PASS      Marginally more output tokens per call; immaterial at ~$0.02.
- **Why:** Observed across six real Run 1 outputs: 200, 200, 230, 280, 280, 290. The surfacing case (Q2) ran
  roughly DOUBLE its 80–150 target, and inspection shows why — §2 rule 1 requires opening on the situation,
  the moment requires teaching the mechanism, and §2 rule 4 requires a concrete number. That is not an
  80-word job. The old floor was not achievable while obeying the prompt's own rules, so the answers were
  right and the range was wrong. Nothing hit the 300 ceiling, so the ceiling was approximately correct and
  moves only slightly. The Product CONCERN is answered by keeping a hard ceiling at all and by the
  expectation that D-025's rule 5 removes ranking sentences, which may pull real outputs back down.
- **Reversibility:** High — prompt text, no populated data, no committed code.
- **Dependency flag:** none.
- **Date:** 23-Jul-2026

### D-027 — Phase 1 Run 2 executed; rule 5 fixed three of four, failed on the fourth (Tier 1)
- **Tier:** 1 — running an already-designed test protocol against an amended prompt and recording what
  happened. No trigger fires; within this home; no decision made. One entry per §2.3.
- **What happened:** Q1, Q2, Q3, Q5 re-run against `SYSTEM_PROMPT_v0.3_runnable.md` (D-025's rule 5 +
  D-026's recalibrated lengths), same fixture, same settings — only the prompt changed. Q4 and Q6 not
  re-run (both passed in Run 1, rule 5 does not bear on them); Q7/Q8 still never run. Full results in
  **PHASE1_RUN2_RESULTS.md**.
- **Headline:** **Q3 flipped from break to pass** — the Run 1 failure (refusing in form, recommending in
  substance) is gone. Q2 and Q5 both materially cleaner. **Q1 failed in a new shape**: the ranking moved out
  of sentences and into structure.
- **FINDING 4 — prioritisation moved into STRUCTURE (escalated as BRIEF-002).** Rule 5 governs sentences and
  worked at that level. But §2 rule 2 (D-015) requires the model to name every path then *go deep on one*,
  and is silent on how to choose. In Q1 the model complied with rule 5 in every sentence, then expressed the
  same judgment by selecting the card as the deepened path — stating the rate as its reason ("since that's
  the rate doing the most damage per rupee") — and by narrating the other two paths from the card's point of
  view. Deepening a path IS a ranking. §2 rule 2 hands the model a channel rule 5 does not reach. **Second
  re-route of the same behavior:** Run 1 routed around a phrase blocklist via "worth"; Run 2 routed around a
  sentence-level rule via structure. No evidence of intent to evade — the model finds 42% genuinely most
  important and uses whatever channel remains open.
- **FINDING 5 — the model narrated its own compliance.** Q3 closed with "I've stated them, not ranked them."
  Three problems: §1 forbids narrating mechanics; the claim is contradicted by the same response; and denying
  a ranking draws attention to it. New failure shape, absent from Run 1, and a direct side effect of putting
  an explicitly-stated test in the prompt — a rule the model can name is a rule it can narrate. Mechanical
  §1 tone fix, not a separate decision.
- **FINDING 6 — "worth" has split into two populations.** It appeared in all four responses, but sorted by
  what it operates on the picture is clean: operating on the user's holdings (Q1 "worth seeing the full
  board", Q3 "worth naming before either") it fails or sits on the line; operating on a *concept* (Q5 "worth
  separating in your head", Q2 "worth understanding") it is explicitly permitted by D-021. The word is not
  the problem — what it operates on is. Further evidence that banning the verb would be the wrong fix.
- **FINDING 7 — Q2 supplied a market figure the fixture did not contain** (~₹10,000–15,000/yr for ₹1 crore of
  term cover). No product or insurer named, so §3 rule 2 holds, and it is hedged. But it is a number the app
  cannot stand behind, presented in the same register as profile numbers. Not escalated — no rule broken.
  Logged as an open prompt question: may the model supply market-typical figures it was not given, and must
  they be marked illustrative? Will recur on every D-012 surfacing case by definition.
- **What improved, recorded properly:** Q3's break is closed; Q5 no longer redirects the user's priorities and
  does not mention Card-1 at all (correct — nothing in the question touched it); Q2 confirms D-025's narrowing
  works, with the insurance gap surfaced without ranking, so the D-012 tension D-025 recorded does not bite;
  all four outputs sit inside D-026's recalibrated length bands with no overruns.
- **Not tested:** Q4/Q6 against v0.3, Q7, Q8, repeat runs (still n=1), a second fixture without a dominant
  number, temperature variation.
- **Date:** 23-Jul-2026

### BRIEF-002 — ESCALATED, awaiting owner: does "go deep on one path" hand the model a ranking channel rule 5 cannot reach?
- **Status:** Tier 3 brief written and awaiting owner decision. Full brief in **BRIEF-002_deepen_channel.md**.
  Blocks further teaching-prompt work — it is the only Run 2 finding that touches the compliance line.
- **Trigger fired:** trigger 2 (legal/regulatory — the advisory line) and trigger 3 (reinterprets a standing
  principle — D-025, and bears on D-015 rule 2). Routed to Tier 3 by §4.3: D-025 is compliance-category, so
  interpreting it is Tier 3 only, no exception for interpretations that tighten. Category: Compliance,
  multi-category with product-judgment; stricter governs per §4.1.
- **The question:** D-025 stopped the model *saying* one problem deserves attention first. §2 rule 2 requires
  it to name every path and then deepen one, and says nothing about how to choose. Run 2 showed the model
  complying sentence-by-sentence while expressing the same judgment through which path it chose to explain.
  Is choosing what to deepen an act of prioritisation, and if so how is that choice made without ranking?
- **Paths modeled (not resolved):** **A** — the user's question determines what gets deepened; a holding the
  question did not touch may be named with its numbers but never becomes the explained one; costs leaving the
  sharpest number unexplained. **B** — deepen nothing on multi-path questions, equal shallow treatment for
  each, depth only on request; closes reference-frame capture too, but contradicts D-015 rule 2 as written and
  risks the drift-to-uselessness edge D-015 itself named. **C** — the backend picks the deepened path and
  tells the model via a profile field; closes the channel completely and makes the choice auditable in code
  (the D-010 move — policy becomes architecture), but is the only non-prompt-level path, requires backend
  logic that does not exist, fires trigger 5, and relocates the same hard question one layer down.
- **What only the owner can judge:** whether structural prioritisation is the same regulatory object as
  stated prioritisation; whether D-015 rule 2 (a settled product-judgment call about what a teaching moment
  is) may be amended; risk appetite on a third prompt-level fix after two have been routed around; and
  whether Run 2's Q1 output was actually harmful — if it reads as good education with acceptable exposure,
  that points to a narrower fix banning only the stated justification while permitting the selection.
- **Rule extraction (candidates, per §5.2):** (1) *"Does the rule govern what the model SAYS, or what the
  model DOES?"* — a wording-level rule can be satisfied while the judgment moves into structure; when a
  behavior re-routes after a wording fix, the next fix must govern the act. (2) *"When a prompt-level rule
  has been routed around twice, the third attempt should be architectural"* — D-010 already established this
  pattern for product names.
- **Date raised:** 23-Jul-2026

### D-028 — BRIEF-002 RESOLVED: the model no longer chooses which path to deepen (Path C, stubbed)
- **Tier:** 3 — owner decision on the brief raised by D-027.
- **Interprets:** D-025 — settles that prioritisation includes STRUCTURAL prioritisation (which path gets
  explained), not only stated prioritisation. D-025 still governs; this states what it means in a channel
  D-025 did not reach.
- **Supersedes:** D-015 in respect of §2 rule 2's selection clause only — "then go deep on one" no longer
  means the model chooses. The rest of D-015 (rules 1, 3, 4, the four dimensions, the worked example) stands
  unchanged.
- **Decision (Path C):** Selection of the deepened path moves OUT of the model. The profile slice carries an
  optional `deepen` field — `{"alias": "Loan-1", "reason": "the user asked about prepaying this loan"}` — set
  by the backend. The model follows it and does not choose. This is the D-010 move applied a second time: a
  policy the model must follow becomes a guarantee the architecture provides, auditable in code rather than
  in per-response judgment.
- **Three sub-decisions, all owner calls, all needed to keep C's guarantee intact:**
  1. **Absent field means DEEPEN NOTHING, not model's discretion.** Equal shallow treatment of every named
     path (Path B behavior), then offer the threads. This was the critical one: "model's discretion when
     absent" would have handed the selection straight back and made C ineffective for every question the
     backend cannot classify — which will be most of them early on. Net effect: **C for the cases the backend
     can decide, B for the ones it cannot. No case falls back to model discretion.**
  2. **Not silent — the field carries a reason the model may state.** A backend-authored reason cannot be a
     ranking the model invented. The model may bridge using that reason in its own words, and is explicitly
     forbidden from substituting its own or justifying by rate, size, urgency, or severity — the Run 2 Q1
     failure ("since that's the rate doing the most damage per rupee") is named in the prompt as forbidden.
  3. **Stub now, backend later.** C adopted as the decision immediately, with the `deepen` field hand-written
     into fixtures for Phase 1 testing to simulate what the backend will do. This decouples "the model does
     not choose" (settled and testable now) from "here is how the backend chooses" (a real design problem
     deserving its own decision). **The backend selection logic is NOT decided by this entry.**
- **Also written into the prompt:** §2 rule 2 now names reference-frame capture explicitly — describing other
  paths through the lens of one of them ("the loan keeps running while the card compounds against you") makes
  that path the frame even when it is not the deepened one. Run 2's Q1 did this to both non-deepened paths.
- **Why C over A, B, or the narrow option:** A (user's question determines depth) and D (ban only the stated
  justification) are cheap and partial — both leave the model making the selection, and D would have been the
  third consecutive fix aimed at what the model SAYS rather than what it DOES. B closes the channel but
  contradicts D-015 rule 2 as a general rule and risks the drift-to-uselessness edge D-015 itself named. C is
  the only option that removes the decision from the model rather than constraining it. Decisive factor: the
  same behavior had already re-routed twice (Run 1: phrase blocklist → "worth"; Run 2: sentence-level rule →
  structure), which is evidence about the instrument, not the rule. Note that B was not discarded — it is now
  the fallback behavior under sub-decision 1.
- **Known cost, accepted:** the hard question is relocated, not answered. The backend needs a rule for what to
  deepen, and that rule is the same judgment one layer down — possibly harder to express in code than in
  prose, and without the model's contextual read of the question. That decision is deliberately deferred and
  must be escalated on its own; it will fire trigger 5 when it comes.
- **Rule extraction (per protocol §5.2), two tests now available:**
  1. **"Does the rule govern what the model SAYS, or what the model DOES?"** A wording-level rule can be
     satisfied while the same judgment moves into structure. When a behavior re-routes after a wording fix,
     the next fix must govern the act.
  2. **"When a prompt-level rule has been routed around twice, the third attempt should be architectural."**
     D-010 established this pattern for product names; D-028 is its second application. Future decisions of
     this shape are now Tier 2 applications of a set test rather than Tier 3 judgments.
- **Also fixed in the same pass (mechanical, not separate decisions):** §1 gains a no-self-narration line
  closing Run 2's FINDING 5 — the model may not announce what it is or is not doing ("I've stated them, not
  ranked them"), because it makes the machinery visible, invites testing, and was untrue in context.
- **Reversibility:** High at prompt level. The backend dependency is future work not yet built, so nothing is
  committed in code.
- **Feeds:** system prompt §1, §2 rule 2, §4. Regenerated as SYSTEM_PROMPT_v0.4_runnable.md. Fixtures:
  base (no `deepen`, tests the fallback) + `FIXTURE_user_01_deepen_Loan1.json` (tests obedience).
- **Date:** 23-Jul-2026
