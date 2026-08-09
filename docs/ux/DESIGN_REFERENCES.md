# FinTutor — External design references (inspiration, not decisions)

> **What this is:** a catalogue of existing apps worth looking at for UI/UX inspiration when the
> aesthetic layer actually gets designed. **Not a decision, not a commitment to copy any pattern** —
> same explicit-ask-only posture as `.claude/skills/design-taste-frontend/` (D-063/D-064). Nothing here
> implies FinTutor should look or behave like any app listed; each entry names the one specific thing
> worth studying, not a wholesale endorsement.
>
> **Why this exists separately from `docs/ux/journeys/`/`wireframes/`:** those two describe FinTutor's
> own, already-decided UX. This describes *other people's* shipped UX, kept for reference only — a
> different category, not a third documented in the folder's own README before now (added alongside this
> file).
>
> **Provenance:** compiled 09-Aug-2026 from a live web search (owner asked, casual "just want to see the
> UI/UX of similar apps" prompt — not a build or design task). Not independently verified by opening each
> app; treat names/features as leads to check firsthand, not confirmed fact. No screenshots or app content
> reproduced here — names and one-line notes only.

---

## Why no single competitor matches FinTutor directly

FinTutor's actual combination — AI-guided, opinionated about *mechanisms*, structurally forbidden from
ranking or recommending specific products (D-009, D-025) — doesn't have a direct competitor among what
this search surfaced. Every app below is relevant for **one specific slice** of the UX, not the whole
shape. The likely move, if/when this gets designed for real: recombine slices under FinTutor's own
constraints, not adopt any one app's full pattern.

## Chat-first, conversational money apps
*(closest to FinTutor's core interaction model — talking to the app instead of building a dashboard)*

- **Cleo** (iOS/Android) — the most directly comparable interaction shell: a chat thread surfaces
  spending/savings/bill insights in plain language instead of a form-first dashboard. Cleo 3.0 added
  two-way voice and long-term memory, aiming explicitly for "human coach" feel. **Study the chat-bubble
  layout and information pacing.** **Do not carry over:** its witty/roast-style personality and
  cash-advance/cashback business model are the opposite of FinTutor's plain-spoken, teach-never-advise,
  no-personality-layer voice (system prompt §1/§5).
- **Fi Money** (India) — has an in-app AI assistant layered over a standard banking/investment UI.
  **Not verified in this search pass** — current screens weren't confirmed; check the app directly before
  treating any specific claim about it as fact.
- **Jupiter** (India) — has an AI assistant ("Jewel"). **Same caveat as Fi Money** — not verified this
  pass, check firsthand.
- **Richify** (India) — search results describe an "AI-CFO" experience (an agent named "Felix" plus
  specialist agents) spanning tax/investment/retirement/real-estate. Relevant as a data point on how far
  "AI financial agent" positioning has gone in the Indian market — worth being aware of as a category,
  not necessarily a UX reference (its scope is explicitly advisory-shaped, unlike FinTutor).

## Category / consolidated-portfolio dashboards
*(closest to FinTutor's persistent Investments/Loans/Insurance sections + consolidated net-worth view)*

- **INDmoney** (India) — multi-asset consolidator; the most relevant reference for laying out an
  "everything in one place" net-worth view across holding types, structurally close to FinTutor's own
  consolidated screen.
- **Groww**, **ET Money** (India) — investment-first UIs, useful for holdings/category navigation
  patterns. Both lean transactional (buy/sell flows) which FinTutor deliberately isn't — study the
  category layout, not the transaction UX.

## Budgeting-philosophy / teaching-oriented apps
*(closest to "teach, don't just track")*

- **YNAB (You Need A Budget)** — the most pedagogically opinionated budgeting app in the category; teaches
  a specific mental model (zero-based budgeting) rather than just displaying numbers. The best available
  reference for "an app can have a strong teaching voice without being prescriptive about individual
  products or purchases" — closest philosophical cousin to FinTutor's teach-never-advise stance, even
  though its subject (budgeting method) differs from FinTutor's (holdings/mechanisms).
- **Monarch Money** — cited as current best-in-class dashboard polish ("the Mint replacement that actually
  improved on Mint"). Visual/interaction-quality reference only, no teaching angle.
- **Copilot Money** — cited as "prettiest, most intuitive" in the Apple ecosystem. Same caveat — polish
  reference only.

---

## How to use this file

- **Not a spec.** Nothing here is MVP scope (`PROJECT_SPEC.md` §4) or a UX decision
  (`PRODUCT_PRINCIPLES.md`). If studying one of these produces an actual design direction worth adopting,
  that's a real decision — write it up in `docs/decisions/`, don't silently absorb a pattern into
  `app/` because it was listed here.
- **Verify before relying on specifics.** Several entries (Fi Money, Jupiter, Richify) are second-hand
  from search results, not firsthand app review — confirm current behavior/UI directly before citing it
  as fact anywhere else in this repo.
- **Update by replacing, not accreting.** If this list goes stale or a real design pass supersedes part of
  it, edit in place — this file isn't append-only (it's reference material, not a decision log).
