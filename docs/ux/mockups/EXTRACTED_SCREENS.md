# Mockup v1 — extracted screen content (build reference)

Extracted 10-Aug-2026 from the rendered `MOCKUPS_v1.html` (shadow-DOM pierced) so build agents have the
exact copy/structure/hierarchy per screen without parsing the 890KB minified HTML. Flow 02 (Home) is
already built in `app/screens/ConsolidatedScreen.tsx` — use it as the pattern exemplar. This file is the
target for Flows 03–07.

## Design system (already in place — use these, do not re-invent)
- Tokens: `colors.{ink,inkSecondary,inkMuted,line,lineSoft,screen,canvas,tutor,tutorSoft,behaviour,behaviourSoft,danger}`
- Fonts (weight-specific — custom faces don't synthesize bold): `font.{ui,uiMedium,uiSemibold,uiBold, mono,monoMedium,monoSemibold, tutor,tutorMedium,tutorSemibold}`. Tutor voice = `font.tutor` (Newsreader serif), figures/labels = `font.mono` (IBM Plex Mono), UI = `font.ui` (IBM Plex Sans).
- Shared styles in `app/design/typography.ts`: `pageTitle, ledgerLabel, ledgerValue, primaryButtonText, secondaryButtonText`.
- `spacing.{xs,sm,md,lg,xl,xxl,xxxl}`, `radius.{sm,md,lg,xl,pill}`, `figure.{hero,subHero}`.
- Rules: P10 — real figures never styled by valence (no red/green, no arrows). P11 — tutor voice in `font.tutor`. P6 — real product names shown to the user (alias only on the wire). Ledger register — label-left/value-right on a hairline rule, no shadowed cards for data.

## OUT OF SCOPE (do not build)
- Reconciliation UI (Flow 03 "saved+reconciled" beyond the save itself) — undrawn, D-094.
- BQ-052 ESOP "what we won't say" wording — leave exactly as-is.
- Any backend/schema change: Flow 06 "FROM HOLDING" provenance breakdown, "goal set in chat", Flow 07 reward-fact content + push tray + reminders surface all need backend and are excluded.

---

(Full extracted text of Flows 03–07 follows — see the agent briefs, which quote the relevant slice per screen.)
