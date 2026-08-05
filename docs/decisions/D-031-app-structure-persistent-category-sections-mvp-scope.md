# D-031 — App structure: persistent category sections; MVP scope expanded (direction vs. build split)
- **Tier:** 3 — a scope decision (trigger 5, the hard no-de-minimis version from D-018). Fired inside a UX
  discussion, not announced as scope — the P-001 pattern (scope disguised as another conversation). Named and
  logged explicitly rather than absorbed.
- **Supersedes:**
  1. **D-012 in respect of the "not a menu / backend-internal taxonomy" clause only.** D-012 said the
     product-type taxonomy is NOT user-facing — no category sections, no "Add X" menu. That is narrowed: the
     app DOES have persistent, user-facing category sections (one per holding family), and a manual add/browse
     path into them. D-012's *primacy* commitment stands unchanged — AI-surfacing is still the primary path to
     populate a section; the menu/manual path is explicitly secondary. The narrowing is "not menu-FIRST," not
     "no menu." The rest of D-012 (AI-surfaced capture is core UX, applies to all types, manual is fallback)
     stands.
  2. **The MVP scope in PROJECT_SPEC §4/§5** — expanded (see below). Recorded as a real increase against the
     spec's own "keep ruthless" instruction and against P4 (start strict). The system flagged the tension; the
     owner decided the expansion is justified because tracking the user's whole financial picture is the
     product's point, and recorded the counter-discipline as the direction/build split below.
- **The decision has two layers, deliberately separated:**

  **Decided DIRECTION (the north star — recorded so it is not re-litigated, NOT all in MVP):**
  - Six holding families under Layer A ("things the user holds"): **Investments, Loans, Insurance, Real
    estate, Cash & bank balances, Alternatives/other** (gold, crypto, ESOPs, startup equity…).
  - Two Layer-B objects ("things the user does"), which are NOT products and behave differently — they
    reference holdings rather than being holdings: **Budgeting / cash-flow** and **Goals & planning**.
  - **Per-item management** — each holding visible in its section with its details, and user actions on it.
  - Persistent dedicated section per category is the structural pattern; AI-surfacing and manual entry are two
    ways to populate the same sections. AI confirmation ("yes, I have a loan" + details) creates a real
    tracked holding in its section, not just model context.

  **MVP BUILD (the ruthless cut — what actually gets built for Phase-1-era MVP):**
  - **Three** holding families only: Investments, Loans, Insurance (D-013 unchanged — no new schema).
  - **Plus** Budgeting/cash-flow and Goals & planning — included because the owner judged them critical AND
    because they are FOUNDATIONAL (they change the data model every other object reads from, so deciding them
    before build prevents rework — unlike extra product families, which are cheap to add later).
  - **Plus** per-item management (depth still to be decided — see open item / Decision 2 below).
  - **Deferred to immediately post-Phase-1:** Real estate, Cash & bank, Alternatives. Rationale: these are
    more instances of the D-013 pattern, not new machinery, so they are cheap to add later and pointless to
    build before the teaching engine is validated on three families. Deferring them costs nothing and keeps
    the pre-validation build small.
- **Why the split is the right shape:** foundational work (goals/budgeting data model) is done before build
  because its cost is rework-if-deferred; additive work (more product families) is deferred because its cost
  is near-zero-if-deferred and pure-surface-if-done-now. Decide-before-build is reserved for what genuinely
  must be, per the spec's ruthless-scope instruction.
- **New work this creates (see §8):** (a) the budgeting/goals data model — how non-product objects sit in the
  baseline alongside product holdings (FOUNDATIONAL, do before build — "Decision 3"); (b) per-item management
  depth — the user's authority over a holding, per field: view / edit / delete / recategorize / correct
  AI-captured values ("Decision 2"); scoped now, designed after the goals/budgeting model exists and Phase 1
  yields one real section to react to; (c) the corrected UX principles section in PRODUCT_PRINCIPLES.md,
  written AFTER (a) and (b) because it extracts from them.
- **Rule extracted:** *direction and MVP-build are separate scopes and should be logged separately.* Recording
  a want as "direction" defuses the pressure to build it now, while still preventing it from being
  re-litigated. Future scope-expansion decisions use the same two-layer shape: what we're committing to
  eventually vs. what the next validated increment actually builds.
- **Reversibility:** Direction is cheap to revise (it is a recorded intention, nothing built). The MVP-build
  additions (budgeting/goals) touch the data model — medium reversibility once built, which is exactly why
  their model is being designed deliberately before build rather than discovered during it.
- **Feeds:** PROJECT_SPEC §4, §5, §8; PRODUCT_PRINCIPLES.md (UX section, pending); the budgeting/goals model
  session (next); D-012 (partially superseded).
- **Date:** 25-Jul-2026
