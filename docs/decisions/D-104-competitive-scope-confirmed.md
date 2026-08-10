# D-104 — Competitive feature expansion: scope confirmed from Richify + Novelty Wealth analysis

**Tier:** 3 (product scope / identity), owner-decided directly in conversation
**Date:** 11-Aug-2026
**Sources:** Richify (richify.ai) live screenshots (5 screens); Novelty Wealth (noveltywealth.in)
web research + 6 live screenshots (Portfolio tab ×4, Goals tab ×2)

---

## Decisions

### Confirmed in MVP scope

| # | Feature area | Status |
|---|---|---|
| 1 | Financial Health Score | Confirmed; specific dimensions + P2 ruling = sub-decision (BQ-054) |
| 2 | Named tutor persona (+ mascot removal) | Confirmed; persona name + visual = sub-decision (BQ-055) |
| 3 | Scenario modelling — 7 "What if" scenarios | Confirmed; priority + retirement formula = sub-decision (BQ-056) |
| 4 | Calculator suite — top 20 + C-21–C-24 (21 new total) | Confirmed; priority + tax approval = sub-decision (BQ-057) |
| 5 | Portfolio overlap indicator | Confirmed; implementation scope = sub-decision (BQ-061) |
| 6 | Portfolio screen restructure (NW-inspired) | Confirmed; donut + sub-scores + trend; sub-scores gate on BQ-054 |
| 7 | Goals screen restructure (NW-inspired) | Confirmed; illustrated goal cards + insurance entry; nav decision = sub-decision (BQ-059) |
| 8 | Home screen restructure (Richify-inspired) | Confirmed; gates on BQ-054, BQ-055, BQ-057 |

### Explicitly post-MVP (parked by owner)

- **Account Aggregator (AA)** — automatic bank/brokerage data import via India's regulated AA framework
  (RBI/SEBI). Requires new service provider (Finvu/Setu/OneMoney/Perfios), consent management,
  DPDP Act alignment, schema changes. Not a single build — its own future brief.

### Not adopted (P2/P10 violations, new dependencies, or advisory territory)

| Feature | Source | Reason |
|---|---|---|
| Green/red return % styling (+20.60%, +10.5%) | Novelty Wealth | P10 — valence on real financial figures |
| "Consider rebalancing" copy | Novelty Wealth | P2 — advisory verdict |
| "You may want to diversify further" | Novelty Wealth | P2 — advisory verdict |
| Rebalancing / mistake-detection alerts | Novelty Wealth | P2 — advisory, SEBI-licensed activity |
| Personalized investment plan | Novelty Wealth | P2 — advisory |
| Market benchmark comparison (Nifty 50) | Novelty Wealth | P10 — -10.3% in muted/red encoding a verdict |
| Live stock tickers with red/green change | Richify | P10 + new live market data dependency |
| Audio brief / TTS | Richify | New TTS service dependency |
| External news feed | Richify | New external data dependency |
| Investor mentor personas (Buffett framing) | Richify | P2 — directly advisory |
| Portfolio overlap requiring scheme/ISIN data | Both | Scheme-level data not in current model; AA or schema change needed for exact computation |
| Hidden commission detection | Novelty Wealth | P2/advisory — requires knowing product commission structure |

---

## Mascot removal (standalone Tier-1 — confirmed, BQ-053 READY)

Owner confirmed: delete Ankur/sapling mascot. `Mascot.tsx` (43 lines) appears only in:
- `app/components/ChatThread.tsx` (import + mood state + celebration timer + `<Mascot mood={mood} />`)
- `app/components/StreakBadge.tsx` (comment only — no import or render)

Removal: delete `Mascot.tsx`, clean up ChatThread.tsx (remove mood state, celebration timer, import,
and the render call). Update StreakBadge.tsx comment. No replacement needed yet — the persona build
(BQ-055) will provide the Chat screen header identity once the persona name is decided.

---

## What the Novelty Wealth Portfolio screenshots show

**Portfolio tab — sections (top to bottom, screenshots 1–4):**

