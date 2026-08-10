# D-088 — P11 added: the tutor's voice has its own typeface

- **Tier:** 2 — owner-confirmed. Sets a new principle.
- **Date:** 10-Aug-2026

## Decision

New principle **P11** in `PRODUCT_PRINCIPLES.md`:

> **P11 — The tutor's voice has its own typeface.**
> **Test:** Can the user tell, without reading a word of it, which text on this screen is FinTutor
> explaining something versus the app labelling or reporting? If the two are typographically
> indistinguishable, that fails.

Everything the app *explains* is set in a serif. Everything the app *is* — labels, chrome, buttons, and
every real value — is sans and mono.

## Why

D-009 and D-025 draw the teaching/advice boundary in the model's behaviour. The user has no way to see
that boundary; they see a single undifferentiated stream of app text. The alternative to making it visible
typographically is making it visible with words — a disclaimer attached to every explanation — which is
both worse to read and, by repetition, less credible. A typeface carries the distinction continuously and
costs nothing at the point of use.

## Implementation scoping — system fonts now, webfonts as a separate decision

The app currently contains **zero `fontFamily` declarations**; everything renders in the platform default
sans. P11 is therefore the first type differentiation in the product, and how it ships matters:

- **Authorised now:** platform system faces — serif (`Georgia` on iOS, `serif` on Android) for the tutor
  voice, the platform default sans for interface, and system mono (`Menlo` on iOS, `monospace` on Android)
  for figures and labels. This ships the principle with **no new dependency**.
- **NOT authorised by this entry:** the specific faces the mockups draw — Newsreader, IBM Plex Sans, IBM
  Plex Mono. Loading them requires `expo-font` plus `@expo-google-fonts/*` packages. Adding a dependency
  is on `CLAUDE.md`'s hard-stop list ("a new library... is a decision, not an implementation detail") and
  carries a real bundle-size and font-loading cost on mobile. It needs its own escalation, with the
  measured bundle delta in hand, and must not be slipped in as part of a reskin.

P11 is satisfied by the *distinction*, not by any particular typeface. The system-font implementation is a
complete implementation of the principle, not a placeholder that leaves it half-done.

## What it forbids

Setting explanatory/teaching copy in the same face as interface chrome; setting a real value in the tutor
serif; using the serif decoratively on non-teaching text (a section heading, a button), which would
dissolve the very signal the principle exists to carry.

## Lenses

- **Compliance — PASS.** Makes an existing compliance boundary more legible; creates no new claim.
- **Product — PASS.** Serves the teaching/advice line directly.
- **Technical — PASS**, on the system-font scoping above. Would be **CONCERN** on webfonts — hence the
  split, so the principle is not blocked on a dependency decision.
- **Cost-and-Scope — PASS.** No scope change.

## Reversibility

High. Font-family values in a token file plus the `StyleSheet` calls reading them.
