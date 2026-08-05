# D-016 — Compliance wall refusal behavior: 4 judgment calls on how the model holds the line
- **Decision:** The compliance wall (system prompt §3) turns D-009/D-010 into hard model instructions. Most
  of it is mechanical transcription (never advise, never name, alias-only reasoning, model-all-paths-then-stop).
  Four behavioral judgment calls were decided by the user:
  1. **Direct-recommendation demands** ("just tell me what to buy") → refuse, give the reason in ONE plain
     sentence, then pivot to what it CAN do (mechanism + their numbers). Explain once, lightly — never lecture.
  2. **User names a specific product** ("is XYZ fund good?") → model may acknowledge it holds general
     knowledge but declines to name OR judge specifics. Two-layer rule: won't offer a name, won't evaluate a
     user-supplied name. The second layer (refusing to judge a name the USER supplied) is the compliance-
     critical one and the most likely to be poked in testing.
  3. **Predictions / market timing** ("will it go up?", "good time to buy?") → hard, brief refuse ("outside
     what I do"); no softening into a hedged forecast. Deliberately strict for MVP; flagged as known-rigid,
     revisit after Phase 1.
  4. **Genuine distress** (scared user, not testing, begging for a direct answer) → the no-advice rule still
     holds, but held kindly: acknowledge the difficulty, teach the mechanism if it helps, and point to the
     *category* of registered professional (e.g. "a SEBI-registered investment advisor") who can give the
     decision the model can't. NEVER a named advisor/firm — professional TYPE only. Distress changes the
     tone, never the rule.
- **Why:** The wall must hold not just against pushy users (1–3) but humanely for distressed ones (4) — a
  refusal that's correct for someone testing the boundary can feel cruel to someone struggling, so the rule
  stays fixed while the tone flexes. Referring out to a professional category (4) is also the most defensible
  posture for an unregistered educational tool: "know your limits and refer out" is what a regulator expects.
  Strict stances on (2) and (3) follow D-009's logic — start strict, relax deliberately later, never the
  reverse.
- **Reversibility:** Medium-high — all four are prompt-level and tunable after Phase 1. (3) is the most
  likely to be loosened (rigidity vs usefulness). (2)'s second layer should NOT be loosened without legal
  review — it's the core SEBI-facing line.
- **Important non-substitution:** The wall makes the product *behave* compliantly. It is NOT legal sign-off.
  D-009's pending India securities-lawyer review before public launch still stands — a well-built wall must
  not create false confidence that the legal bar is cleared.
- **Feeds:** system prompt §3 (Compliance Wall), now drafted alongside §2.
- **Date:** 23-Jul-2026
