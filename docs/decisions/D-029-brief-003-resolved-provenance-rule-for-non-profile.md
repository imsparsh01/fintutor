# D-029 — BRIEF-003 resolved: provenance rule for non-profile numbers (Path C)
- **Decision:** A number in a teaching moment has a provenance — it is either the user's (from the profile)
  or the genre's (typical/illustrative). Any figure not traceable to the profile is given as a **range,
  never a point estimate**, and the "typical, not yours" framing is built into how the range is introduced.
  The range itself carries the signal that it's a genre figure, not a personal fact. Adopted over Path A
  (per-sentence tagging — carries the FINDING 5 self-narration risk) and Path B (qualitative-only — pays too
  much of the D-012 surfacing usefulness the rule exists to protect).
- **Guard (binding, not optional):** the range must be tight enough to convey scale. A range so wide it
  conveys nothing ("₹5,000–₹1 lakh") fails §2 rule 4's legibility standard exactly as a buried number does —
  this is the D-015 drift-to-uselessness edge applied to ranges. Range-washing is the named failure mode and
  the prompt must close it by example.
- **Why Tier 3:** interpreting what numbers the app may assert is compliance-category (protocol §4.3),
  owner-decided. Owner explicitly reaffirmed no deviation from tier assignment at decision time.
- **Supersedes:** nothing. Additive to §2 rule 4 and §5.
- **Rule extracted (compounds protocol):** a rule that introduces a number must state that number's
  provenance; silence about an adjacent channel is the FINDING 1/4/7 error class — the third occurrence of a
  prompt rule governing one channel while staying silent about an adjacent one.
- **Reversibility:** High — prompt-level text, tunable in Phase 1 testing.
- **Feeds:** TEACHING_SYSTEM_PROMPT.md §2 (new rule 5) and §5 (typical-figure phrasing example). Runnable
  regeneration to SYSTEM_PROMPT_v0.5_runnable.md is build-home work, queued as BQ-005 (pending laptop repair).
- **Date:** 25-Jul-2026
