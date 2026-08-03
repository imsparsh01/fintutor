# BRIEF-007 — How does the system decide WHICH unrecorded product type to surface, and WHEN?

> Tier-3 decision brief, written per DECISION_PROTOCOL.md §5.2. The system models paths; it does not pick.
> No recommendation field — the owner did not ask for one.
> **Date raised:** 03-Aug-2026, scoping D-012's undesigned "trigger logic" consequence (item 1 of 4).

---

## Trigger fired

**Trigger 2 (legal / regulatory exposure)** — bears directly on the advisory line. Choosing which
unrecorded product type to raise, when several could plausibly apply, is the same structural-
prioritization question BRIEF-002/D-028 already settled for a different behavior ("deepen").

**Trigger 3 (contradicts or reinterprets a standing principle)** — any resolution here interprets
PRODUCT_PRINCIPLES.md's P2 ("teach never advise — the line is what the output DOES, not what it
SAYS") and D-032 (the open door may only lead to a room the user is already in). It also touches P1
("don't ask; infer, surface, or defer"), which is what makes surfacing happen at all.

**Routing:** either trigger alone sends this to Tier 3 per §2.0; both firing together makes it
unambiguous. No lens deliberation was run — a fired trigger skips lens work entirely.

**Trigger 5 considered, does not clearly fire this time.** Unlike D-028 (written when no backend
existed at all), AI-surfaced capture is already committed MVP scope per D-012 and PROJECT_SPEC.md §4
item 6 — building the mechanism for an already-spec'd flow is not the same as adding a new one. Noted
for completeness, not treated as a second scope-based trigger.

## Category

Compliance, multi-category with product-judgment (P1/P2 are product principles, but §4.1's
stricter-governs rule puts a decision that interprets the advisory line in Compliance regardless).
Same classification shape as BRIEF-002 and BRIEF-006.

---

## The question

D-012 established that surfacing an unrecorded product type organically, in-conversation, is core
MVP UX — not a menu, not later-phase. D-032 narrowed WHEN this may happen: only Trigger A (in-surface,
on-topic) is MVP; proactive/unprompted "cold" surfacing (Trigger B) is explicitly out. What was never
designed is the mechanism itself: given a user's stored profile and the conversation so far, **what
decides which product type is a candidate to raise, and what decides that this particular moment is
the right one to raise it?**

**The scoping finding worth stating plainly: this splits into two different problems, not one.**

1. **WHICH — candidate selection.** Given the user's existing holdings (Investments/Loans/Insurance,
   D-013) and what's absent, which missing product type(s) are relevant enough to be worth surfacing
   at all? This can be computed **mechanically, entirely backend-side, right now** — a fixed pairing
   table against data that already exists in Supabase (e.g. a home/personal loan with no term
   insurance recorded is a candidate; income with no discretionary categories set is a candidate for
   the budgeting concept). This needs no conversation interface — it's the same shape of computation
   as BQ-010's `compute_budget()`, reading the stored profile, not parsing live free text.
2. **WHEN — moment selection.** Given a candidate list, is *this* conversational turn an organically
   on-topic moment to raise one of them? This is exactly D-032's existing on-topic-only constraint,
   already written into the prompt and tested (FINDING 8 fixed) — but D-032 governs surfacing gaps in
   *existing* holdings' context, not introducing a wholly new, unrecorded product type. Whether the
   same rule transfers cleanly, or needs its own test pass, is itself part of what's undesigned.

This split matters because it means the "no interface exists yet" problem that deferred BQ-004
(D-049) does **not** block WHICH — that half is buildable today, against data already in Supabase. It
only potentially blocks WHEN, and even that is closer to "extend an existing, already-tested prompt
rule" than "invent conversational NLU from nothing."

## Why this is genuinely difficult

- **Choosing among multiple simultaneously-relevant candidates recreates BRIEF-002's exact shape.**
  If a backend rule mechanically produces a *candidate list* rather than a single chosen item, the
  compliance question doesn't fully close — if more than one candidate is on-topic in the same turn,
  something still has to pick which one gets raised first (or at all), and that "something" is a
  choice with the same shape as deepen-selection. A candidate *list* is a real improvement over a
  candidate *pick*, but is not by itself the whole answer.
- **BRIEF-006's own rule extraction applies here too.** Moving "which product type to raise" from the
  teaching model to a narrower classifier call would face the identical question already raised there:
  does a smaller model choosing satisfy an auditable guarantee, or does it just relocate the judgment?
- **D-032's on-topic test was built and tested against a different scenario.** It governs whether an
  already-relevant *existing* holding may be named on an off-topic question (FINDING 8). Surfacing an
  *absent* product type is arguably a different act — inviting a new topic in, not naming one already
  present — and hasn't been run through Phase 1 testing in this shape at all.
