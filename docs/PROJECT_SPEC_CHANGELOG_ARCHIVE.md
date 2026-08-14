# FinTutor — Project Spec Change Log Archive

> Older `PROJECT_SPEC.md` §10 change-log entries, moved here verbatim (D-081) once the live file's
> rolling window filled — the change log is pure history and was most of `PROJECT_SPEC.md`'s token cost,
> while only sections 1-9 (current state) and the most recent handful of change-log entries are actually
> needed for routine session start. Newest-first (unchanged ordering).
>
> **Never edited after being moved here.** Do not read this file wholesale as part of routine session
> start — grep it for a specific version/date/decision ID when you actually need one.

---

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

- v2.9 (03-Aug-2026) — **§3 Target user narrowed for MVP (D-053, D-054).** MVP design and Phase-3 testing
  now target a founding segment — early-career, single-income, low-complexity earners — chosen because an
  independently-run product-fit lens and a business/GTM lens converged on it (BRIEF-008). D-054 kept the
  segment un-narrowed further: it spans three internal profiles from a follow-up two-lens pass (BRIEF-009),
  judged to describe the same three people from two angles, and design must serve all three. Every other
  candidate segment recorded as DIRECTION, not MVP BUILD, parked for post-MVP — same split D-031 used for
  holding families. §3's original "not defined by age; defined by intent" line is kept, flagged as an open
  question (both lenses independently used age/career-stage as their real distinguishing axis), not
  rewritten — a decision for a future session, not assumed here.
- v2.8 (03-Aug-2026) — **Decision 3 resolved (D-038).** Budgeting/goals data model: explicit thin funding
  links from Goals to holdings (progress computed live), Budget as a fully computed view with no stored
  object, new first-class Income object. Reference-vs-store test extracted as a reusable rule. Unblocks
  backend schema build tasks (queued in BUILD_QUEUE.md) and partially unblocks Decision 2.
- v2.7 (03-Aug-2026) — **BQ-008 verified D-037's FINDING 9 fix: 5/5 clean.** Card-1 named unprompted in
  every run, no vaguer-consideration substitution, FINDING 10 still 0/5, FINDING 11 "worth" phrasing 0/5
  under D-036's clarified test. Results in docs/PHASE1_RUN6_RESULTS.md; BUILD_QUEUE.md's BQ-008 moved to
  DONE. Also fixed a test-tooling bug found along the way: scripts/run_phase1_test.py's max_tokens=1024 was
  too low for a thinking-enabled model, causing 2/5 empty responses on first attempt (stop_reason=max_tokens,
  thinking consumed the full budget) — raised default to 4096, not a prompt/compliance change.
- v2.6 (02-Aug-2026) — **FINDING 9 resolved at Tier 2 (D-037), REVIEW-FLAGGED, pending verification.** Ran
  FINDING 9 through the actual §2.1 trigger checklist instead of defaulting to a Tier-3 brief: naming a
  collateral-relevant holding without ranking it is already required by D-025's existing carve-out, so this
  is a product-judgment interpretation of D-015 (Tier 2, mandatory REVIEW-FLAG per §4.3), not a new
  compliance-line question. §2 rule 2 now requires naming a materially higher-cost holding outside the two
  decision paths and forbids substituting a vaguer consideration for it — targets the exact pattern all
  three FINDING 9 misses shared (emergency-fund/liquidity framing standing in for Card-1). Lens table:
  Compliance PASS, Product CONCERN (answered by narrow scoping), Technical PASS, Cost-and-Scope CONCERN
  (answered by keeping it to one paragraph). Prompt regenerated as SYSTEM_PROMPT_v0_8_runnable.md. BQ-008
  queued to verify before this is treated as settled. This is the first decision here to demonstrate Tier 2's
  actual design — acted immediately, logged with full lens reasoning, flagged for the owner's retroactive
  veto rather than gated on it.
- v2.5 (02-Aug-2026) — **BRIEF-005 resolved (D-036), no fix.** FINDING 11's "worth X" framing (found scoring
  BQ-007) is judged not to cross the compliance line, including the two verbatim "worth having in view"
  occurrences — owner confirmed this explicitly after the distinction between those and the softer variants
  was raised. D-025's named FAIL example narrowed: the word "first" (ordering) was the operative failure,
  not "worth having in view" alone. Comparative/ordering "worth X" phrasing remains forbidden; nothing else
  about D-025 changes. No prompt file touched.
- v2.4 (02-Aug-2026) — **BQ-007 run against v0.7 (first live-API test run, via `scripts/run_phase1_test.py`
  run locally by the owner — the build sandbox blocks authenticated calls to `api.anthropic.com`).** D-035's
  fix confirmed: FINDING 10 does not reproduce, 0/5. FINDING 9 at 1/5 (20%, down from 2/5 baseline, n too
  small to call improved). **New: FINDING 11** — "worth [X]" framing on Card-1 mentions in 4/5 runs, with
  the prompt's own named-forbidden phrase ("worth having in view") reproduced verbatim in 2/5. Flagged for
  thinking-home, not yet written as a brief. See PHASE1_RUN5_RESULTS.md.
- v2.3 (02-Aug-2026) — **BRIEF-004 resolved (D-035).** Path A adopted: §2 rule 3's on-topic gap-surfacing
  constraint extended from governing only the closing offer to governing the whole answer, closing the
  mid-answer insertion channel FINDING 10 used, with an explicit guard clause protecting rule 2's
  path-naming completeness so the fix doesn't bleed into and worsen FINDING 9. Prompt regenerated as
  SYSTEM_PROMPT_v0_7_runnable.md. FINDING 9 (Card-1 omission, 40%) deliberately left open — not addressed
  by this decision, remains its own §8 item.
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

- v3.2 (04-Aug-2026) — **Gamification/engagement layer added to MVP scope (D-060, D-061).** New §4 item
  9: Duolingo-style engagement mechanics (streaks, variable reward, Hook Loop) adopted in full (D-060) — a
  real scope increase (trigger 5), explicitly recorded as running counter to P4's start-strict default
  rather than a clean application of it. Bounded by D-061: game elements may react to app behavior but
  never to the user's real financial data — an interpretation of P6 extended into gamification design for
  the first time. Two other candidate principles from the same session — gated feature-unlock sequencing,
  social/group stakes — were NOT adopted; both already contradict standing decisions (D-058, §5) and
  needed no new decision. Scope edit deliberately batched rather than applied incrementally per cluster.
