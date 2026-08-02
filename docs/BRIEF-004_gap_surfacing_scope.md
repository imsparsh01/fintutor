# BRIEF-004 — Does the gap-surfacing rule (D-032) need to widen, and can that happen without making the
model's under-naming of relevant holdings (FINDING 9) worse?

> Tier-3 decision brief, written per DECISION_PROTOCOL.md §5.2. The system models paths; it does not pick.
> No recommendation field — the owner has not asked for one.
> **Date raised:** 02-Aug-2026, from Phase 1 Run 4's repeat series (see PHASE1_RUN4_RESULTS.md, FINDING 9 and
> FINDING 10; both surfaced 01-Aug-2026, carried forward here per the build session's own recommendation).

---

## Trigger fired

**Trigger 2 (legal / regulatory exposure)** — FINDING 10 is the model volunteering an unraised gap
(term-insurance) on a question that never touched it. That is the advisory-line / gap-surfacing-scope
question D-009 → D-025 → D-032 have been narrowing for three decisions running.

**Trigger 3 (contradicts or reinterprets a standing principle)** — any resolution here interprets D-032
(itself compliance-category, interpreting D-025, interpreting D-009). FINDING 9 separately touches D-015
rule 2 (name every path) — not obviously a reinterpretation on its own, but the two findings pull on the
same prompt section (§2), and a fix for one risks moving the other. See "Why this is genuinely difficult."

**Routing:** §4.3's narrowing rule. D-032 is compliance-category; interpreting it is **Tier 3 only, no
exception for interpretations that tighten.** Cannot be settled at Tier 2.

## Category

Compliance, multi-category with product-judgment (§2 rules 2 and 3 are teaching-method decisions from D-015
and D-032; any fix modifies them). §4.1's stricter-governs rule puts it in Compliance.

---

## The question

D-032 tightened §2 rule 3 (the closing "open door" offer) to be on-topic only, after FINDING 8 showed the
model volunteering the term-insurance gap on an explicitly off-topic question (Q7). D-032 pre-registered its
own falsification condition:

> "if a future run shows the model volunteering an unraised gap in a context Path B's on-topic constraint
> does not catch (e.g. a question that is finance-adjacent but should still not trigger surfacing), that is
> new evidence Path B is insufficient."

Run 4's repeat series (n=5, `FIXTURE_user_01.json`, Q1 — prepay-vs-invest, never touches insurance) produced
exactly that: one run inserted, **mid-answer**, before the close —

> "One other thing sits in the picture: you're carrying ₹40 lakh of debt with a spouse and a four-year-old,
> and there's no life cover recorded anywhere. That debt doesn't disappear if you do — it lands on whoever
> inherits the house."

**So: does this count as D-032's pre-registered falsification, or is it a genuinely new channel D-032 never
governed in the first place?**

Both readings are defensible and they lead to different paths:

