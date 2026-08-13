# D-064 — `design-taste-frontend` is explicit-ask only

- **Tier:** 1 — owner-stated usage rule; no hard-stop trigger fired.
- **Decision:** Never auto-trigger the vendored skill from generic terms such as “landing page,”
  “redesign,” “frontend,” or “UI.” Consult it only when the owner explicitly asks while beginning UI/design
  work on FinTutor's `app/`; never for `docs/CEO_DASHBOARD.md`/`.html` or personal/one-off web artifacts.
- **Implementation:** Encode the gate in the vendored skill's frontmatter description. This is the one
  disclosed deviation from D-063's verbatim-vendoring rule; its body remains untouched. See
  `.claude/skills/design-taste-frontend/PROVENANCE.md`.
- **Reversibility:** High — restore the upstream description if the policy changes.
- **Authoritative preserved source:** `docs/DECISION_LOG_ARCHIVE.md` D-064.
- **Date:** 04-Aug-2026
