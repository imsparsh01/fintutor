# BRIEF-001 — Does D-009's "never pick a winner" cover problems the user did not raise?

> Tier-3 decision brief, written per DECISION_PROTOCOL.md §5.2. The system models paths; it does not pick.
> No recommendation field — the owner did not ask for one.
> **Date raised:** 23-Jul-2026, from Phase 1 Run 1 (see PHASE1_RUN1_RESULTS.md, FINDING 1).

---

## Trigger fired

**Trigger 2 (legal / regulatory / tax exposure)** — this bears directly on the advisory line and on how
D-009's scope is read.

**Also trigger 3 (contradicts or reinterprets a standing principle)** — any answer here interprets D-009 and
the teach-not-advise principle in a case D-009 did not foresee.

**Routing:** §4.3's narrowing rule applies. Interpreting a **compliance-category** decision is **Tier 3 only,
with no exception for interpretations that appear to tighten.** This cannot be settled at Tier 2 in either
direction.

## Category

Compliance. Multi-category (product-judgment is also live — how the app feels is genuinely at stake), but
§4.1's stricter-governs rule puts it in Compliance.

---

## The question

D-009 forbids picking a winner among the paths the user raised. **It says nothing about the model volunteering
which of the user's several problems deserves attention first.**

In Phase 1 Run 1 the model repeatedly did the latter:

- **Q1** (asked: prepay or invest?) → "Whatever else you do with the ₹2 lakh, that number is worth having in
  view **first**."
- **Q3** (asked: just tell me) → "Nothing you hold outearns 42% reliably enough to **justify** leaving that
  balance running."
- **Q5** (asked: is now a good time to buy equity?) → "Those two numbers are **worth more of your attention
  right now than** market timing."

In each case the model was **arithmetically correct** — 42% > 9% > 3% is not an opinion — and in each case it
**ranked the user's problems without being asked to.**

**So: is unprompted prioritisation teaching (making stakes legible, D-015 rule 4) or advising (resolving a
decision, D-009)?** The prompt currently has no rule either way, which is why the behavior appeared.

### Why this is genuinely difficult

- D-015 rule 4 **requires** the model to make consequences vivid in concrete numbers. A model that knows
  ₹86,000 is compounding at 42% and says nothing is arguably failing its teaching duty.
- But "this matters more than that" is a **judgment about the user's situation**, and it is exactly the
  judgment a registered adviser is licensed to make and FinTutor is not.
- The user's own framing does not settle it either. In Q6 the user explicitly asked *"what to do first"* —
  ordering was responsive there, not volunteered. The line moves depending on what was asked.

### One more thing this must settle

The observed leak was not in any forbidden phrase. The model never said "you should." It said **"worth."**
Whatever path is chosen has to be expressible as **a rule about what the model may do**, not as a longer
blocklist of words — a blocklist demonstrably did not hold (FINDING 2).

---

## Paths

### Path A — Prioritisation is ADVICE. Forbid it.

**What it is.** Extend §3: the model may not rank, order, or direct attention among the user's holdings or
problems unless the user's question asked it to. It may state each item's mechanism and numbers; it may not
say one deserves attention before another.

**Consequence, concretely.** Q3's break disappears. Q1's "in view first" becomes "Card-1 is at 42%, Loan-1 at
9%, Deposit-1 at 3%" with no ordering language. Q5's redirect disappears entirely — the model declines to
predict and stops, or teaches the SIP mechanism without telling the user what deserves attention instead.
Q6's answer survives largely intact, because there the user asked.

**What it costs / forecloses.** A user with a 42% card and a 3% savings balance may read a scrupulously
unordered response and not register which number is on fire. Q6 is the counter-evidence — "every rupee moved
onto the card stops costing you 42% instantly" made the stakes fully legible *without ranking anything* — so
this may cost less than it appears. But it is the strictest reading and it will sometimes feel obtuse.
It also risks D-015's named failure edge (b): drift-to-uselessness.

### Path B — Prioritisation is TEACHING when it is arithmetic. Permit it, bounded.

**What it is.** The model may surface a number as significant when the significance is arithmetically
demonstrable and stated as arithmetic ("42% is the highest rate in your profile; it compounds faster than
anything else here"). It may not use comparative-evaluative framing about what the user should attend to
("worth your attention first," "the sharper answer," "justify").

**Consequence, concretely.** Most of Run 1's outputs stay as they are with light rewording. Q3 still fails —
"nothing justifies leaving that balance running" is evaluative under this rule too. The distinction the model
must hold is *state the rate, do not rank the priority*.

**What it costs / forecloses.** The line between "42% is the highest rate here" and "the 42% deserves your
attention first" is thin, and a model that produced "worth" four times unprompted may not hold it reliably.
Every ambiguous case resolves toward speech rather than silence, which is the wrong default direction if D-009's
start-strict logic governs. It also needs testing to know whether it holds — Path A is checkable by reading
output; Path B requires judging intent.

### Path C — Prioritisation is permitted only when the user's question opens the door.

**What it is.** Ordering is allowed when the user asks a question whose answer requires it ("what should I
deal with first?", "what am I missing?") and forbidden when volunteered. Q6 permitted; Q1, Q3, Q5 forbidden.

**Consequence, concretely.** Matches the pattern in the data exactly — the one case where ordering felt
correct (Q6) is the one where the user asked. Preserves usefulness where the user has actively invited
direction, blocks it where the model volunteered.

**What it costs / forecloses.** It makes compliance depend on the model correctly classifying the user's
intent, which is a judgment call made per-response and cannot be audited from the output alone. A user who
asks "what should I do first?" has asked for a recommendation — answering it may be *more* exposed under SEBI,
not less, since the model is then directing on request. This path may invert the risk it is trying to manage.

---

## What only the owner can judge

**Where the SEBI line actually sits on unprompted prioritisation** — not what makes a better product, but
what an Indian securities regulator would call unregistered advisory activity if it read these six outputs.
D-009 was decided on a specific reading of the enforcement climate (the 2024–25 amendments, the January 2025
circular, the December 2025 finfluencer case). This question is a direct extension of that reading, and the
owner is the one holding it.

**Risk appetite on a thin line.** Path B is more useful and asks the model to hold a distinction it has
already demonstrated it does not hold reliably. Path A is safer and may make the product feel evasive to
someone with a genuine emergency in their profile. That trade is the owner's.

**Whether D-009's start-strict logic governs here too.** D-009 chose the stricter of two available postures
and recorded that tightening later is harder than relaxing later. If that reasoning extends to this case, it
points to Path A for MVP with deliberate review after real users. If this case is different, the owner should
record why.

---

## Lens work already done

None. This did not escalate mid-deliberation — the §4.3 narrowing rule sent it to Tier 3 directly, before any
Tier-2 lens analysis was run.

---

## Rule extraction

**A reusable test is available here, and naming it is most of the value of this brief.**

Candidate, stated as a question future decisions of this shape can be checked against:

> **Does the output tell the user what to attend to, or only what is true?**
> Stating a rate, a total, or a mechanism = true. Stating that one item matters more than another, or should
> come first, or is the sharper problem = attending. The first is teaching; the second is direction.

If the owner adopts something like this, it converts a family of future prompt-wording decisions from
judgment into application — the same mechanism that made D-013's split-vs-merge test convert ten decisions.
It would apply to §6 refusal edge cases, to any future teaching-method revision, and to reviewing model output
in later phases.

Whichever path is chosen, **the resolution should be expressed as a rule of this shape** — a test the model
applies to its own output — rather than as additional forbidden phrases. FINDING 2 is the evidence: the
blocklist did not hold, and "worth" is not a word that can be usefully banned.
