// Design tokens — code, not documentation (see docs/ux/README.md for the boundary).
// Seeded from values already in use across app/screens and app/components as of BQ-019/BQ-027,
// not invented ahead of real screens. Existing StyleSheet.create calls aren't refactored to use
// these yet — that's a follow-on, not part of this file's creation.

export const colors = {
  text: '#111',
  textSecondary: '#666',
  textMuted: '#888',
  border: '#ccc',
  borderLight: '#eee',
  background: '#fff',
  success: '#116611',
  danger: '#c00',
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
