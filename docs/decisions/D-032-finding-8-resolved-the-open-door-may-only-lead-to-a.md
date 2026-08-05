# D-032 — FINDING 8 resolved: the open door may only lead to a room the user is already in (Path B)
- **Tier:** 3 — compliance-category (touches §3 rule 5's advisory-line test and D-012's Trigger A/B scope),
  owner-decided per DECISION_PROTOCOL §4.3 and PRODUCT_PRINCIPLES P2 (Product lens cannot resolve
  advisory-line questions on its own, however cleanly a principle seems to cover it).
- **What FINDING 8 was:** Q7 (a purely off-topic memory-claim question, BQ-001/Run 3) closed by volunteering
  the term-insurance gap unprompted, using "worth looking at" — the literal FINDING 2 phrase D-025 had
  already closed by example, resurfacing in a channel neither D-025 nor D-028 ever governed: an off-topic
  question, not an in-scope ranking.
- **Decision, and why it is NOT a P-002 case:** P-002 (routed-around-twice → go architectural) requires two
  real prior attempts at closing the *same* channel. D-025 closed ranking language *within* an in-scope
  answer; D-028 closed structural favoritism *among paths the user was already discussing*. Neither rule was
  ever pointed at "may the model open a new, off-topic thread at the end of an unrelated answer" — that
  channel had no rule at all, because D-031's Trigger-A/B scope narrowing (25-Jul-2026) was decided at the
  product/spec level and never transcribed into TEACHING_SYSTEM_PROMPT.md. This is a missing rule being
  written for the first time, not a rule being routed around a third time. P-002 does not apply; reaching for
  architecture (a backend gate) would be disproportionate to what the evidence shows.
- **Path chosen (B): tighten §2 rule 3 (the open-door offer) to be on-topic only** — not a new standalone
  Trigger-A/B gate (Path A), not a backend field (Path C). The open door may only name a thread the current
  conversation has already touched (a mechanism just explained, another named path, a holding already under
  discussion). It may never introduce an unheld gap or unraised topic as a closing offer. Gap-surfacing via
  `known_gaps` remains authorized, but only per §2 rule 1 (opening on a situation the user's own question
  puts them in) — never appended to an answer about something else.
- **Why B over A:** Q8's result (BQ-001, same run) is the deciding evidence. Q8 also closed with an open-door
  offer (Fund-A's compounding) and got it right — on-topic, number-free, correctly shaped. The model already
  knows how to make a well-formed offer when nothing pulls it off-topic; Q7's specific failure was not
  checking whether the offer was on-topic before making it. That is a narrower, more precise diagnosis than
  Path A's blanket "no surfacing on off-topic questions" gate, and the fix targets the exact mechanism that
  broke (rule 3) rather than adding new machinery beside it.
- **Why B over C:** no second attempt at this channel has failed yet — trying the narrowest correct fix
  first is what P-002 itself prescribes (escalate to architecture only after two routed-around attempts at
  the SAME channel). Skipping straight to a backend gate here would front-load architectural cost the
  evidence doesn't yet justify.
- **Held in reserve:** if a future run shows the model volunteering an unraised gap in a context Path B's
  on-topic constraint does not catch (e.g. a question that is finance-adjacent but should still not trigger
  surfacing), that is new evidence Path B is insufficient — the next step would be Path A's broader gate,
  and a second such failure on the SAME (now-narrowed) channel would make this a genuine P-002 case.
- **Rule extracted:** before invoking the "routed around twice → go architectural" precedent (P-002), check
  that the SAME channel was actually the target of both prior fixes — a new failure that merely *resembles*
  a past one in shape (ranking-adjacent language) is not automatically the same channel, and treating pattern
  resemblance as if it were repetition would over-apply P-002 and skip past cheaper, more precise fixes.
- **Reversibility:** High — prompt-level text, tunable in further Phase 1 testing (same standing as D-029).
- **Feeds:** TEACHING_SYSTEM_PROMPT.md §2 rule 3 (amended). Runnable regeneration to
  SYSTEM_PROMPT_v0_6_runnable.md is build-home work — new BQ item to be queued.
- **Date:** 01-Aug-2026