1. "Link your accounts" AA prompt card — not adopted (post-MVP)
2. Net worth card: "Your net worth ₹4.45L" — similar to existing ConsolidatedScreen
3. **Portfolio health section:**
   - "Excellent" badge + large 95/100 circle score
   - 2×2 sub-score grid: Performance 82/Excellent · Risk profile 74/Moderate · Cost efficiency
     45/Reasonable · Tax readiness 90/Excellent
   - Portfolio overlap card: 15% · "Measures duplicate holdings in your MFs & stocks" · "Show overlap ↓"
4. **Assets list:** sortable by returns and amount; Stocks / Mutual funds / Insurance ULIP / Bank
   accounts — returns shown in green (P10 violation — not adopted)
5. **Asset allocation donut chart:** ₹16L total; risk-filter chips (All / High 53% / Medium 30% /
   Low...); legend: Equity MF 31% / Stocks 22% / Hybrid 17% / Debt 13% / Bank 11% / Gold 6%;
   "View holdings" button
6. **Portfolio trend:** Portfolio vs market / Profit-Loss tabs; "Your portfolio is underperforming
   the market benchmark. Consider rebalancing" advisory copy (P2 — not adopted); Invested ₹6L /
   Portfolio ₹5.38L −10.3% / Nifty 50 +10.5% (P10 — not adopted)
7. **Insurance readiness card:** "Know your Emergency readiness — Check now" CTA
8. **Add insurances:** Health / Life / Others icon cards + "Get covered, the NovaAI way" CTA
9. **Pro-locked features:** Portfolio health score · Fixes that improve returns · Overlap & hidden
   risks

**P2/P10-safe adaptation for FinTutor's Portfolio screen:**
- Keep: net worth card, asset allocation donut, portfolio health 4-sub-scores (P2-safe framing),
  portfolio overlap %, insurance coverage section, assets breakdown list
- Drop from this screen: return % in green, market benchmark comparison, advisory copy,
  "fixes that improve returns" pro feature, AA link prompt

## What the Novelty Wealth Goals screenshots show

**Goals tab — sections (screenshots 5–6):**

1. **Illustrated goal-type card grid:** Higher education / Secure retirement / Dream house /
   Perfect wedding + "& much more…" — 2×2 photo-card layout with labelled icons
2. "Set your first goal for a stronger financial future!" CTA + "Get started →" button
3. **Emergency readiness card** (cross-links from Portfolio too)
4. **Add insurances section:** Health / Life / Others icon cards (same as Portfolio)
5. **"Get covered, the NovaAI way"** CTA to AI chat
6. **Pro features (locked):** Personalized investment plan / Future wealth projection / Goal progress
   tracking — not adopted (advisory)

**P2/P10-safe adaptation for FinTutor's Goals screen:**
- Keep: illustrated goal type cards, insurance coverage entry section, emergency readiness CTA,
  goal-setting flow
- Drop: personalized investment plan (P2), future wealth projection (advisory framing)

---

## Sub-decisions still needed (each BQ-05x is BLOCKED on one of these)

Each question below needs an owner decision logged before its BQ item can build:

1. **Health Score dimensions + framing** — proposed: 4 bars (Investment rate %, Insurance coverage
   binary, Emergency buffer months, Tax utilisation %) with no single rollup number (avoids P10/P2);
   or owner can approve a single 0–100 number with P2-safe framing → **BQ-054**
2. **Persona name + visual style** → **BQ-055**
3. **Scenario priority + retirement formula** → **BQ-056**
4. **Calculator priority (first 5) + C-16 income tax + C-23 HRA approval** → **BQ-057**
5. **Portfolio overlap implementation scope** (without scheme data) → **BQ-061**
6. **Goals screen nav** — new Goals tab or restructure within existing nav → **BQ-059**
7. **Tools tab** — new "Tools" tab for calculators + scenarios, or surface from Home cards → **BQ-060**

Full candidate lists and options for each are in `docs/BRIEF-019_richify_inspired_feature_expansion.md`.