- **Reading 1 (the build session's own conclusion):** D-032 said a single occurrence on a new channel is
  "already new evidence Path B is insufficient," independent of rate. Q1 is that channel — on-topic, but
  never raising insurance. Under this reading, Path B has now failed twice (Q7, then Q1), which is P-002's
  own bar for going architectural.
- **Reading 2 (a narrower diagnosis):** D-032's rule 3 amendment only ever governed the **closing** open-door
  move. Here the gap was inserted **mid-answer**, not at the close — the close itself was fine (it offered to
  go deeper on prepayment, on-topic). That is a location no rule has ever specifically addressed, which is
  structurally the same situation D-032 itself found FINDING 8 in ("a missing rule being written for the
  first time, not one being routed around") — meaning P-002's "same channel, twice" bar has **not** actually
  been met, because the channel (mid-answer insertion) is new, not repeated.

The brief does not resolve which reading is correct — that is exactly the kind of compliance-line judgment
this protocol reserves for the owner (§4.3). It matters because Reading 1 points toward Path B/C below
(broaden the gate now); Reading 2 points toward Path A (patch the specific hole first, keep P-002's
two-strikes bar intact for the next one).

### Why this is genuinely difficult

- **A rate-based objection: 1/5.** FINDING 10 is lower-frequency than FINDING 9's 40%. D-032 explicitly said
  rate does not matter for this specific falsification condition — but the owner should decide whether that
  pre-commitment still holds, or whether n=5 is too small to act on regardless of what D-032 said in advance.
- **Tightening the gate risks worsening FINDING 9.** FINDING 9 is the model dropping Card-1 (42% APR, the
  fixture's own dominant number) from the answer entirely, 2/5 runs. Both misses substitute an
  emergency-fund/liquidity consideration for Card-1, rather than a random drop — the model is choosing
  *something* to add beyond the user's literal question and picking wrong. If the fix for FINDING 10 makes
  the model more conservative about mentioning anything the user did not explicitly name, that conservatism
  could easily suppress Card-1 further, not less — Card-1 is itself an "unraised" thing by the user's literal
  question (Q1 only names the home loan and ₹2 lakh). §2 rule 2 already requires naming Card-1 (it is
  materially relevant, not a fresh gap); §2 rule 3 (D-032) governs surfacing gaps that are *not yet part of
  the user's baseline as a captured holding*. These are different rules today, but a broadly-worded fix to
  one could bleed into the model's handling of the other — which is exactly the failure FINDING 9's own
  writeup already suspected ("worth checking whether D-032's on-topic tightening... got over-applied by the
  model to the opening path-naming step too").
- **This is the third amendment attempt at the same rule family.** D-025 (sentence-level), D-028 (structural,
  the `deepen` field), D-032 (on-topic scope) have all touched §2/§3's surfacing and depth rules. P-002 says
  a behavior routed around twice should get an architectural fix on the third attempt — but P-002 requires
  the *same* channel to fail twice, and whether FINDING 10 is the same channel as FINDING 8 is exactly the
  Reading 1 vs. Reading 2 question above.
- **FINDING 9 may not independently need Tier 3.** It does not obviously reinterpret what §2 rule 2 requires
  — the rule already says "name every path"; the model just isn't reliably doing it. That looks more like a
  reliability problem (Product/Technical lens territory) than a compliance reinterpretation. It is included
  in this brief anyway because it constrains the solution space for FINDING 10, not because it independently
  fires a trigger — flagged explicitly so the owner can decide it separately if they'd rather.

---

## Paths

### Path A — Patch the specific hole: extend §2 rule 3's on-topic constraint to the whole answer, not just the close

**What it is.** D-032 currently governs only the closing "open door" offer. Amend §2 so the on-topic
constraint applies everywhere a gap could be surfaced — mid-answer or at the close, same rule, same test
("is this thread already in the room"). This treats FINDING 10 as Reading 2: a hole in *where* the existing
rule applies, not evidence the rule's *logic* is wrong.

**Consequence, concretely.** The exact channel Repeat 2 used (inserting an unraised gap as a mid-answer
"one other thing") gets closed by the same on-topic test D-032 already validated at the close. No change to
how the model handles paths the user *did* name — lowest risk of bleeding into FINDING 9's territory, because
the amendment is scoped to gap-surfacing language specifically, not to path-naming generally.

**What it costs / forecloses.** If Reading 1 is actually correct — the model's tendency to volunteer this
particular gap is more persistent than a single closing-paragraph leak — this patches the symptom seen so far
and leaves the door open for a fourth channel (e.g., mid-answer via a different rhetorical frame than "one
other thing sits in the picture"). It does not resolve the P-002 question; it defers it until/if a fourth
occurrence appears, which is only clean if the owner is comfortable treating this as genuinely new evidence
rather than a repeat.

### Path B — D-032's own reserved option: a standalone, broader gate on all unprompted surfacing

**What it is.** Adopt what D-032 itself held in reserve as "Path A" (renamed here to avoid clashing with this
brief's own Path A) — not an on-topic patch to rule 3, but a standalone constraint, independent of where in
the answer it appears: the model may not introduce *any* holding, gap, or product type the user's profile
does not already carry as a captured record and the user's question did not raise, full stop, regardless of
topic adjacency.

**Consequence, concretely.** Closes both the closing-offer channel (already closed by D-032) and the
mid-answer channel (FINDING 10) in one rule, on the theory that the specific location is not the point — the
model volunteering unraised gaps at all is the thing to stop, wherever it happens. Simpler to state and
audit than a location-specific patch.

**What it costs / forecloses.** This is the path most likely to interact badly with FINDING 9. A rule this
broad, worded around "the user's question did not raise it," does not obviously distinguish between a *new*
gap (term insurance) and an *existing, materially relevant holding* (Card-1) that the user also didn't
explicitly name in this particular question. If the model already conflates these (FINDING 9's open
question), a broader "don't introduce what wasn't raised" instruction could plausibly make Card-1 omissions
worse, not better — the opposite of what §2 rule 2 requires. Would need very careful wording, tested against
both fixtures, to avoid this — not a small ask, and untested until it is.

### Path C — Move gap-surfacing eligibility to the backend, mechanically (architectural)

**What it is.** The same move D-010 made for product names and D-028 made for path-deepening: stop asking
the model to judge topicality at all. The profile slice carries a backend-set field (e.g.
`surfaceable_gaps: []`, populated only when the backend's own logic determines the current turn is a good
moment) — the model may only ever mention a gap that appears in that list, never one it infers is relevant
on its own.

**Consequence, concretely.** Closes the channel completely and makes it auditable in code rather than in a
per-response judgment — the strongest guarantee of the three paths, and consistent with P-002's own logic if
the owner concludes (Reading 1) that this rule family has now failed enough times to warrant architecture.

**What it costs / forecloses.** No backend exists yet to compute `surfaceable_gaps` — this is a scope
increase (fires trigger 5 on its own) and would need its own escalation before it could be built. It also
relocates the hard question rather than answering it: the backend needs a rule for *when* a gap is
surfaceable, which is the same judgment D-012's trigger-logic design item already named as undesigned. This
is the highest-cost, most durable path, and the one most clearly out of scope for a prompt-only fix this
session.

---

## What only the owner can judge

**Whether FINDING 10 is Reading 1 or Reading 2** — i.e., whether a single mid-answer occurrence on an
on-topic question is the same failing channel as FINDING 8 (Q7, off-topic), just proving D-032's fix
insufficient as pre-registered, or a genuinely new location no rule has addressed yet. This determines
whether Path A (patch) is a legitimate first attempt or a third pass at an already-failing rule that should
go straight to Path B or C per P-002.

**Risk appetite on rate vs. pre-commitment.** D-032 explicitly said a single occurrence would be sufficient
evidence regardless of rate. Whether that pre-commitment should still bind at n=5, or whether the owner wants
more data before treating 1/5 as decisive, is a judgment about how much weight a self-imposed evidentiary bar
should carry once the actual data comes in.

**Whether FINDING 9 should be decided in the same pass or separately.** FINDING 9 does not independently fire
a Tier-3 trigger, but a broadly-worded fix to FINDING 10 (Path B in particular) risks making it worse. The
owner may want to explicitly sequence this — e.g., accept a narrower FINDING 10 fix now specifically because
FINDING 9 hasn't been separately resolved — or may judge the two are independent enough to decide on their
own timelines.

**Whether the architecture cost (Path C) is worth paying now.** No backend exists yet; choosing Path C
commits to building trigger-logic design work (already an undesigned §8 item under D-012) sooner than
otherwise planned. That trade — pay the cost now for a durable guarantee, vs. defer it and accept prompt-level
risk a while longer — is the owner's to weigh, same as it was at D-028.

---

## Lens work already done

None. §4.3's narrowing rule sends this to Tier 3 directly, before any Tier-2 lens analysis is run.

---

## Rule extraction

**Candidate test, stated so future decisions of this shape can be checked against it:**

> **Before invoking P-002 ("routed around twice → go architectural"), confirm the same channel actually
> failed twice — not merely a failure that resembles a past one in shape.** D-032 already established this
> once, distinguishing FINDING 8 (a missing rule for a channel no prior fix targeted) from a genuine repeat.
> This brief's Reading 1 / Reading 2 split is the same check applied to FINDING 10: rate and topical
> resemblance are not sufficient on their own to establish "same channel" — location and mechanism (closing
> offer vs. mid-answer insertion) matter too.

**A second candidate, new to this brief:**

> **When two findings share a prompt section, model the fix for one against the other before choosing.**
> FINDING 9 and FINDING 10 both live in §2's path-naming and gap-surfacing rules. A fix evaluated for FINDING
> 10 alone (Paths B/C especially) could look correct in isolation and still move FINDING 9 the wrong
> direction. Once adopted, this becomes a standing check whenever two open findings touch the same prompt
> section: state the interaction explicitly rather than resolving them as if independent.

If adopted, the first test converts a family of future "is this the same channel or a new one?" questions
(the same shape as D-032's own diagnosis of FINDING 8) from a fresh judgment call each time into an
application of a named check.
