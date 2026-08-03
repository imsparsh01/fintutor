# D-057 — B2B2C employer-channel GTM groundwork sequenced earlier (pure sequencing, no MVP scope change)

- **Tier:** No §2.1 trigger fired (checklist run below). Logged as a full entry anyway, not a bare
  one-liner, because it directly shapes near-term session priorities — same reasoning D-052/D-054 used.
- **Trigger checklist (DECISION_PROTOCOL.md §2.1):**
  1. Money leaves the account — No.
  2. Legal/regulatory/tax exposure — No. Nothing here touches SEBI positioning, the advisory line, or
     user data handling — no product changes at all. Flagged for later: once actual outreach/pitch
     material is drafted, *that* content gets its own check (e.g. does a pitch deck accurately represent
     the compliance posture) — not fired by this sequencing decision itself.
  3. Contradicts/reinterprets a standing principle — No.
  4. Low reversibility (touched-data test) — No. Nothing built, nothing committed, nothing populated.
     Pure prioritization of where attention goes next.
  5. Increases MVP scope — No, **deliberately narrowed to ensure this**. The owner was asked to
     disambiguate "weight B2B2C earlier" against three concrete readings before this was logged:
     (a) pure GTM/business-development sequencing — no product change; (b) a lightweight employer-
     sponsored signup flow (seats, redemption codes); (c) an employer-visible reporting/dashboard. Paths
     (b) and (c) would both fire this trigger hard — (b) because it directly touches
     `PROJECT_SPEC.md` §5's explicit MVP exclusion of "Payments / subscriptions / monetization," (c)
     even more so, plus real data-privacy/trust exposure (the research in
     `docs/MARKET_OPPORTUNITY_BRIEF_2026-08.md` §5 names employer visibility into personal financial
     data as the kind of thing that could hit the "data-linking hesitation" trust cliff the Business lens
     flagged as the single biggest adoption risk). **Owner chose (a).** Neither (b) nor (c) is adopted or
     ruled out here — they remain open forks that would each need their own Tier-3 treatment if pursued.
  6. Unclassifiable — No. Sequencing/PM category, same as D-006, D-007, D-014.
- **Decision:** B2B2C employer-channel groundwork — identifying candidate pilot employers, drafting
  outreach/pitch material, researching what a financial-wellness-benefit pitch to an Indian employer
  actually needs — is prioritized **earlier in the roadmap**: starting now, in parallel with Phase 2
  (app/backend build) and ahead of Phase 3 (private testing) completing, rather than waiting until
  post-launch as a typical roadmap might sequence it. This is pure GTM/business-development sequencing.
  It adds nothing to `PROJECT_SPEC.md` §4 (MVP scope) or §5 (explicit exclusions), and
  `docs/BUILD_QUEUE.md` is unaffected — no new item enters READY, nothing currently blocked changes
  status.
- **Why:** Per `docs/MARKET_OPPORTUNITY_BRIEF_2026-08.md`, the B2B2C employer-benefit channel
  structurally suits a solo-founder + AI-only team's bandwidth better than a high-volume, low-price
  consumer funnel (fewer, larger relationships vs. many small transactions) and has real precedent in
  India (46% of Indian organizations prioritizing financial-wellness program expansion, ADP's Future of
  Pay 2025). The same brief projects consumer subscription revenue as immaterial for the first 24 months
  at the grounded (solo+AI) scale — so the channel most likely to matter is worth starting relationship-
  building and positioning work for now, rather than only after Phase 3/4.
- **What this explicitly does NOT do:** does not commit to building any employer-facing product surface.
  Paths (b) and (c) above remain unresolved, separate forks — pursuing either would need its own Tier-3
  brief given the scope and (for (c) especially) data-trust exposure involved. This decision is scoped
  strictly to business-development sequencing, not product design.
- **Reversibility:** High — a prioritization/roadmap-sequencing call. No code, no data, no MVP scope
  touched.
- **Date:** 04-Aug-2026.
