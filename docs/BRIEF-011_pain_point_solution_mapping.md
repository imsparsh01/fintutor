# BRIEF-011 — Pain points mapped to GenAI-surfaced teaching solutions

> Findings, not a decision, except one escalated hard-stop item below. Next sequenced piece after
> BRIEF-010 (pain points) — this maps them to concrete solutions, still within teach-never-advise. Two
> independent generative lenses (Product/teaching-design, Business/adoption-retention) produced the raw
> content; `DECISION_PROTOCOL.md`'s standing Compliance lens (§3.2) is then applied directly, as its own
> section below, per the always-runs rule — the two are complementary, not substitutes for each other.
> **Date raised:** 03-Aug-2026, same session as D-053 through D-056.

---

## Product lens — pain point → concrete teaching moment

**Shared:** EPF opacity → AI computes the employer-match mechanism on the user's stated salary ("here's
what should be landing," never a verification claim, since no bank data exists to check against), then
offers to log it — never auto-added. Living-picture gap → the Consolidated view does the work; AI's role
is nudging completeness when a mentioned-but-unlogged holding comes up in conversation. EMI/premium dates
→ inferred reminder candidates surfaced once, never silently scheduled. Jargon → inline, first-use,
tap-to-explain, computed against the user's own numbers where possible rather than a generic definition.

**Fresh starters:** after onboarding captures income + near-zero holdings, AI walks the mechanism of a
general sequencing logic (buffer → protection → growth) illustrated with their numbers — explicitly framed
as "here's how these needs relate," not "do X first."

**Reactive dabblers:** AI explains what the logged product mechanically does (cost, exit terms, liquidity,
typical purpose), then asks reflective questions ("what were you hoping this would do for you?") that let
the user self-assess fit — the AI never states fit or non-fit itself.

**Habit-formers:** AI pattern-matches gaps across the three holding families and names the *category* of
gap generically ("your profile covers X and Y but not Z — intentional, or worth exploring?"), never names
a specific product to fill it.

**Decision-shaped moments (outline only):** loan-vs-invest, tax-saving instrument choice, and ESOP timing
all get the same shape — paths shown side by side on the user's real numbers, mechanism + numbers +
tradeoffs per path, closing with "which weighs more is yours to decide," no ranking, no "better" label.
**ESOP's teaching moment specifically is blocked** until its characteristics schema is designed
(D-055 was membership-only).

**Forks flagged (not assumed buildable):** a side-by-side multi-path comparison UI component (doesn't
exist yet, queued for the screens/PRD stage, not urgent now); the reflective-question conversational
pattern for reactive dabblers, if it needs to be genuinely distinct from existing AI-surfacing (soft flag,
a normal design detail to resolve during actual conversation-flow design, not a scope question).

---

## Business lens — pain point → what actually converts to trust/retention

**Shared:** let the app prove value on 2-3 typed numbers before ever asking to link real accounts —
linking becomes an upgrade to something already working, not a prerequisite. Every neutral multi-path
answer must be paired with a computed, user-specific artifact (a breakeven number, a range, a threshold)
— "the neutrality is in the conclusion, not in the rigor." Onboarding should ratchet value per completed
step, so a user who quits after step 2 still has something to come back to. Extend the existing
EMI/payment reminder pattern to "your numbers changed" nudges as additional re-open hooks.

**Campus-to-first-job:** needs an immediate, low-effort first-session win (a take-home/tax-regime
breakdown from just salary, inside two minutes) before deep onboarding, since urgency is near-zero.

