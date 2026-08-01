# FinTutor — Product Principles (v1.1, 25-Jul-2026)

> **What this is.** The substantive product point of view that non-technical decisions are checked
> against. DECISION_PROTOCOL.md governs *how* a decision is made and *who* owns it; this file supplies
> *what FinTutor believes*, so that the Product lens has real content to test against rather than a vibe.
>
> **How it earns its keep.** A principle here is not a slogan — it is a **usable test**. The bar for
> inclusion: a future decision must be checkable against it *without the owner in the room*. If a
> statement can't resolve a real fork on its own, it isn't a principle yet.
>
> **How it routes (authorized by D-030).** A product decision cleanly resolved by a principle below is a
> Tier-1 application — handled and logged, not escalated. The owner is asked only when principles
> conflict, when none covers the decision, or when a decision would set or amend a principle. See
> DECISION_PROTOCOL.md §3.1 (Product lens) and §3.7 (the routing rule).
>
> **How it grows.** Like DECISION_PROTOCOL.md §6, this file fills by accretion. The founding set below
> was *extracted from decisions already made* (D-009, D-012, D-015, D-025, D-010, D-011), not invented —
> each principle points to where it was already operating. New principles are added only when a real
> decision reveals one; a principle earns its place by resolving a fork, never by sounding good.

---

## The principles

### P1 — Don't ask; infer, surface, or defer.
**Test:** For any point where the app would ask the user to enter something, can the AI infer it, surface
it in context, or defer it until the user shows interest? If yes, don't ask. Every field the user is
asked to fill must justify why it could not be inferred, surfaced, or deferred.

- **Scope:** app-wide. Onboarding, capture, portfolio, every input surface.
- **Traced to:** D-012 (AI-surfaced, not menu-driven; "minimize explicit user input everywhere"). The
  most-repeated commitment in the project and the source of the whole surfacing architecture.
- **What it forbids:** "Add X" button menus the user has to seek out; forms that demand a full schema up
  front; asking for anything the profile or context already implies.

### P2 — Teach, never advise — and the line is what the output *does*, not what it says.
**Test:** Does this output make something legible (a rate, a mechanism, a consequence), or does it tell
the user what to attend to, choose, or prioritise? The first is teaching and is the product; the second
is advice and is forbidden — however it is phrased.

- **Scope:** app-wide, but load-bearing for every teaching moment and every piece of generated copy.
- **Traced to:** D-009 (strict no-advice stance), D-025 (unprompted prioritisation is advice), D-028
  (structural prioritisation is advice too). The "does, not says" formulation is the hard-won refinement
  from BRIEF-002 — it exists because wording-level rules were routed around twice.
- **What it forbids:** ranking the user's problems; picking a winner among paths; steering by structure
  (which thing gets explained, named first, or made the frame) even when no sentence advises.
- **Compliance note:** this principle is also a compliance object. Any decision that touches *where* the
  advice line sits is Compliance-category and therefore Tier 3 (protocol §4.3) — P2 does not license the
  Product lens to settle advisory-line questions on its own.

### P4 — Start strict, relax deliberately — never the reverse.
**Test:** When unsure how permissive a behaviour should be, choose the stricter setting and record what
specific evidence would justify loosening it later. Loosening is always a deliberate, conditioned
decision; it never happens by default, by drift, or by accretion of individually-reasonable narrowings.

- **Scope:** app-wide, wherever a permissiveness dial exists.
- **Traced to:** D-009 (explicit), D-025 (Path A over B, by this logic by name), and the recurring
  "park the growth direction with explicit unpark conditions" pattern (Path B of both BRIEF-001 and -002).
- **What it forbids:** shipping the permissive version "to see how it goes"; loosening because a strict
  setting is momentarily inconvenient; treating elapsed time or user count as sufficient reason to relax.

### P6 — The user sees their real world; only the model sees the masked one.
**Test:** Does this masking, aliasing, or abstraction protect what reaches the LLM, or does it degrade
what the user sees? Protecting the model's input is required; degrading the user's own view of their own
money is forbidden. The user always gets their real names, real numbers, real world back.

- **Scope:** app-wide, wherever compliance/privacy machinery meets the user-facing surface.
- **Traced to:** D-010 (aliasing protects the API boundary), D-011 (full re-humanising in the UI —
  masking applies only to what the LLM sees, never to the user's own view).
- **What it forbids:** showing the user "Fund-A" instead of their fund's real name; letting privacy
  machinery make the app feel sterile or foreign to the person whose data it is.

---

## Deliberately unprincipled (for now)

**The UX/UI surface has no principles yet — but a UX section is now pending (D-031).** The founding four
above were extracted from teaching-engine and compliance decisions. As of D-031, the app's structure
(persistent category sections, AI-primary/manual-secondary population, aliases never shown, no
comprehension gates, progressive capture) implies a real UX stance that CAN be extracted — but only once
its upstream decisions exist: Decision 3 (budgeting/goals data model) and Decision 2 (per-item management
depth), both open in PROJECT_SPEC §8. The UX section is written AFTER those, because it extracts from
them. The **aesthetic layer** (visual style, density, motion, colour, information hierarchy) remains
genuinely unprincipled and will stay so until real screen decisions force it — inventing it now would
violate the extraction discipline this file is built on.

---

## Change log
- v1.1 (25-Jul-2026) — Updated the "deliberately unprincipled" note per **D-031**: a UX principles section is
  now pending (not indefinite), to be extracted once Decision 3 (budgeting/goals model) and Decision 2
  (per-item management depth) exist. Aesthetic layer still deliberately unprincipled. No change to the
  founding four.
- v1.0 (25-Jul-2026) — File created (authorized by D-030). Founding four principles extracted from
  decisions already made: **P1** (don't ask; infer/surface/defer — from D-012), **P2** (teach not advise,
  the line is what the output does not says — from D-009/D-025/D-028), **P4** (start strict, relax
  deliberately — from D-009/D-025), **P6** (user sees the real world, only the model sees the masked one —
  from D-010/D-011). Numbering preserves the extraction-pass labels (P3 was redirected to
  DECISION_PROTOCOL §6 as a precedent about *how to fix*, not a product principle; P5 — depth rationed,
  visibility not — was placed in the teaching-method design as a teaching-scoped principle, not app-wide).
  UX/UI surface deliberately left unprincipled, to fill by accretion.
