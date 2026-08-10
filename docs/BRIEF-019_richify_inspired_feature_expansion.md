# BRIEF-019 — Competitive feature expansion: Health Score, Persona, Scenarios, Calculators, Home restructure

**Status:** OPEN — both Richify and Novelty Wealth reviewed; pending owner decisions on all items in summary table
**Date logged:** 11-Aug-2026
**Last updated:** 11-Aug-2026 (Novelty Wealth analysis added)
**Source:** Competitive analysis of Richify (richify.ai, live screenshots) + Novelty Wealth (noveltywealth.in, web research)
**Scope tag:** Tier 3 decisions across all five areas — nothing builds until each area has an owner-confirmed decision

---

## What triggered this brief

Owner reviewed Richify's live app (screenshots) and Novelty Wealth (web research, 11-Aug-2026),
and identified capabilities worth adopting for FinTutor: a Financial Health Score, a named tutor
persona (replacing the current Mascot/Ankur/sapling), scenario modelling, a broader calculator suite,
and a restructured Home screen. Owner instruction: log everything from both apps, then queue builds.

---

## Novelty Wealth — what they do and what it means for FinTutor

**App:** [noveltywealth.in](https://www.noveltywealth.in/) — India's SEBI-RIA licensed AI wealth
advisory platform. Founded 2024, Bengaluru. $1.4M seed (IndiaQuotient). 15K+ families. Free +
NW Pro at ₹199/month. Data via India's Account Aggregator framework (automatic, consent-based).

**Critical difference from FinTutor:** Novelty Wealth is a licensed investment adviser. Their core
product is giving specific advice — rebalancing, mistake detection, "your personal financial second
opinion." This is the opposite of FinTutor's P2 principle. The more "advanced" things Novelty Wealth
does (rebalancing guidance, concentration alerts, performance optimization) are precisely what FinTutor
is designed not to do. The teach-not-advise principle is FinTutor's product position vs both
Richify and Novelty Wealth — it's a differentiator, not a limitation.

### What Novelty Wealth does — feature-by-feature

| Feature | NW does it | Richify does it | FinTutor can/should adopt? |
|---|---|---|---|
| Portfolio tracking (MF, stocks, EPF, FD, NPS, insurance, real estate) | ✅ | ✅ | FinTutor already tracks these families |
| Family wealth view | ✅ | ✅ | Already in ConsolidatedScreen |
| Named AI persona (NovaAI) | ✅ | ✅ (7 personas) | Yes — Feature area 2 |
| Financial health check-up / score | ✅ (Wealth Check-Up) | ✅ (Ada's health score) | Needs P2 ruling — Feature area 1 |
| Scenario planning ("what if") | ✅ | ✅ | Yes — Feature area 3 |
| Calculator suite | ✅ (9 types) | ✅ | Yes — Feature area 4 |
| Account Aggregator data import | ✅ (core feature) | ❌ | Hard stop — new major dependency |
| Investment advice / rebalancing | ✅ (SEBI-licensed) | Partly | No — violates P2 |
| Portfolio overlap detection | ✅ | ❌ | Possible, but needs scheme-level data (schema change → hard stop if pursued) |
| Hidden commission detection | ✅ | ❌ | No — requires knowing product type and commission rate (advisory territory) |
| Mistake detection / course correction | ✅ | ❌ | No — advisory, fails P2 |
| Tax optimisation advice | ✅ | ❌ | No — advisory framing; C-16 (tax calc) already flagged as hard stop needing approval |
| Live stock tickers (red/green) | ❌ | ✅ | No — P10 violation |
| Audio brief / TTS | ❌ | ✅ (Felix) | No — new TTS dependency |
| News feed | ❌ | ✅ | No — new external data dependency |

### New calculators from Novelty Wealth (to add to Feature area 4)

Novelty Wealth ships these that aren't in FinTutor's current C-04–C-20 list:

| # | Calculator | What it computes | New data needed? |
|---|---|---|---|
| C-21 | XIRR (actual return) | Annualised return on irregular cash flows (SIPs + withdrawals) | Uses existing SIP holdings + would need transaction-level dates |
| C-22 | Step-up SIP | Corpus if SIP increases by X% per year | None (user inputs step-up rate + horizon) |
| C-23 | HRA exemption | House Rent Allowance tax-exempt component (metro/non-metro) | Uses income; India-specific; owner: is this tax-shaped? → Tier 3 |
| C-24 | CAGR calculator | What annualised return did an investment deliver? | None (user inputs start/end value + years) |

**Note on C-21 (XIRR):** Requires transaction-level dates (when each SIP invested) — FinTutor's
current holdings model stores amount and frequency, not individual transaction dates. A simplified
version can be built using assumed monthly dates; exact XIRR requires transaction history.

**Note on C-23 (HRA):** Computing a specific rupee tax exemption is tax-adjacent. Same hard stop
question as C-16 — requires explicit owner approval before building.

**Portfolio overlap** — Novelty Wealth does this (mutual fund overlap). Requires knowing which
specific MF scheme (by name/ISIN) the user holds. FinTutor's holdings store fund family
(mutual_fund), not scheme identity. Adding scheme-level data = schema change = hard stop if
pursued. Flag only, do not build.

### What Novelty Wealth's "Wealth Check-Up" looks like vs Richify's Health Score

Both provide an overarching financial health summary, but the framing differs:
- **Richify (Ada):** Single score across savings/debt/protection/investing. Gamified — user
  tracks improvement over time. CTA to "find the quickest way to lift it" (advisory tone creep).
- **Novelty Wealth:** "Full AI-powered wealth review" — strengths/gaps assessment, risk
  evaluation, tax insights, liquidity health, rebalancing suggestions. Described as "your personal
  financial second opinion." Explicitly advisory.

FinTutor's version — if built — needs to be a descriptive coverage map ("here are the areas your
holdings touch and the areas they don't") rather than either a score or an advisory review. This is
the P2-safe version of what both competitors do.

### What we do NOT adopt from Novelty Wealth

| NW feature | Why not adopted |
|---|---|
| Rebalancing suggestions / alerts | Advisory — fails P2 does-not-says test |
| Mistake detection and course correction | Advisory — directly tells user what they did wrong |
| Tax optimisation advice | Advisory framing; tax calculations need hard stop approval (C-16, C-23) |
| Portfolio overlap with scheme-level data | Schema change (new ISIN/scheme field) — hard stop |
| Hidden commission detection | Requires knowing product commission structure — advisory territory |
| Account Aggregator integration | New major service dependency — hard stop, see Feature area 6 |

---

## What the Richify screenshots show (Home screen, read top-to-bottom)

Richify's Home is a scrollable feed of distinct sections:

1. **Greeting + net worth card** — "Good morning, Sparsh" / total INR / eye toggle / "See my portfolio" + "Add asset"
2. **Goal CTA card** — illustrated promo: "Set your goal / Pay a house deposit, plan your retirement, become debt-free..."
3. **Top moving assets** — live stock tickers with % change, red/green coloured ← *not adopted: see hard stops*
4. **Daily broadcast** — 90-second audio brief narrated by Felix ← *not adopted: new TTS dependency*
5. **News feed** — macro articles sourced from CNBC/external ← *not adopted: new external data dependency*
6. **AI agents section** — agent avatars with personalised openers ("Hey Sparsh, let's check your financial health score…"), "Reply to Ada/Charlie" CTAs
7. **Personal finance quiz** — "Test yourself · 5 Q · 3 min · +10 XP per correct" — weekly themed pack ("Money basics that compound")
8. **Finance 101** — Lily card + topic cards by category (CASH / STRATEGY) with estimated read time
9. **Run the numbers** — saved calculator results with freshness timestamps ("When can I retire? → age 53", "Pay down loan or invest? → +$253K")
10. **Run a scenario / What if…** — named scenario cards ("The Inaction Tax", "Rent vs Buy") with "Run it >"

---

## Feature area 1 — Financial Health Score

### What Richify does
Ada computes a score across savings, debt, protection (insurance), and investing. Single number the
user tracks over time. Shown on the Home screen as a CTA ("let's check your financial health score
and find the quickest way to lift it").

### What data FinTutor already has to compute one
- Debt-to-income ratio (income from `/income`, outstanding balances from holdings)
- Insurance presence (term_insurance / endowment_ulip family — binary: covered or not)
- Investment rate (SIP amounts as % of income)
- Emergency runway (EPF/cash vs estimated monthly outgoings)
- Goal progress (earmarked_amount vs target_amount)

### Open owner decisions required (all Tier 3 — touch money-logic)
1. **Scoring methodology** — what dimensions, what weights, what scale (0–100? A–F? coloured bands)?
   This is a calculation users will rely on as a signal about their financial health. Cannot be decided
   by Claude — it needs an owner decision with reasoning logged.
2. **Valence question** — a "score" that goes up/down will feel like financial judgement. How does this
   sit with P10 (no valence styling on figures) and P2 (teach never advise)? Richify calls Ada
   "educational" but a score of 34/100 communicates a verdict. FinTutor needs a principled answer
   before building — either a scored number with a P2-safe framing, or a different surface (coverage
   map, not a score).
3. **Where it lives** — dedicated Ada-style screen? Home card? Section inside Consolidated?

---

## Feature area 2 — Named tutor persona + mascot removal

### What Richify does
Seven named, photographed AI agents with distinct voices and roles (Felix/Ada/Lily/Pepper/Morgan/Dua/
Charlie/Sam). Users build an ongoing conversational relationship with named agents who initiate contact.

### Current FinTutor state
`Mascot.tsx` (43 lines) — sapling + "Ankur" name. Owner notes this doesn't suit the product.
`StreakBadge.tsx` uses the same engagement-layer colour (behaviour/clay — P7-compliant).

### What's proposed
- Remove the Ankur/sapling mascot entirely
- Give the teaching AI a name and a visual identity on the Chat tab and on the Home screen
- The persona name and visual style are a brand/product decision — owner decides

### Open owner decisions required (Tier 3 — product identity / brand)
1. **Name** — what is the tutor called? (Richify used "Lily" for the teaching persona.)
2. **Visual** — illustrated character? Monogram? Abstract? Photograph style as Richify uses?
3. **Voice scope** — does the persona only appear in Chat, or also as a Home-screen CTA card
   ("Hey [name], your SIP is ₹4,500/mo. Want to understand how that compounds?") ?
4. **Mascot removal timing** — can Ankur/sapling be removed independently of the new persona
   build, or should they ship together? (Former is a Tier-1 delete; latter is a Tier-3 design build.)

---

## Feature area 3 — Scenario modelling ("What if…")

### What Richify does
Named scenario cards on the Home screen. Each runs a computation against the user's real data and
returns a headline answer. Seen in screenshots:
- "The Inaction Tax — If I'd invested it instead of leaving it in cash…"
- "Rent vs Buy — In 5 years, who actually wins?"
- "When can I retire?" → age 53
- "Pay down loan or invest spare cash?" → +$253K

### FinTutor's existing surface
Loan vs Invest modal (already built, D-014) already does "pay down loan or invest?" — it's a
point-in-time calculator, not a Home-screen saved-result card.

### Proposed scenario set (India-relevant, non-advisory framing)

Each scenario is a computation, not a recommendation. The output names a number or a date, not a
verdict. "When can I retire?" → "at your current savings rate, your corpus reaches [target] at age X"
is a mechanism fact. "You should retire at 53" is advice.

Candidate scenarios for FinTutor (owner to confirm the list):

| # | Scenario | Inputs from existing data | Output (mechanism, not verdict) |
|---|---|---|---|
| S-01 | When can I retire? | Income, SIP amounts, current corpus (EPF/mutual funds) | Age at which corpus hits a configurable target |
| S-02 | What if I prepay my loan vs invest? | Home/personal loan outstanding + rate; SIP rate | Corpus difference at loan end date |
| S-03 | What if I increase my SIP by ₹X/month? | SIP holdings + time horizon | Additional corpus at goal date |
| S-04 | Rent vs buy — 5 year view | Income, existing loans, approximate rent vs EMI | Total cost comparison at year 5 |
| S-05 | Emergency fund runway | Income, EPF/cash holdings | Months of runway at current outgoings |
| S-06 | What does my debt cost over time? | Loan outstanding, rate, tenure | Total interest remaining |
| S-07 | Inaction tax — idle cash | Cash holdings, SIP rate benchmark | Opportunity cost over 5 years |

### Open owner decisions required (Tier 2/3 — touch money-logic calculations)
1. **Which scenarios to build first** — confirm the candidate list above; owner picks the priority order.
2. **Retirement corpus target** — S-01 needs a target figure. Does the user set it, or does the app
   use a formula (e.g. 25× annual expenses)? Formula = money-logic = Tier 3.
3. **Rent vs buy (S-04)** — requires rent and property value inputs the app doesn't currently capture.
   New data fields = schema change = hard stop escalation.
4. **Output framing** — "age 53" is fine. "+₹253K" in green (as Richify shows) is a P10 violation.
   All scenario outputs render in ink, unlabelled by valence. Owner confirms this constraint applies.
5. **Home card vs dedicated screen** — do scenarios live as cards on the Home screen (Richify's
   pattern) or behind a "Scenarios" tab?

---

## Feature area 4 — Calculator breadth (top 20 for India)

### Current state: 3 calculators already built
1. ✅ Loan vs Invest (D-014)
2. ✅ ESOP exercise cost (D-066/D-069)
3. ✅ Tax saving room — 80C/NPS (D-016)

### Proposed 17 new calculators (owner to confirm and reorder by priority)

Each calculator is a mechanism explainer, not advice. Output is always a number + the mechanism that
produced it. All outputs render in `font.mono` / `colors.ink`, no valence colour (P10).

| # | Calculator | What it computes | New data needed? |
|---|---|---|---|
| C-04 | SIP goal planner | Monthly SIP needed to reach ₹X in Y years at r% | None (user inputs target) |
| C-05 | Lump sum future value | What ₹X becomes in Y years at r% | None |
| C-06 | SIP corpus projector | What current SIPs grow to by goal date | Uses existing SIP holdings |
| C-07 | PPF maturity | PPF corpus at maturity given balance + contributions | Uses existing PPF holding |
| C-08 | FD maturity | FD maturity value given principal, rate, tenure | Uses existing FD holding |
| C-09 | RD maturity | RD corpus given monthly amount, rate, tenure | Uses existing FD/RD holding |
| C-10 | Home loan EMI | EMI for given principal, rate, tenure | None (user inputs) |
| C-11 | Home loan prepayment impact | Interest saved + tenure reduced by prepaying ₹X | Uses existing home_loan holding |
| C-12 | Debt-free date | When each loan is paid off at current EMI | Uses existing loan holdings |
| C-13 | Credit card payoff | Months to clear balance at ₹X/month | Uses existing credit_card_debt holding |
| C-14 | Emergency fund coverage | Months of runway given cash/EPF vs outgoings | Uses income + holdings |
| C-15 | Term insurance need | Cover gap: income × Y years minus existing sum assured | Uses income + term holdings |
| C-16 | Income tax — old vs new regime | Tax liability comparison, FY 2025-26 | Uses income (owner: this is tax-shaped — Tier 3 hard stop; see note) |
| C-17 | Inflation impact | What ₹X today costs in Y years at r% inflation | None |
| C-18 | Compound growth | Corpus from lump sum + SIP over Y years | None |
| C-19 | Net worth breakdown | Assets vs liabilities composition | Uses all holdings (already partially in ConsolidatedScreen) |
| C-20 | Goal affordability | Monthly saving needed to hit ₹X by date | Uses goals + income |

**Hard stop note on C-16 (Income tax):** Computing a tax liability in rupees is tax-shaped computation
users rely on. Per CLAUDE.md's hard-stop list, this requires explicit owner approval before building —
flag it here, do not proceed without it.

### 4 additional calculators from Novelty Wealth research (C-21 to C-24)

See the Novelty Wealth analysis section above for full description. Appended to the list here for
tracking — these four bring the total proposed new calculators to 21:

| # | Calculator | What it computes | New data needed? |
|---|---|---|---|
| C-21 | XIRR (actual return) | Annualised return on SIP cash flows (simplified: assumes monthly dates) | Approximation only; exact XIRR needs transaction dates |
| C-22 | Step-up SIP | Corpus when SIP increases by X% annually | None (free-form inputs) |
| C-23 | HRA exemption | Tax-exempt HRA component (metro/non-metro) | Uses income — owner approval needed (Tier 3, same as C-16) |
| C-24 | CAGR backward | Annualised return between start/end value | None (free-form inputs) |

### Open owner decisions required
1. **Priority order** — which 5 to build first? The combined list has 21 proposed new calculators;
   a single session can realistically ship 3–5 depending on complexity.
2. **C-16 income tax calculator** — explicit owner approval needed (hard stop category).
3. **C-23 HRA exemption calculator** — explicit owner approval needed (same hard stop category as C-16; computes a rupee tax figure).
4. **UI home** — do calculators get their own tab ("Tools"?), live as Home-screen cards, or sit inside
   each family screen? Richify surfaces results on the Home screen with freshness timestamps.
5. **Input model** — calculators that use existing holdings (C-06, C-07, C-08, etc.) vs. ones that take
   free-form user inputs (C-04, C-05, C-10). The former are richer but depend on data completeness.

---

## Feature area 5 — Home screen restructure

### Current FinTutor Home (ConsolidatedScreen.tsx, 233 lines)
Consolidated totals card, streak badge, reward surface, family-total rows.

### Proposed structure (adapted from Richify, FinTutor-principles-compliant)

```
Home screen — proposed section order
─────────────────────────────────────────────────────────
1. Greeting           "Good evening, [name]"
2. Consolidated card  Net worth total + family breakdown
                      (existing, improved)
3. Health Score card  "Your financial health · [score/coverage]"
                      → taps into Health Score screen
4. Tutor card         "[Persona name]: [personalised opener]"
                      → taps into Chat
5. Run the numbers    Horizontal scroll of calculator result cards
                      with last-run timestamp
6. What if…           Scenario cards (horizontal scroll)
7. Learn              Topic cards (Finance 101 equivalent)
8. Streak / reward    Existing engagement surface (keeps P7 guard)
─────────────────────────────────────────────────────────
```

**What we explicitly do NOT adopt from Richify's or Novelty Wealth's Home (and why):**

| Feature | Source | Why not adopted |
|---|---|---|
| Live stock tickers with red/green % change | Richify | P10 + live market data feed = new external dependency + regulatory risk |
| "+$253K" in green on calculator result | Richify | P10 — a positive figure in green encodes a verdict. Ink only. |
| 90-second audio brief (TTS narrated by Felix) | Richify | New TTS service dependency — requires a hard-stop decision |
| Macro news feed (CNBC/external sources) | Richify | New external news API — not a teaching surface |
| Investor mentor personas (Buffett/Wood framing) | Richify | Directly advisory — fails P2 does-not-says test |
| Rebalancing suggestions on Home | Novelty Wealth | Advisory — fails P2 |
| Mistake/performance alerts | Novelty Wealth | Advisory — fails P2 |
| Account Aggregator auto-import CTA | Novelty Wealth | New major service dependency — see Feature area 6 |

### Open owner decisions required
1. **Tab bar** — adding more features may require a new tab ("Tools" for calculators + scenarios) or
   a restructured nav. Current 6 tabs are already at the practical limit. Owner decides nav shape.
2. **Health Score dependency** — section 3 only exists if Feature Area 1 is approved and built first.
3. **Persona dependency** — section 4 only exists if Feature Area 2 is approved and built first.

---

## Feature area 6 — Account Aggregator integration (HARD STOP — log only, do not build)

### What Novelty Wealth does

Novelty Wealth's core UX differentiator: users connect bank accounts, brokerages (Zerodha, Groww,
HDFC, ICICI Direct), and EPF automatically via India's Account Aggregator (AA) framework — a
consent-based, RBI/SEBI-regulated data-sharing system. No manual entry. Holdings appear immediately
after connection. This is what makes their product feel "more advanced."

### Why this is a hard stop for now

Integrating an AA provider (Finvu, Setu, OneMoney, Perfios) would:
1. Add a new regulated third-party service dependency — not already decided → hard stop per CLAUDE.md
2. Require schema changes to hold AA-sourced data (source: manual vs. AA, token management, refresh cycles)
3. Change the onboarding flow substantially
4. Introduce compliance obligations (consent management, data retention, DPDP Act alignment)

This is a future-phase initiative, not an MVP build. Log here for owner awareness.

### Decision required (Tier 2 escalation — new dependency + compliance shape)
- Does the owner want to explore AA integration as a post-MVP initiative? If yes, it needs its own
  brief, a SEBI/AA compliance check, and a dependency decision logged before any design begins.
- For now: no action, no queuing.

---

## Mascot removal (standalone Tier-1 task, separable from persona build)

`app/components/Mascot.tsx` (43 lines) renders the Ankur/sapling. It is referenced in:
- `ConsolidatedScreen.tsx` (reward surface)
- Potentially `StreakBadge.tsx`

Removing it without a replacement persona is a clean delete — the engagement reward surface can
show a plain text fact (D-100's mechanism-fact pattern) instead. This is Tier 1 and can ship
independently without waiting for the persona design decision.

**Owner confirm:** OK to delete Ankur/sapling now and replace reward moment with the plain
mechanism-fact card (D-100's existing pattern), with the persona name/visual to follow separately?

---

## Summary of decisions needed before any build starts

All items require an owner decision before anything enters BUILD_QUEUE.

| Area | Decision | Tier | Note |
|---|---|---|---|
| Health Score | Scoring methodology and dimensions | 3 | Novelty Wealth does this as "Wealth Review" (advisory); FinTutor needs a P2-safe framing first |
| Health Score | P2/P10 framing — score vs coverage map | 3 | Both competitors' versions lean advisory; needs explicit owner position |
| Health Score | Where it lives (screen / Home card) | 3 | |
| Persona | Name and visual style | 3 | Novelty Wealth = "NovaAI"; Richify = 7 named characters |
| Persona | Mascot removal: now (standalone) vs with persona? | 1 | Fastest win — can ship independently |
| Persona | Voice scope: Chat only vs Home-screen CTA too? | 3 | |
| Scenarios | Which 7 candidates to build and priority order | 2 | |
| Scenarios | Retirement corpus target formula | 3 | Money-logic |
| Scenarios | Rent vs buy data requirements (schema change) | hard stop | New input fields needed |
| Scenarios | Home card vs dedicated screen | 3 | |
| Calculators | Priority order (21 proposed, pick first 5) | 1 | |
| Calculators | C-16 income tax — explicit approval | hard stop | Tax-shaped computation |
| Calculators | C-23 HRA exemption — explicit approval | hard stop | Tax-shaped computation |
| Home | Tab bar / nav structure with new sections | 3 | 6 tabs already at practical limit |
| Account Aggregator | Explore as post-MVP initiative? | 2 | If yes → own brief + compliance check needed |

### What could ship without waiting for any of the above

**Mascot removal only:** Delete `Mascot.tsx` (Ankur/sapling) from `ConsolidatedScreen.tsx`, replace
reward moment with D-100's plain mechanism-fact card. Tier-1 delete, fully reversible. Owner
can confirm this one item independently and it goes straight into BUILD_QUEUE.
