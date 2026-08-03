# BRIEF-008 — Which user segment(s) should FinTutor commit to as its founding target?

> Tier-3 decision brief, written per DECISION_PROTOCOL.md §5.2. The system models paths; it does not pick.
> No recommendation field — the owner did not ask for one.
> **Date raised:** 03-Aug-2026. Owner-initiated: flagged that despite substantial Phase 1/2 progress, the
> product has no defined target-user segments, no PRD, and no screens — `PROJECT_SPEC.md` §3 still reads as
> one undifferentiated paragraph. Scoped deliberately to segmentation ONLY this session (pain points,
> GenAI-solution mapping, MVP prioritization, and screen/PRD work sequenced as separate follow-on sessions,
> per PROJECT_GOVERNANCE.md's one-strategic-question rule). Method: two independent subagent drafts — one
> reasoning as a Product/user-research lens, one as a Business/GTM lens — compared below rather than
> synthesized into a single view, so genuine disagreement stays visible.

---

## Trigger fired

**Trigger 3 (contradicts or reinterprets a standing principle)** — one candidate segment (debt-heavy,
reactive/stressed users) is flagged by the Product-lens draft as the population most likely to demand a
ranked answer ("just tell me what to do"), which is exactly what P2 (teach never advise — the line is what
the output *does*) forbids. Deciding whether to include this segment in the founding/testing population
bears directly on whether the teach-not-advise line gets tested under real pressure or deliberately avoided
— a judgment about the advisory line itself, not a product-fit question the Product lens can resolve alone.

**Trigger 6 (unclassifiable)** — this decision spans product-judgment (which population the design should
serve) and business/GTM (which population is viable to acquire and retain) with no single category cleanly
governing. Per §4.1's multi-category rule, the stricter category (compliance, via trigger 3) governs, but
the ambiguity itself is worth naming rather than smoothing over.

**Routing:** either trigger alone sends this to Tier 3 per §2.0; no lens deliberation was run (the checklist
runs before, not instead of, tier assignment).

## Category

Product-judgment, multi-category with compliance (via P2 exposure) and business/GTM. Stricter-governs rule
(§4.1) puts it in Compliance-adjacent territory for the specific sub-question of whether to test against the
debt-heavy/reactive segment; the broader segment-selection question is product-judgment.

---

## The question

`PROJECT_SPEC.md` §3 currently defines the target user as "anyone earning who wants to self-manage their
finances... not defined by age; defined by intent." That line has never been stress-tested against an actual
segmentation exercise. Two independent lenses were asked to propose candidate segments from scratch, without
seeing each other's work. **Which segment(s), if any, should FinTutor commit to as its founding design and
Phase-3-testing target** — and does §3's "intent, not age" framing survive contact with a real segmentation
attempt?

## What the two independent drafts found

**Product lens** (fit/capability-driven) proposed: (1) financially unmanaged, single-income, low-complexity
early-career — strongest fit; (2) fragmented multi-holding salaried — strongest test of the Consolidated/
reconciliation features, but strains P1 ("don't ask") because legacy holding detail often can't be inferred;
(3) variable/self-employed income — weakest fit, because zero-friction capture implicitly assumes a
structured recurring signal (salary, EMI) that gig income doesn't have; (4) debt-heavy/reactive/stressed —
the segment most likely to break P2 under real urgency; (5) household financial coordinator — structurally
unsupported, since the baseline data model (D-038) is single-user, not multi-person.

**Business lens** (acquisition/viability-driven) proposed: (1) young salaried professionals, 24–32,
metro/tier-1 — strongest first wedge (low CAC, low trust-barrier, matches "unmanaged but willing"); (2)
dual-income households, 30–40 — higher revenue ceiling later, but too high a trust barrier to lead with; (3)
gig/freelance/irregular income — compelling mission narrative, weak unit economics and fragmented
acquisition; (4) first-jobbers/campus — cheap top-of-funnel only, near-zero financial complexity; (5) NRIs —
skip for now, cross-border/regulatory scope not designed.

**Convergence:** both lenses, working independently, landed on essentially the same segment as the strongest
candidate — early-career, single-income-stream, low-complexity salaried — for different but compatible
reasons (Product: least to mis-infer, cleanest fit for AI-surfaced teaching; Business: lowest CAC, lowest
trust barrier, cleanest match to the "unmanaged but willing" positioning already in §3).

**Convergence on a risk:** both independently flagged the gig/freelance/variable-income segment as weak —
Product on structural/technical grounds (the capture mechanism doesn't work without a recurring signal),
Business on commercial grounds (weak unit economics despite strong mission-narrative appeal). Worth noting
explicitly: the segment that *sounds* most aligned with FinTutor's "self-manage instead of hand it to an
advisor" positioning may be the weakest fit on both axes that were checked.

**A meta-finding neither lens was asked to produce, but both surfaced independently:** despite §3's "not
defined by age; defined by intent" framing, both lenses reached for age/life-stage-correlated variables
(income structure, holding complexity, career stage) as their actual distinguishing axis. The Product lens
said so explicitly ("breaks down empirically the moment you segment for real... complexity and life-stage
are not independent of age, they're downstream of it"); the Business lens didn't address the framing
directly but used age bands (24–32, 30–40, 21–24) as its own primary segmentation variable throughout,
without being asked to. This is flagged here, not corrected — changing §3's language is the owner's call, not
something to edit as a side effect of this brief.

---

## Paths

*(Not mutually exclusive — Path C narrows the field before choosing between A and B.)*

### Path A — Commit now: adopt the convergent segment (early-career, single-income, low-complexity salaried) as the sole founding target for design and Phase-3 testing.

**Consequence, concretely.** Every downstream design decision (onboarding shape, which pain points the
AI-surfacing logic prioritizes, what "done" looks like for the first real screens) gets a sharp, real
population to design against instead of an abstract one. Matches the segment both lenses independently
called strongest, for non-overlapping reasons — a real signal, not a coin flip.

**What it costs / forecloses.** The app's most differentiated feature — the Consolidated view and living-
baseline reconciliation (D-038) — is built for a population (segment 1) that has almost nothing to
reconcile. It would go unvalidated against the population it was actually designed for (fragmented
multi-holding users) until a deliberately later wave. Also quietly resolves §3's "not defined by age" framing
in practice without saying so in the spec — the framing and the actual founding-segment choice would
diverge unless §3 is also revisited.

### Path B — Keep §3's target-user language broad, as currently written; treat segmentation as a Phase-3 recruitment question only, not a design commitment yet.

**Consequence, concretely.** Preserves flexibility — no design work gets locked to one population's needs
before real screens exist to react to (mirrors how Decision 2 was deliberately deferred until a real Phase-1
section existed). Avoids over-fitting the earliest screens to a segment that may turn out wrong.

**What it costs / forecloses.** Real design decisions get made anyway, implicitly, the moment anyone builds
an onboarding flow or decides which AI-surfacing triggers to prioritize — without an explicit target, that
implicit choice isn't visible or auditable. This is exactly the "silent scope/direction drift" anti-pattern
`PROJECT_GOVERNANCE.md` warns against, just applied to audience instead of scope.

### Path C — Formally exclude the two structurally-unsupported segments (household financial coordinator; NRIs) now, as a scoping decision separate from picking a founding segment among the rest.

**Consequence, concretely.** Both exclusions trace to decisions already made, not new ones being invented:
household coordination would require a multi-person baseline, which contradicts D-038's single-user model;
NRIs would require cross-border/regulatory scope beyond D-009's India-only compliance posture. Narrows the
real field to three real candidates (early-career low-complexity; fragmented multi-holding; debt-heavy/
reactive) before Path A or B is decided.

**What it costs / forecloses.** Nothing substantive — this looks like applying existing decisions rather than
making a new one, but is included as its own path because *silently* narrowing the field without saying so
would itself be the drift `PROJECT_GOVERNANCE.md` warns against.

---

## What only the owner can judge

**Whether the debt-heavy/reactive segment belongs in the founding/testing population at all.** This is the
segment most likely to pressure-test whether "teach, never advise" survives contact with a user who wants a
ranked answer under real financial stress. Testing it early means finding P2's real edges sooner, at the
cost of real risk exposure with real (if early/private) users; deferring it means shipping and validating the
core teaching loop on a lower-stakes population first, at the cost of not knowing whether P2 holds under
pressure until later. This is a risk-appetite call, not a product-fit call.

**Whether to commit to one founding segment now (Path A) or stay deliberately broad (Path B).** Both lenses
converging on the same answer is a real signal, but it is a signal from two AI-run drafts reasoning from the
same written spec, not from real user contact — Phase 3 (private structured testing) hasn't happened yet.
Whether that's sufficient evidence to commit, or whether committing now is premature relative to how little
real-user signal exists, is the owner's call.

**Whether §3's "not defined by age; defined by intent" framing should be revisited**, given that both
independent lenses, unprompted, used age/life-stage-correlated variables as their real distinguishing axis.
This brief does not propose new wording — per `CLAUDE.md`'s file-permission rules, `PROJECT_SPEC.md` changes
get proposed and confirmed, not made silently — but the tension is real enough that leaving it unexamined
would itself be a choice.

---

## Lens work already done

Both drafts (Product lens, Business lens) are attached in full above — independent, not sequential, so
disagreement stayed visible instead of being smoothed into a single synthesized view. Marked
WORK-IN-PROGRESS: this is exploratory segmentation work, not a settled recommendation, and no path has been
chosen.

---

## Rule extraction

**Candidate test, stated so future decisions of this shape can be checked against it:**

> **When independently-run lenses (no shared context, no sequential influence) converge on the same answer
> for different, non-overlapping reasons, that convergence is admissible signal for a founding product
> decision — but it is signal from written-spec reasoning, not from real user contact, and should be weighted
> accordingly until real-user evidence (Phase 3) exists.**

Flagged as a candidate only — this is the first time this project has run two independent lenses on the same
open question and compared rather than synthesized, so there is n=1 evidence this method produces useful
disagreement-surfacing. Worth deciding explicitly whether to reuse this method for the next sequenced piece
(pain points, once segments are chosen) or treat it as a one-off.
