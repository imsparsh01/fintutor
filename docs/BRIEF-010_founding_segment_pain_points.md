# BRIEF-010 — Pain points for the founding segment (D-053/D-054)

> Findings, not a decision — the next sequenced piece after D-053/D-054, per the one-question-at-a-time
> plan agreed this session. Two independent lenses (Product, Business/GTM), run blind to each other, same
> method as BRIEF-008/009. One real fork surfaced mid-research (ESOP/taxonomy) is escalated below in
> Tier-3 shape; everything else here is descriptive, for the next session (pain-point → GenAI-solution
> mapping) to build on.
> **Date raised:** 03-Aug-2026, same session as D-053/D-054.

---

## Product lens — pain points by profile (user-need angle)

**Shared across all three profiles**
- Can't verify employer deductions are actually correct (e.g. EPF shown on a payslip vs. what's actually
  deposited) — no way to check without a portal login they don't use.
- No single place to see "what do I actually have" — holdings scattered across apps/paper/memory.
- EMI/premium due dates tracked by memory or bank SMS; missed payments discovered only after a penalty.
- Jargon opacity — NAV, sum assured, XIRR, principal outstanding appear unexplained on their own statements.
- No living cash-flow picture — a "budget," if it exists at all, is stale within weeks.

**Fresh starters** — don't know what a "first move" even is (no framework for save vs. protect vs. invest,
so default to inaction or copying a friend/parent); no sense of what's normal for their situation, so the
anxiety is about not knowing the shape of the decision space at all, not a specific product.

**Reactive dabblers** — hold one product bought under pressure (family/agent), can't explain what it does,
what it costs, or what happens if they stop paying; can't check if it's even appropriate for its stated
purpose without effectively asking "which one should I have bought"; sunk-cost fear blocks re-evaluation
since exiting feels like admitting a costly mistake, with no neutral way to reason about exit mechanics.

**Habit-formers** — already tracking in a spreadsheet, so a re-ask of organized data reads as regression,
not help; want to know if their structure has a blind spot without the app naming what to add or where;
frustrated by generic tips that read as noise and erode trust in the AI-surfacing layer generally.

**Where the natural fix risks crossing teach-vs-advise (flagged by this lens explicitly):**
1. "Is this product right for me" (reactive dabblers) — the natural answer is a verdict on their specific
   holding; the app can only teach the mechanism and let the user judge fit.
2. "What should my first move be" (fresh starters) — any ordered "do X then Y" list is a ranking; the app
   can surface categories/tradeoffs, not sequence.
3. "Do I have a blind spot" (habit-formers) — naming a gap is fine; naming what should fill it (an amount,
   a product category) tips into prescribing.

---

## Business lens — pain points by profile (adoption/trust/retention angle)

**Shared across all three profiles**
- Data-linking hesitation at first use — no team visibility, no social proof, no other known users, before
  the app has proven any value. Named as the single biggest adoption cliff.
- "Teach, never advise" reads as evasive if not framed well — users coming from Google/YouTube/finance
  influencers expect a verdict; neutrality can register as "can't help," not "principled," before trust exists.
- Abandoned onboarding = no baseline = no future value — unlike generic-content apps, there's no
  gradual-value ratchet pulling a bounced user back.
- Silent, low-frequency use case — personal finance isn't a daily habit; without reminders/goal check-ins
  actively pulling users back, there's no organic reason to reopen the app between salary credits.

**Campus-to-first-job** — near-zero prior pain (no loans, minimal holdings) means near-zero urgency; the
app must earn a first session's worth of value from thin data. Peer-channel acquisition means trust
transfers fast in either direction — one bad review in a placement WhatsApp group can sink a whole cohort.

**Settled early-career** — highest expectations (likely already tried a budgeting/broker app with concrete
numbers); highest bar for "was linking my real salary worth it"; **flagged as the segment most likely to
demand a ranked answer outright.**

