### D-077 — P9 added: no comprehension gates — teaching content is never locked behind a quiz or a prior lesson

- **Tier:** 1 — extracting a checkable principle from founding-spec language (`PROJECT_SPEC.md` §2/§4) that
  had never been promoted to a Product-lens test. Bounded, reversible (prompt/documentation-level only),
  contained to this session, doesn't touch money-logic, doesn't touch the teach-not-advise line, doesn't
  grow MVP scope.
- **Decision:** New principle **P9** in `docs/PRODUCT_PRINCIPLES.md`:
  > No comprehension gates: teaching content is never locked behind a quiz or a prior lesson.
  > **Test:** Can the user reach any relevant teaching content the moment it's surfaced, or does something
  > stand between them and it — a comprehension check, a passed quiz, a completed prior lesson, a "you
  > must finish X to unlock Y" sequence? If something stands between them, that fails, regardless of how
  > the gate is dressed up (a game mechanic, a "level," a locked card).

  Explicitly states its relationship to P7 (engagement/gamification): P7 permits the full behavioral
  toolkit but only reacting to app usage (opened the app, completed a moment, session count); P9 forbids
  any mechanic — however game-shaped — that conditions access to real teaching content on passing a check,
  closing the specific loophole where a future feature ("3/3 correct to unlock the next moment") could
  otherwise be waved through by a loose reading of P7's "full toolkit" language.
- **Scope note confirmed by owner:** no exception carved for a "light-touch" check (e.g. confirming the
  user actually read a number before moving on) — the framing was put to the owner explicitly and
  confirmed as-is, with no such case permitted.
- **Why:** `PROJECT_SPEC.md` §2 already states "Learn on the go. No curriculum/lesson tree. Teaching is
  triggered by the user's real actions and data," and §4 item 6 describes teaching moments as AI-surfaced
  by real actions, not button-tapped through a structured sequence. That was founding-spec language,
  never before written as a checkable test a future build decision could be run against without asking the
  owner. P9 closes that gap, and does so pre-emptively against a real, foreseeable collision with P7's
  gamification permission.
- **Context:** Item 3 of 3 in the live UX-principles-section discussion (session 2026-08-05a), following
  D-075 (P1 patch) and D-076 (P8, persistent sections). This closes the discussion entirely — all five
  D-031-anticipated UX characteristics (aliases never shown / AI-primary-manual-secondary / progressive
  capture / persistent sections / no comprehension gates) are now covered by a principle (P6, P1, P1, P8,
  P9 respectively).
- **Reversibility:** High — a principles-file addition, no code or data depends on it yet.
- **Date:** 05-Aug-2026