- **Getting WHICH right doesn't fully de-risk WHEN.** Even a perfectly mechanical candidate list still
  hands the model a judgment call about conversational appropriateness — narrower than today's
  undesigned state, but still real discretion, in a channel Phase 1 has not tested.

---

## Paths

### Path A — Backend precomputes a mechanical candidate list (WHICH); the model applies the existing on-topic constraint (WHEN); ties are broken by a fixed precedence rule, not the model.

**What it is.** A fixed pairing table (e.g. home_loan/personal_loan → term_insurance; no discretionary
categories set → budgeting concept) runs against the stored profile — the same kind of backend
computation as `compute_budget()` — and produces a short candidate list carried in the profile slice.
The model may raise a candidate only if the current message is already, organically, on-topic for it
(D-032's existing test, extended to this new scenario and re-verified via Phase 1). If more than one
candidate is on-topic in the same turn, a fixed precedence order in the pairing table — not the
model — decides which one (if any) gets raised, and at most one per turn.

**Consequence, concretely.** Closes the WHICH question completely (mechanical, auditable, buildable
today against existing schema) and narrows WHEN to the smallest possible surface: an already-tested
constraint, applied to a new but structurally similar scenario, with the multi-candidate tie-break
also made mechanical rather than left open.

**What it costs / forecloses.** Requires designing and maintaining a pairing/precedence table by hand
— a real, ongoing product-judgment artifact (which pairings are "natural," which one wins when two
apply) that itself deserves scrutiny each time it's extended. D-032's on-topic test needs its own
Phase-1-style verification in this new context before this can be trusted, not assumed transferable.

### Path B — No backend precomputation; leave both WHICH and WHEN to the model under prompt rules (P1, P2, D-032).

**What it is.** The status quo, made explicit rather than left implicit: the teaching model, using
the full profile and its own read of the conversation, decides both what's worth surfacing and when,
constrained only by existing prompt-level rules.

**Consequence, concretely.** Cheapest — no new backend logic. Keeps the mechanism entirely at the
level D-012/D-032 already operate at.

**What it costs / forecloses.** This is precisely the shape of behavior D-028 already found gets
routed around when left to model discretion once real compliance weight is attached — the Run 1/Run 2
pattern (phrase blocklist → "worth"; sentence rule → structure) that took two iterations and an
architectural fix to close for "deepen." Choosing Path B here means accepting the same risk in an
untested channel, on the strength of an assumption (that surfacing is different enough from deepening
to not repeat the pattern) that hasn't been checked.

### Path C — Defer entirely; ship MVP with manual-add only, no organic surfacing at launch.

**What it is.** AI-surfaced capture of *new, unrecorded* product types doesn't ship in the first MVP
cut. Only the manual fallback path exists for adding a holding the AI hasn't organically surfaced.

**Consequence, concretely.** Removes the compliance question entirely by removing the behavior.
Simplest to reason about and to test.

**What it costs / forecloses.** Unlike BQ-004's deferral (D-049), this is not "wait for infrastructure
that doesn't exist yet, on a mechanism that was always secondary" — D-012 explicitly recorded organic
surfacing as core MVP UX, "not a later-phase add-on," across ALL product types. Path C reverses an
explicit standing commitment, not merely a stub. That is a materially different, bigger cost than
D-049's deferral was.

---

## What only the owner can judge

**Whether Path A's mechanical tie-break actually closes the compliance gap, or whether a hand-built
precedence table is itself a form of backend-side prioritization that deserves its own scrutiny each
time it's extended.** This can, in principle, nest indefinitely — at some point a fixed rule has to be
trusted as "mechanical enough," and where that line sits is a judgment call, not a technical one.

**Whether reversing D-012's explicit "core MVP UX, all types, not later-phase" commitment (Path C) is
acceptable**, given it was recorded deliberately at the time, not left ambiguous.

**Risk appetite on repeating the deepen pattern.** Path B is cheap precisely because it changes
nothing — but D-028's own history says that is exactly the condition under which the same behavior
gets routed around. Whether that risk is acceptable for a channel (new-product surfacing) that hasn't
been tested yet is the owner's call, not a technical one.

---

## Lens work already done

None. Both fired triggers route directly to Tier 3 per §2.0, before any lens deliberation runs.

---

## Rule extraction

**Candidate test, extending BRIEF-002/BRIEF-006's own lineage:**

> **A backend-computed candidate LIST is a real improvement over the model choosing outright, but it
> is not itself the whole fix. If more than one candidate can be simultaneously eligible, the tie-break
> among them must also be mechanical — otherwise the same structural-prioritization channel reopens one
> level up, just among a shorter list.**

If adopted, this generalizes to any future design (deepen, surfacing, or otherwise) where a backend
rule narrows the model's discretion to a *set* rather than a single item: narrowing the set closes
part of the gap, but the selection *within* the set needs the same scrutiny the original single-choice
selection got, not a pass on the assumption that a shorter list is automatically safe.
