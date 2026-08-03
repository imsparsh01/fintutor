# BRIEF-006 — How does the backend decide which holding to deepen, without the model's contextual read?

> Tier-3 decision brief, written per DECISION_PROTOCOL.md §5.2. The system models paths; it does not pick.
> No recommendation field — the owner did not ask for one.
> **Date raised:** 03-Aug-2026, picking up BQ-004 (BLOCKED, traces to D-028's explicitly deferred question).

---

## Trigger fired

**Trigger 2 (legal / regulatory exposure)** — this is BRIEF-002's own unresolved question
("is choosing what to explain the same regulatory object as saying what deserves attention?"),
now concretized as a backend design problem rather than a prompt problem.

**Trigger 5 (increases MVP scope)** — deepen-selection logic does not exist anywhere in the
codebase. `backend/` (BQ-011/009/010/012) has data models and a budget computation endpoint; there
is no chat/conversation orchestration layer, no NLU step, nothing that turns a user's raw question
into structured intent. `app/` (the actual mobile app) is still empty. Building this is new backend
capability, not an extension of something already decided.

**Routing:** either trigger alone routes to Tier 3 per §2.0; both firing together makes it
unambiguous. No lens deliberation was run (§2.0 — the checklist runs before, not instead of, tier
assignment; a fired trigger skips lens work entirely).

## Category

Compliance, multi-category with product-judgment and technical-architectural. §4.1's
stricter-governs rule puts it in Compliance — same classification BRIEF-002 used for the same
underlying question.

---

## The question

D-028 settled that the *model* must not choose which holding to deepen — the profile slice carries
a `deepen` field the backend sets, and the model follows it without justifying by rate, size, or
urgency. That decision was stubbed: fixtures hand-write the `deepen` field for Phase 1 testing, and
D-028 explicitly deferred "here is how the backend chooses" as its own decision, warning it "will
fire trigger 5 when it comes." It has now come — BQ-004 is the only queued item still BLOCKED on
it.

The hard question D-028 relocated is still exactly as hard: **something has to look at the user's
question and decide which holding (if any) is relevant enough to deepen, and whatever does that
looking is making a judgment call.** Moving the decision from "the teaching model, per response" to
"the backend, in code" only closes the compliance gap if the backend's logic is genuinely
mechanical and auditable — not if it just relocates the same judgment into a different, still-opaque
model call.

## Why this is genuinely difficult

- **No NLU layer exists to hand this to.** Real user questions are free text ("should I pay off my
  loan or invest the difference?"). Nothing in the current backend parses that into "this concerns
  Loan-1." Building that parsing *is* the scope increase trigger 5 flagged.
- **A model call that classifies intent is not obviously different from the thing D-028 banned.**
  If the backend's "mechanical" rule is actually a Haiku call asking "which holding does this
  question concern," the selection is still a model's per-response judgment — just a narrower,
  cheaper model making it instead of Sonnet. Whether that satisfies D-028's "auditable in code"
  guarantee, or merely moves the same regulatory question one layer down, is not obviously
  resolved by D-028's own text.
- **A purely mechanical (no-model) rule is weak against real questions.** String/alias matching
  against free text will rarely produce an unambiguous match for natural phrasing. Under D-028 sub-
  decision 1, an unmatched question means "deepen nothing" (equal shallow treatment) — which is
  safe, but if it fires on most real questions, the deepen mechanism does very little work for MVP.
- **The rest of the app this would feed doesn't exist yet.** There is no conversation UI, no
  question-intake flow, nothing in `app/` at all. Designing the selection rule in isolation, before
  the interface that would produce the "user's question" this rule reads, risks solving against a
  guessed shape of input rather than a real one.

---

## Paths

### Path A — A narrow classification model call (e.g. Haiku, reusing D-002's two-model split) picks the holding; a fixed rule gates confidence.

**What it is.** A structured, non-teaching model call takes the user's question + the profile's
holding list and returns either a single holding alias or "none." The backend only sets `deepen` when
the call returns a single confident match; anything else is absent (falls to D-028's equal-shallow-
treatment fallback).

**Consequence, concretely.** Reuses existing architecture (D-002) rather than inventing a new
component. Handles natural free-text questions far better than string matching. The classification
prompt and its inputs/outputs are logged and inspectable after the fact.

**What it costs / forecloses.** This is the path most exposed to the "did we actually fix anything"
critique above — a model is still choosing, just a smaller one, on a narrower question. It is not
"the rule lives in code that can be read, tested, and shown to a regulator" in the sense D-028's Path
C promised; it's a classifier whose behavior on edge cases is itself a matter of model judgment, the
same shape of problem D-028 was written to escape.

### Path B — Mechanical matching only: alias/keyword text match, or an explicit UI selection signal (user taps a holding before/while asking). No model call anywhere in the loop.

**What it is.** `deepen` is set only when the question text contains a holding's alias/product-type
keyword unambiguously, or — stronger — only when the UI itself tells the backend which holding the
user is currently focused on (a tap, a screen context), never inferred from free text at all.

**Consequence, concretely.** This is the path that actually delivers D-028's original promise: a
rule in code, testable, with no model judgment in the selection path at all. The UI-signal variant in
particular has zero inference — the user's own action picks the holding, not a rule guessing at their
intent.

**What it costs / forecloses.** The text-match variant will rarely fire on real natural-language
questions, so most real questions fall to the "deepen nothing" fallback — the mechanism does little
work. The UI-signal variant requires the app (`app/`, currently empty) to carry a selection-context
concept before this can be built at all, meaning BQ-004 cannot actually be implemented ahead of real
screen/interaction design.

### Path C — Defer backend selection logic entirely for MVP; ship D-028's fallback (equal shallow treatment) as the only behavior.

**What it is.** No deepen-selection logic gets built now. BQ-004 stays blocked, possibly re-scoped or
removed from the near-term queue, until a real conversation interface exists to design the selection
rule against.

**Consequence, concretely.** Cheapest, and honest about the fact that this problem is currently being
designed against a guessed shape of input rather than a real one — nothing in `app/` yet produces
"the user's question" this rule would consume. Compliance question stays open but also stays
low-stakes: with no selection logic, every question gets equal shallow treatment, which is the
already-accepted safe fallback.

**What it costs / forecloses.** Postpones the actual product/teaching value D-015 rule 2 was written
to deliver (going deep on the mechanism that matters) indefinitely, not just until a specific
milestone.

*(Considered and not written up as a fourth path: a purely financial-metric-driven rule — e.g.
always deepen the holding with the highest rate or largest outflow, regardless of question content.
BRIEF-002 already identified this exact behavior as the original problem ("choosing by rate is what
it currently does and is exactly the problem") — it would reintroduce structural prioritization by
size/rate without even being responsive to what the user asked, which is a regression, not a
candidate.)*

---

## What only the owner can judge

**Whether a narrow classifier call (Path A) satisfies D-028's "auditable in code" guarantee, or only
relocates the same compliance question to a different, still-opaque model.** This is a judgment
about how a regulator would read "a smaller model decided" versus "code decided," not a technical
question.

**Whether BQ-004 is premature relative to the rest of the build.** `app/` is empty; there is no real
conversation interface yet. Whether it's worth designing a selection rule now (Paths A/B) against a
guessed input shape, or explicitly deferring (Path C) until a real interface exists to design
against, is a sequencing call about the project as a whole, not just this backend logic.

**If Path B is chosen, whether relying mostly on the "deepen nothing" fallback for most real
questions is an acceptable MVP tradeoff.** D-028 already built that fallback as safe-by-default; the
question is whether a deepen mechanism that rarely fires is worth having versus not building one at
all (converging with Path C in practice).

---

## Lens work already done

None. Both fired triggers route directly to Tier 3 per §2.0, before any lens deliberation runs.

---

## Rule extraction

**Candidate test, stated so future decisions of this shape can be checked against it:**

> **Moving a judgment from the teaching model to a narrower, different model call does not by
> itself satisfy an "auditable in code" guarantee — it only does if the narrower call's behavior on
> edge cases is itself fully specified and testable, not left to that model's own judgment.**
> A guarantee is architectural only when a human can read the rule and predict its output; a
> classifier call that quietly makes its own judgment calls on ambiguous input is a relocation, not
> a resolution.

If adopted, this becomes the standard check any time a proposed fix routes a compliance-sensitive
decision through *any* model call, not only the user-facing one — generalizing D-028's own "does the
rule govern what the model SAYS or DOES" test one level further, to "does moving it to a different
model actually change what governs the decision."
