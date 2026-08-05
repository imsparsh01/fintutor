# D-009 — Compliance stance: strict "no product/security names, ever" — mechanism + scenario modeling only
- **Decision:** FinTutor NEVER names a specific product, security, fund, stock, or investment vehicle — not
  even ones the user already holds. It only teaches concepts and mechanisms (compound interest, EMI
  amortization, diversification, etc.) applied to the user's own numbers. When the user asks a decision-shaped
  question (e.g. "I have ₹2 lakh extra, should I pay down my loan or invest it?"), FinTutor uses its knowledge
  of the user's full baseline profile and stated goals to model out multiple paths side by side — mechanism,
  numbers, trajectory, and risks for each — so the user sees the consequences clearly. It never tips the
  scale toward one path, never says "you should," and always leaves the decision to the user.
- **Why:** SEBI's Investment Advisers Regulations, 2013 (as tightened through 2024-2025 amendments and a
  January 2025 circular) draw enforcement scrutiny around content that functions as personalized investment
  advice regardless of "educational" framing — including a December 2025 case where a finfluencer's
  "education" was found to be unregistered advisory activity (₹546 crore impounded). Naming specific products
  or securities is the clearest trigger for that scrutiny. Modeling scenarios/trade-offs with the user's own
  numbers — without naming products or picking a winner — stays on the education side of the line while still
  being genuinely useful for real decisions. This is the strictest of the two postures considered; chosen for
  MVP to minimize regulatory risk given the current enforcement climate.
- **Reversibility:** Medium. Can be loosened later (e.g. allowing references to products the user already
  holds) after real legal review — but tightening a live product after users are used to a looser behavior is
  harder than starting strict and relaxing deliberately. Do NOT loosen this without a securities/fintech
  lawyer's review first.
- **Date:** 23-Jul-2026
