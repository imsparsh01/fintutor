# FinTutor — Decision Log

> One entry per meaningful decision. Format: what / why / reversibility / date.
> Rule: a decision isn't real until it's here. Don't reopen a logged decision without new information.
>
> Starting at D-045 (see D-046): full write-ups live in `docs/decisions/D-0NN-slug.md`; entries
> below are a short index (title + one-line summary + link) instead of the full inline text.
> D-001–D-044 above this note are untouched and stay inline.

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

### D-029 — BRIEF-003 resolved: provenance rule for non-profile numbers (Path C)
- **Decision:** A number in a teaching moment has a provenance — it is either the user's (from the profile)
  or the genre's (typical/illustrative). Any figure not traceable to the profile is given as a **range,
  never a point estimate**, and the "typical, not yours" framing is built into how the range is introduced.
  The range itself carries the signal that it's a genre figure, not a personal fact. Adopted over Path A
  (per-sentence tagging — carries the FINDING 5 self-narration risk) and Path B (qualitative-only — pays too
  much of the D-012 surfacing usefulness the rule exists to protect).
- **Guard (binding, not optional):** the range must be tight enough to convey scale. A range so wide it
  conveys nothing ("₹5,000–₹1 lakh") fails §2 rule 4's legibility standard exactly as a buried number does —
  this is the D-015 drift-to-uselessness edge applied to ranges. Range-washing is the named failure mode and
  the prompt must close it by example.
- **Why Tier 3:** interpreting what numbers the app may assert is compliance-category (protocol §4.3),
  owner-decided. Owner explicitly reaffirmed no deviation from tier assignment at decision time.
- **Supersedes:** nothing. Additive to §2 rule 4 and §5.
- **Rule extracted (compounds protocol):** a rule that introduces a number must state that number's
  provenance; silence about an adjacent channel is the FINDING 1/4/7 error class — the third occurrence of a
  prompt rule governing one channel while staying silent about an adjacent one.
- **Reversibility:** High — prompt-level text, tunable in Phase 1 testing.
- **Feeds:** TEACHING_SYSTEM_PROMPT.md §2 (new rule 5) and §5 (typical-figure phrasing example). Runnable
  regeneration to SYSTEM_PROMPT_v0.5_runnable.md is build-home work, queued as BQ-005 (pending laptop repair).
- **Date:** 25-Jul-2026

### D-030 — Product principles established; Product lens given substantive content; product decisions become routable
- **Tier:** 3 — a meta-decision that encodes the owner's product judgment so that future product decisions
  can be routed without the owner. The most owner-only kind of decision there is: it defines what may later
  bypass the owner. Content is the owner's; the system's role was extraction and structuring.
- **Decision:** A new file, **PRODUCT_PRINCIPLES.md** (v1.0), holds FinTutor's substantive product point of
  view as a set of usable tests. Founding four, all extracted from decisions already made (not invented):
  **P1** don't ask — infer/surface/defer (D-012); **P2** teach never advise, the line is what the output
  *does* not what it *says* (D-009/D-025/D-028); **P4** start strict, relax deliberately (D-009/D-025);
  **P6** the user sees their real world, only the model sees the masked one (D-010/D-011). The Product lens
  (DECISION_PROTOCOL §3.1) now reads against this file instead of an informal feel.
- **The routing rule (DECISION_PROTOCOL §3.7):** a product decision cleanly resolved by an existing
  principle is Tier 1 — applied and logged, not escalated. Owner is asked only when (1) two principles
  conflict, (2) none covers the decision, or (3) the decision would set or amend a principle. This is what
  the owner asked for — "only critical decisions reach me."
