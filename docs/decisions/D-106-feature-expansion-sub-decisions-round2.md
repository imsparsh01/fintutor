# D-106 — Feature expansion sub-decisions round 2: nav structure, Health Score formula, scenario priority, portfolio overlap

**Tier:** Mixed (Tier 3 for nav architecture; Tier 3 for scoring formula; Tier 2 for scenario priority; Tier 1 for overlap approach)
**Date:** 11-Aug-2026
**Source:** Owner answered directly in conversation (AskUserQuestion round 2)

---

## Decision 1 — Navigation: 5-tab structure

**Confirmed tab bar:** Home · Portfolio · Goals · Tools · Chat

| Tab | Content |
|---|---|
| Home | Greeting card, net worth summary, Health Score card, Arya persona card, Calculator results carousel, Scenario cards, Learn section, Streak/reward |
| Portfolio | Detailed holdings view: asset allocation donut, health sub-scores, portfolio overlap indicator, assets breakdown list (P10-safe), portfolio trend (mechanism fact only) |
| Goals | Illustrated goal-type cards, goal progress, insurance coverage entry (Health/Life/Others), Emergency readiness CTA |
| Tools | Calculator screens (C-04/10/17/22/24 + C-16/23 batch 2 + remaining), Scenario "What if…" screens |
| Chat | Arya conversation interface (ChatThread with Arya persona header) |

This requires a 5-tab bottom navigator. Current app has 4 tabs (Home, Chat, + family screens accessed via Home). The family-screen tabs may need to be removed from the tab bar and accessed from within the Portfolio tab instead — this is a nav restructure, not just an addition.

---

## Decision 2 — Health Score formula: approved

**Overall score** = simple average of 4 sub-scores, rounded to nearest integer.

**Sub-scores** (each 0–100):

| Sub-score | Computation | Full score means |
|---|---|---|
| Investment rate | (monthly SIP ÷ monthly income) × 10, capped at 100 | SIP = 10% or more of income |
| Insurance safety net | 0 = no coverage; 50 = term_insurance present; +25 = health_insurance present; +25 = sum_assured ≥ income × 10. Max 100. | Both term + health, adequate sum |
| Emergency buffer | months_runway × 8.33, capped at 100. months_runway = (EPF + cash_savings) ÷ (income ÷ 12) | 12 months of runway |
| Tax utilisation | (total_80c_invested ÷ 150000) × 100, capped at 100 | Full ₹1.5L 80C limit used |

**Label bands** (no valence colour — ink only, P10):
- 0–39: "Getting started"
- 40–59: "Building up"
- 60–79: "On track"
- 80–100: "Strong"

**P2 safeguard:** micro-copy reads "This score reflects how many of the four areas your holdings currently cover." The number is an index of coverage breadth, not an investment performance verdict.

**"What we won't say" block (D-091 pattern):** "A view on whether these numbers are optimal. What this screen shows: where you have coverage and where you don't."

---

## Decision 3 — Scenario priority: top 4 + user-set retirement target

**First batch (uses existing holdings data, no new schema):**

| # | Scenario | Key inputs | Output (mechanism, not verdict) |
|---|---|---|---|
| S-05 | Emergency fund runway | Income + EPF + cash | Months of runway |
| S-03 | What if I increase my SIP? | Current SIP + step-up ₹ + time horizon | Additional corpus at goal date |
| S-06 | What does my debt cost? | Loan outstanding + rate + tenure | Total interest remaining (mechanism fact) |
| S-07 | Inaction tax — idle cash | Cash holdings + assumed SIP rate | Opportunity cost over 5 years |

**S-01 (retirement):** user enters the corpus target. App says "at your current savings rate, your corpus reaches ₹[user-target] at age [X]." No formula the app defends — the user sets the number.

**S-04 (rent vs buy):** requires new input fields (rent, property value) → schema change → hard stop. Not in first batch. Revisit in a later session with explicit schema approval.

**S-02 (prepay vs invest):** covered by existing Loan vs Invest modal (D-014). Not duplicated; may be surfaced on the Scenarios tab as a shortcut to the existing modal.

---

## Decision 4 — Portfolio overlap: Option A (educational category-concentration indicator)

**What gets built:** A "Category concentration" indicator showing how many of the user's mutual funds are in the same broad category (equity/debt/hybrid). Labels it "Category concentration" not "Overlap" since true stock-level overlap requires scheme data we don't have.

**Copy pattern (P2/D-091):** "What this number shows: how spread your mutual fund holdings are across fund categories. What it can't tell you: whether different equity funds hold the same underlying stocks — that requires linking your fund account."

No external API, no scheme-level data, no rupee figure. Pure mechanism fact computed from existing holdings.
