# D-072 — BRIEF-006 fully resolved: Path A (narrow Haiku classifier) confirmed for the general Chat-tab deepen case

- **Tier:** 3, owner-confirmed. Trigger 2 (SEBI advisory line / D-028's "auditable in code" guarantee) —
  the same trigger BRIEF-006 fired originally; this entry records the owner's sign-off on Path A rather
  than reopening the analysis BRIEF-006 already did.
- **Resolves:** the one piece of BRIEF-006 left open after D-049 (deferred, Path C) and D-071 (shipped
  Path B's UI-signal variant for the "Ask about this" entry point only). This entry closes BRIEF-006
  entirely — every `/chat` entry point now has a real, decided `deepen` mechanism or an explicit safe
  default.
- **Decision:** Path A adopted, scoped to the general Chat-tab case only (free-typed questions with no
  holding-detail origin). A narrow, non-teaching Haiku call reads the user's question plus their holdings
  (alias + product_type only — never `display_name`, reusing the exact list `assemble_baseline` already
  builds, so D-010's guarantee holds by construction, not convention). If the question clearly and
  specifically concerns exactly one holding, the classifier returns that holding's alias; the backend then
  sets `deepen` to that alias with a **fixed, backend-authored reason** — never a model-invented one,
  preserving the system prompt's own rule that "the reason you were given is the only reason that exists."
  If the question is general, ambiguous, concerns multiple/no holdings, or the classifier call fails or is
  unconfigured, `deepen` stays absent — D-028's existing safe "deepen nothing" fallback, unchanged. This
  path runs **only when D-071's deterministic UI-signal case didn't already set `deepen`** — that path
  still takes priority whenever present.
- **Why resolved now, not left parked:** BRIEF-006's open question was whether a narrower model call
  satisfies "auditable in code," or just relocates the same judgment to a smaller, still-opaque model. The
  owner judged it does, for reasons BRIEF-006 itself already named as Path A's case: the call is logged and
  inspectable, gated by a fixed rule (single confident match, or nothing), and — critically — every failure
  mode (ambiguous question, API error, missing key) degrades to the exact same safe default that already
  governs today. Getting the classification wrong never produces worse behavior than not having it at all;
  it only produces less depth than an ideal classification would.
- **What this does NOT change:** D-028's core guarantee — the *teaching* model never picks which holding to
  deepen — stands untouched. The classifier is a structurally different, narrower model performing a
  narrower task (single-holding-or-none classification), not the teaching model exercising judgment over
  its own answer. D-071's UI-signal path is unchanged and keeps priority.
- **Reversibility:** High — an additive backend call. Removing it (or a live failure) degrades cleanly to
  the pre-existing default; no data depends on it.
- **Feeds:** `backend/app/services/deepen_classifier.py` (new), wired into `POST /chat` in `main.py` as the
  fallback path when `deepen_alias` (D-071) isn't provided or doesn't resolve. First real use of D-002's
  Haiku half of the two-model split.
- **Date:** 04-Aug-2026
