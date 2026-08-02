# BRIEF-005 — Does the "worth [X]" bridging pattern on unasked-but-relevant mentions need its own rule, and
does another named-example patch stand a real chance of closing it?

> Tier-3 decision brief, written per DECISION_PROTOCOL.md §5.2. The system models paths; it does not pick.
> No recommendation field — the owner has not asked for one.
> **Date raised:** 02-Aug-2026, from BQ-007 (see PHASE1_RUN5_RESULTS.md, FINDING 11).

---

## Trigger fired

**Trigger 2 (legal / regulatory exposure)** — this is §3 rule 5 territory directly: the rule that governs
whether the model tells the user what is true versus what to attend to.

**Trigger 3 (contradicts or reinterprets a standing principle)** — any resolution here interprets D-025,
which wrote rule 5 and named "worth having in view first" as a literal failing example. Whether this counts
as that same failure recurring, or a distinct one, is itself part of the question below.

**Routing:** §4.3's narrowing rule. D-025 is compliance-category; interpreting it is **Tier 3 only, no
exception for interpretations that tighten.**

## Category

Compliance (§4.1's stricter-governs rule; no other lens has a live objection here).

---

## The question

BQ-007 re-ran Q1 five times against v0.7 to check FINDING 9 and FINDING 10. Scoring the full checklist (not
just those two items) surfaced something neither was looking for. Four of five runs, on mentioning Card-1 (a
holding rule 2 requires naming, not one the user asked about), wrap it in "worth" framing:

> Run 1: "**Worth flagging** alongside this: your card is carrying ₹86,000 at 42%..."
> Run 3: "**Worth having in the background:** your card is carrying ₹86,000 at 42%..."
> Run 4: "One more thing **worth naming**... so it's **worth having in view** as you decide where the ₹2
> lakh goes."
> Run 5: "Also **worth noting**: Card-1 is separately running at 42%..." and, on a different subject
> entirely (the emergency-fund/liquidity point), "...that's **worth having in view**."

Two of those five reproduce **"worth having in view"** — not a paraphrase, the literal phrase §3 rule 5
already names, in the prompt the model was given, as an explicit FAIL example:

> "Worth having in view first," "worth more of your attention than," and "the sharper answer hiding in it"
> all rank, and all fail this test.

**So: is this the same failure D-025 already named and supposedly closed, still leaking through the named
ban — or a distinct channel the named examples never actually targeted, that happens to produce similar
surface wording?**

### Why this is genuinely difficult

- **The named phrase itself came back.** FINDING 2 (Run 1, D-024) established that a blocklist of banned
  *phrases* cannot hold a semantic line, because the model routes around named phrases via synonyms. D-025's
  fix was deliberately NOT a blocklist — it was a test ("does this tell the user what is TRUE, or what to
  ATTEND to?") with named examples as illustration, not enforcement. Here, the model didn't route around the
  named example; it reproduced it. That is a different failure shape from what D-025 was built to survive,
  and it raises a harder question than "add another banned phrase" — if the literal named example still
  leaks, it's not obvious that naming more examples fixes anything.
- **The subject matter may be a genuinely different channel.** FINDING 6 (D-027) already sorted "worth" into
  two populations: operating on a holding the user is choosing between (fails) versus operating on a concept
  (permitted). Every prior case D-025's rule was tested against involved ranking *among paths the user was
  actively deciding between* (Q1's prepay-vs-invest, Q3, Q5). Card-1 here is neither of the two paths in
  play — it's a third, materially-relevant fact rule 2 requires including. The model may not be "ranking" in
  the sense D-025 tested at all; it may be reaching for "worth X" as a generic bridge whenever it introduces
  *anything* adjacent to the question, regardless of whether ranking is even the right frame. Run 5's second
  occurrence — "worth having in view" applied to the emergency-fund point, not a holding at all — is evidence
  for this reading: the pattern doesn't track "which holding matters most," it tracks "I'm adding something
  you didn't ask about."
- **A prompt-level test already targets this in principle.** The true-vs-attend test is written broadly
  enough to already cover "worth having in view" wherever it appears — it doesn't only apply to named paths.
  So this may not need a *new* rule at all, only a demonstration that the existing test, worded more forcibly
  around bridging language specifically, holds better than a fourth named example would.
- **Rate matters differently here than in FINDING 9/10.** 4/5 runs show some form of this; 2/5 reproduce the
  exact named phrase. That is a materially higher rate than FINDING 9 (1/5) or FINDING 10 (0/5 after the
  fix), on a rule that has already been through one full revision (D-025) specifically to close this exact
  wording.

---

## Paths

### Path A — Add a third named category to rule 5: bridging into a not-asked-about-but-relevant fact

**What it is.** FINDING 6 split "worth" into two populations (holdings the user is choosing between vs.
concepts). Add a third, explicit population: introducing something the user's question did not raise but
that rule 2 or the baseline data makes relevant (an existing holding, an emergency-fund figure, anything in
the profile). State plainly that this category gets zero introductory framing — no "worth," "notably,"
"also," "one more thing" — just the fact, stated the way any other true sentence in the answer is stated.

**Consequence, concretely.** Card-1 becomes: "Your card is carrying ₹86,000 at 42% — a separate cost sitting
alongside these two paths." No lead-in verb, no justification for why it's being mentioned at all — it's
just there, the way profile numbers already are elsewhere in the answer.

**What it costs / forecloses.** This is the same *shape* of fix that already failed once (D-025 named an
example; the model still produced it). If the reason it failed is "named examples don't hold," adding a
third named category is the same instrument tried a third time, and the brief's earlier point applies:
Run 4 and Run 5 didn't paraphrase around "worth having in view" — they used it verbatim, despite it already
being named. There's a real chance this path doesn't move the rate at all.

### Path B — Replace/supplement the test with a structural rule: no introductory framing of any kind on unasked material

**What it is.** Rather than naming more phrases, add a rule that targets the *mechanism*, not the wording:
any sentence introducing something the user's question did not raise must be a bare declarative — no lead-in
clause, transition phrase, or justification of relevance, regardless of what words it uses. This is the
BRIEF-002 rule-extraction lesson applied here: "does the rule govern what the model SAYS or what it DOES" —
a rule against specific phrases governs saying; a rule against the presence of *any* introductory framing
governs the act of bridging itself, which is harder to route around because it doesn't name a target to
avoid.

**Consequence, concretely.** Closes not just "worth having in view" but "notably," "it's also worth
mentioning," "one thing to flag," and any other bridge the model might reach for next — the test is
structural (is there a lead-in at all?) rather than lexical (does it match a banned phrase?).

**What it costs / forecloses.** Broader rules are harder to verify compliance with by inspection — "no
lead-in of any kind" is a stricter bar than it sounds, and some genuinely useful transitions ("separately,"
plain topic sentences) could get caught by an overzealous reading. Untested whether this measurably reduces
the rate versus Path A, since both are still prompt-level instructions relying on the model to follow them.

### Path C — Backend-side deterministic check, post-generation

**What it is.** Since this is now the second time a prompt-level fix to this exact rule (D-025, tested here)
has been asked to hold and the literal named phrase came back, treat it as approaching P-002 territory
(routed around / still leaking → go architectural) — but unlike D-010's aliasing or D-028's `deepen` field,
there's no structured decision to move into the backend here; this is about sentence style, not which content
gets shown. The closest architectural equivalent: a deterministic post-generation scan for a short list of
known-leaked phrases ("worth having in view," "worth flagging," "worth noting," "worth having in the
background," and whatever else future runs surface), which either blocks the response for regeneration or
flags it for logging before the user sees it.

**Consequence, concretely.** Closes the specific phrases already observed with a hard backstop independent of
whether the model "learns" not to use them. Also creates a running, auditable log of how often the backstop
fires — useful signal for whether the underlying tendency is shrinking or not.

**What it costs / forecloses.** No backend exists yet (scope increase, fires trigger 5, needs its own
escalation). It is also inherently incomplete — pattern-matching on free text only catches phrasings already
seen, so it doesn't fix the tendency, only backstops the specific instances found so far. Doesn't touch the
open question of whether this is the same channel as D-025 or a new one; it just makes the answer matter
less by closing the door mechanically either way.

---

## What only the owner can judge

**Whether this is the same channel as D-025/FINDING 6, or a distinct one.** If it's the same channel
(ranking, just showing up on a holding instead of a named path), the literal named phrase leaking through is
strong evidence the instrument (named examples) doesn't hold and this is closer to P-002 territory than
FINDING 10 was. If it's a distinct channel (a generic bridging habit, evidenced by Run 5's use on the
emergency-fund point), Path A's narrower fix is a legitimate first attempt at a genuinely new category, the
same reasoning D-035 used for FINDING 10.

**Whether "worth noting" — as opposed to "worth having in view first" — actually crosses the line at all.**
The softer variants (Run 1's "worth flagging," Run 5's "worth noting") are gentler than the original FINDING
2 case, which ordered problems ("worth having in view first," ranking implied by "first"). Whether the owner
reads unadorned "worth noting" as still failing the true-vs-attend test, or as acceptable connective tissue
that doesn't direct attention the way "first" or "more than" did, is a judgment call this brief does not
make for them.

**Risk appetite on a second attempt at the same instrument.** Path A repeats the shape of fix that already
underperformed once on this exact rule. The owner may judge one underperformance isn't yet enough to abandon
prompt-level fixes (matching D-035's reasoning for FINDING 10), or may judge the literal-phrase-recurrence is
itself strong enough evidence to skip straight to Path B or even open the Path C conversation despite its
cost.

---

## Lens work already done

None. §4.3's narrowing rule sends this to Tier 3 directly, before any Tier-2 lens analysis is run.

---

## Rule extraction

**Candidate test, stated so future decisions of this shape can be checked against it:**

> **A named-example ban is falsified by the example itself recurring, not only by paraphrase.** FINDING 2
> showed a blocklist gets routed around via synonyms. This is the other failure mode: the exact named example
> can still leak verbatim, which means naming an example is not by itself evidence the underlying behavior is
> understood or closed — only that one specific string is flagged. The test the example was meant to
> illustrate (true vs. attend) is what has to hold; the example itself is not the guarantee.

**A second candidate:**

> **When "worth"-style bridging language appears on something rule 2 requires naming but the user didn't ask
> about, check whether it recurs on non-holding material too (the way Run 5's emergency-fund instance does)
> before assuming the fix belongs to the holdings-ranking rule.** A pattern that generalizes past the
> holdings-and-paths frame D-025/FINDING 6 were built around is evidence of a different, broader mechanism —
> a bridging habit, not a ranking habit — and the fix should be scoped to what's actually recurring, not to
> the frame the last fix used.

If adopted, the first test becomes a standing check on every future named-example fix in this prompt: did the
literal example ever come back, not just a synonym for it. The second sharpens FINDING 6's split from two
populations into a reusable check for whether a new occurrence belongs to an existing category or signals a
new one.
