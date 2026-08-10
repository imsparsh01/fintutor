# BRIEF-019 — Richify-inspired feature expansion: Health Score, Persona, Scenarios, Calculators, Home restructure

**Status:** OPEN — pending Novelty Wealth review (owner instruction: finalise scope after both apps reviewed)
**Date logged:** 11-Aug-2026
**Source:** Competitive analysis of Richify (richify.ai) + owner's live app screenshots
**Scope tag:** Tier 3 decisions across all five areas — nothing builds until each area has an owner-confirmed decision

---

## What triggered this brief

Owner reviewed Richify's live app (screenshots attached in session) and identified five capabilities
worth adopting for FinTutor: a Financial Health Score, a named tutor persona (replacing the current
Mascot/Ankur/sapling), scenario modelling, a broader calculator suite (top 20 for India), and a
restructured Home screen modelled on Richify's layout. Owner instruction: log everything now, finalise
after reviewing Novelty Wealth, then queue builds.

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

### Open owner decisions required
1. **Priority order** — which 5 to build first? The list above has 17; a single session can realistically
   ship 3–5 depending on complexity.
2. **C-16 tax calculator** — explicit owner approval needed (hard stop category).
3. **UI home** — do calculators get their own tab ("Tools"?), live as Home-screen cards, or sit inside
   each family screen? Richify surfaces results on the Home screen with freshness timestamps.
4. **Input model** — calculators that use existing holdings (C-06, C-07, C-08, etc.) vs. ones that take
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

**What we explicitly do NOT adopt from Richify's Home (and why):**

| Richify feature | Why not adopted |
|---|---|
| Live stock tickers with red/green % change | P10 (valence styling on financial figures) + live market data feed = new external dependency + regulatory risk |
| "+$253K" in green on calculator result | P10 — a positive figure in green encodes a verdict. Output renders in ink only. |
| 90-second audio brief (TTS narrated by Felix) | New TTS service dependency — requires a hard-stop decision |
| Macro news feed (CNBC/external sources) | New external news API — new dependency, not a teaching surface |
| Investor mentor personas (Buffett/Wood framing) | Directly advisory — fails P2 does-not-says test |

### Open owner decisions required
1. **Tab bar** — adding more features may require a new tab ("Tools" for calculators + scenarios) or
   a restructured nav. Current 6 tabs are already at the practical limit. Owner decides nav shape.
2. **Health Score dependency** — section 3 only exists if Feature Area 1 is approved and built first.
3. **Persona dependency** — section 4 only exists if Feature Area 2 is approved and built first.

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

| Area | Decision | Tier |
|---|---|---|
| Health Score | Scoring methodology and dimensions | 3 |
| Health Score | P2/P10 framing of a numeric score | 3 |
| Persona | Name and visual style | 3 |
| Persona | Mascot removal: now (standalone) vs with persona? | 1 |
| Scenarios | Which scenarios to build and in what order | 2 |
| Scenarios | Retirement corpus target formula | 3 |
| Scenarios | Rent vs buy data requirements (schema) | hard stop |
| Calculators | Priority order of 17 new calculators | 1 |
| Calculators | C-16 income tax calculator explicit approval | hard stop |
| Home | Navigation structure with new sections | 3 |
| Home | New "Tools" tab vs Home-card surfaces | 3 |

---

## Next step

Owner to review Novelty Wealth app, then return to this brief to confirm decisions above.
Nothing enters BUILD_QUEUE until each decision has an answer. The mascot removal is the one
item that could ship immediately without any of the above — owner can confirm that independently.