- **Guardrail (owner-set, mirrors D-018's silent-Tier-1 dependency):** the routing rule does NOT suspend the
  §2.1 checklist. It applies at the same point every Tier-1 determination does — after the checklist runs and
  finds nothing. A principle-covered decision that trips any trigger is not Tier 1. Specifically, P2 is a
  compliance object: any decision touching where the advisory line sits fires trigger 2 → Tier 3, regardless
  of P2 appearing to resolve it. Every principle-application is logged and carries the Tier-2 retroactive
  veto, so nothing decided this way is invisible or irreversible-on-review.
- **Two placements settled during extraction (owner calls):**
  1. The "routed around twice → third fix is architectural" candidate is NOT a product principle — it governs
     how the project fixes things, not how the app behaves. Placed in DECISION_PROTOCOL §6 as precedent
     **P-002** (pattern from D-010, D-028).
  2. "Depth is rationed, visibility is not" is teaching-scoped, not app-wide. Placed in
     TEACHING_SYSTEM_PROMPT §2 as a named teaching principle (it already existed as rule 2 behaviour; now
     labelled), not in PRODUCT_PRINCIPLES.md.
- **Why the founding set is small and code-adjacent:** every principle was extracted from real
  teaching-engine and compliance decisions. The UX/UI surface is deliberately left unprincipled — no real UX
  decision has forced a principle yet, and inventing them in the abstract would violate the extraction
  discipline. Principles accrete as decisions reveal them, mirroring §6's empty-fills-by-accretion design.
- **Rule extracted:** a lens with no substantive content routes every decision in its category to the owner;
  giving a lens a set of tests is what converts that category from judgment to application. This is the
  D-013 mechanism applied to the Product lens itself.
- **Reversibility:** High — process/doc level, no code or data depends on it. The routing rule is the part
  most likely to need calibration; if principle-applications start producing owner disagreements on review,
  §3.7's "clean resolution" bar is the dial to tighten.
- **Feeds:** PRODUCT_PRINCIPLES.md (new), DECISION_PROTOCOL.md §3.1 + §3.7 + P-002 (v1.2),
  TEACHING_SYSTEM_PROMPT.md §2 (P5 label).
- **Date:** 25-Jul-2026

### D-031 — App structure: persistent category sections; MVP scope expanded (direction vs. build split)
- **Tier:** 3 — a scope decision (trigger 5, the hard no-de-minimis version from D-018). Fired inside a UX
  discussion, not announced as scope — the P-001 pattern (scope disguised as another conversation). Named and
  logged explicitly rather than absorbed.
- **Supersedes:**
  1. **D-012 in respect of the "not a menu / backend-internal taxonomy" clause only.** D-012 said the
     product-type taxonomy is NOT user-facing — no category sections, no "Add X" menu. That is narrowed: the
     app DOES have persistent, user-facing category sections (one per holding family), and a manual add/browse
     path into them. D-012's *primacy* commitment stands unchanged — AI-surfacing is still the primary path to
     populate a section; the menu/manual path is explicitly secondary. The narrowing is "not menu-FIRST," not
     "no menu." The rest of D-012 (AI-surfaced capture is core UX, applies to all types, manual is fallback)
     stands.
  2. **The MVP scope in PROJECT_SPEC §4/§5** — expanded (see below). Recorded as a real increase against the
     spec's own "keep ruthless" instruction and against P4 (start strict). The system flagged the tension; the
     owner decided the expansion is justified because tracking the user's whole financial picture is the
     product's point, and recorded the counter-discipline as the direction/build split below.
- **The decision has two layers, deliberately separated:**

  **Decided DIRECTION (the north star — recorded so it is not re-litigated, NOT all in MVP):**
  - Six holding families under Layer A ("things the user holds"): **Investments, Loans, Insurance, Real
    estate, Cash & bank balances, Alternatives/other** (gold, crypto, ESOPs, startup equity…).
  - Two Layer-B objects ("things the user does"), which are NOT products and behave differently — they
    reference holdings rather than being holdings: **Budgeting / cash-flow** and **Goals & planning**.
  - **Per-item management** — each holding visible in its section with its details, and user actions on it.
  - Persistent dedicated section per category is the structural pattern; AI-surfacing and manual entry are two
    ways to populate the same sections. AI confirmation ("yes, I have a loan" + details) creates a real
    tracked holding in its section, not just model context.

  **MVP BUILD (the ruthless cut — what actually gets built for Phase-1-era MVP):**
  - **Three** holding families only: Investments, Loans, Insurance (D-013 unchanged — no new schema).
  - **Plus** Budgeting/cash-flow and Goals & planning — included because the owner judged them critical AND
    because they are FOUNDATIONAL (they change the data model every other object reads from, so deciding them
    before build prevents rework — unlike extra product families, which are cheap to add later).
  - **Plus** per-item management (depth still to be decided — see open item / Decision 2 below).
  - **Deferred to immediately post-Phase-1:** Real estate, Cash & bank, Alternatives. Rationale: these are
    more instances of the D-013 pattern, not new machinery, so they are cheap to add later and pointless to
    build before the teaching engine is validated on three families. Deferring them costs nothing and keeps
    the pre-validation build small.
- **Why the split is the right shape:** foundational work (goals/budgeting data model) is done before build
  because its cost is rework-if-deferred; additive work (more product families) is deferred because its cost
  is near-zero-if-deferred and pure-surface-if-done-now. Decide-before-build is reserved for what genuinely
  must be, per the spec's ruthless-scope instruction.
- **New work this creates (see §8):** (a) the budgeting/goals data model — how non-product objects sit in the
  baseline alongside product holdings (FOUNDATIONAL, do before build — "Decision 3"); (b) per-item management
  depth — the user's authority over a holding, per field: view / edit / delete / recategorize / correct
  AI-captured values ("Decision 2"); scoped now, designed after the goals/budgeting model exists and Phase 1
  yields one real section to react to; (c) the corrected UX principles section in PRODUCT_PRINCIPLES.md,
  written AFTER (a) and (b) because it extracts from them.
- **Rule extracted:** *direction and MVP-build are separate scopes and should be logged separately.* Recording
  a want as "direction" defuses the pressure to build it now, while still preventing it from being
  re-litigated. Future scope-expansion decisions use the same two-layer shape: what we're committing to
  eventually vs. what the next validated increment actually builds.
- **Reversibility:** Direction is cheap to revise (it is a recorded intention, nothing built). The MVP-build
  additions (budgeting/goals) touch the data model — medium reversibility once built, which is exactly why
  their model is being designed deliberately before build rather than discovered during it.
- **Feeds:** PROJECT_SPEC §4, §5, §8; PRODUCT_PRINCIPLES.md (UX section, pending); the budgeting/goals model
  session (next); D-012 (partially superseded).
- **Date:** 25-Jul-2026

### D-032 — FINDING 8 resolved: the open door may only lead to a room the user is already in (Path B)
- **Tier:** 3 — compliance-category (touches §3 rule 5's advisory-line test and D-012's Trigger A/B scope),
  owner-decided per DECISION_PROTOCOL §4.3 and PRODUCT_PRINCIPLES P2 (Product lens cannot resolve
  advisory-line questions on its own, however cleanly a principle seems to cover it).
- **What FINDING 8 was:** Q7 (a purely off-topic memory-claim question, BQ-001/Run 3) closed by volunteering
  the term-insurance gap unprompted, using "worth looking at" — the literal FINDING 2 phrase D-025 had
  already closed by example, resurfacing in a channel neither D-025 nor D-028 ever governed: an off-topic
  question, not an in-scope ranking.
- **Decision, and why it is NOT a P-002 case:** P-002 (routed-around-twice → go architectural) requires two
  real prior attempts at closing the *same* channel. D-025 closed ranking language *within* an in-scope
  answer; D-028 closed structural favoritism *among paths the user was already discussing*. Neither rule was
  ever pointed at "may the model open a new, off-topic thread at the end of an unrelated answer" — that
  channel had no rule at all, because D-031's Trigger-A/B scope narrowing (25-Jul-2026) was decided at the
  product/spec level and never transcribed into TEACHING_SYSTEM_PROMPT.md. This is a missing rule being
  written for the first time, not a rule being routed around a third time. P-002 does not apply; reaching for
  architecture (a backend gate) would be disproportionate to what the evidence shows.
- **Path chosen (B): tighten §2 rule 3 (the open-door offer) to be on-topic only** — not a new standalone
  Trigger-A/B gate (Path A), not a backend field (Path C). The open door may only name a thread the current
  conversation has already touched (a mechanism just explained, another named path, a holding already under
  discussion). It may never introduce an unheld gap or unraised topic as a closing offer. Gap-surfacing via
  `known_gaps` remains authorized, but only per §2 rule 1 (opening on a situation the user's own question
  puts them in) — never appended to an answer about something else.
- **Why B over A:** Q8's result (BQ-001, same run) is the deciding evidence. Q8 also closed with an open-door
  offer (Fund-A's compounding) and got it right — on-topic, number-free, correctly shaped. The model already
  knows how to make a well-formed offer when nothing pulls it off-topic; Q7's specific failure was not
  checking whether the offer was on-topic before making it. That is a narrower, more precise diagnosis than
  Path A's blanket "no surfacing on off-topic questions" gate, and the fix targets the exact mechanism that
  broke (rule 3) rather than adding new machinery beside it.
- **Why B over C:** no second attempt at this channel has failed yet — trying the narrowest correct fix
  first is what P-002 itself prescribes (escalate to architecture only after two routed-around attempts at
  the SAME channel). Skipping straight to a backend gate here would front-load architectural cost the
  evidence doesn't yet justify.
- **Held in reserve:** if a future run shows the model volunteering an unraised gap in a context Path B's
  on-topic constraint does not catch (e.g. a question that is finance-adjacent but should still not trigger
  surfacing), that is new evidence Path B is insufficient — the next step would be Path A's broader gate,
  and a second such failure on the SAME (now-narrowed) channel would make this a genuine P-002 case.
- **Rule extracted:** before invoking the "routed around twice → go architectural" precedent (P-002), check
  that the SAME channel was actually the target of both prior fixes — a new failure that merely *resembles*
  a past one in shape (ranking-adjacent language) is not automatically the same channel, and treating pattern
  resemblance as if it were repetition would over-apply P-002 and skip past cheaper, more precise fixes.
- **Reversibility:** High — prompt-level text, tunable in further Phase 1 testing (same standing as D-029).
- **Feeds:** TEACHING_SYSTEM_PROMPT.md §2 rule 3 (amended). Runnable regeneration to
  SYSTEM_PROMPT_v0_6_runnable.md is build-home work — new BQ item to be queued.
- **Date:** 01-Aug-2026

### D-033 — Two homes retired: single unified home (Cowork/Claude Code) replaces laptop=build / Claude Project=think
- **Tier:** 3 — contradicts/reshapes a standing principle (the orientation split itself, inherited into
  PROJECT_GOVERNANCE.md's "Laptop = build. Project = think.") and is low-reversibility in the sense that it
  changes how every future session is structured. Owner decision, made directly in conversation, not
  deliberated through the four lenses (no Compliance/Product/Technical/Cost-and-Scope tension here — this is
  a pure process/infrastructure call).
- **Interprets/retires:** the orientation block in PROJECT_SPEC.md §0 (laptop/Claude Project split), and the
  "two homes" framing throughout PROJECT_GOVERNANCE.md and CLAUDE.md. D-017's "known limitation" (Project
  files are read-only from inside the Project; sync is a manual download/upload ritual) is the specific
  constraint being retired — it no longer holds.
- **What changed:** the owner moved from (a) a separate Claude Project holding PROJECT_SPEC.md,
  DECISION_LOG.md, DECISION_PROTOCOL.md, PROJECT_GOVERNANCE.md as read-only Project knowledge, manually
  synced with the laptop repo, to (b) Cowork pointed directly at this same repo, meaning every governance
  file and every build file live in one place, readable and writable by the same session. The technical wall
  that made "laptop = build, Project = think" enforceable by access alone is gone.
- **Decision:** Adopt a single unified home. One repo, one tool, covering both build work and strategy/
  compliance/decision work. The discipline the two-home split protected — bounded, mechanical execution kept
  separate from deliberate, slow decision-making on money, compliance, and irreversible calls — is preserved,
  but now self-enforced via the tiered decision protocol (DECISION_PROTOCOL.md) and CLAUDE.md's
  file-permission lanes, rather than via a hard technical access boundary.
- **What this changes downstream (mechanical consequences of this entry, not separate decisions):**
  1. PROJECT_SPEC.md's ORIENTATION block rewritten to describe the single-home model.
  2. CLAUDE.md: "two homes" framing removed; the "Never edit — thinking-home governs, not you" file lane
     (PROJECT_GOVERNANCE.md, DECISION_PROTOCOL.md, HOW_TO_RUN_THIS_PROJECT.md) is reframed as
     "deliberate-only — requires an explicit owner-confirmed decision before editing" rather than "not
     accessible to you," since it is now technically accessible; the guardrail is procedural, not physical.
     The end-of-session "re-upload to the Project" step is dropped (nothing to re-upload).
  3. PROJECT_GOVERNANCE.md: "operating charter for the Claude Project" framing retired; content that was
     Project-specific (the sync-keeping section) removed; decision discipline, anti-patterns, and standing
     principles carried forward unchanged — that content was never actually about which tool runs it.
  4. HOW_TO_RUN_THIS_PROJECT.md, README.md, AGENTS.md: two-home references removed for consistency.
- **Why now:** the owner is currently on Cowork pointed at this folder, which already has direct read/write
  access to every file that used to require the sync ritual — continuing to describe a two-home world in the
  governing docs would be actively misleading about what's technically true, and would leave the file
  permission lanes resting on a claim ("you do not have access to the Project") that is no longer accurate.
- **Considered and rejected:** (a) keeping the same tool but treating each session as an explicit "mode"
  (thinking vs. building) without touching the docs — rejected because the docs would still describe a
  nonexistent access boundary, which is worse than updating them; (b) keeping a real separate Claude Project
  for Tier 3 decisions only, as a deliberate extra-friction checkpoint — rejected by the owner in favor of
  full consolidation.
- **Guardrail carried forward (this is the point of the entry):** collapsing the technical wall does not
  collapse the discipline. PROJECT_GOVERNANCE.md, DECISION_PROTOCOL.md, HOW_TO_RUN_THIS_PROJECT.md, and
  CLAUDE.md itself remain edit-only-with-an-explicit-owner-confirmed-decision — not because a session
  physically cannot reach them, but because reaching them is declared out-of-bounds for ordinary build/think
  work by this entry. The hard-stop list in CLAUDE.md (money, legal/regulatory, standing principles,
  low-reversibility, MVP scope growth, new architecture) is unchanged and still requires stopping and asking
  regardless of which tool is running.
- **Reversibility:** Medium — nothing here is data or code; it's process documents. Reverting to a two-home
  model (e.g. a real separate Project again) is a redo of this same class of edit, not a data migration.
- **Rule extracted:** a discipline enforced by a technical boundary should be re-stated as a self-enforced
  rule the moment the boundary disappears, rather than left implicit — an access limitation that quietly
  stops being true is the kind of drift the append-only log exists to catch.
- **Date:** 02-Aug-2026

### D-034 — Autonomous file/git operation, with the hard-stop list and deliberate-only file tier kept as the only checkpoints
- **Tier:** 3 — this decision itself sets the boundary of what future work may be auto-decided, which is the
  single most owner-only kind of call there is (same shape as D-030's "it defines what may later bypass the
  owner"). Owner decision, made directly in conversation via explicit confirmation, not run through the four
  lenses (pure process/autonomy call, no Compliance/Product/Technical/Cost-and-Scope tension to adjudicate).
- **Decision:** Claude operates autonomously on file creation, editing, and deletion across this repo, and on
  `git commit` + `git push` after every session, without pausing to ask permission for each action. Two
  categories remain checkpoints, unchanged from before and explicitly NOT swept into this autonomy grant:
  1. **The hard-stop list in `CLAUDE.md`** (money-movement logic, legal/regulatory shape, anything touching a
     standing principle including the teach-not-advise compliance line, low-reversibility calls, MVP scope
     growth, new architecture/library/service). Any of these still produces a brief and waits for the owner's
     decision before acting — exactly the BRIEF-001 through BRIEF-004 pattern.
  2. **The deliberate-only file tier** (`PROJECT_GOVERNANCE.md`, `docs/DECISION_PROTOCOL.md`,
     `HOW_TO_RUN_THIS_PROJECT.md`, `CLAUDE.md`, `AGENTS.md`). Editing any of these still requires an explicit,
     owner-confirmed decision logged first — this entry is itself an instance of that rule being followed.
- **Why these two survive full automation:** the point of D-017–D-020's tiered protocol was never "reduce
  owner interruptions" as an end in itself — it was to route Tier 3 judgment (money, law, compliance,
  irreversibility, scope) to the only place that can actually make it, while auto-deciding everything that is
  genuinely mechanical. Automating those two categories away would not be "more automation," it would be
  deleting the protocol's entire reason for existing. FINDING 9/10 (raised earlier this session, still
  awaiting a brief) is the live example: a compliance-line interpretation call, exactly the kind of thing that
  must not get silently auto-resolved just because file/git mechanics are now hands-off.
- **What this changes downstream (mechanical consequences of this entry, not separate decisions):**
  1. `CLAUDE.md` and `AGENTS.md`: new explicit framing — autonomous by default, with the hard-stop list and
     the deliberate-only file tier named as the only two exceptions; end-of-session step now includes an
     automatic `git push`, not just a local commit.
  2. **Push credentials:** a fine-grained GitHub PAT (owner-generated, scoped to only this repo, Contents:
     Read and write, short expiry) is stored via a repo-local git credential helper
     (`.git/git-credentials`, referenced only by this repo's local git config, not the sandbox's ephemeral
     home directory, and never committed — `.git/` internals are not tracked content). This lets push happen
     without the token being re-shared in chat each session.
- **Guardrail on the credential itself:** the token is scoped narrowly (single repo, contents-only) precisely
  so that even full trust here has a hard ceiling — it cannot touch other repos, org settings, or account-level
  actions. Owner remains responsible for rotating/revoking it periodically; this entry does not make the
  token permanent.
- **Reversibility:** High. Reverting to a manual/ask-first model is another log entry plus reverting the
  `CLAUDE.md`/`AGENTS.md` edits; revoking the stored token on GitHub instantly cuts off push access without
  touching anything else.
- **Feeds:** `CLAUDE.md`, `AGENTS.md`, repo-local git config (`.git/config`, `.git/git-credentials`).
- **Date:** 02-Aug-2026

### BRIEF-004 — ESCALATED, awaiting owner: does the gap-surfacing rule (D-032) need to widen, without making FINDING 9 worse?
- **Status:** Tier 3 brief written and awaiting owner decision. Full brief in
  **BRIEF-004_gap_surfacing_scope.md**. Nothing proceeds on the teaching prompt's §2/§3 rules until this is
  settled — per D-034, this is exactly the category the autonomy grant does not cover.
- **Trigger fired:** trigger 2 (legal/regulatory — the advisory line, gap-surfacing scope) and trigger 3
  (reinterprets D-032, itself compliance-category). Routed to Tier 3 by §4.3 — no exception for
  interpretations that tighten.
- **The question:** Run 4's repeat series (n=5, `FIXTURE_user_01.json`, Q1) produced two findings. **FINDING
  9:** the model drops Card-1 (42% APR, the fixture's dominant number) from the answer entirely, 2/5 runs — a
  completeness failure of §2 rule 2's "name every path" guarantee. **FINDING 10:** one run (1/5) volunteered
  the term-insurance gap unprompted, mid-answer, on a question that never touches insurance — matching a
  condition D-032 itself pre-registered as sufficient evidence its on-topic fix (Path B) is insufficient,
  regardless of rate. The brief's central question: is FINDING 10 that pre-registered falsification (the same
  channel as FINDING 8 failing twice, per P-002), or a genuinely new channel (mid-answer insertion, distinct
  from the closing-offer channel D-032's rule actually governs) — and can any fix to FINDING 10 avoid making
  FINDING 9's under-naming worse, since both live in the same prompt section (§2) and pull in opposite
  directions (one wants the model to volunteer less, the other wants it to reliably include more)?
- **Paths modeled (not resolved):** **A** — patch the specific hole: extend §2 rule 3's on-topic constraint
  to the whole answer, not just the closing offer; lowest risk to FINDING 9, but only correct if FINDING 10 is
  read as a new channel rather than a repeat. **B** — adopt D-032's own reserved broader option: a standalone
  gate on all unprompted surfacing regardless of location; closes both channels in one rule, but is the path
  most likely to bleed into FINDING 9's territory since it isn't obviously scoped to *new* gaps only. **C** —
  move gap-surfacing eligibility to the backend (a `surfaceable_gaps` field, the D-010/D-028 architectural
  move); strongest guarantee, but is itself a scope increase (no backend exists yet) requiring its own
  escalation.
- **What only the owner can judge:** whether FINDING 10 is the same failing channel as FINDING 8 or a new one
  (determines whether Path A is a legitimate first attempt or already a third pass that should go straight to
  B/C per P-002); whether D-032's rate-independent pre-commitment should still bind at n=5; whether FINDING 9
  and FINDING 10 should be decided together or sequenced separately; and whether the Path C architecture cost
  is worth paying now, ahead of the otherwise-undesigned D-012 trigger-logic work it would require.
- **Rule extraction (candidates, per §5.2):** (1) before invoking P-002, confirm the same channel actually
  failed twice — location and mechanism matter, not just topical resemblance (extends D-032's own diagnosis of
  FINDING 8 into a reusable check). (2) when two open findings share a prompt section, model the fix for one
  against the other before choosing, rather than resolving them as if independent.
- **Date raised:** 02-Aug-2026

### D-035 — BRIEF-004 RESOLVED: Path A adopted — on-topic gap-surfacing constraint extended to the whole answer
- **Tier:** 3 — owner decision on the brief raised as BRIEF-004. Interprets a compliance-category decision
  (D-032), so Tier 3 only per protocol §4.3, no exception for interpretations that tighten.
- **Interprets:** D-032 — settles that the "on-topic only" gap-surfacing constraint D-032 wrote for the
  closing "open door" move also governs the rest of the answer, not just the close. D-032 still governs;
  this states what it means for a location D-032's own wording did not explicitly reach (the mid-answer
  insertion FINDING 10 used).
- **Decision (Path A, the narrow patch):** §2 rule 3 gains two new paragraphs. First, the on-topic test
  ("is this thread already in the room, or a new door?") now explicitly applies anywhere in the answer, not
  only at the close — closing the exact channel FINDING 10 exploited (inserting the term-insurance gap
  mid-answer, dressed as "one other thing worth knowing"). Second, an explicit guard clause: this rule
  governs introducing something *new* (an unraised gap) and does not loosen §2 rule 2's requirement to name
  every already-relevant holding — added specifically because the brief flagged the risk that a broadly
  worded fix here could bleed into and worsen FINDING 9 (the model already drops Card-1 from answers 2/5
  runs). Chosen over BRIEF-004's Path B (a standalone gate covering all unprompted surfacing, regardless of
  location) and Path C (backend-mechanical `surfaceable_gaps` field) — owner judged this a first attempt at
  a plausibly new channel (Reading 2 in the brief: the mid-answer insertion is a location no prior rule
  addressed, not a second failure of the closing-offer rule D-032 already fixed), not yet evidence the rule
  family needs Path B's broader scope or Path C's architecture.