**Startup/gig employee** — irregular pay breaks budgeting logic that implicitly assumes monthly salary,
and any visible mishandling of that gap breaks trust immediately; ESOP confusion is a strong draw but
ESOPs are inherently decision-shaped ("exercise or not"), so multi-path modeling without a verdict may
feel weakest precisely where anxiety (and demand for a real answer) is highest.

**Named retention risk (flagged by this lens explicitly):** tax-saving instrument choice (settled
early-career, filing season), ESOP exercise timing (startup/gig), and any "pay down loan vs. invest
surplus" moment — the highest-anxiety, highest-engagement moments in each profile's journey, and exactly
where churn risk peaks if the app visibly won't pick a side.

---

## Where the two lenses converge

Both independently zeroed in on the same underlying tension, from opposite directions: the moments where a
user gets the *most value* from the app (a real product-fit judgment, a first move, a blind-spot fix, a
tax-saving choice, an ESOP call, a loan-vs-invest call) are structurally the same moments where "teach never
advise" is hardest to make feel satisfying rather than evasive. This isn't a new compliance question — the
underlying line (P2, D-025's unprompted-prioritisation-is-advice, D-028's structural-prioritisation-is-advice
too, and §2's existing "model multiple paths side by side" pattern for decision-shaped questions like
loan-vs-invest) is already settled. What's new here is seeing it mapped concretely onto *this specific
segment's* highest-stakes moments, which makes it a design problem for the next stage (how do we make
neutral, multi-path teaching feel like help, not evasion, at exactly these moments) rather than a compliance
gap to close now.

---

## Escalated sub-question: ESOPs are the startup/gig profile's top-cited need, but aren't in the D-013 taxonomy

**Trigger fired: Trigger 5 (increases MVP scope) — hard, no de-minimis exception.** ESOPs are not one of
D-013's 8 MVP product types (Equity MF, Debt MF, Stocks, FD/RD, PPF/EPF, Home Loan, Personal Loan, Credit
Card Debt, Term Insurance, Endowment/ULIP). Building real ESOP support (a characteristic schema, teaching
content for exercise-timing mechanics) would be a genuine taxonomy addition, the same shape of decision as
D-013 itself and BRIEF-006/D-049's deferred `deepen`-selection work.

**The question:** does the startup/gig employee profile's #1 named pain point get real MVP coverage, or
does that profile launch with structurally thinner day-1 value than the other two internal profiles?

- **Path A — add ESOPs to the taxonomy now.** Closes the gap for a third of the founding segment's internal
  profiles. Costs: a real scope increase (new characteristics schema, new teaching content, new aliasing
  considerations for D-010), on top of MVP work already queued (BQ-009 through BQ-014 done, more ahead).
- **Path B — park ESOPs explicitly for post-MVP,** same DIRECTION-not-BUILD pattern D-031 used for real
  estate/cash/alternatives. Costs: the startup/gig profile's most-cited need goes unaddressed at launch —
  worth deciding whether that's an acceptable MVP gap or a reason to reconsider how much weight that profile
  carries early, without reopening D-054 itself.

**Resolved — D-055.** Owner chose Path A: ESOPs added to the taxonomy, in MVP scope. See
`docs/decisions/D-055-esop-added-to-taxonomy.md`. Taxonomy membership only — the characteristics field
schema is a deferred follow-on task, not designed by this decision.

---

## Existing constraint worth carrying forward, not a new decision

The Product lens's #1 shared pain point — "can't verify employer EPF deductions are actually happening" —
requires bank/account data verification, which `PROJECT_SPEC.md` §5 already excludes from MVP (no bank/
account-aggregator integration). This isn't a new fork; it just means the real MVP answer here is teaching
the mechanism ("here's what should be happening and how to check it yourself"), not verifying it on the
user's behalf. Worth keeping visible for the next stage so it isn't quietly overpromised.

---

## Not yet decided

No solution/screen mapping done — that's the next sequenced session (pain points → GenAI-surfaced teaching
moments), per the plan agreed earlier. The ESOP/taxonomy fork is resolved (D-055); ESOP's characteristics
field schema is a separate, not-yet-started design task.
