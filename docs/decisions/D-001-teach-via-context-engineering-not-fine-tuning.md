# D-001 — Teach via context engineering, NOT fine-tuning
- **Decision:** The tutor is an off-the-shelf Anthropic model fed the user's profile + app rules as context
  on each call. No custom-trained model.
- **Why:** The model already knows finance. What's missing is the user's live numbers + app voice — those
  are supplied per-call, not baked into weights. Fine-tuning teaches style/skill, not per-user facts.
- **Reversibility:** High (could add fine-tuning far later at scale). Not an MVP concern.
- **Date:** 22-Jul-2026
