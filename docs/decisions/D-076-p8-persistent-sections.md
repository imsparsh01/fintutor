### D-076 — P8 added: a holding family's section is always reachable, never gated behind having data in it

- **Tier:** 1 — extracting a checkable principle from an already-made decision (D-031), resolving a
  tension the owner flagged rather than opening a new one. Bounded, reversible (prompt/documentation-level
  only), contained to this session, doesn't touch money-logic, doesn't touch the teach-not-advise line,
  doesn't grow MVP scope.
- **Decision:** New principle **P8** in `docs/PRODUCT_PRINCIPLES.md`:
  > A holding family's section is always reachable — never gated behind having data in it.
  > **Test:** For any holding family in the D-013 taxonomy, is its section reachable through the app's
  > persistent navigation regardless of whether the user currently holds anything in it? If a section
  > would be hidden, collapsed out of navigation, or otherwise made unreachable until data exists in it,
  > that fails.

  Scoped explicitly to reachability/information-architecture only — it does NOT govern what an empty
  section's screen looks like or says (empty-state design), which stays open until a real screen decision
  forces it, matching this file's own extraction discipline (same treatment as the aesthetic layer).
- **Resolved tension:** the checkpoint from session 2026-08-05a flagged whether "persistent" should apply
  to an empty section the same as a populated one, or whether that would pressure inventing UI ahead of
  data. Owner resolved: empty sections are shown, not hidden — reachability is committed now; the
  empty-state's actual design is deliberately left for later, so this commits to the narrower, genuinely
  decided claim only.
- **Why:** D-031 already decided the app is structured as persistent, user-facing category sections
  (Investments/Loans/Insurance), not a menu-less AI-only surface. That decision implies a section is part
  of the app's structure independent of its contents, but nothing had stated that as a checkable test
  before — a future build decision (e.g. "should we hide the Insurance tab until the user has an
  insurance holding?") had no principle to resolve it against without asking the owner. P8 closes that
  gap.
- **Context:** Item 2 of 3 in the live UX-principles-section discussion (session 2026-08-05a, continuing
  from D-075/Item 1). Item 3 (no comprehension gates / no lesson-tree, tracing to `PROJECT_SPEC.md` §2/§4's
  "learn on the go" language) remains open.
- **Reversibility:** High — a principles-file addition, no code or data depends on it yet. If a future
  build decision needs to hide an empty section for a real product reason, that would need to either
  amend or carve an exception into P8, not silently ignore it.
- **Date:** 05-Aug-2026
