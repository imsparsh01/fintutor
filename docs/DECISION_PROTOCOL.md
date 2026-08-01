# FinTutor — Decision Protocol (v1.2, 25-Jul-2026)

> **Status: COMPLETE (v1.0).** All six sections are written. §6 is a live section that fills by accretion —
> it is empty by design, not unfinished.
>
> Per D-017's hard cap, the protocol is now done and work returns to Phase 1 (D-006, teaching engine).
> Changes from here should be calibration driven by real decisions running through the system, not
> further design.
>
> This file defines **how decisions get made** in the FinTutor project. It is governance machinery, not
> product. It exists because decision volume — not build capacity — is the owner's bottleneck.
> Authorized by **D-017**. Read alongside PROJECT_GOVERNANCE.md (which governs *sessions*); this file
> governs *decisions within them*.

---

## 0. Framing (do not lose this)

**This is a decision ROUTING system, not an org chart.** Personas are **evaluation lenses** — devices for
applying a specific angle of scrutiny to a question. The value is the lens, not the job title. Do not write
job descriptions for imaginary executives; that is the failure mode this framing exists to prevent.

**There is no CEO lens.** In a solo project the CEO is the owner. A system that simulates the owner's
judgment defeats its own purpose. Tier 3 is what protects that seat.

**Three scalability guarantees (from D-017):**
1. **Append-only.** DECISION_LOG.md entries are never rewritten. New information → a new superseding entry.
2. **Precedent by accretion.** Novel decision types get appended to §6, not folded into a redesign.
3. **Unclassifiable fails UPWARD.** If the protocol cannot route a decision, it is Tier 3 by default.
   Never sideways into a guess.

**Recorded limitation:** Project knowledge files are read-only from inside the Project. "Live files" means
the download → edit → re-upload sync ritual in PROJECT_GOVERNANCE.md, done with discipline. Nothing here
updates itself. Any mechanism that assumes self-updating documents is wrong.

---

## 1. The taxonomy (COMPLETE — derived from D-001 through D-016)

Built retroactively from real decisions rather than invented, so the categories describe what this project
actually produces.

### 1.1 Retroactive classification

| # | Decision | Category | Needed the owner? | Why / why not |
|---|---|---|---|---|
| D-001 | Context engineering, not fine-tuning | Technical-architectural | No | One clearly right answer on technical merits |
| D-002 | Sonnet/Haiku split | Technical-economic | No | Reversible, config-level |
| D-003 | Python/FastAPI over Java | Technical-architectural | **Yes** | Irreversible once code exists |
| D-004 | React Native / Expo | Technical-architectural | **Yes** | Irreversible once app exists |
| D-005 | Managed platform, don't roll auth | Technical-architectural | No | Forced by solo-bootstrap constraints |
| D-006 | Teaching engine first | Sequencing/PM | No | Follows from de-risking logic |
| D-007 | Governance before build | Sequencing/PM | No | Follows from same logic |
| D-008 | Supabase specifically | Technical-economic | Borderline | Provider lock-in, but medium reversibility |
| D-009 | Strict no-product-names | **Compliance** | **Yes** | Regulatory exposure; defines the product |
| D-010 | Architectural aliasing | Compliance-architectural | **Yes** | Philosophy commitment |
| D-011 | Alias methodology split into 3 | Technical-design | No | Decomposition, not judgment |
| D-012 | AI-surfaced capture | **Product-judgment** | **Yes** | Defines how the app feels |
| D-013 | 8-type taxonomy | Product-technical | Mostly no | The split-vs-merge *test* was judgment; applying it was mechanical |
| D-014 | Park subagents | Sequencing/PM | No | Sequencing logic |
| D-015 | Four teaching dimensions | **Product-judgment** | **Yes** | Defines the core product behavior |
| D-016 | Refusal behavior | Product-compliance | **Yes** | Compliance-governed |

### 1.2 Findings

**Seven of sixteen genuinely needed the owner.** The other nine were reversible technical calls, sequencing
logic, or mechanical application of an already-set rule. **~55% of decision bandwidth is recoverable** — a
measured number, not a hoped-for one. This is the protocol's justification.

**Five categories, not four:**
1. **Technical-architectural** — D-001, D-003, D-004, D-005, D-011
2. **Technical-economic** — D-002, D-008 — where cost is the deciding variable
3. **Product-judgment** — D-012, D-015 — how the app feels
4. **Compliance** — D-009, D-010, D-016 — regulatory exposure
5. **Sequencing/PM** — D-006, D-007, D-014

**Boundary decisions are the important finding.** D-013 (product + technical) and D-016 (product +
compliance) sit across categories. The protocol therefore needs a multi-category rule, and it is:
**the stricter category governs.** D-016 is product-flavored but compliance-governed → Tier 3.

**The D-013 pattern is the template for Tier 2.** The owner made one judgment call (the split-vs-merge test:
*does the teaching mechanism or tax behavior actually differ?*) and then applied it mechanically across ten
items. That is exactly the shape to automate: **the owner sets the test; the system applies it.**

