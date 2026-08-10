# D-096 — Empty sections use a static walkthrough followed by an optional Chat handoff

- **Tier:** 3, owner-decided directly in conversation
- **Interprets:** D-090; resolves BQ-049/BQ-050's empty-baseline content fork.
- **Decision:** Empty Investments, Loans, and Insurance sections open the existing full-screen `TeachingWalkthrough` with static mechanism/category steps. The walkthrough must not claim to use the user's own numbers while the section is empty. Its final step points the user to the existing Chat handoff for applying the mechanism to their own numbers; the existing secondary “I think I have one” action remains available after dismissal.
- **Why:** This keeps the approved full-screen teaching surface and P9 guard, makes the empty-state promise truthful, and avoids inventing a new backend response shape or personal figures where no baseline exists.
- **Reversibility:** Presentation-only; no schema, persistence, or backend contract changes.
- **Date:** 10-Aug-2026
