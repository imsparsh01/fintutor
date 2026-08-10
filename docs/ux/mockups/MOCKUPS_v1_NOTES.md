# UX mockups v1 — handoff into the FinTutor repo

> Produced 10-Aug-2026 from `PROJECT_SPEC.md` v3.9, `PRODUCT_PRINCIPLES.md` v1.5, BRIEF-009/010/011/013,
> `docs/ux/journeys/onboarding.md`, and the real `app/` code (screens, components, `design/tokens.ts`).
> Nothing here is decided. This is a proposal artifact — route it through `DECISION_PROTOCOL.md` before
> any of it lands in `app/`.

## Where these files belong

| File | Suggested repo path | Why |
|---|---|---|
| `FinTutor-Mockups-v1.html` (self-contained, opens offline) | `docs/ux/mockups/MOCKUPS_v1.html` | Same category as `docs/ux/wireframes/` — FinTutor's own UX, at higher fidelity. New `mockups/` subfolder; add a line to `docs/ux/README.md` describing the third category (wireframes = structure, mockups = aesthetic layer, DESIGN_REFERENCES = other people's UX). |
| this file | `docs/ux/mockups/MOCKUPS_v1_NOTES.md` | The reasoning + the open decisions the mockups force. |

Per D-047's pre-commit hook: these are `docs/` only, so no `docs/sessions/*.md` log is strictly required —
but if the same commit touches `app/`, one is.

## What this artifact forces a decision on

`PRODUCT_PRINCIPLES.md`'s "Deliberately unprincipled" section says the **aesthetic layer** (visual style,
density, motion, colour, information hierarchy) stays unprincipled "until real screen decisions force it."
These mockups are that forcing function. Adopting any of it is a **new decision**, not an application of an
existing principle — most likely Tier 2 (product judgment, owner review), with two exceptions flagged below
that look Tier 3.

### Proposed for adoption (Tier 2 — product judgment)

1. **P10 candidate — real financial figures are never styled by valence.** Numbers are set in one mono
   face on a hairline ledger; no green/red, no up/down arrows, no progress-bar colour, no emphasis that
   implies good or bad. *Test:* does this styling choice tell the user something is true, or something is
   good? The second is a verdict by typography and is forbidden. Traces to P2's "does, not says" and P6.
2. **P11 candidate — the tutor's voice has its own typeface.** Explanations in a serif; interface, labels
   and values in sans/mono. Makes "where the model is speaking" legible without a disclaimer on every
   bubble. Traces to D-009/D-025's need for the teaching/advice boundary to be *visible*.
3. **The engagement layer has its own colour and its own plane.** One accent (clay `#B9552C`) used
   exclusively for streak/mascot/behaviour surfaces, never on a ledger row. Makes D-061's boundary
   enforceable by review rather than by vigilance — if clay touches a real number, the rule is broken.
4. **Empty sections are teaching surfaces.** P8 commits only to reachability; this proposes what the empty
   state *shows*: what lives in this section (categories, never products) + an offer to walk through it.

### Flagged as Tier 3 (compliance-adjacent — owner only)

5. **The "what we won't say" block.** A recurring, explicit statement of the verdict FinTutor is declining
   to give, placed wherever a verdict is the natural next thought (holding detail, 80C room, ESOP cost).
   This is a *compliance-messaging* pattern, not a styling choice — it changes how the advice line is
   communicated to the user. BRIEF-010's business lens named exactly this risk ("neutrality reads as
   evasive"), so the wording is load-bearing and needs owner sign-off, not Tier-2 adoption.
6. **Refusal stated before the result, framed as method.** In the comparison flow the app says "I'm not
   going to tell you which one to do — here's both paths in the same detail plus the rate that decides it"
   *before* showing numbers. Same reason as (5): it's advice-line messaging.

### Confirms an already-proposed shape (no new decision)

