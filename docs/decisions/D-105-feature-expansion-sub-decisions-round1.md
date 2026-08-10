# D-105 — Feature expansion sub-decisions: Arya persona, calculator batch 1, tax approval, Health Score display format

**Tier:** Mixed (Tier 3 for persona name/brand + P2 ruling; Tier 1 for calculator priority; hard stop resolved for tax calculators)
**Date:** 11-Aug-2026
**Source:** Owner answered directly in conversation (AskUserQuestion round 1)

---

## Decision 1 — Persona name: Arya

The FinTutor AI tutor is named **Arya**.

This name replaces "Ankur" (the deleted sapling mascot, BQ-053). Arya appears:
- As the header identity on the Chat screen (replacing the removed Mascot component)
- Eventually on the Home screen persona card (Section 4, BQ-060)

Visual style: Tier 1 decision — a simple monogram avatar (circle with "A" in `colors.tutor`
forest-green, `font.uiSemibold`) until an illustrated character is commissioned. This is a
placeholder consistent with the warm-ledger design; the persona can evolve visually without
a new logged decision.

---

## Decision 2 — Calculator batch 1: C-04, C-10, C-17, C-22, C-24

First 5 calculators confirmed (all free-form input, no existing-holdings dependency):

| # | Calculator | Formula |
|---|---|---|
| C-04 | SIP Goal Planner | Monthly SIP = FV × r / ((1+r)^n − 1), where r = rate/12, n = months |
| C-10 | Home Loan EMI | EMI = P × r × (1+r)^n / ((1+r)^n − 1) |
| C-17 | Inflation Impact | Future cost = PV × (1 + inflation)^years |
| C-22 | Step-up SIP Corpus | Iterative: each year's SIP increases by step-up %, compound over tenure |
| C-24 | CAGR Backward | CAGR = (FV/PV)^(1/years) − 1 |

All five render outputs in `font.mono` / `colors.ink`, no valence colour (P10). No backend
calls — pure frontend math.

---

## Decision 3 — Tax calculators approved (hard stop resolved): C-16 and C-23

Owner explicitly approved both:

**C-16 — Income tax (old vs new regime comparison):**
Computes tax liability under both regimes for FY 2025-26 using the user's gross income.
Framing: side-by-side comparison with mechanism copy explaining what drives the difference.
No recommendation, no verdict — the user sees the numbers and decides. The "what we won't say"
block (D-091 pattern) applies: name the verdict declined ("which regime you should choose"),
state what the screen does instead ("the numbers that describe each option").

**C-23 — HRA exemption calculator:**
Computes the HRA-exempt portion under Section 10(13A): minimum of (a) actual HRA received,
(b) 50%/40% of basic for metro/non-metro, (c) actual rent paid minus 10% of basic. User
inputs these three components; output is the exempt amount. Same "what we won't say" framing
applies — this shows the exempt figure by the formula, it does not confirm whether the user
has claimed correctly (that's an employer/CA question).

C-16 and C-23 are in batch 2 (after C-04, C-10, C-17, C-22, C-24 ship).

---

## Decision 4 — Health Score display: single 0-100 format (formula TBD)

Owner chose: **single 0-100 score** (Novelty Wealth style — overall number + 4 sub-scores).

Display format confirmed. Scoring formula (what 4 dimensions and their weights produce
the 0-100 number) is still a Tier 3 sub-decision — owner must confirm the formula before
BQ-054 can build. A proposed formula will be logged in a follow-up decision once confirmed.

**P2 safeguard for the single-number display:** the overall score and each sub-score are
labelled with band names that describe COVERAGE ("Getting started / Building up / On track /
Strong"), not outcome verdicts ("bad / risky / excellent"). Micro-copy reads: "This score
describes how many of the four areas your holdings currently cover — not how your investments
will perform." This framing is consistent with P2 (teach) and avoids P10 (the number is an
index of coverage breadth, not a financial return figure).