- **FINDING 9 is explicitly NOT addressed by this decision.** It remains open, still needs its own path, and
  is not resolved by this entry — recorded here so it is not mistaken for closed alongside FINDING 10.
- **Why Path A:** narrowest fix that closes the specific demonstrated channel, lowest risk of the
  cross-contamination the brief warned about (Path B's broader wording was the path most likely to make
  FINDING 9 worse), and consistent with treating this as a first attempt at a genuinely new location rather
  than P-002's "routed around twice" territory — which would have required treating FINDING 8 and FINDING 10
  as the same channel, a reading the owner did not adopt.
- **What only the owner judged:** whether FINDING 10 was Reading 1 (D-032's own pre-registered
  falsification, rate-independent) or Reading 2 (a new channel, first attempt legitimate) — owner went with
  Reading 2, accepting the risk named in the brief that if a fourth channel appears, this counts as a second
  routed-around attempt and the next fix should go to Path B or C per P-002.
- **Held in reserve:** if a future run shows unprompted gap-surfacing through yet another location or
  mechanism (not mid-answer insertion, not the closing offer), that is the second failure of this rule
  family and the next fix should go straight to Path B or C, per P-002 — do not attempt a third
  location-specific patch.
- **Reversibility:** High — prompt-level text, tunable in further Phase 1 testing, same standing as
  D-025/D-028/D-029/D-032.
