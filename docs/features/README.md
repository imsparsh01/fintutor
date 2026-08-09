# Per-feature subfolders (D-082)

Each subfolder here is a self-contained home for one feature's strategy + build documentation: a `PRD.md`,
any supporting design docs, and a `decisions/` folder holding that feature's full `D-0NN-slug.md`
write-ups (same format and numbering sequence as `docs/decisions/` — just physically relocated here for
features big enough to warrant their own space).

What does **not** move here:
- `docs/BUILD_QUEUE.md` stays the single global build-task queue. A feature subfolder never gets its own
  queue — build items for this feature still go through the normal READY/BLOCKED/DONE flow, one item per
  session, same as everything else.
- `docs/DECISION_LOG.md` still indexes every decision, regardless of whether the full write-up lives in
  `docs/decisions/` or in a feature's `decisions/` subfolder here — grep by ID to find it either way.

Piloted on `onboarding/` (D-082). Adopt this shape for a new feature only when it's big enough to need
multiple design docs of its own — most features should keep using a single `docs/BRIEF-0NN-*.md` in the
flat convention, which is still the default.
