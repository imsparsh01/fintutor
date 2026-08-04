# BRIEF-018 — The missing manual "add holding" path (D-012's own named-but-undesigned piece)

> Picks up the CRITICAL item from `docs/BUILD_QUEUE.md`'s BLOCKED section, found during the 04-Aug-2026
> comprehensive live-verification pass. Written so the owner is confirming or steering a concrete shape,
> not approving a vague direction. Scoped narrowly on purpose — see "What this does NOT cover" below.
> **Date raised:** 04-Aug-2026.

---

### The question: what does the manual fallback path for adding a holding actually look like?

- **Trigger check, run explicitly rather than assumed:**
  - Trigger 1 (money movement/calculations) — **does not fire.** This is data capture, not a calculation
    users rely on. Income and Goals creation (BQ-016/BQ-017/BQ-020) shipped the same shape without
    escalation.
  - Trigger 2 (legal/regulatory) — **does not fire.** No advisory content anywhere in a create form.
  - Trigger 3 (contradicts/reinterprets a standing principle) — **checked closely, does not fire.** D-012
    itself already named "a minimal-but-real manual fallback UI" as a required MVP piece, explicitly
    alongside the AI-surfaced path, not as a lesser stand-in for it: *"A manual 'corner' path... also
    exists in MVP as a fallback/escape hatch... both paths are MVP."* Building it executes that decision;
    it doesn't reinterpret it. (The fact that AI-surfaced creation *also* doesn't exist yet is a separate,
    larger gap — see below — not a reason this piece needs to wait.)
  - Trigger 4 (low reversibility) — **does not fire.** No schema change; reuses `POST /holdings` and the
    `HoldingEditModal` pattern already built and shipped (BQ-027/BQ-028).
  - Trigger 5 (increases MVP scope) — **does not fire.** `PROJECT_SPEC.md` §8 already lists "a
    minimal-but-real manual fallback UI" as one of D-012's four named, still-undesigned consequences —
    this is completing already-committed scope, not adding new scope.
  - **No hard trigger fires.** This routes to Tier 2 (real tradeoffs, no forced answer) rather than Tier 3
    — flagged here explicitly in case the owner reads it differently; happy to treat as Tier 3 if so.
- **Category:** Product-judgment + technical-architectural, not compliance.

### What's already settled, not a real fork
- **Where the entry point lives.** A "+ Add holding" affordance per family screen (Investments/Loans/
  Insurance), matching the pattern `BudgetingScreen.tsx` already uses for Income ("+ Add income source")
  and Goals ("+ Add goal"). Not really a choice — it's the established convention every other "add"
  affordance in this app already follows.
- **Reusing `HoldingEditModal` in a "create" mode**, rather than building a parallel component. It already
  does everything a create form needs: dynamic per-type characteristics fields keyed off
  `CHARACTERISTICS_SCHEMA`, the product-type chip picker, and — already built, for free — a blank field is
  simply omitted from the save payload rather than required (BQ-028). That last property matters: it means
  D-012's "progressive capture, not the full schema up front" philosophy is satisfied automatically by
  reusing what already exists, not a new feature to build.

### The real fork: does the user ever see or type "alias"?

**Path A — Auto-generate the alias; the user only ever types `display_name`.** On create, the app assigns
a sequential alias per family (`Loan-2`, `Fund-B`, …) and the create form never shows an "Alias" field at
all — only "What do you want to call this? (e.g. HDFC Home Loan)". The user never has to understand or
manage an internal concept that D-010/D-011 designed to be backend-only in the first place.

**Consequence, concretely.** Matches D-011's own architecture intent more closely: aliases exist so the
LLM never sees a real name, not as something the user is meant to think about. Removes an entire class of
friction (a real user has no natural instinct for what a good "alias" is) and an entire class of error
(duplicate-alias 409s from a user picking a generic name a second time).

**What it costs.** A small new piece of logic — generating a not-already-taken sequential label per family
per user — that doesn't exist anywhere today. Still cheap: query the user's existing aliases in that
family, pick the next unused number. No schema change.

**Path B — Reuse the edit form exactly as-is; the user types both `alias` and `display_name`.**

**Consequence, concretely.** Zero new logic beyond the create-mode plumbing itself — literally the same
fields, same validation, same 409-on-duplicate behavior the edit path already has.

**What it costs.** Exposes an internal, backend-oriented concept to a user who has no reason to understand
it, on the exact screen meant to be the "minimal, real" fallback D-012 asked for. Duplicate-alias 409s
become a real first-time-user papercut (unlike in edit mode, where the alias already exists and rarely
needs re-typing).

### A smaller, secondary question

**Should the product-type picker in the create flow be scoped to the current screen's family (Investments
→ only investment types), or show the full unconstrained list `HoldingEditModal`'s recategorize picker
already uses?** Leaning toward scoping it — matches why the user tapped "+ Add" from the Investments
screen in the first place, and avoids an odd "why would I add a loan from here" moment — but this is a
much smaller call than the alias question, noted for completeness rather than modeled as a full fork.

---

### What only the owner can judge

**Whether Path A's small new complexity (sequential alias generation) is worth it for the UX/architecture
win, or whether reusing the edit form exactly as-is (Path B) is the more honest "minimal" reading of what
D-012 asked for** — D-012's own word was "minimal," which could argue either way: minimal *new code* (Path
B) or minimal *user-facing surface* (Path A).

**Whether the family-scoped product-type picker is worth a small deviation from the edit modal's existing
unconstrained one**, or whether reusing it unconstrained (simpler, one less thing to maintain) is fine.

### What this brief does NOT cover
The AI-surfaced creation path — `/chat` having no tool-calling/function-call setup to ever create a
holding from conversation — is D-012's *primary* path and a substantially larger, separate piece of work
(trigger logic, micro-capture flow, and a real conversation-driven capture design, per `PROJECT_SPEC.md`
§8's own framing). This brief scopes only the fourth, smallest of D-012's four named open pieces — the
manual fallback. Building this does not solve, and is not meant to solve, the AI-surfacing gap.

### Rule extraction
**A "fallback" or "secondary" path named in an old decision can sit undesigned for a long time without
anyone noticing, because nothing ever fails loudly — it just silently has no UI.** The catch here came from
live testing, not a spec re-read. Worth a standing habit: when picking up a BQ item that touches a family
of related paths (primary + fallback, AI-surfaced + manual), explicitly check whether the un-glamorous half
was ever actually finished, not just assumed done because the glamorous half shipped.

### No recommendation
Genuine tradeoff between Path A and B, no forced answer — left unpicked per DECISION_PROTOCOL.md §5.2's
default. Happy to give a lean if asked, same as BRIEF-006/BRIEF-017.