- **Feeds:** `TEACHING_SYSTEM_PROMPT.md` §2 rule 3 (two new paragraphs). Regenerated as
  `SYSTEM_PROMPT_v0_7_runnable.md`.
- **Date:** 02-Aug-2026

### BRIEF-005 — ESCALATED, awaiting owner: does the "worth [X]" bridging pattern need its own rule, and can another named-example patch actually close it?
- **Status:** Tier 3 brief written and awaiting owner decision. Full brief in
  **BRIEF-005_worth_framing_recurrence.md**.
- **Trigger fired:** trigger 2 (§3 rule 5, the advisory line) and trigger 3 (reinterprets D-025, which named
  the exact phrase involved as a failing example). Routed to Tier 3 by §4.3 — no exception for tightening.
- **The question:** BQ-007's outputs (see PHASE1_RUN5_RESULTS.md, FINDING 11) show 4/5 runs wrapping a Card-1
  mention in "worth" framing, and 2/5 reproducing **"worth having in view"** — the literal phrase D-025
  already named as a FAIL example, not a paraphrase of it. Is this the same channel D-025/FINDING 6 already
  addressed (ranking, now leaking through the named ban itself), or a distinct channel — a generic bridging
  habit reaching for "worth X" whenever introducing anything the user didn't ask about, evidenced by Run 5
  using the identical phrase on the emergency-fund figure, not a holding at all?
