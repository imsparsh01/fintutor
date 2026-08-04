# D-071 — BRIEF-006 narrowed and confirmed: deepen selection wired for the "Ask about this" entry point only

- **Tier:** 3, owner-confirmed — trigger 2 (SEBI advisory line, same open question BRIEF-002/D-028/BRIEF-006
  all routed to the owner) fired on the underlying mechanism regardless of how mechanical this specific
  wiring is; this entry records the owner's sign-off on the narrower framing surfaced in conversation, not a
  fresh brief.
- **Interprets:** D-049 — narrows D-049's blocker ("app/ has a real conversation interface AND a decision
  exists specifying the selection rule") to what's actually now true: the interface exists (BQ-023/024/025)
  and one deterministic sub-case of the selection rule is now decided (this entry), but the general
  free-text Chat-tab case is NOT decided — D-049's Path-C deferral still stands for that half. Does not
  supersede D-028 (the `deepen` field contract itself is unchanged) or BRIEF-006 (Path A's classifier
  question is untouched and still open).
- **Decision:** Ship **BRIEF-006's Path B, UI-signal variant, scoped to exactly one entry point** — the
  "Ask about this" flow BQ-022 already built on `HoldingDetailScreen`. When a question originates there, the
  holding's alias (already known with certainty — no inference, no model call) is threaded through to
  `/chat` and the backend sets `deepen = {alias, reason: "the user asked directly about this holding"}`.
  Every other path into `/chat` (the general Chat tab, typed free text, onboarding chips) is **unchanged** —
  `deepen` stays absent, D-028's existing "deepen nothing" fallback still governs there. This is narrower
  than any of BRIEF-006's three original paths as written: it is Path B's cleanest variant, deliberately not
  extended to cover the harder general-question case Path A/C were about.
- **Why this satisfies D-028's compliance guarantee where BRIEF-006's other paths were unclear on it:** the
  alias comes from the app's own navigation state (which holding's detail screen the user tapped into), not
  from parsing or classifying the question text. There is no judgment anywhere in the loop — not the
  teaching model's, not a narrower classifier's. This is exactly the property BRIEF-006 named as what would
  make Path B "actually deliver D-028's original promise: a rule in code, testable, with no model judgment
  in the selection path at all."
- **What this does NOT decide:** the general Chat-tab case (free-typed questions with no holding context) is
  untouched. BRIEF-006's Path A (Haiku classifier) and its open regulatory question ("does a narrower model
  call satisfy 'auditable in code', or only relocate the same judgment") remain exactly as open as they were
  at D-049. Revisit only as its own decision, not implied by this one.
- **Reversibility:** High — additive request field on `/chat`, no populated data depends on it, easily
  removed or extended without migration.
- **Feeds:** unblocks a scoped build task — `/chat` request body gains an optional field carrying the
  triggering holding's alias; `backend/app/services/baseline.py` sets `deepen` when present and the alias
  resolves to one of the user's own holdings (never trusts an alias blindly); `HoldingDetailScreen`'s
  existing "Ask about this" navigation threads the alias through to `ChatScreen`/`ChatThread`/`askQuestion`
  alongside the existing pre-filled question text.
- **Date:** 04-Aug-2026
