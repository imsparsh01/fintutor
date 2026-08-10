# D-086 — Aesthetic layer adopted: the warm-ledger visual register (1a) and its token set

- **Tier:** 2 — owner-confirmed (visual register chosen directly in conversation, 10-Aug-2026).
- **Date:** 10-Aug-2026

## Decision

FinTutor's aesthetic layer is no longer unprincipled. The **warm ledger** register (fork `1a` of the three
the mockups left open) is adopted as drawn in `docs/ux/mockups/MOCKUPS_v1.html`: a warm off-white screen,
near-black ink, hairline rules, a forest-green teaching accent, and a clay accent quarantined to the
engagement layer.

The token set, replacing the seeded values in `app/design/tokens.ts`:

```
ink            #16211C   (was text          #111)
ink-secondary  #5C6660   (was textSecondary #666)
ink-muted      #8B938D   (was textMuted     #888)
line           #DFD8CA   (was border        #ccc)
line-soft      #F0EAE0   (was borderLight   #eee)
screen         #FFFDF9   (was background    #fff)
canvas         #FBF8F2   tab bar / recessed surfaces — new
tutor          #1D5C46   teaching accent
tutor-soft     #E4EFE8 / #F4F8F5
behaviour      #B9552C   streak/mascot ONLY — never on a ledger row
behaviour-soft #FAF1EA
danger         #B4342A   (was danger        #c00)
radius         9 / 12 / 14 / 18 / 26 / 34
```

### The `success` token is renamed, not recoloured

`tokens.ts` currently ships `success: '#116611'` and uses it as the de-facto accent for *actions* (Save,
Ask, Send) — 6 hardcoded instances remain outside the token besides. The word `success` carries a valence
this register deliberately strips out of the palette (see D-087/P10). It is therefore **renamed to
`tutor`** and recoloured to `#1D5C46` in the same change. A rename is required: leaving a token called
`success` in place while giving it a valence-free colour would preserve exactly the semantic this decision
removes, and the next person to reach for it would reintroduce the problem.

### Clay is reserved, and that reservation is reviewable

`behaviour` (`#B9552C`) may appear only on engagement surfaces — streak counters, mascot, reward moments.
It may never appear on a ledger row, a holding value, a budget figure, or any real number. This is a
straight application of **P7** (engagement reacts to behaviour, never to real financial data), not a new
principle — its contribution is making P7 checkable *by eye*: if clay touches a real number, the rule is
broken, and a reviewer needs no context to see it.

## Lenses

- **Compliance — PASS.** A colour register carries no regulatory exposure on its own. The two
  compliance-adjacent patterns the same mockups propose are split out to their own Tier-3 entries
  (D-091, D-092) rather than absorbed here.
- **Product — PASS.** The register is derived from the product's existing commitments (undecorated
  numbers, a visible teaching voice), not selected on taste alone.
- **Technical — PASS.** Colour/radius token substitution, no new dependency, no architectural change.
- **Cost-and-Scope — PASS.** Reskinning surfaces that already exist. No new screen, flow, or capability;
  trigger 5 does not fire.

## Reversibility

High. Touched-data test: no populated data is migrated, no committed code contract changes — this edits
token values and the `StyleSheet` calls that read them. Reverting is a token-file revert plus the same
mechanical substitution in the other direction.

## Scope note — what this does NOT decide

The mockups draw several surfaces that do not exist in `app/` and are not authorised by this entry: the
push-notification tray and the standalone reminders surface (Flow 07.2/07.3), and the Income screen as
drawn (Flow 06.2). `PROJECT_SPEC.md` §4 item 7 does put reminders in MVP scope, but building that screen
is a separate build item, not part of a reskin. Also still undrawn and undecided: the Loans section, the
credit-card teaching moment, the baseline **reconciliation** UI (§2's core feature has no screen yet),
settings/privacy, and login error states.

## Traces to

`docs/ux/mockups/MOCKUPS_v1.html`, `docs/ux/mockups/MOCKUPS_v1_NOTES.md`, `PROJECT_SPEC.md` §8's
aesthetic-layer item (the "until real screen decisions force it" condition — these mockups are that
forcing function), `PRODUCT_PRINCIPLES.md`'s "Deliberately unprincipled" section.