**Derived rule — rule extraction:** when a Tier-3 decision produces a reusable test, the test is logged
**explicitly and separately**, so future decisions of the same shape drop to Tier 2. Rule extraction is a
required output field of every Tier-3 brief (see §5 when written).

---

## 2. Tiers, triggers, and the routing sequence (COMPLETE)

### 2.0 The order of operations (this is the whole design)

**The trigger checklist runs FIRST, before any tier is assigned.** Tiers are not a thing you guess and then
sanity-check; the checklist *produces* the tier. This ordering is deliberate and load-bearing — see §2.6 for
why it is what makes the no-noise choice in §2.4 safe rather than merely quiet.

```
Decision arises
    │
    ▼
[1] Run the Tier-3 trigger checklist (§2.1) — mechanical, no judgment
    │   any trigger fires ──────────────────────────► TIER 3 (owner decides)
    │   cannot classify the decision at all ────────► TIER 3 (fails upward)
    ▼  no trigger fires
[2] Is there more than one defensible answer with real tradeoffs?
    │   yes ─────────────────────────────────────────► TIER 2 (deliberate, act, log)
    ▼  no — one clearly right answer
[3] Is acting on it possible within the current home (§2.3)?
    │   no — requires the other home ────────────────► escalate to owner (sync boundary)
    ▼  yes
    TIER 1 (act, one-line log)
```

### 2.1 The Tier-3 trigger checklist

Run every one. **Any single trigger firing sends the decision to Tier 3.** No weighing, no "mostly fine" —
this list is checked, not judged. If checking a trigger itself requires judgment, that ambiguity is
trigger 6.

| # | Trigger | Test |
|---|---|---|
| 1 | **Money leaves the account** | Does acting on this spend money, commit to a recurring cost, or change a billing tier? |
| 2 | **Legal / regulatory / tax exposure** | Does it touch SEBI positioning, the advisory line, user financial data handling, privacy/retention, or tax treatment? |
| 3 | **Contradicts or reinterprets a standing principle** | Does it bear on any of the five standing principles (PROJECT_GOVERNANCE.md) or the teach-not-advise line? Reinterpreting counts as contradicting. |
| 4 | **Low reversibility — the touched-data test** | Would undoing this require migrating populated data, or rewriting code already committed and depended on? If yes → Tier 3. (§2.2) |
| 5 | **Increases MVP scope** | Does it add a product type, screen, flow, integration, or capability not already in PROJECT_SPEC.md §4? Any increase, however small. (§2.2) |
| 6 | **Unclassifiable** | Does it fail to sit cleanly in any of §1.2's five categories, or is the trigger check itself ambiguous? Unknown fails UPWARD. |

**Multi-category rule (from §1.2):** where a decision spans categories, the stricter category governs.
Compliance is strictest, then product-judgment, then technical-architectural, then technical-economic, then
sequencing/PM.

### 2.2 Two triggers that need their definitions pinned

**Trigger 4 — reversibility is touched-data-based, not time-based.** "How many hours to undo" is a guess that
drifts with mood and fatigue. The test is binary and checkable:

> **Low reversibility = undoing it requires migrating populated data, or rewriting committed code that other
> code now depends on.** Everything else is reversible.

Consequences worth seeing: a schema field added *before* any data is captured is reversible (Tier 1/2); the
same field added *after* is not (Tier 3). A library swap in an unwritten module is reversible; the same swap
after three modules import it is not. **This makes timing part of the tier** — the identical decision can be
Tier 1 on Monday and Tier 3 on Friday. That is correct behavior, not a bug in the test.

**Trigger 5 — scope increase is a HARD trigger, chosen deliberately.** Owner's call, 23-Jul-2026: MVP focus
comes first, so *every* scope increase stops and escalates, with no de-minimis exception.

- **What this buys:** it automates the "silent scope growth" anti-pattern guard in PROJECT_GOVERNANCE.md.
  Scope can no longer grow by accretion inside a schema or a reworded sentence.
- **What it costs, stated honestly:** D-013 would have fired this trigger. Adding insurance to the taxonomy
  was the mechanical output of a test the owner had already set (split-vs-merge), yet it enlarged MVP's
  product surface — so under this rule it stops and escalates rather than completing in-session. That is the
  accepted price of the guard. Revisit only if it proves to be firing constantly on genuinely mechanical work.

### 2.3 The three tiers

