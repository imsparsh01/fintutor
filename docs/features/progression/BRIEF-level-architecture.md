# Executive brief — What should a FinTutor level mean?

**Status:** Owner decision required before the progression PRD or schema can be finalised.
**Traces to:** D-114 / BQ-064
**Prepared:** 12-Aug-2026

## Trigger fired

Tier 3: this determines user identity, the product’s retention incentive, and how FinTutor represents
financial understanding. A misleading level could become a competence claim, financial judgment, or
curriculum gate even if the underlying points are behavior-only.

## The question

Should FinTutor represent progression as a competence ladder, a learning journey, or neutral numbered
levels—and what exactly may the resulting level claim about the user?

## Paths

### Path A — Competence ladder

Example: Beginner → Intermediate → Advanced → Expert.

- **Benefit:** immediately legible and status-motivating.
- **Cost:** FinTutor does not test or certify understanding. It could patronise an experienced new user and
  falsely certify a highly active user. “Expert” also creates an artificial endpoint.
- **Verdict:** not recommended.

### Path B — Five-stage learning journey (recommended)

Provisional names:

**Discovering → Exploring → Connecting → Deepening → Expanding**

- **Benefit:** communicates ongoing participation and breadth without claiming intelligence, financial
  health, investment ability, or mastery. Works for students and professionals.
- **Cost:** needs one sentence of explanation because journey language is less self-explanatory than
  Beginner/Expert.
- **Long-term shape:** the fifth stage remains open-ended rather than declaring the user finished.

### Path C — Neutral numbered levels

Example: Level 1 → Level 2 → Level 3 indefinitely.

- **Benefit:** easy to calculate and extend.
- **Cost:** generic, easier to farm, and users may still interpret a large number as financial expertise.
  Endless level inflation becomes the product’s identity.
- **Verdict:** viable fallback; a small number may support Path B but should not lead it.

## Recommended architecture under Path B

### One visible identity

The user sees:

- current named stage;
- continuous percentage/progress to the next stage;
- a plain explanation of what moved progress;
- optional ways to continue.

The level means only:

> You have meaningfully explored more of FinTutor, across more kinds of learning activity and over time.

It does not mean the user is financially healthier, knows more than another person, is a better investor,
made the right decisions, or completed a prescribed curriculum.

### Four internal dimensions, not four public scores

The visible progress value is backed by breadth across:

1. **Explore** — teaching moments and first use of a capability.
2. **Model** — calculators and scenarios completed through a valid result.
3. **Reflect** — substantive Arya exchanges, revisits, and recaps.
4. **Return** — meaningful activity on another day.

Later stages require activity across multiple dimensions, not merely a point threshold. This prevents app
opens, chat volume, or one favorite calculator from dominating. Exact weights and caps are lower-level
design work after this architecture is approved.

### Binding behavior

- Progress and stage never decrease; a streak may reset separately.
- No content or feature is level-gated.
- No financial value, outcome, Portfolio Health result, or real-world action affects progress.
- Calculator/scenario progress is identical regardless of the result.
- Handling a context prompt—including “skip for now”—does not make disclosure the price of progression.
- Challenges ask the user to explore, compare, model, or reflect; never to save, invest, repay, buy, sell,
  or change coverage.
- Stage is not the primary explanation-depth control. Explicit user preference and onboarding familiarity
  come first; every explanation retains a simpler/deeper override.
- Progress attribution is transparent (“Explored a new mechanism”), not only an opaque “+40 XP.”
- Payment can never buy progress, preserve a streak, or confer an expertise-signalling status.

## Technical consequence, not yet a schema decision

If Path B is approved, the eventual implementation should use a backend-authoritative, versioned behavior
event ledger plus a rebuildable user-progress summary—not frontend counters and not an extension of
`streak_states`. It must store semantic event identifiers only: no chat text, financial inputs, calculator
results, Portfolio Health values, or product choices. The durable schema, retention, authentication, and
migration package remains a later Tier-3 approval after event rules are drafted.

## Recommendation

Approve **Path B**, including the five-stage journey model and the meaning/guardrails above. Treat the five
names as approved working names unless the owner changes them now; visual identity and microcopy can be
designed without reopening the architecture.
