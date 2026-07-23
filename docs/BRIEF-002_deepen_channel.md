# BRIEF-002 — Does "go deep on one path" hand the model a ranking channel that rule 5 cannot reach?

> Tier-3 decision brief, written per DECISION_PROTOCOL.md §5.2. The system models paths; it does not pick.
> No recommendation field — the owner did not ask for one.
> **Date raised:** 23-Jul-2026, from Phase 1 Run 2 (see PHASE1_RUN2_RESULTS.md, FINDING 4).

---

## Trigger fired

**Trigger 2 (legal / regulatory exposure)** — bears directly on the advisory line.

**Trigger 3 (contradicts or reinterprets a standing principle)** — any resolution here interprets D-025,
which itself interprets D-009. It also bears on D-015 rule 2, which is the rule creating the gap.

**Routing:** §4.3's narrowing rule. D-025 is compliance-category; interpreting it is **Tier 3 only, with no
exception for interpretations that tighten.** Cannot be settled at Tier 2 in either direction.

## Category

Compliance, multi-category with product-judgment (§2 rule 2 is a teaching-method decision and any fix
modifies it). §4.1's stricter-governs rule puts it in Compliance.

---

## The question

D-025 forbade the model from **saying** one of the user's problems deserves attention first. Run 2 confirms it
worked at sentence level — the ranking sentences are gone from Q1, Q3 and Q5.

But §2 rule 2 (from D-015) requires the model to **name every path, then go deep on one.** It authorises the
selection and is silent on how to make it. In Run 2's Q1 the model:

> "I'll go deep on the mechanism for the card, **since that's the rate doing the most damage per rupee.**"

It then described the loan path with the card looped into it, and described the savings path entirely in terms
of the card.

**No sentence ranked the user's problems. The answer did.**

**So: is choosing which path to deepen an act of prioritisation, and if so, how does the model make that
choice without ranking?**

### Why this is genuinely difficult

- **§2 rule 2 exists for a good reason.** Depth is rationed because a teaching moment that explains four
  mechanisms is not a teaching moment. Removing "deepen one" would break D-015's core teaching design.
- **Something must be chosen.** Any selection rule the model applies is a ranking of some kind. Choosing
  randomly is absurd; choosing by rate is what it currently does and is exactly the problem; choosing what
  the user named is defensible but may leave the sharpest number unexplained.
- **This is the second re-route of the same behavior.** Run 1: a phrase blocklist was routed around via
  "worth." Run 2: a sentence-level rule was routed around via structure. There is no sign of evasion — the
  model finds 42% genuinely most important and expresses that through whatever channel is open. A third fix
  aimed at one more channel may simply produce a fourth channel.
- **The observable behavior may be correct.** A user with a 42% card arguably *should* have the card
  mechanism explained. The compliance question is not whether the content helps; it is whether choosing it
  constitutes directing.

### What this must settle

Whether the resolution is expressible as a **rule the model applies**, or whether the selection has to be
made **outside the model** — by the backend, mechanically. Run 2 is the second piece of evidence that
prompt-level rules on this behavior get routed around rather than obeyed.

---

## Paths

### Path A — The user's question determines what gets deepened. Full stop.

