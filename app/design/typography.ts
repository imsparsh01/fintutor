// Shared style objects for roles that recur, verbatim, across 3+ screens/components.
// Extracted at BQ-0xx alongside the weight-token migration (see tokens.ts's WEIGHTS note)
// to stop the same font.uiSemibold/font.monoSemibold declarations from drifting out of
// sync one file at a time. Conservative on purpose: only roles that were byte-for-byte
// identical everywhere they appeared got pulled out here. A near-miss (different
// fontSize, extra margin, etc.) stays local to its own file rather than being forced
// into one of these.
import { StyleSheet } from 'react-native';
import { colors, font, spacing } from './tokens';

export const typography = StyleSheet.create({
  // Page/modal H1 — screens/{Insurance,Loans,Investments}Screen's pageTitle and
  // {Esop,TaxSavingRoom}Modal's title.
  pageTitle: {
    fontFamily: font.uiSemibold,
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  // Ledger label (1D) — font.mono 12 / uppercase / ls 0.5 / inkMuted. The row-label half
  // of every label/value ledger pair in the app.
  ledgerLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Ledger value (1E) — font.mono 15/semibold/ink. The value half of the same pair.
  ledgerValue: {
    fontFamily: font.monoSemibold,
    fontSize: 15,
    color: colors.ink,
  },
  // Primary button label (1C) — font.ui semibold/15/screen, for text sitting on a
  // colors.tutor-filled primary button.
  primaryButtonText: {
    fontFamily: font.uiSemibold,
    fontSize: 15,
    color: colors.screen,
  },
  // Secondary/outline button label — same weight and size as primaryButtonText, but for
  // the colors.tutor-bordered (not filled) tier, so the text renders in colors.tutor.
  secondaryButtonText: {
    fontFamily: font.uiSemibold,
    fontSize: 15,
    color: colors.tutor,
  },
});
