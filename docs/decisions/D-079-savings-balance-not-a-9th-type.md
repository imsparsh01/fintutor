### D-079 — `savings_balance` is not a missing 9th D-013 type — it's an instance of the already-deferred Cash & bank family

- **Tier:** 2, owner-confirmed. **Interprets: D-031** (clarifies which family an existing fixture field
  belongs to; does not change D-031's own scope decision). Not a new scope decision itself — it resolves
  the open question toward *no* new type and *no* new build work, so the hard scope-increase trigger
  doesn't fire in the direction that would require Tier 3. Flagged per D-020's mandatory REVIEW-FLAG on
  non-compliance interpretations regardless.
- **Question (open since 25-Jul-2026, surfaced while scoping BQ-002):** `FIXTURE_user_01.json` uses a
  `savings_balance` product type (`current_balance` + `interest_rate`, idle cash) that isn't one of D-013's
  8 taxonomy types (9 with ESOP/D-055). Does idle cash need a formal 9th type, or is it schema-exempt?
- **Decision:** Schema-exempt — but not because D-013's split-vs-merge test fails to distinguish it (it
  arguably would: savings-account interest has its own tax treatment, distinct from FD/RD). The real
  answer is a level up: a savings-account balance is exactly what `PROJECT_SPEC.md` §5 already names
  "**Cash & bank balances**" — one of the three holding families (alongside Real estate and Alternatives)
  that D-031 already classified as DECIDED DIRECTION, deferred to immediately post-Phase-1, distinct from
  the three MVP-build families (Investments/Loans/Insurance) D-013's taxonomy actually governs. So this was
  never a gap inside D-013's 8-type taxonomy — it's an instance of a fourth *family* already scheduled for
  later, not a missing type within the three families being built now.
- **Consequence for the fixture:** `FIXTURE_user_01.json`'s use of `savings_balance` is a Phase-1
  prompt-testing artifact only (checking the teaching engine handles a mentioned-but-untracked balance
  sensibly) — not a signal that production schema needs to support it now. No fixture change required.
- **Why no Tier 3 escalation despite touching MVP scope:** the hard scope trigger (`CLAUDE.md`,
  D-018) fires on decisions that *grow* MVP scope; this one explicitly does not add a type, a family, or
  any build work — it closes an open question in the direction of "nothing to build," which is the same
  direction D-031 already committed to for Cash & bank generally.
- **Rule extraction:** when a taxonomy gap is found, check whether it's actually a *type* gap inside an
  in-scope family (D-013's test applies) before treating it as a scope question — it may instead be a
  *family*-level gap already classified as direction-not-build (D-031's split), in which case the answer
  is "already decided, nothing new to do," not "new decision needed."
- **Revisit:** whenever Cash & bank's post-Phase-1 build is actually picked up — at that point D-013's
  split-vs-merge test should be (re-)applied to `savings_balance` properly, since the tax-treatment
  distinction noted above is real and would likely earn it its own type rather than a merge.
- **Reversibility:** High — no code or schema touched by this entry.
- **Date:** 05-Aug-2026