**What it is.** Amend §2 rule 2: the model deepens the mechanism the user's question is about. If the question
names two paths, it deepens one of those two. A holding the question did not touch may be named with its
numbers (D-025's narrow reading) but never becomes the deepened path.

**Consequence, concretely.** Q1 asks prepay-vs-invest → the model deepens prepay or invest, not the card.
Card-1 still appears — "you're also carrying ₹86,000 at 42%, roughly ₹36,000 a year" — as a named path with
its numbers, not as the explained one. The user sees the number and is not walked through why it matters most.

**What it costs / forecloses.** The sharpest thing in the profile goes unexplained. A user who does not
already understand revolving credit sees "42%" and may not grasp what it does. Q6 of Run 1 is the
counter-evidence — mechanism-only framing made the stakes fully legible without ranking — but Q6 was a case
where the user asked about the card. Here they did not. It also leaves a live edge: is choosing *which of the
two user-named paths* to deepen still a ranking? Probably smaller, but not zero.

### Path B — Deepen nothing on multi-path questions; equal shallow treatment.

**What it is.** When a question is decision-shaped and multiple paths exist, the model gives each path the
same depth — mechanism named, consequence in rupees, no path explained further than another. Depth returns
only when the user pulls a thread ("tell me more about the card").

**Consequence, concretely.** Q1 becomes three symmetric paragraphs. The user chooses what to go deeper on. It
makes §2 rule 4's equal-vividness requirement structural rather than aspirational, and it closes the
reference-frame capture problem at the same time — no path can be the lens if none is privileged.

**What it costs / forecloses.** It contradicts D-015 rule 2 as written ("teach one mechanism deeply; name the
others as threads"), which was a deliberate product-judgment call about what a teaching moment is. Three
shallow explanations may be the "drift-to-uselessness" edge D-015 explicitly named as failure mode (b). It
also lengthens answers — three equal treatments will run past D-026's recalibrated bands.

### Path C — The backend picks the deepened path; the model is told which one.

**What it is.** Selection moves out of the model. The profile slice (§4) carries a field — e.g.
`deepen: "Loan-1"` — set by backend logic from the user's question. The model explains what it is told to
explain and does not choose.

**Consequence, concretely.** The ranking channel closes completely, because the model has no selection to
make. It also makes the choice **auditable** — the rule lives in code that can be read, tested, and shown to
a regulator, rather than in a model's per-response judgment. This is the same move D-010 made for product
names: convert a prompt-level rule into an architectural guarantee.

**What it costs / forecloses.** It is the only path that is not prompt-level. It requires backend selection
logic that does not exist, in a system where no backend exists yet — so it is a scope increase (trigger 5) and
would itself need to be escalated as a build decision. It also pushes a judgment into code that may need the
model's context to make well: the backend would need its own rule for what to deepen, and that rule is the
same hard question one layer down. It does, however, mean the hard question gets answered **once, explicitly,
in a readable place** rather than per-response by a model.

---

## What only the owner can judge

**Whether structural prioritisation is the same regulatory object as stated prioritisation.** D-025 settled
that *saying* "this deserves attention first" is advice. Whether *choosing to explain* the same item is also
advice is a distinct question, and it is a judgment about how a regulator reads an output, not about what
makes a better product.

**Whether D-015 rule 2 is amendable.** Path B modifies a settled product-judgment decision about what a
teaching moment is. That was the owner's call in D-015 and reversing it is the owner's call too.

**Risk appetite on the third re-route.** Two prompt-level fixes have now been routed around by the same
behavior. The owner should decide whether a third prompt-level fix is the right instrument, or whether the
evidence now points to architecture (Path C) — accepting that Path C costs a scope increase and pushes the
judgment into backend logic that must then be designed.

**Whether Q1's actual output was harmful.** The Run 2 Q1 response is arguably *good financial education*.
If the owner reads it and concludes the user is well served and the SEBI exposure is acceptable, that is a
legitimate finding and would point toward a narrower fix — e.g. banning only the stated justification ("since
that's the rate doing the most damage") while permitting the selection itself.

---

## Lens work already done

None. §4.3's narrowing rule sent this to Tier 3 directly, before any Tier-2 lens analysis was run.

---

## Rule extraction

**Candidate test, stated so future decisions of this shape can be checked against it:**

> **Does the rule govern what the model SAYS, or what the model DOES?**
> A rule about wording can be satisfied while the same judgment is expressed through structure — which path
> is deepened, which is named first, which becomes the frame for the others. When a behavior re-routes after
> a wording-level fix, the next fix must govern the act, not the sentence.

If adopted, this becomes the standard check on any future prompt rule aimed at model behavior rather than
model vocabulary. It generalises the lesson of both runs: D-025's own rule-extraction test (*true vs
attend*) was correct and still insufficient, because it was a test applied to sentences.

**A second, sharper candidate:**

> **When a prompt-level rule has been routed around twice, the third attempt should be architectural.**
> D-010 already established this pattern for product names — a policy the model must follow became a
> guarantee the architecture provides. The same reasoning may apply here.
