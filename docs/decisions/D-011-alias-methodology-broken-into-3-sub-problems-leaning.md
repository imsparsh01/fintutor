# D-011 — Alias methodology broken into 3 sub-problems; leaning toward selection-based resolution + full re-humanizing for the user
- **Decision:** D-010's "alias methodology" is treated as three separate design questions, not one blob:
  (1) **Resolution** — how the backend maps what a user means to the right internal record. Leaning strongly
  toward **selection, not free text**: the user picks their holding from a list/dropdown (populated at
  onboarding) rather than typing a name, which the backend then resolves trivially by record ID — no fuzzy
  NLP matching needed for MVP. (2) **Characteristics** — the field list tracked per product type (e.g. fund:
  asset class, expense ratio, lock-in; loan: principal, rate, tenure, EMI; insurance: type, premium, sum
  assured). Only fields an actual teaching moment would use — resist over-modeling. (3) **Re-humanizing** —
  what the user sees when the LLM's response references an alias like "Fund-A." Leaning toward translating
  the alias **all the way back to the real name** in the final UI layer, since D-010's masking was only ever
  about what the *LLM* sees/says — the user already knows their own holding's real name, so hiding it from
  them in the UI would add confusion without adding any compliance or privacy benefit.
- **Why:** Splitting the methodology into named sub-problems prevents any one of them from being solved
  vaguely or skipped. Selection-based resolution avoids building NLP matching MVP doesn't need. Full
  re-humanizing in the UI keeps the app feeling natural to the user while preserving the actual point of
  D-010 (protecting what reaches Anthropic's API, not hiding the user's own data from themselves).
- **Reversibility:** High on (1) and (3) — both are backend/UI logic, changeable without data migration.
  Medium on (2) — the characteristics schema is more costly to change once built and populated with data.
- **Still open:** the actual list of product types + their characteristic fields (Step 1–2 of the framework)
  — being drafted in a separate working session. This entry captures the mechanism/framework only.
- **Date:** 23-Jul-2026