- BRIEF-013's comparison-view proposal (full-screen modal, neutral card order) is drawn as specified,
  including the input-order note. The mockups add one thing worth a look: **the unnamed third path**
  ("hold the cash") is stated explicitly, so a two-column layout isn't read as an exhaustive choice set.

## Screen inventory (what's drawn, and against what)

| Flow | Screens | Anchored to |
|---|---|---|
| 01 Onboarding | Register · chip conversation · first value moment · skipped-state home | D-058, D-012, BRIEF-010/011 |
| 02 Home | Fresh starter · reactive dabbler · habit-former (same layout, three data states) | D-054, D-065, `ConsolidatedTotalsCard` |
| 03 Teaching + capture | Mechanism answer with ranges · surfaced confirm cards · saved + reconciled | D-078, D-029, D-032/D-035, `HoldingProposalCard` |
| 04 Sections | Investments list · empty Insurance · holding detail · manual add sheet | D-031/P8, D-059, D-074, P6, `HoldingsList`/`HoldingDetailScreen` |
| 05 Decision-shaped | Prepay-vs-invest setup · parallel paths · 80C room · ESOP exercise cost | D-067/D-068, BRIEF-014/015/016, `LoanVsInvestModal` |
| 06 Budget | Computed budget with "from holding" provenance · variable income + goals · goal set in chat | D-038, BRIEF-017, `BudgetingScreen` |
| 07 Engagement | Streak moment (variable reward = a fact worth knowing) · push tray · reminders surface | D-060/D-061/P7, P9, §5 no-aggregator |

Still undrawn: Loans section, credit-card teaching moment, baseline **reconciliation** UI (new / updates /
contradicts — §2's core feature has no screen yet), settings/privacy surface, login error states.

## Open picks the mockups deliberately left as forks

- **Visual register** — `1a` warm ledger (drawn throughout) / `1b` dark slate / `1c` editorial big-type.
- **Where a teaching moment appears** — `1d` inline bubbles / `1e` mechanism card (recommended default) /
  `1f` full-screen walkthrough. `1f` needs a P9 guard: skip live on every step, nothing unlocked at the end.

## Design tokens, as drawn (not yet reconciled with `app/design/tokens.ts`)

```
ink            #16211C   (was #111)
ink-secondary  #5C6660   (was #666)
ink-muted      #8B938D   (was #888)
line           #DFD8CA   hairline rules  (was #ccc)
line-soft      #F0EAE0                   (was #eee)
screen         #FFFDF9   (was #fff)
canvas         #FBF8F2   tab bar / recessed
tutor          #1D5C46   (replaces success #116611 as the teaching accent)
tutor-soft     #E4EFE8 / #F4F8F5
behaviour      #B9552C   streak/mascot ONLY — never on a ledger row
behaviour-soft #FAF1EA
danger         #B4342A   (was #c00)
radius         9 / 12 / 14 / 18 / 26 / 34
type           Newsreader (tutor voice) · IBM Plex Sans (UI) · IBM Plex Mono (figures, labels)
```

Note the collision: `tokens.ts` currently uses `success: '#116611'` as the de-facto accent for *actions*
(Save, Ask, Send). If the tutor accent is adopted, that token should be renamed rather than recoloured —
`success` carries a valence these mockups deliberately strip out of the palette.

## Suggested build order (if adopted)

1. Reskin what already exists behind `tokens.ts` — cheapest way to see the direction in a running app.
2. `OnboardingScreen` + `ChatThread` bubble/card treatment (Flow 01, 03) — the surfaces every must-have
   from BRIEF-012 needs.
3. `ConsolidatedScreen` as Flow 02 (currently a centred placeholder with a backend health readout).
4. `LoanVsInvestModal` → Flow 05's parallel-path layout, including the order note and the third-option block.
5. `BudgetingScreen` → Flow 06, with the "from holding" provenance rows.
6. The undrawn reconciliation UI — needs its own design pass before it can be built.