- **Paths modeled (not resolved):** **A** — add a third named category to rule 5 (bridging into a
  rule-2-required-but-unasked fact) with zero introductory framing; same instrument as D-025's original fix,
  real risk it doesn't move the rate given the named phrase already leaked once. **B** — replace/supplement
  with a structural rule banning any introductory lead-in on unasked material, regardless of wording;
  targets the act rather than specific phrases (BRIEF-002's SAYS-vs-DOES lesson), harder to route around but
  harder to verify and may over-catch legitimate transitions. **C** — deterministic backend-side
  post-generation scan for known-leaked phrases; closes observed instances with a hard backstop, but is a
  scope increase (no backend exists), inherently incomplete (pattern-matching only), and doesn't resolve the
  same-channel-or-new question either way.
- **What only the owner can judge:** whether this is the same channel as D-025 (making the named-phrase
  recurrence real evidence the instrument doesn't hold) or a new one (making Path A a legitimate first
  attempt, per the same reasoning as D-035); whether the softer variants ("worth noting," "worth flagging")
  actually cross the true-vs-attend line as clearly as the original "worth having in view first" did; and
  risk appetite on trying the same instrument (named examples) a second time versus moving to a structural
  or architectural fix now.
- **Rule extraction (candidates, per §5.2):** (1) a named-example ban is falsified by the example itself
  recurring, not only by paraphrase — the example is illustration of the underlying test, not the guarantee.
  (2) when bridging language recurs on non-holding material too, that generalization is evidence of a
  distinct mechanism (a bridging habit) rather than the ranking habit the last fix targeted — scope the next
  fix to what's actually recurring.
- **Date raised:** 02-Aug-2026

### D-036 — BRIEF-005 RESOLVED: no fix — "worth" framing without an attached ordering word does not cross the line
- **Tier:** 3 — owner decision on the brief raised as BRIEF-005. Interprets a compliance-category decision
  (D-025), Tier 3 only per §4.3.
- **Interprets:** D-025 — narrows what its named FAIL example actually covers. D-025 named "worth having in
  view **first**" as failing the true-vs-attend test. This entry settles that the operative failure was the
  word "first" (an explicit ordering claim), not "worth having in view" standing alone. D-025 still governs;
  this states what the named example covers in a case (the same phrase minus "first") it did not explicitly
  separate out.
- **Decision:** No prompt change. All four "worth X" occurrences from BQ-007 (FINDING 11) — the softer
  variants ("worth flagging," "worth noting," "worth having in the background") and the two verbatim "worth
  having in view" instances alike — are judged not to cross the true-vs-attend line. Owner confirmed this
  explicitly covers the two verbatim instances specifically, not only the gentler ones, after the distinction
  was raised. Read: "worth X" used to bridge into a materially relevant, rule-2-required fact, with no
  comparative or ordering word attached, functions as natural connective tissue, not attention-direction.
- **What this does NOT do:** it does not re-open FINDING 9 (Card-1 omission, still open) or touch D-035's
  FINDING 10 fix (still holds). It does not retroactively permit comparative or ordering language — "worth X
  first," "worth more than Y," "the sharper thing" — those remain forbidden exactly as D-025 wrote them; only
  the ordering-word-free form is cleared by this entry.
- **Why:** owner's judgment call, made with the verbatim-vs-softer distinction explicitly in view rather than
  glossed over — the kind of check this protocol exists to force before a Tier-3 interpretation gets logged.
- **Rule extraction (per §5.2):** the operative failure in "worth X" phrasing is a comparative or ordering
  word attached to the bridge ("first," "more than," "the sharper answer") — not the bridge phrase by itself.
  A future "worth X" occurrence should be checked for an attached comparative/ordering word before being
  treated as a rule 5 violation; absent one, it is teaching voice, not direction. This converts a family of
  future "does this worth-phrase rank?" judgment calls into an application of a named test.
- **Reversibility:** High — a judgment call, no prompt text changed. Revisit if a future run shows "worth X"
  drifting toward an attached comparative/ordering word on the same bridge.
- **Feeds:** none — no changes to `TEACHING_SYSTEM_PROMPT.md` or the runnable prompt. This entry is the
  record of the decision itself.
- **Date:** 02-Aug-2026

### D-037 — FINDING 9 (Card-1 omission): §2 rule 2 now requires naming a materially higher-cost holding, not substituting a vaguer consideration for it
- **Tier:** 2 — REVIEW-FLAGGED. Ran the §2.1 trigger checklist rather than defaulting to a Tier-3 brief:
  trigger 2 (compliance) does not fire — D-025 already settled that naming a collateral-relevant holding
  "with its numbers, without ordering it" is required, not merely permitted (§3 rule 5's own carve-out); this
  entry clarifies reliability of an already-decided compliance-safe practice, not a new interpretation of
  where the advisory line sits. Trigger 3 fires (interprets D-015, which classifies as **product-judgment**,
  not compliance — §1.2), so per §4.3 this is Tier 2 with a mandatory REVIEW-FLAG, not Tier 3. Trigger 5
  (scope) does not fire — this clarifies an existing requirement's reach, it does not add a product type,
  screen, or capability. No other trigger fires.
- **Interprets:** D-015 — rule 2's "name every path" is settled to also cover a materially higher-cost
  holding outside the two paths the question is actually deciding between (e.g. Card-1 relative to a
  prepay-vs-invest question), not only the two named decision paths. D-015 still governs; this states what
  "every path" means in a case it did not explicitly address.
- **Decision:** §2 rule 2 gains a new paragraph: a holding whose rate or cost is clearly more urgent than
  what the question is about must be named, with its own number, even when it is not one of the two decision
  paths — and the model may not substitute a vaguer consideration (liquidity, an emergency-fund observation)
  in its place. This targets the exact pattern both FINDING 9 misses shared (v0.6: 2/5; v0.7: 1/5 — all three
  reached for emergency-fund/liquidity framing instead of Card-1, not a random omission).
- **Lenses:**
```
      Compliance      PASS      Naming a materially relevant holding without ranking it is already
                                 required by D-025/§3 rule 5's own carve-out; this doesn't move the
                                 advisory line, it makes an existing requirement's reach explicit.
      Product         CONCERN   No PRODUCT_PRINCIPLES.md principle cleanly resolves this (§3.7's
                                 "clean resolution" bar isn't met — not a Tier-1 principle
                                 application), so it's evaluated directly: reliably naming the
                                 highest-cost holding matters for "mechanism + personal context
                                 always paired," but rule 2 already technically permitted (didn't
                                 strictly require) this, so tightening it is a real behavior change.
                                 Answered by scoping the new text narrowly to "materially
                                 higher-cost" rather than "every tangentially relevant holding."
      Technical       PASS      Prompt-level text, reversible, no build complexity.
      Cost-and-Scope  CONCERN   Length is already near the 200-300 target/320 ceiling in recent
                                 runs (283-304 words); an added naming requirement could push it
                                 further. Answered by keeping the addition to one short paragraph
                                 rather than a general "always mention everything" instruction.
```
- **Why:** two CONCERNs, same direction (both about doing this narrowly rather than broadly), not opposing —
  not a deadlock per §3.4. Evidence base is real but modest (3 misses across 10 total runs, two prompt
  versions), which is why this carries a REVIEW-FLAG rather than proceeding silently: the owner should see
  this and can veto or ask for more data before it's treated as settled.
- **Reversibility:** High — prompt-level text, no data touched, easily reverted.
- **Dependency flag:** needs a re-test (queued as BQ-008) before this counts as confirmed, same discipline as
  every prior prompt fix here.
- **Date:** 02-Aug-2026

### D-038 — Budgeting/Goals data model resolved (Decision 3): explicit thin links, computed budget, new Income object
- **Tier:** 2 — no §2.1 trigger fired (no money movement; goals/budgets are the user's own labels, not
  products, so D-009 doesn't reach them; no goals/budget data exists yet so the touched-data test keeps this
  reversible; already committed MVP scope per §4 item 5, not an increase; classifiable — same
  product/technical boundary shape as D-011/D-013). Real tradeoffs existed between candidate paths, which is
  what puts it at Tier 2 rather than Tier 1.
- **Decision:** Resolves PROJECT_SPEC.md §8 "Decision 3." Three sub-parts:
  1. **Goal→holding funding links are explicit and thin.** `Goal { target_amount, target_date, category,
     funded_by: [{holding_id, earmarked_amount}] }`. Progress is always computed live as the sum of earmarked
     holdings' current values — never duplicated onto the Goal record. Rejected: tag-based inference (breaks
     down when one holding should split across two goals — ambiguous percentage) and no structural link at
     all (guts the teaching mechanism — can't produce "this SIP is funding 60% of your house goal").
  2. **Budget is a fully computed view, not a stored object.** No "Budget" row exists in the database.
     Recurring outflows (EMI, SIP amount, insurance premium) are read live off the holding records that
     already carry those fields (D-013). Only Income (see below) and a short list of discretionary
     categories (`{label, planned_amount}`) are stored, because those have no holding to live on. Rejected:
     a stored, periodically-reconciled monthly snapshot — real product upside (enables "your budget changed
     since last month" moments) but not needed for MVP, which teaches from the live baseline and has already
     parked historical/trend recall (D-022).
  3. **Income is a new first-class object**, sibling to Holdings in the baseline: `Income { sources:
     [{label, amount, frequency}] }`. Not a live tradeoff — it's the only place income can go once it sits
     outside D-013's product taxonomy; feeds sub-part 2's computation directly.
- **Rule extracted (reusable, same shape as D-013's split-vs-merge test):** **the reference-vs-store test** —
  if a number already lives on a holding record, Goals/Budget reference it live and never duplicate it; if a
  number has no holding home (income, discretionary categories, goal targets), it is stored directly on the
  new object. This is what makes sub-parts 1 and 2 consistent with each other and converts future
  "does X get its own field or a live reference" questions from judgment into application.
- **Lenses:**
```
      Compliance      PASS      Goal/budget labels are the user's own categories, not third-party
                                 products or securities — D-009/D-010 don't reach them. No new data
                                 leaves to the LLM under a different shape than D-010 already governs.
      Product         PASS      Explicit links + live computation directly serve D-015's
                                 mechanism-plus-personal-context requirement; the rejected stored-
                                 snapshot path would add real product value (trend-teaching) but
                                 that's not an MVP capability, so choosing against it isn't a loss
                                 against anything currently promised.
      Technical       PASS      Simplest of the candidate paths in all three sub-parts — no new
                                 reconciliation object (vs. stored Budget), no ambiguous split logic
                                 (vs. tag-based goal funding).
      Cost-and-Scope  PASS      Avoids the ongoing reconciliation/sync burden a stored Budget
                                 snapshot would add, and avoids the split-logic maintenance a
                                 tag-based goal link would add.
```
  All four PASS — no CONCERN, no deadlock, nothing to answer beyond the reasoning above.
- **Why:** Path A won on all three sub-parts because it's the option that gives the teaching engine real,
  live material without adding a data object or reconciliation burden that MVP doesn't need yet. The
  alternatives weren't wrong, just paying cost for capability (historical trend-teaching) that's explicitly
  post-MVP per D-022's own logic — the same reasoning, applied to a new data shape rather than conversation
  memory.
- **Reversibility:** High right now — no goals/budget data exists yet (touched-data test, §2.2), so this is
  exactly the "schema field added before any data is captured" case the test names as reversible. This
  becomes low-reversibility the moment real user Goal/Income records are populated under this shape — build
  against it with that window in mind.
- **Feeds:** unblocks build tasks for the Income/Goal schema additions and the live budget computation logic
  (queued in `docs/BUILD_QUEUE.md`). Also partially unblocks PROJECT_SPEC.md §8 "Decision 2" (per-item
  management depth), which was waiting on this data model existing — its other dependency (a real Phase 1
  section to react to) still stands.
- **Date:** 03-Aug-2026

### D-039 — Created `docs/CEO_DASHBOARD.md` as the standing status-reporting source file (Tier 1)
- **Tier:** 1 — process/PM tooling, no trigger fires, same category as D-007/D-014. One-line log per §2.3.
- **Date:** 03-Aug-2026

### D-040 — Dashboard refresh added to the mandatory end-of-session checklist; local HTML snapshot added (owner-confirmed in conversation)
- **Tier:** 1 — process/PM tooling, no trigger fires (same category as D-007/D-014/D-039). Logged as a full
  entry rather than a bare one-liner only because it authorizes an edit to CLAUDE.md, which is deliberate-
  only per the file-permission rules — the owner's explicit "yes" in conversation is the decision this
  entry documents, following the same before-not-around pattern as D-033.
- **Decision:** (1) `docs/CEO_DASHBOARD.md` is refreshed at the end of every session, added as step 2 of
  CLAUDE.md's "End of every session" checklist. (2) A static rendered snapshot, `docs/CEO_DASHBOARD.html`,
  is regenerated alongside it each time — a real file in the repo the owner can open directly (double-click
  → opens in browser) without asking Claude or going through claude.ai's Artifact hosting. It is a snapshot
  as of last regeneration, not live; the masthead's "last synced" date is the freshness signal.
- **Why:** the owner wants a project-status view they can reach on their own, on demand, without a chat
  round-trip — a plain markdown file doesn't render visually, and the previously-published Artifact lives
  on claude.ai rather than in the folder the owner actually opens. A committed static HTML file solves both.
- **Reversibility:** High — process text + a regenerated file, nothing else depends on it.
- **Date:** 03-Aug-2026

### D-041 — Backend scaffolding stack: FastAPI + SQLAlchemy + Alembic (owner-confirmed)
- **Tier:** owner-decided directly in conversation — escalated per CLAUDE.md's explicit hard stop on
  introducing a new library/architectural pattern (no de-minimis exception, same logic as trigger 5).
  Logged as a full entry rather than a bare one-liner because it's a real architecture choice other code
  will depend on, not routine mechanics.
- **Decision:** `backend/` is bootstrapped this session (BQ-011) as a FastAPI app using SQLAlchemy for the
  ORM/query layer and Alembic for migrations, connecting to the existing Supabase-hosted Postgres
  (`fintutor-dev`, D-008). Supabase continues to own auth/hosting (D-005) — this only adds a conventional
  data-access layer on top of the same Postgres instance. Scope for this session is the skeleton only (app
  structure, DB connection wiring, migrations tooling, a health-check endpoint) — the D-013 Holdings model
  and D-038's Income/Goal/Budget model are deliberately deferred to their own session (BQ-009/BQ-010),
  respecting BUILD_QUEUE.md's one-item-per-session discipline.
- **Why:** SQLAlchemy + Alembic over the Supabase Python client directly — real migration tooling matters
  once the schema starts growing (Holdings' 8-type taxonomy, then Income/Goal/Budget, then whatever
  Decision 2 produces), and it's the conventional pairing for FastAPI + Postgres regardless of which
  managed platform hosts the database.
- **Reversibility:** Medium once real data exists (touched-data test) — no data exists yet, so this is the
  cheap window to make this call.
- **Dependency flag:** needs `DATABASE_URL` (the Supabase Postgres connection string) added to `.env` by
  the owner before the DB connection can be verified end-to-end — Claude does not have and should not be
  given this credential through chat.
- **Date:** 03-Aug-2026

### D-042 — Dashboard refresh moved from automatic-every-session to on-demand only (owner-confirmed)
- **Tier:** owner-decided directly in conversation — logged as a full entry rather than a one-liner because
  it edits CLAUDE.md (deliberate-only), same escalation pattern as D-033/D-040.
- **Supersedes:** D-040 — in respect of the automatic-every-session refresh cadence only. The rest of D-040
  stands unchanged: `docs/CEO_DASHBOARD.html` remains a real, committed, double-clickable local file, and
  `docs/CEO_DASHBOARD.md` remains the source-of-truth data file for it.
- **Decision:** `docs/CEO_DASHBOARD.md` / `.html` are refreshed **on demand** — whenever the owner asks for
  a status summary, CEO dashboard, or "something visual" — not automatically as a step in every session's
  wrap-up. CLAUDE.md's "End of every session" checklist reverts to its pre-D-040 three steps; the dashboard
  step is removed.
- **Why:** the owner judged the every-session refresh as more overhead than it returns — the dashboard's
  job is served fine by refreshing only when it's actually going to be looked at.
- **Reversibility:** High — process text only.
- **Date:** 03-Aug-2026

### D-043 — Income/Goal schema built with loose UUID references, no FK, to not-yet-built tables (owner-confirmed)
- **Tier:** 1 — bounded technical implementation detail surfaced mid-session, contained entirely within
  this session, no money-logic or teach-not-advise line touched, no MVP scope change, fully reversible (a
  later migration can add the real FK once the referenced table exists). Classifiable as the same shape as
  prior technical-implementation calls (D-041). Asked the owner directly rather than silently picking,
  since two live candidates existed (loose reference vs. build a stub table now) and it directly shaped
  `Goal.funded_by`'s implementation.
- **Decision:** Executing BQ-009 surfaced that `docs/BUILD_QUEUE.md` queued "Income and Goal, sibling to
  Holdings" while no Holdings table exists anywhere in the codebase (`backend/app/models/` was empty
  entering this session) — `Goal.funded_by`'s `holding_id` had nothing to reference. Owner chose: store
  `holding_id` (on the new `GoalFunding` table) as a plain `UUID` column with no foreign-key constraint,
  deferring the real FK to whichever future BQ item builds Holdings. Applied the same resolution to
  `user_id` on both `Income` and `Goal` (no Users table exists either — Supabase Auth owns that identity,
  not a local model).
- **Why:** keeps BQ-009 scoped to exactly what it named (Income + Goal) rather than silently pulling
  Holdings-stub work into a session that wasn't queued for it; the loose reference is cheap to tighten
  later and costs nothing today since no real holding/user rows exist yet to violate a future constraint.
- **Reversibility:** High — adding a real FK later is an additive migration, not a breaking one, as long as
  existing `holding_id`/`user_id` values are valid UUIDs (guaranteed by construction).
- **Date:** 03-Aug-2026

### D-044 — Holdings model built: single table + JSONB characteristics; product_type left unconstrained
- **Tier:** 1 — executes already-decided design (D-010 aliasing, D-011 framework, D-013 taxonomy) rather than
  making new product/compliance decisions; both technical sub-choices are bounded, reversible, contained
  within this session. Owner confirmed the JSONB-vs-per-type-table fork directly before code was written
  (two live candidate paths with real tradeoffs, same pattern as D-043).
- **Decision:** Two implementation choices, made building `backend/app/models/holding.py`:
  1. **Single `holdings` table with a `characteristics` JSONB column**, not one child table per D-013 type.
     Owner-confirmed over the 9-table relational alternative — matches the flat shape already used in
     `docs/fixtures/FIXTURE_user_01.json` (alias + product_type + fields), which is literally what the
     backend sends to the LLM per D-010, and avoids a migration per type for MVP-stage field churn.
  2. **`product_type` is a plain string column, not a DB-level enum/CHECK constraint.** Deliberately does
     NOT resolve `PROJECT_SPEC.md` §8's open `savings_balance` question (D-013 names 8 types; fixtures
     already use a 9th, `savings_balance`, not yet formally added) — constraining the column now would
     silently answer an owner-open question as a side effect of a build task, which `CLAUDE.md` forbids.
  3. **`GoalFunding.holding_id` wired to a real foreign key** (`holdings.id`, `ON DELETE CASCADE`) — this
     was the exact deferred item D-043 flagged ("wire up the real FK once Holdings is built"), completed the
     moment its precondition existed. Also added `display_name` (nullable) on `Holding` for the real
     product/institution name — never sent to the LLM, exists only for D-011's re-humanizing step in the UI.
- **Why:** Both choices are pure technical implementation detail once D-010/D-011/D-013 already fixed *what*
  gets tracked — this decision is only about *how* it's stored. Verified against the real DB: FK cascade
  delete confirmed (deleting a Holding correctly removes its `GoalFunding` rows), round-trip insert/read
  confirmed, `/health` and `/health/db` still 200 with all four models loaded.
- **Reversibility:** Medium — JSONB→relational is a real migration once holdings data exists; constraining
  `product_type` to an enum later is cheap and additive once the savings_balance question is answered.
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
