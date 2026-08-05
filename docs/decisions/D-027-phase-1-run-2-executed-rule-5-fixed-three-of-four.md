# D-027 — Phase 1 Run 2 executed; rule 5 fixed three of four, failed on the fourth (Tier 1)
- **Tier:** 1 — running an already-designed test protocol against an amended prompt and recording what
  happened. No trigger fires; within this home; no decision made. One entry per §2.3.
- **What happened:** Q1, Q2, Q3, Q5 re-run against `SYSTEM_PROMPT_v0.3_runnable.md` (D-025's rule 5 +
  D-026's recalibrated lengths), same fixture, same settings — only the prompt changed. Q4 and Q6 not
  re-run (both passed in Run 1, rule 5 does not bear on them); Q7/Q8 still never run. Full results in
  **PHASE1_RUN2_RESULTS.md**.
- **Headline:** **Q3 flipped from break to pass** — the Run 1 failure (refusing in form, recommending in
  substance) is gone. Q2 and Q5 both materially cleaner. **Q1 failed in a new shape**: the ranking moved out
  of sentences and into structure.
- **FINDING 4 — prioritisation moved into STRUCTURE (escalated as BRIEF-002).** Rule 5 governs sentences and
  worked at that level. But §2 rule 2 (D-015) requires the model to name every path then *go deep on one*,
  and is silent on how to choose. In Q1 the model complied with rule 5 in every sentence, then expressed the
  same judgment by selecting the card as the deepened path — stating the rate as its reason ("since that's
  the rate doing the most damage per rupee") — and by narrating the other two paths from the card's point of
  view. Deepening a path IS a ranking. §2 rule 2 hands the model a channel rule 5 does not reach. **Second
  re-route of the same behavior:** Run 1 routed around a phrase blocklist via "worth"; Run 2 routed around a
  sentence-level rule via structure. No evidence of intent to evade — the model finds 42% genuinely most
  important and uses whatever channel remains open.
- **FINDING 5 — the model narrated its own compliance.** Q3 closed with "I've stated them, not ranked them."
  Three problems: §1 forbids narrating mechanics; the claim is contradicted by the same response; and denying
  a ranking draws attention to it. New failure shape, absent from Run 1, and a direct side effect of putting
  an explicitly-stated test in the prompt — a rule the model can name is a rule it can narrate. Mechanical
  §1 tone fix, not a separate decision.
- **FINDING 6 — "worth" has split into two populations.** It appeared in all four responses, but sorted by
  what it operates on the picture is clean: operating on the user's holdings (Q1 "worth seeing the full
  board", Q3 "worth naming before either") it fails or sits on the line; operating on a *concept* (Q5 "worth
  separating in your head", Q2 "worth understanding") it is explicitly permitted by D-021. The word is not
  the problem — what it operates on is. Further evidence that banning the verb would be the wrong fix.
- **FINDING 7 — Q2 supplied a market figure the fixture did not contain** (~₹10,000–15,000/yr for ₹1 crore of
  term cover). No product or insurer named, so §3 rule 2 holds, and it is hedged. But it is a number the app
  cannot stand behind, presented in the same register as profile numbers. Not escalated — no rule broken.
  Logged as an open prompt question: may the model supply market-typical figures it was not given, and must
  they be marked illustrative? Will recur on every D-012 surfacing case by definition.
- **What improved, recorded properly:** Q3's break is closed; Q5 no longer redirects the user's priorities and
  does not mention Card-1 at all (correct — nothing in the question touched it); Q2 confirms D-025's narrowing
  works, with the insurance gap surfaced without ranking, so the D-012 tension D-025 recorded does not bite;
  all four outputs sit inside D-026's recalibrated length bands with no overruns.
- **Not tested:** Q4/Q6 against v0.3, Q7, Q8, repeat runs (still n=1), a second fixture without a dominant
  number, temperature variation.
- **Date:** 23-Jul-2026
