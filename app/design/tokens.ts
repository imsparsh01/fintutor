// Design tokens — code, not documentation (see docs/ux/README.md for the boundary).
//
// Rewritten at BQ-043 to the warm-ledger register adopted in D-086, from the v1 mockups
// (docs/ux/mockups/MOCKUPS_v1.html). Before this, values were seeded from whatever was already
// in use across screens/components; they are now decided, and the decision records are the
// authority — not this file's history.
//
// Two principles are enforced through these tokens. Read them before changing a value:
//   P10 (D-087) — a real financial figure is never styled by valence. There is deliberately NO
//                 positive/negative, gain/loss, or on-track/behind colour in this palette. If you
//                 find yourself needing one, the answer is that the figure renders in `ink`.
//   P11 (D-088) — the tutor's voice has its own typeface. `font.tutor` is for generated teaching
//                 copy ONLY; everything the app *is* uses `font.ui` or `font.mono`.

import { Platform } from 'react-native';

export const colors = {
  // Ink — all real financial figures render in these, undecorated (P10).
  ink: '#16211C',
  inkSecondary: '#5C6660',
  inkMuted: '#8B938D',

  // Hairline rules — the ledger is drawn with these, never with fills or shadows.
  line: '#DFD8CA',
  lineSoft: '#F0EAE0',

  // Surfaces
  screen: '#FFFDF9',
  canvas: '#FBF8F2', // tab bar, recessed surfaces

  // Teaching accent. Replaces the old `success: '#116611'`, which was RENAMED rather than
  // recoloured (D-086): a token called `success` carries exactly the valence P10 strips out,
  // and the next person to reach for it would reintroduce the problem. Use for teaching
  // surfaces and primary actions (Save, Ask, Send) — never to signal that a number is good.
  tutor: '#1D5C46',
  tutorSoft: '#E4EFE8',

  // Engagement layer ONLY — streak, mascot, reward moments (P7, D-086).
  // Never on a ledger row, a holding value, a budget figure, or any real number.
  // This reservation is what makes P7 checkable by eye: if clay touches a real number,
  // the rule is broken and a reviewer needs no context to see it.
  behaviour: '#B9552C',
  behaviourSoft: '#FAF1EA',

  // Reserved for genuine error/destructive states (validation failure, delete).
  // NOT for negative financial values — that would be valence styling (P10).
  danger: '#B4342A',
} as const;

// Typeface roles (P11, D-088). System faces only — the mockups' Newsreader / IBM Plex would
// need expo-font + @expo-google-fonts/*, which is a dependency decision that has NOT been made
// (D-088, D-093). P11 is satisfied by the distinction, not by any particular face, so this is a
// complete implementation of the principle rather than a placeholder.
export const font = {
  // The tutor speaks. Generated teaching/explanatory copy only.
  tutor: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) as string,
  // The app labels and reports. Interface chrome, buttons, headings.
  ui: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) as string,
  // Figures and labels. Every real number renders here.
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// A few off-scale values are still in real use (2, 6, 10, 14 — see e.g.
// HoldingEditModal's paddingVertical: 10) and haven't been reconciled onto this
// scale yet. Flagged here rather than silently forced onto the nearest token.

export const radius = {
  sm: 9,
  md: 12,
  lg: 14,
  xl: 18,
  pill: 34,
} as const;

// Two-step figure scale (1G) — the largest computed numbers in the calculator modals.
// `hero` is for the one deciding figure on a screen (there is ever only one); `subHero`
// is every other prominent card value. Added here rather than left as a magic number so
// the next modal has a documented value to reach for instead of inventing a third size.
export const figure = {
  hero: 32,
  subHero: 22,
} as const;
