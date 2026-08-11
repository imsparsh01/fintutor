# D-113 — Primary navigation uses five named icons with full-width mobile layout

**Tier:** 1 implementation of the owner’s direct UI request; bounded and reversible
**Interprets:** D-106’s five-tab navigation
**Date:** 12-Aug-2026

## Decision

The five visible tabs use distinct line icons matching their destinations: house for Home, briefcase
for Portfolio, target for Goals, calculator for Tools, and conversation bubble for Chat. The active
icon uses the existing tutor colour and tutor-soft surface. Hidden navigator destinations occupy no
tab-bar layout width.

The icons are code-native Views using the existing design tokens. No icon package is introduced for
this five-glyph set.

## Why

The navigator had no icon renderer, leaving placeholder-like marks in the UI. It also kept layout
slots for hidden destinations, which squeezed and truncated the five visible labels on a mobile
viewport. A coherent local set fixes both problems without adding a dependency or changing routes.

## Reversibility

High. Presentation and tab-item layout only; all routes and navigation entry points remain intact.