**TIER 1 — auto-decide and act.**
- **Criteria:** no trigger fires, one clearly right answer, actionable within the current home.
- **Authority is bounded by home (owner's call, 23-Jul-2026).** In the Project: if it can be acted on here —
  a doc edit, a classification, a framing call — act. In Claude Code: if it can be acted on there, act. **A
  Tier-1 decision that requires the *other* home is not Tier 1.** It escalates to the owner, because crossing
  the boundary requires the manual sync ritual and only the owner can perform it. The boundary is the limit
  of autonomous action, not a formality.
- **Logging:** one line in DECISION_LOG.md — what, and that it was Tier 1. No why, no lens analysis.
- **Silent by design.** The §2.4 doubt threshold does NOT apply here (owner's call: no noise). §2.6 explains
  what makes this safe.
- **If a Tier-1 call later proves load-bearing:** it gets **promoted by a new appended entry** that references
  and supersedes the one-liner. The original line is never rewritten — promotion adds, it does not edit. This
  preserves append-only while giving the decision the full what/why/reversibility treatment it turned out to
  deserve.

**TIER 2 — deliberate, act, log, owner may veto.**
- **Criteria:** no trigger fires, but multiple defensible answers with real tradeoffs.
- **Process:** the decision goes through the evaluation lenses (§3), which produce a recommendation *and* a
  written rationale.
- **Action is immediate (owner's call, 23-Jul-2026, option c).** The work proceeds; it does not wait for
  review. This is only safe because Tier 2 is reversible *by definition* — trigger 4 would have pulled it to
  Tier 3 otherwise. **Retroactive veto is the control**, and it is real precisely because reversibility was
  verified before the tier was assigned, not assumed after.
- **If a Tier-3 trigger surfaces mid-deliberation:** it escalates immediately, **with the deliberation
  attached** (owner's call). The owner sees the lens work already done rather than a clean-slate brief. Faster;
  the accepted cost is that the owner is reading a partially-formed recommendation, so the brief must state
  plainly that it is attached work-in-progress and not a settled position.

**TIER 3 — owner decides. The system produces a brief, never a decision.**
- **Criteria:** any trigger in §2.1 fired.
- **Output:** a decision brief (format in §5) — the question, the paths modeled, which trigger fired, what
  specifically requires owner judgment, and a **rule-extraction** field (§1.2): if this decision produces a
  reusable test, that test is logged separately so future decisions of the same shape route to Tier 2.
- **The system does not recommend a Tier-3 outcome unless asked.** Modeling paths is the job; picking is the
  owner's. (This mirrors D-009's stance toward the user, applied inward — the same reasoning, different
  audience.)

### 2.4 The doubt threshold — Tier 2 only

Owner's instruction: *if you're even 25% unsure the owner should see this, surface it.*

**Scope: Tier 2 only.** Tier 1 stays silent (owner's call: no noise).

**Mechanism: flag, do not block.** A REVIEW-FLAGGED Tier-2 decision still proceeds — the work is done, the
decision acted on. The flag means it is listed *first* at session close, above the routine log. The owner sees
what the system was unsure about, already actionable rather than pending.

This resolves the tension between "proceed immediately" and "bring me anything doubtful": doubt changes
**visibility**, never **velocity**.

### 2.5 Sync state at every session close (mandatory)

Owner's instruction: remind about laptop ↔ Project sync every time. Reminders decay into wallpaper, so this
is a **structural checklist item**, not a nag. Every session ends with:

```
SYNC STATE
  Files changed this session:      [list, or "none"]
  Re-upload to Project needed:     [yes/no — which files]
  Copy to laptop repo + commit:    [yes/no — which files]
  Escalated, awaiting owner:       [list, or "none"]
  REVIEW-FLAGGED Tier-2 decisions: [list, or "none"]
```

Nothing here updates itself (D-017's recorded limitation). This block is the discipline that substitutes for
automation.

### 2.6 Why the checklist runs first (the safety argument for a silent Tier 1)

The doubt threshold exists to catch **misclassification**. The dangerous misclassification is a Tier-3
decision wrongly routed to Tier 1 — and under §2.4 that is precisely the case no flag will catch.

The compensating control is **ordering**. Because the trigger checklist (§2.1) runs *before* tier assignment
rather than as a Tier-3 confirmation step, a decision cannot reach Tier 1 without having been tested against
money, law, standing principles, touched-data, scope, and classifiability. Tier 1 is not "what didn't seem
important" — it is **the residue of a checklist that already ran and found nothing**.

This is what makes the no-noise choice safe rather than merely quiet. **If §2.1 is ever weakened, softened, or
moved after tier assignment, the Tier-1 silence stops being safe and §2.4 must be re-opened.** Recorded here
so the dependency is not forgotten.

## 3. The evaluation lenses (COMPLETE)

Lenses are the machinery of Tier 2. They exist to make a decision get looked at from angles that disagree
with each other. **A lens that has never objected to anything is decoration** — that is the failure mode this
section is built to prevent, and §3.5 makes it visible.

### 3.1 The four lenses

| Lens | The question it asks | The objection only it can raise |
|---|---|---|
| **Compliance** | Does this move toward or away from the SEBI line — the advisory boundary, product-naming, data handling? | "This is legally exposed regardless of how well it works." |
| **Product** | Does this satisfy the principles in PRODUCT_PRINCIPLES.md? Does it fit how the app should feel? | "This works but it is not what FinTutor is." |
| **Technical** | Is this buildable by one person with Claude Code, and is it reversible in practice? | "This is right in principle and not deliverable by this team." |
| **Cost-and-Scope** | Does it consume owner attention or add ongoing maintenance drag? | "Nothing here is wrong; it just costs more than it returns." |

**Note on the Cost-and-Scope lens (deliberately narrow).** It does *not* ask "does this add scope" — trigger 5
(§2.1) already answers that, and a decision that adds scope cannot be at Tier 2 in the first place. What is
left for this lens is what the triggers do not catch: **owner attention and ongoing maintenance burden.**
Things that add no scope and cost no money but create permanent drag — a doc that must be hand-synced, a
convention that must be remembered, a config that must be kept true. In a solo bootstrapped project, attention
is the scarce resource; money barely varies. This lens is the only guard on it.

**There is no CEO lens.** See §0. That seat is the owner's, and Tier 3 protects it.

### 3.2 Which lenses run (relevance selection, with a floor)

Owner's call, 23-Jul-2026: **only relevant lenses run.** Running all four on every decision generates padding
where a lens genuinely has nothing to say, and padding is what makes deliberation stop being read.

**The floor: Compliance ALWAYS runs.** It is never relevance-selected.

The reason is structural, not caution. Compliance is the lens holding the veto (§3.3), which makes it the most
dangerous one to skip — and the skip is exactly the failure it cannot catch. A lens that was never invoked
raises no objection, and Tier 2's doubt threshold (§2.4) flags uncertainty in the *analysis*, not absence of
the analysis. So Compliance is exempted from selection: it runs, and on most decisions it returns PASS in one
line. That is a cheap price for closing the gap.

Product, Technical, and Cost-and-Scope are selected by relevance. **A lens is relevant if it could plausibly
return anything other than PASS.** If the honest answer is "this lens has no angle here," skip it and record
the skip — see §3.5.

### 3.3 Verdicts

Every lens that runs returns **one verdict and one sentence.** Not a paragraph. Not free-form analysis.

| Verdict | Meaning | Effect |
|---|---|---|
| **PASS** | No objection from this angle. | None. |
| **CONCERN** | A real cost or risk, but not disqualifying. | Recorded in the rationale. Two or more CONCERNs → see §3.4. |
| **BLOCK** | This decision should not proceed as framed. | See below — differs by lens. |

**The Compliance BLOCK is a hard veto (owner's call, 23-Jul-2026).** If the Compliance lens returns BLOCK, the
decision escalates to Tier 3 immediately, regardless of what every other lens said. No synthesis, no
outvoting. This makes Compliance structurally different from the other three, matching D-009's own logic —
strict by default, relaxed only deliberately and with review.

**A BLOCK from Product, Technical, or Cost-and-Scope is not a veto.** It is a strong objection that must be
answered in the written rationale. If the objection cannot be answered, the decision has no defensible path
and escalates — which is the deadlock rule below.

**Accepted cost of the compliance veto:** more escalation. Given the SEBI exposure this project carries, a
false escalation costs a conversation; a missed one costs the product. The asymmetry is the justification.

### 3.4 Deadlock → Tier 3 (owner's call, 23-Jul-2026)

When two lenses reach opposing verdicts and **neither is Compliance** (which would have resolved it by veto),
there is no tiebreaker. The decision escalates to Tier 3 with both positions stated.

This is deliberate. Two valid lenses in genuine opposition means the decision has real tradeoffs and no clearly
right answer — which is close to the definition of what the owner should see. Inventing a precedence order
(Product beats Technical, or the reverse) would manufacture a resolution the analysis does not support.

**What counts as deadlock:**
- Any BLOCK from a non-Compliance lens that another lens's analysis directly contradicts.
- Two or more CONCERNs pointing in opposite directions, where satisfying one worsens the other.

**What does not:** several CONCERNs that all point the same way. That is not a deadlock, it is a decision with
known costs — proceed, record the costs, and consider whether the pile-up warrants a REVIEW-FLAG (§2.4).

### 3.5 The anti-decoration rule

The point of lenses is disagreement. A lens that always agrees is doing nothing while looking like it is.

**Two mechanisms keep this visible:**

1. **Skips are recorded, not silent.** When a lens is skipped as irrelevant, the Tier-2 output names it:
   *"Technical: not run — no build implication."* A skip is a claim, and a wrong one is legible after the fact.
2. **Verdict history is auditable.** Because every lens run produces exactly one verdict word, the log can be
   scanned. **If a lens has returned nothing but PASS across many decisions, the lens is miscalibrated or the
   decisions are not reaching it** — either way that is a finding about the protocol, and it belongs in §6 as
   precedent.

This is the same reasoning as §2.6: the safety of a quiet system rests on being able to check that the quiet
is earned.

### 3.6 Worked example

> **Decision (Tier 2):** should the alias table use sequential aliases (`Fund-A`, `Fund-B`) or opaque IDs
> (`h_7f3a`)?

```
Compliance      PASS      Neither form reaches the LLM as a real name; D-010 is satisfied either way.
Product         skip      Not run — the user never sees the alias (D-011 re-humanizes in the UI).
Technical       CONCERN   Sequential aliases are readable in logs during Phase 1 debugging, but leak
                          holding count and ordering if a profile slice is ever exposed.
Cost-and-Scope  PASS      Same implementation effort; no ongoing maintenance difference.

VERDICT: proceed with sequential aliases for Phase 1 debugging clarity, revisit before any real user
data exists (touched-data test, §2.2 — reversible now, not later).
```

Note what makes this a real deliberation rather than four agreements: Technical raised something no other
lens could see, Product honestly declined to weigh in rather than padding, and the recorded reversibility
window is what keeps the decision at Tier 2 legitimately.

### 3.7 The Product routing rule (owner's call, 25-Jul-2026 — authorizes D-030)

The Product lens now reads against a substantive point of view (PRODUCT_PRINCIPLES.md) rather than an
informal sense of "how the app should feel." This makes a class of product decisions **routable without the
owner** — which is the point, and also the risk, so the rule is bounded tightly.

**The rule:** a product decision that is **cleanly resolved by an existing principle** is Tier 1 — applied
and logged, not escalated. The owner is asked (Tier 3) only when:
1. **two principles conflict** and resolving the tradeoff is a values call, or
2. **no principle covers** the decision, or
3. the decision would **establish or amend** a principle rather than apply one.

**This rule does not suspend the checklist.** It sits at the same place every Tier-1 determination sits —
*after* §2.1's trigger checklist has run and found nothing. A principle-covered decision that still trips any
trigger (touches compliance, grows scope, is low-reversibility per the touched-data test) is **not Tier 1**,
no matter how cleanly the principle applies. Concretely: P2 (teach-not-advise) is also a compliance object, so
any decision touching *where* the advisory line sits fires trigger 2 and goes to Tier 3 regardless of P2
seeming to "resolve" it — the principle describes the settled line, it does not license moving it.

**Why this is safe** (the same argument as §2.6 and §3.5): every such decision is **logged**, so a silent
Tier-1 application is auditable after the fact and carries the Tier-2 retroactive veto — the owner can reverse
any principle-application they disagree with on review. The safety rests on two things holding: the checklist
running first (§2.0), and the principles being genuine tests rather than vibes (enforced by
PRODUCT_PRINCIPLES.md's own inclusion bar). If either weakens, this rule must be re-opened.

**A "clean" resolution is a high bar.** If applying the principle requires interpreting what the principle
*means* in a case it did not foresee, that is the §4.3 narrowing situation, not a clean application — and for
a compliance-flavored principle (P2, P6) that interpretation is Tier 3. Clean means: the principle's test,
run as written, produces one answer without needing to be stretched.

## 4. Conflict and precedence rules (COMPLETE)

Most of this section was settled inside §2 and §3. Recorded here in one place so precedence never has to be
re-derived from three separate sections.

### 4.1 Settled elsewhere (restated, not re-decided)

| Conflict | Rule | Source |
|---|---|---|
| Decision spans two categories | The **stricter** category governs (Compliance > product-judgment > technical-architectural > technical-economic > sequencing/PM) | §1.2, §2.1 |
| Compliance lens returns BLOCK | Hard veto → Tier 3, regardless of other lenses | §3.3 |
| Two non-Compliance lenses deadlock | → Tier 3, both positions stated, no invented precedence | §3.4 |
| Protocol cannot classify the decision | → Tier 3 (fails upward) | §2.1 trigger 6 |
| A trigger check is itself ambiguous | The ambiguity IS trigger 6 → Tier 3 | §2.1 |

### 4.2 Supersession requires a formal marker (owner's call, 23-Jul-2026)

Append-only means a superseded entry is never edited or deleted. The cost is that a reader scanning forty
entries cannot tell which are still live without reading all of them. The marker is what makes append-only
scannable rather than merely safe.

**Rule:** any DECISION_LOG.md entry that overrides an earlier one carries, as its first field:

```
- **Supersedes:** D-0XX — [one clause on what changed and why the earlier entry no longer governs]
```

- The superseded entry is **left exactly as written.** No edit, no strikethrough, no "SUPERSEDED" banner
  added to it. The pointer lives only in the new entry, because adding a banner would be a rewrite.
- **Partial supersession must say so:** *"Supersedes D-0XX in respect of the refusal-tone rule only; the
  rest of D-0XX stands."* Silent partial override is how a log stops being trustworthy.
- Reading order is therefore: an entry governs unless a **later** entry names it in a Supersedes field.
- This also covers the §2.3 promotion case — a Tier-1 one-liner that proved load-bearing gets a full appended
  entry marked `Supersedes:` the one-liner. Promotion and supersession use the same mechanism.

### 4.3 Interpreting a standing decision — the narrowing rule (owner's call, 23-Jul-2026)

The live risk is not contradiction; contradiction is loud and gets caught. It is **interpretation** — a later
decision that settles what an earlier one *meant* in a case the earlier one did not foresee, and in doing so
quietly moves the line.

*Worked example:* D-009 says never name a product. A later decision must settle whether an asset-class label
("large-cap equity fund") counts as a product name. Nobody is contradicting D-009. But whichever way that
lands, D-009 now means something slightly different than it did.

**The rule is split by category:**

| The decision being interpreted is… | Interpretation may happen at… |
|---|---|
| **Compliance category** (D-009, D-010, D-016, and any successor) | **Tier 3 only.** Interpreting a compliance decision is itself a compliance decision. No exceptions, including interpretations that appear to *tighten* the rule. |
| **Any other category** | **Tier 2**, provided it is logged explicitly as an interpretation and carries an automatic REVIEW-FLAG (§2.4). |

**Why compliance is absolute here.** D-009's own logic is start-strict, relax only deliberately and with
review. A rule that can be narrowed at Tier 2 is not strict — it is strict until something needs it not to be.
Loosening-by-interpretation is the specific failure this closes, and it is the failure that would be least
visible if it happened.

**Why tightening is also Tier 3.** Tightening looks safe and therefore looks skippable. But an interpretation
that tightens still changes what the product does, may contradict what the owner actually decided, and sets
precedent for the next interpretation. The tier tracks *who owns the line*, not which direction it moved.

**Non-compliance interpretations carry a mandatory REVIEW-FLAG** — not because any single one is risky, but
because interpretation is cumulative. Three narrowings of D-015's teaching rules, each defensible alone, can
move the teaching method somewhere the owner never chose. The flag makes the drift visible while it is still
one step long.

**Recording:** an interpretation is logged with an `**Interprets:** D-0XX` field (distinct from `Supersedes:`
— the earlier decision still governs; this states what it means in a case it did not cover).

---

## 5. Output formats (COMPLETE)

Two artifacts. Both drop into DECISION_LOG.md in its existing what/why/reversibility/date shape, so the log
stays one readable document rather than three interleaved formats.

**Tier 1 needs no format.** One line: what was decided, and `Tier 1`. That is the whole point of Tier 1.

### 5.1 The Tier-2 recommendation

```
### D-0XX — [decision in one line]
- **Tier:** 2 — [REVIEW-FLAGGED, if §2.4 doubt applies]
- **Supersedes:** D-0XX — [only if it does]        ← §4.2
- **Interprets:** D-0XX — [only if it does]        ← §4.3
- **Decision:** [what was decided, concretely enough to act on]
- **Lenses:**
      Compliance      PASS/CONCERN/BLOCK    [one sentence]
      Product         PASS/CONCERN/BLOCK    [one sentence]   ← or: skip — [why not relevant]
      Technical       PASS/CONCERN/BLOCK    [one sentence]   ← or: skip — [why not relevant]
      Cost-and-Scope  PASS/CONCERN/BLOCK    [one sentence]   ← or: skip — [why not relevant]
- **Why:** [the reasoning, including how any CONCERN or non-Compliance BLOCK was answered]
- **Reversibility:** [touched-data test, §2.2 — and the window, if timing changes the answer]
- **Dependency flag:** [optional — "blocked on X, automatable for [effort/cost], would unblock Y"]
- **Date:**
```

Rules: Compliance always appears (§3.2). Skipped lenses are **listed with their skip reason**, never omitted
— an absent line is indistinguishable from an oversight (§3.5). Verdicts stay one sentence; the argument
belongs in **Why**.

### 5.2 The Tier-3 brief

The system models paths and does not pick one (§2.3). The format enforces that.

```
### BRIEF — [the question, as a question]
- **Trigger fired:** [which of §2.1's six, and the specific fact that fired it]
- **Category:** [and, if multi-category, which one governs per §4.1]
- **The question:** [what actually has to be decided, stripped of everything that doesn't]
- **Paths:**
      Path A — [what it is] → [consequence, concretely] → [what it costs / forecloses]
      Path B — [same shape]
      Path C — [if real; do not manufacture a third]
- **What only the owner can judge:** [the specific thing — the risk appetite, the money, the
      philosophical line. Not "your preference."]
- **Lens work already done:** [if this escalated mid-deliberation (§2.3), attached here and marked
      WORK-IN-PROGRESS, not a settled recommendation]
- **Rule extraction:** [if this decision would produce a reusable test, name it — that test, once
      set, drops future decisions of this shape to Tier 2. Per §1.2. Write "none apparent" if so.]
- **Recommendation:** [ONLY if the owner asked for one. Otherwise this field is absent.]
```

**The rule-extraction field is the compounding mechanism.** D-013 is the proof: the owner set one test
(split-vs-merge) and it converted ten downstream decisions from judgment into application. Every Tier-3 brief
asks the same question — *did this produce a test that makes the next one cheaper?* A protocol without this
field routes the same decisions forever.

**Note on the modeling stance.** Modeling every path fully and refusing to pick is exactly what the product
does for its users (D-009). Applied inward, the reasoning holds for the same reason: the owner has context
the system does not, and a recommendation anchors a decision the system was not positioned to make.

### 5.3 Session close

The SYNC STATE block (§2.5) closes every session. REVIEW-FLAGGED Tier-2 decisions are listed **first**, above
the routine log — doubt changes visibility, not velocity (§2.4).

---

## 6. Precedent log (novel decision types)

**Fills by accretion** as decisions appear that §1's five categories do not cleanly hold, or as triggers and
lenses behave in ways worth recording. It is the growth mechanism: the taxonomy expands by appending here,
never by redesigning §1. One entry so far.

**Append an entry when any of these happen:**
- A decision does not sit cleanly in any of the five categories (it fired trigger 6 and went to Tier 3 —
  record how it was ultimately routed).
- A trigger fires in a way that was not anticipated, or fires on something clearly mechanical.
- A lens returns BLOCK for the first time, or a deadlock escalates — both are calibration data.
- A lens has returned nothing but PASS across many decisions (§3.5) — that is a finding about the lens.
- An interpretation (§4.3) reveals that a standing decision's scope was genuinely unclear.

**Entry format:**
```
### P-00X — [the decision or pattern]
- **What happened:** [the decision, and what about it did not fit]
- **How it was routed:** [tier, and by which rule or default]
- **New category / rule created:** [or: none — handled by existing rules]
- **Date:**
```

### P-001 — Scope arrived disguised as a tone question (trigger 5, first live firing)
- **What happened:** During a session drafting §1/§5 of the teaching system prompt, the owner answered a
  role question — *should the model speak as though it knows the user's history?* — with yes. Answered as
  asked, that is a voice decision and belongs in a prompt stub. But delivering it requires conversation
  storage, retrieval, a rule for what is worth remembering versus re-derivable from the baseline, and a
  retention/deletion policy. It was a capability increase wearing the clothes of a tone preference. Nothing
  about the question's framing signalled scope; the shape only became visible when the answer was traced to
  what it would take to implement.
- **How it was routed:** Tier 3 by **trigger 5 (increases MVP scope)** — the hard, no-de-minimis version
  from D-018. Trigger 2 (data handling) also fired, since retention of conversation content falls under
  D-010's unwritten privacy policy. Stricter category governs (§4.1) → Compliance. Escalated mid-session and
  parked as post-MVP by owner decision. Logged as **D-022**.
- **Why this is worth recording:** it is the first live firing of any trigger, and it fired on the case the
  guard was built for. The anti-pattern in PROJECT_GOVERNANCE.md is *silent scope growth* — scope enlarging
  "inside a schema or a reworded sentence." This was the prompt-stub version of the same move. Two
  calibration findings:
  1. **The checklist-before-tier ordering (§2.0, §2.6) is what caught it.** Had tiers been guessed first,
     this would have been assigned Tier 1 or 2 as a prompt-wording call and never tested against trigger 5.
     This is direct evidence for the dependency recorded in §2.6 — the silent Tier 1 is safe *because* the
     checklist runs first, and that ordering must not be weakened.
  2. **Scope increases do not announce themselves in the vocabulary of scope.** Trigger 5 must be checked
     against what a decision would *require to build*, not against how the question was phrased. Phrasing is
     not the unit of analysis; consequence is.
- **New category / rule created:** None — §1's five categories held (this was product-judgment spanning into
  compliance, resolved by the existing stricter-governs rule). No redesign warranted. The finding is about
  **how trigger 5 must be applied**, not about the taxonomy: check the implementation consequence of an
  answer, not the register of the question.
- **Date:** 23-Jul-2026

### P-002 — When a rule is routed around twice, the third fix should be architectural
- **What happened:** During the product-principles extraction pass (D-030), a candidate stated as a product
  principle — *"when a prompt-level rule has been routed around twice, the third attempt should be
  architectural"* — was found to be a principle about **how the project fixes things**, not about how the
  app behaves. It does not belong in PRODUCT_PRINCIPLES.md (which tests product decisions); it belongs here,
  as a decision-making precedent.
- **The pattern:** established twice already. D-010 turned "the model must not name products" (a policy the
  model follows) into aliasing (a guarantee the architecture provides). D-028 turned "the model must not
  choose which path to deepen" into the backend `deepen` field, after two prompt-level fixes (D-025's rule 5,
  then the sentence-level guard) were each routed around by the same behaviour re-expressing itself through a
  new channel.
- **The rule, stated for reuse:** when a behaviour has evaded **two** instruction-level fixes, the third fix
  should change the architecture (move the decision into backend logic or a data guarantee), not write a
  third instruction. Two re-routes are evidence about the instrument, not the wording — a third instruction
  will likely be routed around through whatever channel remains open.
- **How it routes a decision:** a proposed third instruction-level fix to a twice-routed behaviour should be
  treated as fired trigger 5 (the architectural alternative is almost always a scope increase) and escalated
  — the owner decides whether to pay the architectural cost or accept the leak. This is what happened at
  D-028 (Path C, chosen over two cheaper prompt-level options).
- **New category / rule created:** none — this is a decision-making heuristic, logged as precedent, not a new
  taxonomy category. It compounds the protocol the way a rule-extraction test does: it converts a family of
  "should we write another rule?" decisions into an application of a set test (has this been routed around
  twice?).
- **Date:** 25-Jul-2026

**Review trigger:** if §6 reaches roughly ten entries, the taxonomy in §1 is probably wrong rather than
incomplete — that is the signal to revisit §1 deliberately, as its own Tier-3 decision. Below ten, keep
appending; do not redesign.

---

## Change log
- v1.2 (25-Jul-2026) — Product lens given substantive content (authorizes **D-030**). §3.1 Product lens now
  reads against **PRODUCT_PRINCIPLES.md** rather than an informal "how the app should feel." New **§3.7** —
  the Product routing rule: a product decision cleanly resolved by an existing principle is Tier 1 (applied,
  logged, not escalated); the owner is asked only when principles conflict, none covers the decision, or the
  decision would set/amend a principle. The rule explicitly does not suspend the §2.1 checklist — a
  principle-covered decision that trips any trigger (notably: P2 is a compliance object, so advisory-line
  moves fire trigger 2) is not Tier 1. Safety rests on the checklist running first (§2.0) and on principles
  being genuine tests, both auditable via logging + retroactive veto. New **P-002** precedent appended to §6:
  the "routed around twice → third fix is architectural" pattern (from D-010, D-028), placed here rather than
  in PRODUCT_PRINCIPLES.md because it governs how the project fixes things, not how the app behaves. This is
  accretion + one calibration edit to §3, not a redesign; protocol design remains closed at v1.0.
- v1.1 (23-Jul-2026) — First §6 precedent entry appended: **P-001**, recording that conversation memory
  entered a prompt-drafting session as a tone question and fired trigger 5 (plus trigger 2 on data handling),
  escalating to Tier 3 and parking as D-022. Two calibration findings recorded: the checklist-before-tier
  ordering is what caught it (direct evidence for the §2.6 dependency), and trigger 5 must be checked against
  what an answer would require to BUILD, not against the vocabulary the question was asked in. No taxonomy
  change — the five categories held. Protocol design remains closed at v1.0; this is accretion, not redesign.
- v1.0 (23-Jul-2026) — §4, §5, §6 written; protocol COMPLETE. §4: precedence table restating what §2/§3
  settled, plus two owner calls — supersession requires a formal `Supersedes:` marker on the new entry (the
  old entry is never touched, and partial supersession must say so), and interpretation of a standing
  decision is Tier 3 for compliance-category decisions (both loosening AND tightening) but Tier 2 with a
  mandatory REVIEW-FLAG elsewhere, because interpretation drift is cumulative. §5: three formats — Tier 1 is
  one line, the Tier-2 recommendation carries the lens block with skips listed explicitly, the Tier-3 brief
  models paths without recommending and carries the rule-extraction field that compounds the protocol. §6:
  opened empty with append criteria and a review trigger at ~10 entries. D-017's cap is now reached; next
  work is Phase 1 (D-006).
- v0.3 (23-Jul-2026) — §3 written and COMPLETE: the four lenses (Compliance, Product, Technical,
  Cost-and-Scope), each defined by the objection only it can raise. Four owner judgment calls: Compliance
  BLOCK is a hard veto sending the decision to Tier 3 regardless of other lenses; lenses are
  relevance-selected EXCEPT Compliance, which always runs (a skipped veto-holding lens is the one gap no flag
  catches); verdicts are structured PASS/CONCERN/BLOCK plus one sentence; deadlock between two
  non-Compliance lenses escalates rather than being resolved by an invented precedence order. Cost-and-Scope
  deliberately narrowed to owner-attention and maintenance drag, since trigger 5 already prevents any
  scope-adding decision from reaching Tier 2. Anti-decoration rule added (§3.5): skips are recorded, verdict
  history is auditable, an always-PASS lens is a finding. §4 reduced to two remaining questions.
- v0.2 (23-Jul-2026) — §2 written and COMPLETE: routing sequence (checklist-before-tier), the six Tier-3
  triggers, pinned definitions for reversibility (touched-data test) and scope (hard trigger), the three tier
  definitions, the Tier-2-only doubt threshold, the mandatory session-close sync block, and the safety
  argument for a silent Tier 1. Seven owner judgment calls captured: hard scope trigger; Tier 2 acts
  immediately with retroactive veto; Tier-1 authority bounded by home; promotion by new entry (not rewrite);
  mid-deliberation escalation carries its work; touched-data reversibility; doubt threshold on Tier 2 only.
- v0.1 (23-Jul-2026) — File created per D-017. §0 framing and §1 taxonomy complete (retroactive
  classification of D-001–D-016, five categories, ~55% recoverable bandwidth, stricter-category-governs rule,
  D-013 rule-extraction template). §2–§6 stubbed with drafting notes.
