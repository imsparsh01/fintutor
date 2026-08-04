# D-060 — Founding UX framework, cluster 1 of 3 resolved: engagement mechanics (streaks, variable reward, Hook Loop) adopted in full

- **Tier:** 3 — **two triggers fired.**
  - **Trigger 3 (contradicts/reinterprets a standing principle).** Bears directly on P4
    (`PRODUCT_PRINCIPLES.md`) — "start strict, relax deliberately — never the reverse... choose the
    stricter setting and record what specific evidence would justify loosening it later." This decision
    skips the strict-first step and adopts the permissive form immediately, for this specific
    permissiveness dial (engagement/retention-mechanic aggressiveness).
  - **Trigger 5 (MVP scope increase, hard trigger, no de-minimis exception).** `PROJECT_SPEC.md` §4 (MVP
    scope) has no gamification/engagement-mechanics capability today — no streaks, no reward system, no
    habit-loop architecture. Adopting this cluster adds a real capability (state tracking, new UI surfaces,
    a trigger/notification layer) not currently in scope.
  - Owner-decided directly in conversation.
- **Context:** this is cluster 1 of 3 from the founding UX/gamification framework session (25 candidate
  principles, grouped into: clean fits with existing philosophy, principles blocked outright by standing
  decisions, and three genuinely contested clusters). Only this cluster — engagement mechanics — is
  resolved by this entry. The "real financial data treated as a game" cluster (virtual pet/nurturing
  mechanics, XP/badges on real holdings, RPG/strategy metaphor) and the outright-blocked items (gated
  feature-unlock sequencing, social/group stakes — both already contradict standing decisions D-058 and §5
  respectively) are separately tracked, not decided here.
- **Decision:** Loss-aversion streak mechanics, variable/unpredictable reward feedback, and the full
  Hook Loop architecture (Trigger → Action → Variable Reward → Investment) are adopted as governing
  engagement-design principles for FinTutor — "same playbook as Duolingo," full adoption, not a bounded or
  watered-down version.
- **Why (owner's stated reasoning, paraphrased faithfully):** these are engagement mechanics, not
  gambling mechanics — the intent is to build a good habit around a good product, and that distinction
  (helping someone build a genuinely useful habit vs. exploiting them) is the owner's judgment call, made
  explicitly and knowingly, aware this is the same mechanic-shape gambling and social-media apps use.
- **Tension knowingly accepted, not silently resolved:** recorded as a **scoped carve-out to P4**, not a
  supersession of it. P4 continues to govern other permissiveness dials in the product as before —
  compliance-adjacent ones especially (P2's advisory line stays strict-by-default, unaffected). This
  decision narrows P4's applicability specifically to engagement/retention-mechanic aggressiveness, by
  explicit owner choice made with the tradeoff stated plainly (three options laid out, this one picked
  knowingly), not by drift or an unexamined default.
- **Boundary NOT decided here, flagged so it isn't assumed later:** this authorizes engagement mechanics
  generally — it does **not** pre-clear any future feature that ties a specific reward/streak/badge to a
  specific financial action (e.g., "your streak breaks if you don't invest today," "badge for buying
  product X"). That shape of feature would tie attention-engineering directly to a financial decision and
  needs its own P2 (teach-never-advise) check when it's actually designed — this decision is scoped to
  general app-engagement mechanics, not a blanket exemption for anything wearing a "gamification" label.
- **Not yet reflected in `PROJECT_SPEC.md` §4** — trigger 5 fired, so this is a real scope increase, but
  the actual spec edit is pending: whether to add it now or batch it with clusters 2/3 once the full UX
  framework discussion concludes, so §4 gets one coherent addition rather than three incremental ones. The
  owner has not yet chosen between those.
- **Rule extraction (candidate, not yet adopted as standing):** engagement/retention-mechanic design
  decisions are product-judgment calls under an owner-set permissiveness default (full-adoption, for this
  category specifically) — distinct from compliance-permissiveness dials, which still start strict under
  P4 unchanged. Not logged as a confirmed standing rule; future engagement-mechanic decisions should still
  come back as their own questions unless the owner explicitly confirms this as a reusable test.
- **Reversibility:** High as logged now — nothing built yet, no real user engagement/streak data exists.
  Closes once real users have real streak/reward history (touched-data test, §2.2 of
  `DECISION_PROTOCOL.md`).
- **Date:** 04-Aug-2026
