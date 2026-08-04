# D-059 — Decision 2 resolved: Path C adopted — full per-field edit, delete, and recategorize authority over holdings

- **Tier:** 3 — Trigger 2 fired (user financial data handling: per-item edit/delete/recategorize authority
  over a user's holdings is financial-data handling by definition). Owner-decided directly in conversation,
  resolving `PROJECT_SPEC.md` §8's "Decision 2 — per-item management depth," open since D-031.
- **The question:** For an AI-captured holding in the living baseline, what is the user's authority per
  field — view only, edit, delete, recategorize `product_type`? And does correction bypass or reuse the AI
  reconciliation pipeline (§2 of `PROJECT_SPEC.md` frames that pipeline as "a core feature, not a CRUD
  save")?
- **Decision:** **Path C adopted.** Full per-field edit, delete, and `product_type` recategorization via a
  standard direct-manipulation UI — the same authority a user would expect over any records list in a
  consumer finance app. Not limited to view-only or delete-only; not routed exclusively through AI
  conversation.
- **Paths considered (not adopted):**
  - Path A — view-only, all correction through AI conversation. Rejected: with the chat surface
    (`BQ-023`/`BQ-024`) still unbuilt, this would leave holdings functionally frozen in MVP — no way to fix
    a wrong captured value or remove a closed holding until the conversational engine ships.
  - Path B — delete-only, no field-level edit UI. Rejected: still leaves value corrections stuck behind the
    same unbuilt chat dependency; an unusual UX shape (delete but not edit) for a records list.
- **Why:** Owner's stated reasoning: full direct-manipulation authority is "the correct way to move
  forward," explicitly weighed against the size of the build ask and chosen anyway. Practical driver
  matches Path A/B's rejected-cost: `BQ-023`/`BQ-024` (the conversational surface) are still blocked, so a
  correction path that depends on chat existing would leave real holding-management gaps in MVP
  indefinitely. Path C is buildable now, independent of that dependency.
- **Tension knowingly accepted, not silently resolved:** this sits in real tension with §2's "living
  baseline... reconciliation is a core feature, not a CRUD save" framing, and with D-012's anti-menu,
  anti-form philosophy for *capture*. The distinction the owner is drawing (implicit in choosing Path C
  anyway): D-012/the living-baseline framing governs how a holding **enters** the baseline (AI-surfaced,
  not menu-driven) — Decision 2 governs what happens **after** a holding already exists, which is a
  different concern. Recorded here explicitly rather than papered over, per `DECISION_PROTOCOL.md` §4.3's
  spirit (interpretation tensions should be visible, not smoothed away) — not filed as a formal
  `Interprets:` of D-012/§2, since this decision doesn't reinterpret what D-012 means, it scopes a
  boundary D-012 never addressed (correction/management authority) rather than moving D-012's own line.
- **Rule extraction — NOT adopted as a standing test.** The brief proposed a candidate reusable rule (route
  future Income/Goals field-edit questions through the same "conversational reconciliation vs. parallel
  mutation surface" test). The owner did not confirm this as a standing rule — only Decision 2 itself was
  decided. Future analogous questions (e.g., Income/Goals edit authority) should be brought back as their
  own Tier-3 questions unless/until the owner explicitly adopts the candidate test.
- **Not yet decided as a side effect of this entry:** exact per-field edit rules (e.g., can `alias` collide
  with another holding on edit — the existing `(user_id, alias)` unique constraint from `BQ-012` still
  applies; is there a confirm/undo step on delete — a real UX question for the build task, not resolved
  here) and whether recategorizing `product_type` is unconstrained or limited to same-family swaps. These
  are implementation-shaped follow-ons for the build task(s) this decision unblocks, not further
  Decision-2-shaped questions.
- **Reversibility:** Medium — no real user holding data exists in the live DB yet (dev-only), so the
  decision itself is cheap to reverse today (touched-data test, §2.2 of `DECISION_PROTOCOL.md`). Once real
  users have edited/deleted/recategorized holdings through this authority, reversing to a stricter model
  (Path A/B) becomes a genuine UX regression, not just a code change — the reversibility window closes with
  real usage, not with code being written.
- **Date:** 04-Aug-2026
