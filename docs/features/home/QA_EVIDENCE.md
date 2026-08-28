# Home prototype QA evidence

**Date:** 28-Aug-2026  
**Scope:** BQ-118 controlled fixture only  
**Result:** PASS after fixes

## Static checks

- `node --check docs/features/home/prototype/app.js`: PASS.
- `git diff --check`: PASS.
- Forbidden API/storage scan for `fetch`, XHR, WebSocket, Supabase, local/session storage and external URLs:
  PASS, none present.
- Visible em/en-dash scan: PASS, none present.
- Project font existence and HTTP loading: PASS after correcting the initial font paths.
- DOM integrity: zero duplicate IDs, zero nested interactive controls, zero unnamed buttons, one H1, zero
  empty headings.

## Scenario and interaction coverage

| Coverage | Evidence | Result |
|---|---|---|
| Seven scenario selector states | Mixed, empty, one failure, stale/offline, denied, switch, all actions rendered | PASS |
| Unknown vs zero | Empty financial families say Not recorded; mixed unknown says Not valued yet | PASS |
| Local failure | Financial picture failed while Health/Arya remained; one retry restored only picture | PASS |
| Offline/stale | Banner + last-known timestamp; restore retained stale label; manual refresh changed to current | PASS |
| Permission loss | Financial rows immediately reduced to zero DOM rows; reauthentication copy remained | PASS |
| Account switch race | Mira cleared during loading; Kabir rendered; log confirmed late Mira response discarded | PASS |
| Destination coverage | Every one of 28 rendered route controls opened the correctly named controlled destination | PASS |
| Optional cards | Invite and learning fact dismissed independently and reset correctly | PASS |
| Fixture controls | Fail, deny, switch, reset, drop/restore and refresh all exercised | PASS |

## Responsive, theme and accessibility coverage

- Mobile 390x844: no horizontal overflow; phone surface remains 100% width; Health and account controls
  collapse to one column.
- Wide 1440x1000: no horizontal overflow; 430px phone remains stable; task panel remains sticky.
- Deterministic light theme computed to `rgb(244, 241, 234)` / ink `rgb(33, 33, 31)`.
- Deterministic dark theme computed to `rgb(23, 25, 23)` / ink `rgb(241, 239, 231)`.
- Reduced-motion rule disables animation, smooth scrolling and transitions.
- Every visible button is at least 44px high after repair.
- Computed contrast audit found zero visible buttons below 4.5:1.
- Every button has a non-empty accessible name; Health overall reads “score 68, 3 of 4 areas measured.”
- Focus-visible uses a 3px high-contrast outline. DOM order matches visual order.
- Console audit after complete interaction pass: zero warnings/errors.

## Defects found and fixed during QA

1. Prototype font URLs pointed at a non-existent folder; corrected to the project-bundled fonts.
2. Health accessible text concatenated 68 and 3 into “683”; added explicit accessible names.
3. Persistent fixture controls failed after rerenders; replaced direct wiring with one delegated handler.
4. Deterministic light mode lost to the OS dark media rule; fixed theme token precedence.
5. Personalization actions cramped on narrow mobile; added a responsive action grid.
6. Financial ledger rows sized to their content; made all rows full-width.
7. Multiple controls were below 44px; enforced the minimum target globally.
8. Combined fixture had two H1s and an empty dialog heading; normalized the hierarchy and default title.

## Boundary

This evidence proves the fixture's behaviour, layout and semantics. It does not prove real Supabase timing,
native assistive-technology behaviour, production navigation or backend ownership; those belong to later
bounded implementation and integration tests.
