# Onboarding — legacy four-track structured conversation PRD (SHIPPED; SUPERSEDED FOR NEW USERS BY D-118/D-119)

> Historical implementation reference only. D-118/D-119 replace the four-track product flow with
> `ASSESSMENT_V2.md`. D-082's ungated structured-flow and fail-safe principles survive.

> Piloting the `docs/features/<slug>/` convention (D-082). Open Question #1 resolved (D-083); the stage/path
> map, persisted-state shape, and fail-safe mechanics below are **confirmed as proposed (D-084)**, no
> changes requested. Build item is in `docs/BUILD_QUEUE.md` READY. Implementation-time details are still
> open — see "Not yet written" at the bottom — but those are for whoever picks up the build item to resolve,
> not further owner decisions.

## Confirmed scope (D-082)

- **Onboarding only.** The general Chat tab and every other `/chat` entry point are unchanged. Revisit
  extending this pattern there later, as its own decision.
- **Structured *flow*, not structured *fields*.** D-058 still holds: no form field anywhere in onboarding.
  What changes is that each turn is aware of where the user is in a defined structure, instead of every
  turn being one isolated free-form question into the general teaching engine.
- **Fail-safe requirement:** every AI turn must end in either a clear next-step (chip/prompt) or an
  explicit "onboarding complete" state. No turn may leave the user with nowhere to go, and the flow may not
  loop without a way out.

## Open question #1 — RESOLVED (D-083)

**Path A adopted:** a narrow stage indicator, not conversation memory — never a transcript, never sent to
the model as dialogue history. Does not reopen D-022 (full conversation memory stays parked pending D-010).
Full reasoning: [D-083](decisions/D-083-stage-indicator-resolved.md).

## Stage/path map (draft — needs owner review, not yet confirmed)

Entry point is unchanged — the four existing chips plus free text ([OnboardingScreen.tsx](../../../app/screens/OnboardingScreen.tsx)).
The first message routes to one of D-054's three founding sub-profiles, or an unclassified fallback that
routes in on the next turn instead of guessing. Each track's stages are grounded directly in what
[BRIEF-011](../../BRIEF-011_pain_point_solution_mapping.md) already mapped for that profile — nothing
invented fresh here:

**`fresh_starter`** (chip: "I just started earning")
1. `intro` — AI asks about income, conversationally (D-058 still holds: never a form field)
2. `sequencing` — once enough is known, AI walks the buffer → protection → growth relationship on the
   user's own numbers. **Compliance note carried forward from BRIEF-011's own review:** even framed as "how
   these needs typically relate," a fixed presentation order risks reading as a recommendation — not
   blocked, but whoever writes this stage's copy needs that precedent in view, not just the general
   "teach never advise" instinct.
3. `complete` — a real computed number has been delivered; AI closes with an explicit "continue to app" turn.

**`reactive_dabbler`** (chip: "I have a loan/EMI")
1. `intro` — AI asks what the product/loan is
2. `mechanism` — AI explains what it mechanically does (cost, exit terms, purpose) — never states fit
3. `reflect` — AI asks a reflective question ("what were you hoping this would do for you?"), letting the
   user self-assess — the AI never answers this for them
4. `complete`

**`habit_former`** (chip: "I already track my budget")
1. `intro` — AI asks what they're already tracking
2. `gapscan` — AI pattern-matches across the three holding families, names the *category* of any gap
   generically — never the specific product to fill it
3. `complete`

**`unclassified`** (chip: "Something else", or free text matching none of the above)
1. `intro` — one light clarifying turn to route into a track above; if it's still ambiguous after that,
   falls through to a generic `complete` rather than guessing indefinitely — this is itself part of the
   fail-safe requirement below, not a separate concern.

## Persisted-state shape (draft proposal, grounded in an existing pattern)

No `users`/`profile` table exists in `backend/app/models/` — identity lives in Supabase Auth, and every
domain table (`Income`, `Goal`, `Holding`, `StreakState`) carries a loose `user_id`, no FK, one small table
per concern. [`streak_state.py`](../../../backend/app/models/streak_state.py) is the closest existing
precedent for exactly this shape (pure app-behavior state, one row per user, not financial data). Proposed,
matching that convention directly:

```python
class OnboardingState(Base):
    __tablename__ = "onboarding_states"
    id: Mapped[uuid.UUID]         # primary key
    user_id: Mapped[uuid.UUID]    # unique, loose reference — same convention as StreakState
    track: Mapped[str | None]     # fresh_starter / reactive_dabbler / habit_former / unclassified
    stage: Mapped[str | None]     # intro / sequencing / mechanism / reflect / gapscan / complete
    turns_in_stage: Mapped[int]   # feeds the fail-safe budget below
```

Still a draft — table/column naming and whether `track`+`stage` should collapse into one combined string
are implementation details, not fixed by this section.

## Fail-safe / loop-exit mechanics (draft)

- **Turn budget per track:** propose 4 AI turns before forcing a resolution. If `turns_in_stage` hits that
  budget without reaching `complete`, the AI's *next message itself* must explicitly offer "continue to the
  app" as part of its own text — not rely solely on the persistent header button, which a user mid-
  conversation may not look at.
- **The existing "Skip for now" / "Done — go to app" header button stays the universal escape hatch at
  every stage**, unchanged from D-058 — the turn-budget rule above is a second, redundant safety net for
  users who don't notice the header, not a replacement for it.
- **`unclassified`'s one-turn-then-resolve-anyway rule** (above) is the same mechanic applied to routing
  itself — a user should never sit in classification limbo.

## Built (BQ-042, 10-Aug-2026)

The implementation-time details below were resolved as part of building this, per this PRD's own framing
("for whoever picks up the build item to resolve, not further owner decisions") — not new owner decisions.
Full detail in `docs/BUILD_QUEUE_ARCHIVE.md`'s BQ-042 entry.

- **Stage copy is not fixed prose** — the teaching engine gets a `guidance` string per stage (via the new
  `onboarding` baseline field) and writes its own reply from that, same as every other teaching turn. The
  `fresh_starter`/`sequencing` guidance carries BRIEF-011's compliance note directly: present
  buffer/protection/growth as "how these needs typically relate," never a fixed order or recommendation.
- **Resuming a skipped conversation** resolves for free: `OnboardingState` is read fresh on every call, so
  a returning user with an already-set `track`/`stage` just continues there. No separate resume UI or logic
  needed.
- **`/chat` request/response shape:** request gains `onboarding: bool` + `onboarding_track_hint: str |
  None` (chip taps send a deterministic hint, mirroring D-071's `deepen_alias`; free text goes through a
  narrow Haiku classifier, mirroring D-072). Response gains `onboarding_state: {track, stage}`.
- **`turns_in_stage` resets to 0 on every stage transition**, including a track change (the
  `unclassified` → real-track reroute). The forced-resolution turn's copy isn't scripted — the
  `closing_instruction` field tells the model plainly what the reply must do, and it writes it in its own
  voice, same pattern as every other instruction field in the system prompt.

## Live-verified (10-Aug-2026, local Mac session)

Real Supabase Postgres + real Anthropic API, driven through the actual browser UI. Deterministic chip
routing, the content-aware stage-advance classifier (correctly stayed in `intro` until real loan details
arrived, then correctly advanced to `mechanism`), and the independent holding-capture classifier all
confirmed working. One real break found and fixed — see [D-085](decisions/D-085-limited-onboarding-exchange-memory.md):
a short, referential reply ("no, that's the only one") lost all context, since D-022 sent zero prior-turn
content even within a single onboarding conversation. Fixed by forwarding exactly the AI's own last message
— never persisted, never sent outside onboarding — not by reopening D-022's general case.

## Fully live-verified (10-Aug-2026, same session, follow-up pass)

The D-085 fix was re-verified live against the exact failure transcript — see the section above. All four
tracks then tested end-to-end (real Supabase, real Anthropic), not just `reactive_dabbler`:
`fresh_starter`'s `sequencing` stage delivered real computed numbers while explicitly declining to
prescribe an order; `habit_former`'s `gapscan` correctly named a missing category generically; genuinely
ambiguous free text (not a chip tap) correctly resolved to `unclassified` via the live Haiku classifier
rather than being forced into a track, and the turn-budget `closing_instruction` fail-safe fired correctly.
Nothing outstanding on live verification.

## Not yet written (still genuinely open)

- Exact per-stage copy is model-generated from the `guidance` strings, not fixed prose — worth a review
  pass if the owner wants tighter control over wording, not a defect.
- The "resume a skipped conversation" interaction resolves mechanically (state persists, `OnboardingScreen`
  just isn't re-shown after "Done"/`markOnboardingSeen`) but hasn't been tested via the real skip → resume
  UI flow specifically.
