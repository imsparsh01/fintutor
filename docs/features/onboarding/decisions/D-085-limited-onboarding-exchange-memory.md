# D-085 — Limited memory for the onboarding exchange: exactly one prior AI message, never persisted

- **Tier:** 3, owner-decided directly in conversation, triggered by a real live-verification finding
  against the merged [BQ-042](../../BUILD_QUEUE_ARCHIVE.md) implementation.

## What triggered this

Live-testing the `reactive_dabbler` track end-to-end (real Supabase, real Anthropic API) surfaced a real
break: after the AI asked "is this the only loan you're carrying?" and the user replied "no, that's the
only one," the model's next reply lost the thread entirely — it responded as if greeting a brand-new,
unlogged holding. Root cause: D-022 forbids sending *any* prior-turn content to the model, so a short,
referential reply that only makes sense in light of the AI's own immediately preceding question arrives
with nothing to anchor it. This isn't specific to the merged implementation's code — it's a property of
D-022 applied to a genuinely multi-turn structured flow, and would affect any implementation built on the
same "zero memory, ever" rule.

## Decision

**Within the onboarding flow only, the AI's own single immediately-preceding message in the current
conversation is forwarded on the next turn** — narrowly enough that this is not "conversation memory" in
the sense D-022 parked:

- **Exactly one message, never a growing history.** Not the user's prior messages, not earlier AI turns —
  only the AI's own last reply, the one piece of context needed to interpret a short/referential answer.
- **Never persisted server-side.** No new database column, no new table field. The frontend already holds
  this exact text as local display state (`ChatThread`'s `messages`, which D-022's own original text
  already carved out as "local display state only, never sent back to the model") — this decision changes
  only the "never sent back" half, for onboarding calls specifically. The backend receives it per-request
  and forwards it into that one teaching-engine call; nothing about it is written to disk anywhere.
- **Scoped to onboarding-flagged `/chat` calls only** (`ChatRequest.onboarding=True`). The general Chat
  tab, `HoldingDetailScreen`'s "Ask about this," and every other entry point are completely unaffected —
  D-022 continues to apply to them exactly as before.

## Why this doesn't reopen D-022's parked general case

D-022 was parked because it fired **two** triggers: the hard scope-growth trigger, and a **data-retention**
trigger — the concern was stored, retained dialogue subject to a retention/deletion policy that doesn't
exist yet (D-010). This decision creates **no new stored data at all** — there's nothing to retain, nothing
for a future D-010 policy to need to cover, because nothing persists past the single request/response
cycle it's used in. The scope-growth question is also answered narrowly: this isn't "add conversation
memory" as a general capability, it's a single, bounded fix to keep one specific, already-approved feature
(BQ-042) coherent. D-022 itself — full dialogue recall, any persisted history, anything outside onboarding
— remains exactly as parked as it was, still gated on D-010.

## Reversibility

High. No schema change, no data migration, nothing to unwind beyond removing a request field and a prompt
addition if this is ever reconsidered.

**Date:** 10-Aug-2026
