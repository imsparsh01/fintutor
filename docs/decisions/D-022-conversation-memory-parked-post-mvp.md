# D-022 — Conversation memory parked to post-MVP

- **Decision:** Do not add session-to-session dialogue recall to the MVP. The model remains stateless and
  receives the live financial baseline on every call, but no stored prior conversation.
- **Reason/status:** The question fired the MVP-scope trigger and introduced a data-retention concern, so it
  was escalated and parked. Revisit only after Phase 1 is validated and D-010 settles retention/deletion.
- **Boundary:** D-085 later permits only the immediately preceding AI message during the current onboarding
  exchange, held in frontend display state and never persisted; it does not unpark general memory.
- **Authoritative preserved sources:** `PROJECT_SPEC.md` §5 and §8;
  `docs/PROJECT_SPEC_CHANGELOG_ARCHIVE.md` v1.4; D-023/P-001 in the historical decision log.
- **Date:** 23-Jul-2026
