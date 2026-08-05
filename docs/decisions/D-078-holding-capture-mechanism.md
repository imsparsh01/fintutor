### D-078 — AI-surfaced holding-capture mechanism confirmed: narrow Haiku reconciliation call + explicit confirm UI, no auto-write

- **Tier:** 3, owner-confirmed. Fires the financial-data-creation hard-stop trigger (`CLAUDE.md`) and
  builds a still-undesigned piece of D-012 (micro-capture flow) — both require owner sign-off, not a
  Claude Code default.
- **Question:** D-012's *primary* path — the AI creating a real tracked holding from conversation, on the
  user's own confirmation — has never been built. Everything shipped to date (BQ-036) is the *secondary*
  manual-add path. Two forks needed resolving before this could become a buildable item: (1) how does the
  extraction from free text happen, and (2) does a proposed holding write straight to the database or wait
  on an explicit confirm step.
- **Anchor already decided, not re-litigated here:** D-002 committed on day one to a two-model split —
  Sonnet for teaching, **Haiku for the narrow "does this new input update the baseline" reconciliation
  step** — and `PROJECT_SPEC.md` §2 already names reconciliation (new/updates/contradicts) as a core
  feature, not a CRUD save. That reconciliation step has simply never been implemented. This decision is
  the first real use of it, not a new architectural pattern — D-072 already proved the shape (a narrow,
  non-teaching Haiku call reading the conversation + holdings list, degrading cleanly to "no confident
  match" on any ambiguity) for a different job (`deepen` selection); this reuses the identical shape for
  holding-capture extraction.

- **Fork 1 — extraction mechanism. Path A confirmed:** a second, narrow Haiku call, same pattern as
  `backend/app/services/deepen_classifier.py` (D-072). Given the user's own `/chat` message plus their
  existing holdings (alias + product_type only, per D-010), it asks one narrow question: does this message
  describe a holding not already captured, and if so, which D-013/D-066 `product_type` and which
  characteristic fields can be confidently extracted? Returns structured JSON or nothing. **Path B
  (tool-use on the main Sonnet teaching call) was rejected** — this codebase has never used tool-calling,
  and folding capture logic into the teaching system prompt risks the exact "prompt rule gets routed
  around" failure class BRIEF-002 went architectural specifically to avoid.
- **Fork 2 — write gate. Path A confirmed:** a proposed holding is never written to the database from the
  classifier alone. It surfaces as an explicit confirm card in the chat UI (pre-filled `product_type` +
  extracted characteristics), and only a user tap on "Save" calls the existing `create_holding` path
  (D-074/BQ-036 — alias auto-generated, same as the manual-add flow) to actually write it. **Path B**
  (trusting an affirmative-sounding reply to auto-create) **was rejected** — per §2's "reconciliation is a
  core feature, not a CRUD save," an unconfirmed free-text extraction writing real financial data
  unattended is closer to a silent CRUD save than living-baseline reconciliation, and gives no undo beyond
  a manual delete if the extraction misreads the conversation.

- **Implementation shape (mechanical detail, not further owner decisions):**
  - New `backend/app/services/holding_capture_classifier.py`, mirroring `deepen_classifier.py`'s
    structure: Haiku call, hard-coded D-013/D-066 product-type + characteristic-field list (backend has no
    shared schema file with `app/lib/characteristicsSchema.ts` — mirrors it by comment, same convention
    already used by `budget.py`/`surfacing.py`/`taxonomy.ts`), strict JSON parsing with any failure
    (unconfigured key, API error, malformed JSON, unrecognized `product_type`) degrading to `None` — never
    guesses, same discipline as D-072.
  - Unrecognized characteristic keys in an otherwise-valid response are dropped, not rejected wholesale —
    a good partial extraction with one hallucinated extra field shouldn't be thrown away entirely.
  - `POST /chat`'s response gains an optional `holding_proposal: {product_type, characteristics} | None`
    field, absent meaning nothing proposed this turn — same "absent means nothing" discipline as `deepen`.
  - **Scoped out, not silently dropped:** no dedup check against the user's existing holdings of the same
    `product_type` — a user can legitimately hold two loans, and the confirm-card step already gives the
    user the choice to decline a genuine duplicate. No in-card field editing in v1 — the card shows the
    extraction read-only with Save/Not-now; corrections happen via the existing edit UI (BQ-028) after
    saving, same simplicity precedent BQ-036 set for the manual-add form.
  - Cost note: adds one more small Haiku call to `/chat` turns (alongside D-072's conditional `deepen`
    classifier) — accepted, matches D-002's original design intent that Haiku exists precisely for this
    kind of narrow, high-volume, cheap classification work.

- **Reversibility:** Medium — no schema change (characteristics stays the existing JSONB blob,
  `create_holding` is unchanged), but this is new user-facing behavior once shipped. Easy to disable by
  simply not calling the classifier if it proves noisy or unreliable in practice.
- **Date:** 05-Aug-2026
