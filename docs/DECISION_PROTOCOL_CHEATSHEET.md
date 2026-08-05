# FinTutor — Decision Protocol Cheat Sheet (D-081)

> **Read this for routine decision-routing.** It is a condensed, load-bearing extract of
> `docs/DECISION_PROTOCOL.md` — every operative rule is here verbatim or near-verbatim, but the
> rationale, worked examples, and precedent log are not. **Read the full protocol instead of this file
> when:** something is genuinely ambiguous, you're writing an actual Tier-3 brief and want the full §5
> format context, or you need to understand *why* a rule exists (e.g. before proposing to change one).
> This file is never the last word on a genuinely hard case — it's the fast path for the routine ones.

---

## Routing order (run in this sequence, every time)

```
[1] Run the six triggers below — mechanical, no judgment.
    any trigger fires, or the decision doesn't classify at all  →  TIER 3
[2] No trigger fired. Is there more than one defensible answer with real tradeoffs?
    yes  →  TIER 2 (deliberate via lenses, act, log)
[3] No — one clearly right answer. Actionable right now (no missing access/decision blocking it)?
    no   →  escalate to owner
    yes  →  TIER 1 (act, one-line log)
```

## The six Tier-3 triggers (any ONE firing → Tier 3, no weighing)

1. **Money leaves the account** — spends money, commits to a recurring cost, changes a billing tier.
2. **Legal/regulatory/tax exposure** — SEBI positioning, the advisory line, financial-data handling,
   privacy/retention, tax treatment.
3. **Contradicts or reinterprets a standing principle** — including the teach-not-advise line.
   Reinterpreting counts as contradicting.
4. **Low reversibility (touched-data test)** — undoing it would require migrating populated data, or
   rewriting committed code other code now depends on. (Timing matters: the identical decision can be
   Tier 1 before data exists and Tier 3 after.)
5. **Increases MVP scope** — adds a product type, screen, flow, integration, or capability not already
   in `PROJECT_SPEC.md` §4. **No de-minimis exception**, however small.
6. **Unclassifiable** — doesn't sit cleanly in a decision category, or the trigger check itself is
   ambiguous. Unknown fails UPWARD, never sideways into a guess.

**Multi-category rule:** stricter category governs — Compliance > Product-judgment >
Technical-architectural > Technical-economic > Sequencing/PM.

## The three tiers

- **Tier 1 — act, one-line log.** No trigger fired, one clearly right answer, actionable now. Silent by
  design (no doubt-flag applies). A **product decision cleanly resolved by an existing
  `PRODUCT_PRINCIPLES.md` principle is Tier 1** — escalate only if two principles conflict, none covers
  it, or it would set/amend a principle (this doesn't suspend the trigger checklist: a principle-covered
  decision that still trips a trigger is not Tier 1).
- **Tier 2 — deliberate via lenses (below), act immediately, log, owner may veto.** Reversible by
  definition (trigger 4 already checked). If ≥25% unsure the owner should see it, REVIEW-FLAG it — flag
  changes visibility, never velocity; the work still proceeds.
- **Tier 3 — owner decides. Produce a brief, never a decision.** Any trigger fired. Model paths, don't
  pick one, unless the owner explicitly asks for a recommendation.

## The four lenses (Tier 2 only)

| Lens | Objection only it can raise | Runs when? |
|---|---|---|
| **Compliance** | "Legally exposed regardless of how well it works." | **Always** — never skipped. |
| **Product** | "This works but isn't what FinTutor is." | If it could plausibly return non-PASS. |
| **Technical** | "Right in principle, not deliverable by one person." | Same. |
| **Cost-and-Scope** | "Nothing's wrong, it just costs more than it returns" (owner attention / maintenance drag — NOT scope, trigger 5 already covers that). | Same. |

Verdicts: **PASS / CONCERN / BLOCK** + one sentence each, skips recorded with a reason (never silently
omitted). **Compliance BLOCK = hard veto → Tier 3 immediately**, regardless of other lenses. A
non-Compliance BLOCK is a strong objection, not a veto — if it can't be answered in the rationale, that's
a **deadlock** (two lenses in genuine opposition, neither Compliance) → **Tier 3**, no invented
precedence.

## Supersession & interpretation (governs how you log, always)

- **Supersession:** a new entry overriding an earlier one carries `**Supersedes:** D-0XX — [what
  changed]` as its first field. The old entry is **never edited** — no banner, no strikethrough.
- **Interpretation** (settling what an earlier decision *means* in a case it didn't foresee — narrowing
  OR appearing to tighten, both count): interpreting a **Compliance-category** decision is **Tier 3
  only**, no exceptions. Interpreting anything else may run at Tier 2 but is logged
  `**Interprets:** D-0XX` and carries a **mandatory REVIEW-FLAG**.

## Output formats

**Tier 1:** one line — what was decided, and "Tier 1."

**Tier 2:**
```
### D-0XX — [decision in one line]
- **Tier:** 2 [— REVIEW-FLAGGED, if applicable]
- **Supersedes / Interprets:** D-0XX [only if applicable]
- **Decision:** [concrete enough to act on]
- **Lenses:** Compliance [verdict, one sentence]; Product/Technical/Cost-and-Scope [verdict + sentence,
  or "skip — why"]
- **Why:** [reasoning, incl. how any CONCERN/BLOCK was answered]
- **Reversibility:** [touched-data test result]
- **Date:**
```

**Tier 3 brief:**
```
### BRIEF — [the question, as a question]
- **Trigger fired:** [which one, and the fact that fired it]
- **The question:** [stripped to what actually needs deciding]
- **Paths:** A/B/(C if real) — each: what it is → consequence → what it costs/forecloses
- **What only the owner can judge:** [specific — risk appetite, money, the philosophical line]
- **Rule extraction:** [does this produce a reusable test for future decisions of this shape? or "none apparent"]
- **Recommendation:** [ONLY if the owner asked for one]
```

## Session close

Every session ends with a SYNC STATE block: files changed, sync/commit needed, anything escalated and
awaiting the owner, and any REVIEW-FLAGGED Tier-2 decisions listed **first**.

---

*Full rationale, the five-category taxonomy with retroactive classification, worked examples, and the
growing precedent log (P-001, P-002, …) live in `docs/DECISION_PROTOCOL.md` — consult it, don't
reconstruct it from memory, whenever a case doesn't cleanly match what's above.*
