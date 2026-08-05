# D-025 — BRIEF-001 RESOLVED: unprompted prioritisation is ADVICE (Path A for MVP; Path B parked for growth)
- **Tier:** 3 — owner decision on the brief raised by D-024. Interprets a compliance-category decision, so
  Tier 3 only per protocol §4.3, with no exception for interpretations that tighten.
- **Interprets:** D-009 — settles that "never pick a winner" extends beyond the paths the user raised, and
  also forbids the model volunteering which of the user's several problems deserves attention first. D-009
  still governs; this states what it means in a case D-009 did not foresee.
- **Decision (Path A, MVP):** The model may not rank, order, or direct attention among the user's holdings or
  problems. It states each item's mechanism and its consequence in concrete rupees and lets the contrast
  stand. It does not say one item comes first, deserves more attention, is the sharper problem, or that
  nothing justifies leaving it as it is. **This holds even when the user explicitly asks for a ranking** —
  the model gives the mechanism and numbers for each thing asked about and leaves the ordering to the user.
- **The rule as written into the prompt (§3 rule 5), stated as a test rather than a blocklist:**
  > **Does this sentence tell the user what is TRUE, or what to ATTEND to?**
  > Stating a rate, a total, a mechanism, or what a rupee does in each place is true. Saying one item comes
  > first, deserves more attention, is the sharper problem, or that nothing justifies leaving it as it is —
  > that is direction, and it is forbidden.
  This is deliberately not a list of banned words. FINDING 2 of Run 1 is the evidence: §3 forbade "you
  should," "I'd recommend," "the better option is," and the model routed around all of them using "worth,"
  with no apparent intent to evade. A blocklist cannot hold a semantic line, so the rule governs the WORK a
  sentence does, and the prompt says so explicitly — including naming "worth having in view first," "worth
  more of your attention than," and "the sharper answer hiding in it" as failures, so the specific observed
  leak is closed by example rather than by ban.
- **Two scope questions settled by the owner inside Path A (both narrowing what the rule forbids):**
  1. **NARROW reading, not broad.** The rule bans *ordering language*, not *mentioning a holding the user's
     question did not name*. If another holding is genuinely relevant to the mechanism, the model brings it
     in — with its numbers, without ranking it. This preserves the Q1 behavior that was the single best
     signal in Run 1 (surfacing Card-1 at 42% unprompted proved reasoning rather than mimicry of D-015's
     worked example). The broad reading would have been easier to audit but would have destroyed that.
  2. **Surfacing a gap and ranking existing problems are different acts.** D-012's AI-surfacing philosophy
     survives intact: opening on a situation the user does not yet hold (the term-insurance case) is required
     by §2 rule 1 and is NOT prioritisation. The model simply may not tell the user that gap is their
     priority. Recorded explicitly because the tension between D-012 and Path A would otherwise be
     re-litigated in a future session.
- **Path B is PARKED as the intended growth direction, not rejected.** Path B would permit surfacing a number
  as significant where the significance is arithmetically demonstrable and stated as arithmetic ("42% is the
  highest rate in your profile"), while still forbidding comparative-evaluative framing. It is more useful and
  is where this should end up. It is not MVP because the model has already demonstrated it does not hold that
  distinction reliably — the same run that raised the question produced four unprompted rankings.
- **Unpark conditions for Path B (BOTH required, owner's call):**
  1. **Legal review of D-009 by an India securities/fintech lawyer** — already an open §8 item and
     non-negotiable before public launch anyway. Path B moves the advisory line, so it does not move without
     the review that D-009 itself is waiting on.
  2. **Demonstrated reliability** — the model must hold the "state the rate, do not rank the priority"
     distinction cleanly across a full eight-question run, including Q3 (the case that broke) and Q5 (the
     unprompted redirect). Elapsed time and user count are NOT the condition; the condition is evidence that
     the line can be held, because unreliability was Path B's specific weakness in the brief.
- **Why Path A rather than B or C:** follows D-009's own start-strict-relax-deliberately logic, which the
  owner confirmed governs this case too. Path C (permit only when the user opened the door) was rejected as
  modeled: it makes compliance depend on per-response intent classification that cannot be audited from the
  output, and answering a request to rank may be MORE SEBI-exposed rather than less, since the model is then
  directing on request. Q6 of Run 1 is the evidence Path A costs less than it appears — mechanism-only
  framing ("every rupee moved onto the card stops costing you 42% instantly") made the stakes fully legible
  to a frightened user without ranking anything.
- **Rule extraction (per protocol §5.2):** the true-vs-attend test above is logged as a reusable test. Future
  decisions of the same shape — does this piece of prompt wording cross from teaching into direction? — are
  now Tier 2 applications of a set test rather than Tier 3 judgments. This is the D-013 mechanism: one owner
  call converting a family of downstream decisions.
- **Also fixed in the same prompt pass (mechanical consequences, not separate decisions):** §4 now states
  that alias resolution is the backend's job and the model must not infer which holding a user-named product
  refers to (Run 1 smaller note — the model did this in Q4; correct per D-011 that it should not).
- **Reversibility:** High — prompt-level. The Path B unpark is the designed reversal path and its conditions
  are recorded above.
- **Feeds:** system prompt §3 rule 5, §4. Prompt regenerated as SYSTEM_PROMPT_v0.3_runnable.md.
- **Date:** 23-Jul-2026