**Settled early-career:** will actively push for a ranked answer — the neutral framework needs visible
rigor (showing where the user's numbers sit on the axes that actually differentiate the paths) to not
feel thin.

**Startup/gig:** needs a rolling/variable-income model instead of calendar-month budgeting assumptions —
**see escalation below.**

**Named churn-risk moments, concrete answers:** tax-saving choice gets a criteria panel plotting the
user's real numbers against the differentiating axes, plus an outcome-range simulator; ESOP timing gets a
vesting/strike/scenario simulator (market up/flat/down) showing cash-flow and tax-impact ranges per
timing choice, no recommended timing; loan-vs-invest gets a breakeven calculator handing the user the one
number that would flip the decision. Common closing device: every decision-shaped interaction ends with a
single computed "number to watch," specific to the user.

**Lower-stakes forks flagged, not pursued for MVP:** cohort/social-proof data ("users like you") — a new
data source, would also raise its own privacy/data-handling questions if ever pursued; a shareable/
exportable comparison artifact — a new UI/export pattern. Neither is needed for MVP; noted here so they
aren't silently assumed available later, not raised as something to decide now.

**Explicitly rejected by default, not adopted:** "most people lean toward X"-style language for the
settled-early-career segment, proposed by this lens as a way to add weight to the neutral framework, then
immediately self-flagged as risking the advice line. Per P4 (start strict, relax deliberately) this simply
isn't used — no owner decision needed to *not* adopt something that touches a standing principle, only to
adopt it. Flagged here so it isn't quietly reintroduced later without the same scrutiny D-025/D-036 gave
comparable phrasing.

---

## Escalated: variable-income budgeting logic for the startup/gig profile

**Trigger fired: hard-stop, `CLAUDE.md`'s first item — "anything touching money movement, calculations
users rely on, or financial data."** The Business lens flagged this itself, correctly: the startup/gig
profile's core need (a working cash-flow/budgeting view under irregular pay) requires different
calculation logic than the calendar-month assumption the rest of the founding segment can use — this is
real money-math the user would rely on to understand their own cash position, not a cosmetic difference.

**Why this can't just be designed as a normal follow-on task, unlike the UI-pattern forks above:** those
are presentation questions; this is a computation users would trust with real financial judgment calls.
Getting it wrong isn't a bad screen, it's a wrong number someone might act on.

**Not decided here.** Two rough shapes exist (a trailing-average/rolling-window model vs. an
explicit-irregular-income-declaration model where the user states their own pattern), but neither is
sketched in detail — per the hard-stop rule, this stops at "a decision is needed" rather than proceeding
to design the logic itself. Owner's call on how (or whether) to proceed before any further design work
touches this specific piece.

---

## Compliance lens check (DECISION_PROTOCOL.md §3.2, applied directly — not run when this brief was first
written; added on the owner's prompt about whether the standing lens framework was still in use)

Per protocol, the Compliance lens always runs, no exceptions. Applied here against P2 (teach never
advise — the line is what the output DOES) and the specific precedents it's built from (D-025 no
ordering/ranking language even on request; D-028 structural prioritization is advice too; D-032 gap
surfacing must stay on-topic; D-036/D-037 name the real gap concretely, never prescribe the fix).

**PASS, no concern:** EPF mechanism explainer; Consolidated-view completeness nudge; EMI/premium
reminders; inline jargon explainers; reactive-dabblers' reflective-question flow (never states fit);
habit-formers' category-gap surfacing (names the gap concretely per D-037's own standard, never
prescribes what fills it — same shape, not in tension); the three decision-shaped moments' side-by-side
path structure (matches the already-validated §2 pattern); onboarding value-ratchet; "your numbers
changed" nudges.

**CONCERN, not a BLOCK — flagged for careful wording when this is actually built:** the fresh-starters
sequencing explainer (buffer → protection → growth). Even framed as "here's how these needs typically
relate, not what to do first," presenting them in a fixed order risks the exact pattern BRIEF-002/D-028
found the model routing into before — structural ordering standing in for a banned recommendation, without
using any forbidden phrase. Not blocked, because it's a general, typically-true relationship rather than a
judgment on the user's own situation, but whoever writes the actual copy needs this precedent in view, not
just the general "teach never advise" instinct.

**PASS, with a reasoning note (so it isn't re-litigated as a concern later):** the breakeven-calculator and
"number to watch" devices the Business lens proposed. These pass D-025's own test — *does this tell the
user what is TRUE, or what to ATTEND to* — because a breakeven point is a computed fact (where two paths
are mathematically equal), not a directive. They only stay compliant if implementation copy keeps them
phrased as facts ("this is the threshold where X and Y are equal") rather than urgency framing ("watch
this because it matters most") — a copy-discipline note for later, not a design change now.

**Not evaluated — out of this lens's scope:** Technical and Cost-and-Scope lenses weren't run here, since
nothing in BRIEF-011 proposes a concrete build yet (still pre-PRD/pre-screens) — those two are better
applied once there's an actual technical proposal to weigh, per their own definitions in
`DECISION_PROTOCOL.md` §3.

## Not yet decided

Solution content above is descriptive, feeding the next stage (rough MVP-fit prioritization → PRD →
screens). The variable-income budgeting question is the one item that needs the owner's decision before
the startup/gig profile's cash-flow coverage can be designed further; everything else here can proceed.
